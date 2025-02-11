


CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  is_manual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, 
         COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
         new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.check_admins()
RETURNS TABLE(email text, has_admin_role boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    EXISTS (
      SELECT 1 
      FROM user_roles ur 
      WHERE ur.user_id = p.id 
      AND ur.role = 'admin'
    ) as has_admin_role
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = p.id 
    AND ur.role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uid
    AND role = 'admin'::user_role
  );
$$;


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own time records"
ON time_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all time records"
ON time_records FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own time records"
ON time_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time records"
ON time_records FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all time records"
ON time_records FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete time records"
ON time_records FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON user_roles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
ON user_roles FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);


CREATE POLICY "Users can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());



CREATE OR REPLACE FUNCTION public.is_admin(user_uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uid
    AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
begin
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  return new;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.get_user_email(admin_uid uuid, target_user_id uuid)
RETURNS text AS $$
DECLARE
  is_admin BOOLEAN;
  user_email text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_uid
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;

  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.update_user_credentials(admin_uid uuid, target_user_id uuid, new_email text DEFAULT NULL, new_password text DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_uid
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  IF new_email IS NOT NULL THEN
    UPDATE auth.users
    SET email = new_email,
        updated_at = now()
    WHERE id = target_user_id;
  END IF;

  IF new_password IS NOT NULL THEN
    UPDATE auth.users
    SET password = crypt(new_password, gen_salt('bf'))
    WHERE id = target_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;



CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

# Database Setup

This document outlines the Supabase database configuration for the time tracking application.

## Schema

### User Roles Enum
```sql
CREATE TYPE user_role AS ENUM ('admin', 'user');
```

### Tables

#### Profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins full access to profiles
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

-- Allow users to read and update their own profile
CREATE POLICY "Users can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

#### Time Records
```sql
CREATE TABLE time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  is_manual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### User Roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Database Functions

1. `is_admin(user_uid UUID)`: Checks if a user has admin privileges
```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uid
    AND role = 'admin'::user_role
  );
$function$
```

2. `handle_new_user()`: Automatically creates profile and role entries for new users
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Create the profile without username (will be set later)
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
end;
$function$
```

3. `get_user_email(admin_uid UUID, target_user_id UUID)`: Allows admins to fetch user emails
```sql
CREATE OR REPLACE FUNCTION public.get_user_email(admin_uid uuid, target_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin BOOLEAN;
  user_email text;
BEGIN
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_uid
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  -- Get the user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;

  RETURN user_email;
END;
$function$
```

4. `update_user_credentials(admin_uid UUID, target_user_id UUID, new_email TEXT, new_password TEXT)`: Allows admins to update user credentials
```sql
CREATE OR REPLACE FUNCTION public.update_user_credentials(admin_uid uuid, target_user_id uuid, new_email text DEFAULT NULL::text, new_password text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_uid
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  -- Update email if provided
  IF new_email IS NOT NULL THEN
    UPDATE auth.users
    SET email = new_email,
        updated_at = now()
    WHERE id = target_user_id;
  END IF;

  -- Update password if provided
  IF new_password IS NOT NULL THEN
    UPDATE auth.users
    SET password = crypt(new_password, gen_salt('bf'))
    WHERE id = target_user_id;
  END IF;

  RETURN TRUE;
END;
$function$
```

## Triggers

- `on_auth_user_created`: Automatically sets up new user profiles and roles when a user signs up
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

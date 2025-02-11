
# Database Schema

This document outlines the table structures in the Supabase database.

## User Roles Enum
```sql
CREATE TYPE user_role AS ENUM ('admin', 'user');
```

## Tables

### Profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Time Records
```sql
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
```

### User Roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);
```

## Functions

### Handle New User
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- Create the profile record
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, 
         COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
         new.email);
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  return new;
end;
$$;
```

### Check Admins
```sql
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
```

### Is Admin
```sql
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
```

## RLS Policies

### Profiles Table
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));
```

### Time Records Table
```sql
-- Enable RLS
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Users can read their own time records
CREATE POLICY "Users can read their own time records"
ON time_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all time records
CREATE POLICY "Admins can read all time records"
ON time_records FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Users can insert their own time records
CREATE POLICY "Users can insert their own time records"
ON time_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own time records
CREATE POLICY "Users can update their own time records"
ON time_records FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can update all time records
CREATE POLICY "Admins can update all time records"
ON time_records FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can delete time records
CREATE POLICY "Admins can delete time records"
ON time_records FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
```

### User Roles Table
```sql
-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read their own roles"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all roles
CREATE POLICY "Admins can read all roles"
ON user_roles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles"
ON user_roles FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```


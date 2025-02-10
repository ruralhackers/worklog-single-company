
# Database Functions

This document outlines the Supabase database functions.

## Admin Check Function
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

## New User Handler
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

## User Email Getter
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

## User Credentials Updater
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

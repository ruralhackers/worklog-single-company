
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
2. `handle_new_user()`: Automatically creates profile and role entries for new users
3. `get_user_email(admin_uid UUID, target_user_id UUID)`: Allows admins to fetch user emails
4. `update_user_credentials(admin_uid UUID, target_user_id UUID, new_email TEXT, new_password TEXT)`: Allows admins to update user credentials

## Triggers

- `on_auth_user_created`: Automatically sets up new user profiles and roles when a user signs up

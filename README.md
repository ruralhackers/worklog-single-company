
# Welcome to your Lovable project

A time tracking application built with React, TypeScript, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/aa8843a0-94f6-4b2c-8925-923bfd144af3

## Features

- User authentication (sign up/login)
- Time tracking with clock in/out functionality
- Manual time entry support
- Admin dashboard for user management
- Responsive design with shadcn/ui components

## Prerequisites

Before you begin, ensure you have:
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase account - [Sign up here](https://supabase.com)

## Supabase Setup

1. **Create a Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project" and follow the setup wizard
   - Save your project URL and anon key for later

2. **Database Schema**
   The application uses the following tables:

   ```sql
   -- User roles enum
   CREATE TYPE user_role AS ENUM ('admin', 'user');

   -- Profiles table - stores user profile information
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
     username TEXT,
     avatar_url TEXT,
     updated_at TIMESTAMP WITH TIME ZONE
   );

   -- Time records table - stores user time entries
   CREATE TABLE time_records (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
     clock_out TIMESTAMP WITH TIME ZONE,
     is_manual BOOLEAN DEFAULT false,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- User roles table - manages user permissions
   CREATE TABLE user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     role user_role NOT NULL DEFAULT 'user',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );
   ```

3. **Database Functions**
   The application uses several database functions for secure operations:

   - `is_admin(user_uid UUID)`: Checks if a user has admin privileges
   - `handle_new_user()`: Automatically creates profile and role entries for new users
   - `get_user_email(admin_uid UUID, target_user_id UUID)`: Allows admins to fetch user emails
   - `update_user_credentials(admin_uid UUID, target_user_id UUID, new_email TEXT, new_password TEXT)`: Allows admins to update user credentials

4. **Triggers**
   - `on_auth_user_created`: Automatically sets up new user profiles and roles

## Environment Setup

1. **Configure Supabase Client**
   Update the environment variables in your project:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Development**
   ```sh
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

## Features

### Authentication
- Email/password signup and login
- Admin/User role management
- Secure credential management

### Time Tracking
- Clock in/out functionality
- Manual time entry support
- Notes for time records
- Monthly hours summary

### Admin Dashboard
- User management
- User profile editing
- Time record viewing
- Monthly hours reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## License

This project is MIT licensed. See the LICENSE file for details.

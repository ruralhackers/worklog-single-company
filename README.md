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

## Deployment Steps

1. **Create a Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project" and follow the setup wizard
   - Save your project URL and anon key for later

2. **Set Up Database Schema**
   - In your Supabase project, go to the SQL editor
   - Copy and paste the following SQL commands:

```sql
-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create time records table
CREATE TABLE time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  is_manual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uid UUID)
RETURNS BOOLEAN
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

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- Create the profile
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
end;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

3. **Clone and Configure**
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

4. **Configure Supabase**
   - Update the Supabase configuration in `src/integrations/supabase/client.ts` with your project URL and anon key
   - Or use environment variables if deploying to a platform that supports them

5. **Build and Deploy**

There are several ways to deploy your application:

**Deploy with Netlify:**
1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Deploy!

**Deploy with Vercel:**
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Deploy!

**Deploy with GitHub Pages:**
1. In your repository settings, enable GitHub Pages
2. Add this to your `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: '/<repository-name>/',
     // ... other config
   })
   ```
3. Add a GitHub Action workflow:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Install Dependencies
           run: npm install
         - name: Build
           run: npm run build
         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@4.1.1
           with:
             branch: gh-pages
             folder: dist
   ```

## Development

To run the project locally:

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Customization

You can customize the application by:
- Modifying the UI components in `src/components`
- Updating the styling using Tailwind CSS classes
- Adding new features through the Supabase backend

## Contributing

This project is open source. To contribute:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## Support

If you need help:
- Check the [Issues](https://github.com/yourusername/yourrepo/issues) section
- Create a new issue if you find a bug
- Reach out to the maintainers

## License

This project is MIT licensed. See the LICENSE file for details.

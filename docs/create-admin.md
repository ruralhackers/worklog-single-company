
# Creating the First Admin User

After setting up your database and creating a new user through the application's signup process, you'll need to manually assign the admin role to create the first administrator. Follow these steps:

1. First, sign up for a new account through the application
2. Note down the email you used to sign up
3. Go to the SQL Editor in your Supabase Dashboard
4. Run the following SQL query, replacing `'user@example.com'` with your actual email:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'user@example.com'
);
```

This will promote the specified user to an admin role. After this, you can use the application's admin interface to manage other users' roles.

## Alternative Method

If you know the user's UUID directly, you can use this query instead:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'YOUR-USER-UUID';
```

Replace `'YOUR-USER-UUID'` with the actual UUID of the user you want to make an admin.

## Verification

To verify the change, you can run:

```sql
SELECT 
    au.email,
    ur.role
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.role = 'admin';
```

This will show you all users with admin privileges.

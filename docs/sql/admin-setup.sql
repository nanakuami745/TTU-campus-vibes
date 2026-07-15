-- ============================================
-- CREATE ADMIN ACCOUNTS
-- ============================================
-- Run this AFTER database-setup.sql
-- ============================================

-- Method 1: Create admin via SQL (Recommended for first admin)
-- ============================================
-- Note: You need to create the user in Supabase Auth first, then update their profile

-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" and create with email/password
-- Step 3: Copy the User ID
-- Step 4: Run this query, replacing 'USER_ID_HERE' with the actual UUID

-- Example:
-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE id = 'paste-user-id-here';

-- ============================================
-- Method 2: Create admin programmatically
-- ============================================
-- You can also create a function to promote users to admin

CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET role = 'admin'
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage example:
-- SELECT promote_to_admin('admin@ttu.edu.gh');

-- ============================================
-- Method 3: Create multiple admins at once
-- ============================================
-- If you have a list of admin emails, you can promote them all:

-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email IN (
--     'admin1@ttu.edu.gh',
--     'admin2@ttu.edu.gh',
--     'admin3@ttu.edu.gh'
-- );

-- ============================================
-- Verify admin accounts
-- ============================================
-- Check all admin accounts:
SELECT id, email, full_name, role, is_active, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Admins CANNOT self-register through the app
-- 2. You must create admin accounts manually via Supabase Dashboard
-- 3. Then promote them to admin using one of the methods above
-- 4. Admin email should follow pattern: *@ttu.edu.gh
-- 5. Recommended first admin: admin@ttu.edu.gh

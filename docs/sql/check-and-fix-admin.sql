-- ============================================
-- CHECK AND FIX ADMIN ACCOUNT
-- ============================================

-- Step 1: Check current user role
SELECT 
    id,
    email,
    full_name,
    role,
    is_active
FROM profiles
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';

-- Step 2: If role is NOT 'admin', run this to fix it:
UPDATE profiles 
SET role = 'admin'
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';

-- Step 3: Verify the update worked
SELECT 
    id,
    email,
    full_name,
    role,
    is_active
FROM profiles
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';

-- Step 4: View all admins to confirm
SELECT 
    id,
    email,
    full_name,
    role
FROM profiles
WHERE role = 'admin';

-- ============================================
-- MANUALLY CONFIRM USER & PROMOTE TO ADMIN
-- ============================================
-- User ID: 0c19c888-3946-4508-ab0e-dce8dbbf83c9
-- ============================================

-- Step 1: Manually confirm the user in auth.users table
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE id = '0c19c888-3946-4508-ab0e-dce8dbbf83c9';

-- Step 2: Check if profile was created (should be automatic via trigger)
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM profiles
WHERE id = '0c19c888-3946-4508-ab0e-dce8dbbf83c9';

-- Step 3: If profile doesn't exist, create it manually
-- (Only run this if Step 2 returns no results)
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES (
    '0c19c888-3946-4508-ab0e-dce8dbbf83c9',
    'admin@ttu.edu.gh',  -- Replace with actual email
    'Admin User',         -- Replace with actual name
    'admin',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Promote user to admin (if profile already exists)
UPDATE profiles 
SET role = 'admin'
WHERE id = '0c19c888-3946-4508-ab0e-dce8dbbf83c9';

-- Step 5: Verify everything is set up correctly
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_active,
    u.email_confirmed_at,
    u.confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '0c19c888-3946-4508-ab0e-dce8dbbf83c9';

-- Expected result:
-- - role should be 'admin'
-- - is_active should be true
-- - email_confirmed_at should have a timestamp
-- - confirmed_at should have a timestamp

-- ============================================
-- ALTERNATIVE: Confirm ALL unconfirmed users
-- ============================================
-- (Only use this if you want to confirm all pending users)

-- UPDATE auth.users
-- SET 
--     email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE confirmed_at IS NULL;

-- ============================================
-- VIEW ALL ADMINS
-- ============================================
SELECT 
    id,
    email,
    full_name,
    role,
    is_active
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

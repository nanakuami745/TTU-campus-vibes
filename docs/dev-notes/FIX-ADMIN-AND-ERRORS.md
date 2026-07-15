# 🔧 Fix Admin Login & 406 Errors

## Issues Found

1. ❌ **Admin user redirected to student dashboard** - Role not set to 'admin'
2. ❌ **406 errors on likes** - Query using `.single()` instead of `.maybeSingle()`

## ✅ Fixes Applied

### Fix 1: Code Fix (Already Done)
- ✅ Updated `src/services/postService.js`
- ✅ Changed `.single()` to `.maybeSingle()` in `hasUserLiked()` function
- ✅ This fixes the 406 errors

### Fix 2: Database Fix (You Need to Do This)

---

## 🚀 Steps to Fix Admin Login

### Step 1: Run SQL to Promote User to Admin

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New query**
3. Copy and paste this:

```sql
-- Check current role
SELECT 
    id,
    email,
    full_name,
    role,
    is_active
FROM profiles
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';

-- Update to admin
UPDATE profiles 
SET role = 'admin'
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';

-- Verify it worked
SELECT 
    id,
    email,
    full_name,
    role
FROM profiles
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';
```

4. Click **Run**
5. Check the result - `role` should now be `'admin'`

### Step 2: Logout and Login Again

1. In your app, click **Logout**
2. Go to http://localhost:5173/login
3. Login with your admin credentials
4. You should now be redirected to `/admin/dashboard` ✅

---

## 🧪 Test Admin Features

After logging in as admin, you should see:

- ✅ Admin Dashboard with stats
- ✅ Moderation page (approve/reject posts)
- ✅ Users page (manage students)
- ✅ Broadcast page (send announcements)

---

## 🐛 If Still Having Issues

### Issue: Still redirected to student dashboard

**Check 1: Verify role in database**
```sql
SELECT email, role FROM profiles 
WHERE id = 'd12919db-3026-4200-99af-7deb702870e1';
```
Should return `role = 'admin'`

**Check 2: Clear browser cache**
- Press `Ctrl + Shift + Delete`
- Clear cookies and cache
- Or use Incognito mode

**Check 3: Check AuthContext**
- Open browser console (F12)
- Type: `localStorage.clear()`
- Refresh page
- Login again

### Issue: 406 errors still appearing

**Solution:** Restart dev server
```bash
# Press Ctrl+C
npm run dev
```

The code fix should resolve this automatically.

---

## 📊 Verify Everything Works

### Test Checklist:

- [ ] Admin can login
- [ ] Redirected to `/admin/dashboard`
- [ ] Dashboard shows stats
- [ ] Can navigate to Moderation
- [ ] Can navigate to Users
- [ ] Can navigate to Broadcast
- [ ] No 406 errors in console
- [ ] No 500 errors in console

---

## 🎯 Summary

**What was wrong:**
1. User account created but role was 'student' (default)
2. `.single()` query fails when no like exists

**What was fixed:**
1. ✅ Code: Changed `.single()` to `.maybeSingle()`
2. ⏳ Database: Need to run SQL to set role to 'admin'

**Next step:**
Run the SQL query above to promote your user to admin, then logout and login again!

---

## 💡 Pro Tip

When creating admin accounts in the future:

1. Create user in Supabase Auth
2. **Immediately** run this SQL:
```sql
UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@ttu.edu.gh';
```
3. Then login

This ensures the role is set before first login.

---

**Ready?** Run the SQL query now! 🚀

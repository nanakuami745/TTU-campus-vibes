# ✅ Setup Checklist

Copy this checklist and mark items as you complete them!

---

## 🔧 Local Setup

- [x] Clone repository from GitHub
- [x] Run `npm install`
- [x] Create `.env` file
- [x] Add Supabase credentials to `.env`
- [x] Fix Supabase URL (remove `/rest/v1/`)
- [ ] Restart dev server (`npm run dev`)
- [ ] Verify app loads at http://localhost:5173

---

## 🗄️ Supabase Database Setup

### Create Project
- [ ] Go to https://supabase.com
- [ ] Create new project: "TTU Campus Vibes"
- [ ] Save database password
- [ ] Wait for project to finish setting up
- [ ] Copy Project URL and anon key

### Run Database Schema
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy contents of `database-setup.sql`
- [ ] Paste and run the SQL
- [ ] Verify success message

### Verify Tables Created
- [ ] Run verification query:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```
- [ ] Confirm 7 tables exist:
  - [ ] profiles
  - [ ] posts
  - [ ] friendships
  - [ ] messages
  - [ ] notifications
  - [ ] likes
  - [ ] comments

### Check Triggers
- [ ] Verify auto-profile trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

---

## 🖼️ Storage Setup

### Create Buckets
- [ ] Go to Storage in Supabase Dashboard
- [ ] Create bucket: `avatars` (Public: Yes)
- [ ] Create bucket: `covers` (Public: Yes)
- [ ] Create bucket: `post-media` (Public: Yes)

### Verify Bucket Policies
- [ ] Click on `avatars` bucket → Policies tab
- [ ] Verify policies exist (SELECT, INSERT, UPDATE)
- [ ] Repeat for `covers` bucket
- [ ] Repeat for `post-media` bucket

---

## 👨‍💼 Admin Account Setup

### Create First Admin
- [ ] Go to Authentication → Users
- [ ] Click "Add user" → "Create new user"
- [ ] Email: `admin@ttu.edu.gh`
- [ ] Password: (create strong password)
- [ ] Check "Auto Confirm User"
- [ ] Click "Create user"
- [ ] Copy the User ID (UUID)

### Promote to Admin Role
- [ ] Go to SQL Editor
- [ ] Run promotion query (replace USER_ID):
  ```sql
  UPDATE profiles 
  SET role = 'admin'
  WHERE id = 'USER_ID_HERE';
  ```
- [ ] Verify admin created:
  ```sql
  SELECT email, role FROM profiles WHERE role = 'admin';
  ```

---

## 🧪 Testing

### Test Student Registration
- [ ] Go to http://localhost:5173/register
- [ ] Try invalid email (should fail): `test@gmail.com`
- [ ] Use valid email: `student@ttu.edu.gh`
- [ ] Fill in: Name, Password, Department, Level
- [ ] Click Register
- [ ] Verify success and redirect to feed

### Test Admin Login
- [ ] Go to http://localhost:5173/login
- [ ] Login with admin credentials
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Check dashboard shows stats
- [ ] Navigate to Moderation page
- [ ] Navigate to Users page
- [ ] Navigate to Broadcast page

### Test Student Login
- [ ] Logout from admin
- [ ] Login with student account
- [ ] Verify redirect to feed (`/`)
- [ ] Check navigation works:
  - [ ] Feed
  - [ ] Network
  - [ ] Messages
  - [ ] Notifications
  - [ ] Profile

### Test Profile Features
- [ ] Click on profile
- [ ] Try uploading avatar
- [ ] Try uploading cover photo
- [ ] Edit profile details
- [ ] Save changes
- [ ] Verify changes persist after refresh

### Test Post Creation
- [ ] Create a "Friends Only" post
- [ ] Verify it appears immediately
- [ ] Create a "Public" post
- [ ] Verify status shows "Pending"
- [ ] Login as admin
- [ ] Go to Moderation
- [ ] Approve the post
- [ ] Logout and login as student
- [ ] Verify post now shows in feed

### Test Friend System
- [ ] Create second student account
- [ ] Search for first student
- [ ] Send friend request
- [ ] Login as first student
- [ ] Check notifications
- [ ] Accept friend request
- [ ] Verify both users show as friends

### Test Messaging
- [ ] As student 1, go to Messages
- [ ] Start conversation with student 2
- [ ] Send a message
- [ ] Login as student 2
- [ ] Check messages
- [ ] Reply to message
- [ ] Verify conversation works

### Test Notifications
- [ ] Create post as student 1
- [ ] Like post as student 2
- [ ] Login as student 1
- [ ] Check notifications
- [ ] Verify like notification appears
- [ ] Mark as read
- [ ] Verify notification marked

---

## 📧 Email Configuration (Optional)

### Test Default Emails
- [ ] Try password reset flow
- [ ] Check email arrives
- [ ] Test reset link works

### Configure Custom SMTP (Production)
- [ ] Go to Settings → Auth
- [ ] Scroll to SMTP Settings
- [ ] Enable custom SMTP
- [ ] Add SMTP credentials
- [ ] Test email sending

### Customize Email Templates
- [ ] Go to Authentication → Email Templates
- [ ] Customize "Confirm signup" template
- [ ] Customize "Reset password" template
- [ ] Test templates

---

## 🚀 Deployment (When Ready)

### Prepare for Deployment
- [ ] Run `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Fix any build errors
- [ ] Commit all changes to git
- [ ] Push to GitHub

### Deploy to Netlify
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Add environment variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy site
- [ ] Test production site

### Post-Deployment
- [ ] Test all features in production
- [ ] Create production admin accounts
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring
- [ ] Enable email verification
- [ ] Test email flows in production

---

## 🔐 Security Checklist

- [ ] Verify RLS policies are enabled on all tables
- [ ] Test that students can't access admin routes
- [ ] Test that users can only edit their own data
- [ ] Verify email validation works
- [ ] Test that deactivated users can't login
- [ ] Verify storage buckets have correct policies
- [ ] Test that users can't see pending posts from others
- [ ] Verify friend-only posts are actually private

---

## 📊 Performance Checklist

- [ ] Check database indexes are created
- [ ] Test feed loads quickly with many posts
- [ ] Verify images load properly
- [ ] Test with slow network (throttle in DevTools)
- [ ] Check for console errors
- [ ] Verify no memory leaks (long session test)

---

## 📝 Documentation Checklist

- [ ] Read `SETUP-GUIDE.md`
- [ ] Bookmark `QUICK-REFERENCE.md`
- [ ] Save database password securely
- [ ] Document any custom changes
- [ ] Create admin user guide
- [ ] Create student user guide (optional)

---

## 🎯 Final Verification

- [ ] All tables created ✓
- [ ] All storage buckets created ✓
- [ ] Admin account works ✓
- [ ] Student registration works ✓
- [ ] Posts work ✓
- [ ] Friends work ✓
- [ ] Messages work ✓
- [ ] Notifications work ✓
- [ ] Image uploads work ✓
- [ ] Moderation works ✓
- [ ] No console errors ✓
- [ ] No 404 errors ✓

---

## 🎉 Completion

When all items are checked:

- [ ] Take a screenshot of working app
- [ ] Celebrate! 🎊
- [ ] Start using the platform
- [ ] Gather user feedback
- [ ] Plan next features

---

**Current Progress:** _____ / _____ items completed

**Estimated Time:** 30-45 minutes for complete setup

**Last Updated:** [Add date when you start]

---

## 💡 Tips

- Don't skip steps - they build on each other
- Test as you go - don't wait until the end
- Keep Supabase dashboard open in another tab
- Use browser DevTools console to debug
- Refer to SETUP-GUIDE.md for detailed instructions

---

**Good luck with your setup! 🚀**

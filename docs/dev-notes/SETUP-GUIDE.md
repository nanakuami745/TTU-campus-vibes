# TTU Campus Vibes - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works)
- Git

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

✅ **Status:** Already completed!

---

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Name:** TTU Campus Vibes
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to Ghana (e.g., Frankfurt or London)
5. Click **"Create new project"** and wait for setup to complete

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 2.3 Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.4 Run Database Setup SQL

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `database-setup.sql`
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. Wait for success message: "Success. No rows returned"

This creates:
- ✅ All 7 required tables
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Auto-profile creation trigger
- ✅ Storage buckets for images

### 2.5 Verify Database Setup

In SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- comments
- friendships
- likes
- messages
- notifications
- posts
- profiles

---

## 👨‍💼 Step 3: Create Admin Account

### 3.1 Create Admin User in Supabase Auth

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. Fill in:
   - **Email:** `admin@ttu.edu.gh` (or your preferred admin email)
   - **Password:** Create a strong password
   - **Auto Confirm User:** ✅ Check this box
4. Click **"Create user"**
5. **Copy the User ID** (UUID) from the users list

### 3.2 Promote User to Admin

1. Go to **SQL Editor**
2. Run this query (replace `USER_ID_HERE` with the copied UUID):

```sql
UPDATE profiles 
SET role = 'admin'
WHERE id = 'USER_ID_HERE';
```

3. Verify admin was created:

```sql
SELECT id, email, full_name, role 
FROM profiles 
WHERE role = 'admin';
```

You should see your admin account listed.

---

## 🎨 Step 4: Configure Storage Buckets

### 4.1 Create Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Create three buckets:

**Bucket 1: avatars**
- Click **"New bucket"**
- Name: `avatars`
- Public bucket: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 2: covers**
- Click **"New bucket"**
- Name: `covers`
- Public bucket: ✅ **Yes**
- Click **"Create bucket"**

**Bucket 3: post-media**
- Click **"New bucket"**
- Name: `post-media`
- Public bucket: ✅ **Yes**
- Click **"Create bucket"**

### 4.2 Verify Storage Policies

The storage policies were created automatically by the SQL script. To verify:

1. Click on each bucket
2. Go to **Policies** tab
3. You should see policies for SELECT, INSERT, and UPDATE

---

## 📧 Step 5: Configure Email Settings (Optional but Recommended)

### 5.1 Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customize these templates:
   - **Confirm signup** - For email verification
   - **Reset password** - For password recovery
   - **Magic Link** - For passwordless login (if needed)

### 5.2 SMTP Settings (For Production)

For production, configure custom SMTP:

1. Go to **Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP and configure your email provider

For development, Supabase's default email works fine.

---

## 🚀 Step 6: Run the Application

### 6.1 Start Development Server

```bash
npm run dev
```

The app should start at: `http://localhost:5173`

### 6.2 Test the Setup

**Test Student Registration:**
1. Go to `http://localhost:5173/register`
2. Register with email: `student@ttu.edu.gh`
3. Use any password
4. Fill in name and other details
5. Click Register

**Test Admin Login:**
1. Go to `http://localhost:5173/login`
2. Login with your admin credentials
3. You should be redirected to `/admin/dashboard`

**Test Student Login:**
1. Logout from admin
2. Login with student credentials
3. You should see the student feed

---

## 🔧 Troubleshooting

### Issue: "Failed to load resource: 404"

**Problem:** Incorrect Supabase URL in `.env`

**Solution:**
1. Check your `.env` file
2. Ensure `VITE_SUPABASE_URL` is correct (no trailing slash)
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Issue: "Missing Supabase Environment Variables"

**Problem:** Environment variables not loaded

**Solution:**
1. Ensure `.env` file is in project root
2. Restart dev server
3. Check that variables start with `VITE_`

### Issue: "Email validation failed"

**Problem:** Email doesn't match TTU pattern

**Solution:**
- Student emails must end with `@ttu.edu.gh`
- Example: `bcict22101@ttu.edu.gh`

### Issue: "Profile not found after registration"

**Problem:** Trigger not working

**Solution:**
1. Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
2. If missing, re-run the trigger creation part of `database-setup.sql`

### Issue: "Cannot upload images"

**Problem:** Storage buckets not configured

**Solution:**
1. Verify buckets exist in Storage section
2. Check bucket names match exactly: `avatars`, `covers`, `post-media`
3. Ensure buckets are public
4. Verify storage policies are in place

---

## 📊 Database Schema Overview

### Tables

1. **profiles** - User accounts (students & admins)
   - Linked to Supabase Auth
   - Stores role, bio, department, etc.

2. **posts** - User posts
   - Has moderation status (pending/approved/rejected)
   - Supports visibility (public/friends)

3. **friendships** - Friend connections
   - Tracks friend requests and accepted friendships

4. **messages** - Direct messages between users

5. **notifications** - User notifications
   - Friend requests, likes, comments, etc.

6. **likes** - Post likes

7. **comments** - Post comments

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Email domain validation (@ttu.edu.gh)
- ✅ Role-based access control
- ✅ Secure password recovery
- ✅ Protected admin routes
- ✅ Automatic profile creation on signup

---

## 🌐 Deployment

### Frontend (Netlify)

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Backend

Backend is handled by Supabase - no additional deployment needed!

---

## 📝 Next Steps

1. ✅ Test all features:
   - Student registration
   - Admin login
   - Post creation
   - Friend requests
   - Messaging
   - Notifications

2. ✅ Customize:
   - Update logo and branding
   - Modify email templates
   - Adjust UI colors

3. ✅ Production:
   - Set up custom domain
   - Configure production SMTP
   - Enable email verification
   - Set up monitoring

---

## 🆘 Need Help?

- Check Supabase logs: Dashboard > Logs
- Check browser console for errors
- Verify RLS policies are correct
- Test SQL queries in SQL Editor

---

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

**Setup Complete! 🎉**

Your TTU Campus Vibes platform is now ready for development and testing!

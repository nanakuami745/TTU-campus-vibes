# Quick Reference Card

## 🔑 Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🌐 Default URLs

- **Development:** http://localhost:5173
- **Student Routes:** `/`, `/network`, `/messages`, `/notifications`, `/profile`
- **Admin Routes:** `/admin/dashboard`, `/admin/moderation`, `/admin/users`, `/admin/broadcast`

## 📧 Email Pattern

**Students:** `*@ttu.edu.gh`
- ✅ `bcict22101@ttu.edu.gh`
- ✅ `student@ttu.edu.gh`
- ❌ `student@gmail.com`

**Admins:** Same pattern, but manually promoted

## 🗄️ Supabase Quick Access

### Get to SQL Editor
Dashboard → SQL Editor → New Query

### Get to Storage
Dashboard → Storage → Select Bucket

### Get to Auth Users
Dashboard → Authentication → Users

### Get API Credentials
Dashboard → Settings → API

## 📊 Quick SQL Queries

### Check all tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View all admins
```sql
SELECT email, full_name, role FROM profiles WHERE role = 'admin';
```

### Promote user to admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@ttu.edu.gh';
```

### Count users by role
```sql
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

### View recent posts
```sql
SELECT p.content, pr.full_name, p.status, p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### View pending posts (for moderation)
```sql
SELECT p.*, pr.full_name as author
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
```

## 🔐 User Roles

| Role | Can Register | Can Post | Posts Need Approval | Can Moderate |
|------|--------------|----------|---------------------|--------------|
| Student | ✅ Yes | ✅ Yes | ✅ Yes (public posts) | ❌ No |
| Admin | ❌ No (manual) | ✅ Yes | ❌ No (auto-approved) | ✅ Yes |

## 📝 Post Visibility & Status

### Visibility Types
- **Public:** Visible to all users (needs admin approval for students)
- **Friends:** Visible only to accepted friends (no approval needed)

### Status Types
- **Pending:** Waiting for admin approval
- **Approved:** Visible to intended audience
- **Rejected:** Not visible (author can see it)

### Post Flow
```
Student creates public post → Status: pending → Admin approves → Status: approved → Visible to all
Student creates friends post → Status: approved → Visible to friends immediately
Admin creates post → Status: approved → Visible to all immediately
```

## 🗂️ Storage Buckets

| Bucket | Purpose | Public |
|--------|---------|--------|
| `avatars` | Profile pictures | ✅ Yes |
| `covers` | Cover photos | ✅ Yes |
| `post-media` | Post images | ✅ Yes |

## 🔔 Notification Types

- `friend_request` - Someone sent you a friend request
- `friend_accept` - Someone accepted your friend request
- `like` - Someone liked your post
- `comment` - Someone commented on your post
- `post_approved` - Admin approved your post
- `post_rejected` - Admin rejected your post

## 🐛 Common Issues & Fixes

### Issue: 404 Error on Login
**Fix:** Check `.env` file, restart dev server

### Issue: Can't Register
**Fix:** Ensure email ends with `@ttu.edu.gh`

### Issue: Profile Not Created
**Fix:** Check trigger exists in database

### Issue: Can't Upload Images
**Fix:** Verify storage buckets exist and are public

### Issue: Admin Can't See Dashboard
**Fix:** Verify role is set to 'admin' in profiles table

## 📱 Test Accounts

### Create Test Student
```
Email: test.student@ttu.edu.gh
Password: TestPass123!
Name: Test Student
```

### Create Test Admin
1. Create user in Supabase Auth
2. Run: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@ttu.edu.gh';`

## 🔍 Debugging Tips

### Check Auth State
```javascript
// In browser console
supabase.auth.getSession()
```

### Check Current User
```javascript
// In browser console
supabase.auth.getUser()
```

### View Supabase Logs
Dashboard → Logs → Select log type

### Check RLS Policies
Dashboard → Database → Tables → Select table → Policies tab

## 📦 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── feed/        # Feed-related components
│   ├── profile/     # Profile components
│   ├── notifications/
│   └── ui/          # Basic UI elements
├── context/         # React Context (Auth, Notifications)
├── layouts/         # Layout components
├── lib/             # Supabase client
├── pages/           # Page components
│   └── admin/       # Admin pages
├── services/        # API service functions
└── App.jsx          # Main app with routes
```

## 🎯 Feature Checklist

- ✅ User registration (students only)
- ✅ Email validation (@ttu.edu.gh)
- ✅ Role-based authentication
- ✅ Profile management
- ✅ Post creation with visibility
- ✅ Post moderation (admin)
- ✅ Friend system
- ✅ Direct messaging
- ✅ Notifications
- ✅ Admin dashboard
- ✅ User management (admin)

## 🚀 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Netlify account
- [ ] Connect GitHub repo to Netlify
- [ ] Add environment variables in Netlify
- [ ] Configure custom domain (optional)
- [ ] Set up custom SMTP for emails
- [ ] Create admin accounts
- [ ] Test all features in production
- [ ] Enable email verification
- [ ] Set up monitoring/analytics

---

**Keep this file handy for quick reference during development!**

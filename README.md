# TTU Campus Vibes

A closed, verified social platform built exclusively for Takoradi Technical University (TTU) students — posts, friends, messaging, notifications, and institutional moderation, with academic identity (department, level, courses) at its core rather than bolted on.

> See [`docs/DIFFERENTIATION.md`](docs/DIFFERENTIATION.md) for what makes this different from a generic Facebook/WhatsApp clone.

## Features

**Students**
- Register with a verified `@ttu.edu.gh` institutional email only
- Create posts with **Friends Only** (instant) or **Public** (admin-reviewed) visibility
- Send/accept friend requests, view friend lists and mutual friends
- Real-time messaging with friends
- Notifications for friend activity
- Full profile management (avatar, cover photo, bio, department, level)

**Admins**
- Post public institutional broadcasts (auto-notifies all students)
- Review and approve/reject public posts before they go live
- Manage and deactivate student accounts
- Moderate reported content

**Shared**
- Single login form; role-based redirect after authentication
- Supabase Auth with email/password + password recovery
- No dummy data, no client-side persistence — all state is server-backed via Supabase

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (Auth, PostgreSQL, Row-Level Security, Storage)
- **Deployment:** Netlify (frontend), Render (small Express server), GitHub

## Project Structure

```
src/
  components/    UI building blocks (feed, layout, profile, notifications, ui)
  context/       React context providers (auth, notifications)
  layouts/       Shared page shells for student/admin areas
  pages/         Route-level pages, incl. admin/ subroutes
  services/      Supabase data-access layer (posts, friends, messages, admin)
  lib/           Supabase client setup
server/          Minimal Express server (see render.yaml)
docs/            Architecture, PRD, differentiation strategy, SQL setup scripts
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project (Project Settings → API).

3. **Set up the database**
   Run the SQL in `docs/sql/database-setup.sql` against your Supabase project, then `docs/sql/fix-rls-policies.sql` for Row-Level Security. See `docs/sql/` for admin-promotion and utility scripts.

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — full product requirements
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture and data flow
- [`docs/DIFFERENTIATION.md`](docs/DIFFERENTIATION.md) — unique features and roadmap
- [`docs/sql/`](docs/sql) — database setup and admin scripts
- [`docs/dev-notes/`](docs/dev-notes) — historical build/troubleshooting notes

## Security Note

Registration is restricted to `@ttu.edu.gh` emails, validated both client- and server-side. Row-Level Security is enforced at the database level so students can never read/write data outside their permitted scope, regardless of client-side checks.

# Supabase Setup

This guide explains how to connect Youshu Web to a Supabase project for local development or self-hosting.

Youshu Web stores personal asset, stock transaction, and metric data. Use a Supabase project you control, keep Row Level Security enabled, and do not commit secrets or production data to the repository.

## 1. Create a Supabase Project

1. Create a new project in Supabase.
2. Save the project URL and anon public key.
3. Keep the service role key private. The current app only needs the anon public key in `.env.local`.

## 2. Configure Environment Variables

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For Vercel or another deployment provider, add the same variables in the deployment environment settings.

## 3. Apply Database SQL

The SQL files live in `supabase/`:

- `schema.sql` creates the initial asset and transaction tables, enums, trigger, and RLS policies.
- `migration_v2.sql` adds currency support and the stock trades table.
- `fix.sql` is a destructive reset helper for early development and should not be applied to a production database with real data.

Recommended order for a new empty project:

1. Open the Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Run `supabase/migration_v2.sql`.
4. Review the created tables and RLS policies.

Do not run `fix.sql` unless you intentionally want to drop and recreate early asset tables.

## 4. Auth Configuration

In Supabase Auth settings:

1. Enable email authentication.
2. Set the site URL to your local or deployed app URL.
3. Add redirect URLs for local development and production.

Common redirect URLs:

```text
http://localhost:3000
http://localhost:3000/reset-password
https://youshu-web.vercel.app
https://youshu-web.vercel.app/reset-password
```

Adjust production URLs if you deploy to another domain.

## 5. Row Level Security Checklist

Before using real data, confirm:

- RLS is enabled on user-owned tables.
- Select policies only allow `auth.uid() = user_id`.
- Insert policies require `auth.uid() = user_id`.
- Update and delete policies only allow the owner to modify records.
- Server-side queries filter by the authenticated `user_id`.
- Anonymous users cannot read asset, transaction, stock, or metric records.

## 6. Local Validation

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a test account, and verify:

- The app redirects unauthenticated users to login.
- A signed-in user can create and view their own records.
- A second test user cannot see the first user's records.
- Password reset redirects back to the configured app URL.

## 7. Deployment Notes

For Vercel:

1. Import the GitHub repository.
2. Add the Supabase environment variables.
3. Deploy.
4. Confirm the production URL is listed in Supabase Auth redirect URLs.

## Security Notes

- Never expose the Supabase service role key in browser code.
- Never commit `.env.local`.
- Use sample data for screenshots and issue reports.
- Report vulnerabilities privately according to `SECURITY.md`.

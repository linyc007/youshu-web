# Contributing to Youshu Web

Thanks for considering a contribution. Youshu Web is an early-stage open-source personal finance and data tracking app, so clear changes, careful testing, and security-minded review matter more than large patches.

## Ways to Contribute

- Improve documentation for setup, Supabase configuration, and deployment.
- Add tests for asset depreciation, stock holdings, and profit/loss calculations.
- Improve authentication, route protection, and Supabase Row Level Security checks.
- Fix responsive layout issues on mobile and narrow screens.
- Improve accessibility, form validation, loading states, and error handling.
- Propose small, focused feature improvements through an issue before opening a large PR.

## Local Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.local.example .env.local
```

Set your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

## Development Guidelines

- Keep changes focused and easy to review.
- Prefer TypeScript types over `any`.
- Preserve user data isolation in every database query.
- Keep financial calculations deterministic and explain assumptions in the PR.
- Do not commit secrets, local environment files, exported user data, or Supabase service-role keys.
- Update documentation when behavior, setup steps, or database requirements change.

## Checks Before Opening a PR

Run the relevant checks:

```bash
npm run lint
npm run build
```

If a check cannot be run locally, mention why in the PR description.

## Security-Sensitive Changes

Changes involving authentication, protected routes, Supabase queries, RLS policies, password reset flows, or financial records need extra care. Please include:

- The data access rule being changed.
- The expected owner/user isolation behavior.
- How you tested unauthorized access cases.
- Any database migration or rollback notes.

## Pull Request Checklist

- The change has a clear purpose and small scope.
- User-facing behavior is described in the PR.
- Relevant docs are updated.
- Lint/build status is included.
- Screenshots are attached for UI changes when possible.
- Security and privacy impact is considered.

# Youshu Web

Youshu Web is an open-source personal data and asset tracking application. It helps individuals keep a clear view of long-term assets, stock transactions, multi-currency holdings, and custom metrics through a private dashboard.

The project is built as a deployable Next.js application backed by Supabase, with a focus on privacy-conscious personal finance workflows and clear, maintainable TypeScript code.

## Project Status

Youshu Web is an early-stage project maintained in public. The app is deployed at [youshu-web.vercel.app](https://youshu-web.vercel.app), and the repository includes setup docs, a security policy, contribution guidelines, issue templates, and a public roadmap.

## Features

- Email authentication, password reset, and protected app routes with Supabase Auth.
- Asset dashboard for creating, editing, selling, deleting, and undoing asset sale records.
- Stock transaction module with holdings, trade history, realized/floating profit and loss, and multi-currency summaries.
- Metrics dashboard with chart-based personal data visualization.
- Responsive layout for desktop and mobile usage.
- Supabase PostgreSQL schema and migration files for the backend data model.

## Screenshots

Product screenshots should use sample data only. See [docs/screenshots](docs/screenshots/README.md) for the screenshot checklist and recommended image names.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Supabase Auth and PostgreSQL
- Recharts
- Framer Motion
- Vercel deployment

## Repository Structure

```text
.github/              Issue templates and pull request template
docs/                 Roadmap, screenshot guidance, and maintenance notes
src/app/              Next.js routes and layouts
src/components/       Dashboard, stock, layout, and UI components
src/context/          Authentication context
src/hooks/            Shared React hooks
src/lib/              Supabase clients and utilities
src/types/            Shared TypeScript types
supabase/             Database schema and migration SQL
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Set the required Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
- [Screenshot guide](docs/screenshots/README.md)
- [Suggested starter issues](docs/maintenance/ISSUE_SEEDS.md)

## Database

The Supabase SQL files live in `supabase/`:

- `schema.sql` contains the initial database structure.
- `migration_v2.sql` contains later stock and asset tracking changes.
- `fix.sql` contains follow-up database fixes.

Before using the app with real data, review the SQL files and apply them to a Supabase project you control. Keep Row Level Security enabled for user-owned financial data.

## Scripts

```bash
npm run dev      # Start the local development server
npm run build    # Build the production app
npm run start    # Start the production server
npm run lint     # Run Next.js linting
```

## Roadmap

- Improve documentation for local Supabase setup.
- Add focused tests for asset and stock calculation logic.
- Harden authentication, authorization, and Row Level Security workflows.
- Improve stock quote update flows and cost-basis reporting.
- Expand metric tracking while keeping the app simple and privacy-focused.

## Contributing

Issues and pull requests are welcome. For changes that affect financial calculations, authentication, database access, or Row Level Security, please include a clear explanation of the behavior being changed and how it was tested.

## Security

Please do not open public issues for vulnerabilities involving authentication, private user data, or Supabase access control. Contact the maintainer privately or open a minimal report without sensitive details.

## License

Youshu Web is dual-licensed under either of:

- MIT License ([LICENSE-MIT](LICENSE-MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))

You may choose either license when using, modifying, or distributing this project.

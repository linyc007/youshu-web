# Roadmap

This roadmap keeps the project direction visible for users, contributors, and open-source program reviewers. Items may change as the app matures.

## Near Term

- Document a complete Supabase setup path, including schema import, auth settings, and Row Level Security expectations.
- Add tests for asset daily cost, sold-asset review, stock holdings, and realized/floating profit and loss calculations.
- Review protected routes and Supabase access patterns for user data isolation.
- Improve mobile table layouts for assets and stock transactions.
- Add screenshots for login, dashboard, stock holdings, and metrics views.

## Security and Reliability

- Add a repeatable checklist for Supabase RLS policy review.
- Audit forms for input validation and error handling.
- Add dependency review steps before releases.
- Document backup/export expectations for users who self-host.

## Product Direction

- Improve stock quote update workflows while keeping manual entry as a reliable fallback.
- Expand metrics tracking without turning the app into a high-friction daily logging tool.
- Improve onboarding so new users understand the asset model quickly.
- Add clearer empty states and first-run guidance.

## Maintainer Workflow

- Use labeled issues to track roadmap, security, documentation, testing, and good-first-issue work.
- Keep changes small enough for review.
- Publish release notes for meaningful changes.
- Prioritize security and correctness for financial-data workflows.

# Suggested GitHub Issues

Use these as initial public issues to show the project roadmap and make contribution opportunities clear. Labels are suggestions; create the labels in GitHub before applying them if they do not exist yet.

## Issue 1

Title: `Roadmap: improve OSS readiness and maintainer workflow`

Labels: `roadmap`, `documentation`, `maintenance`

Body:

```markdown
## Goal

Track the near-term work needed to make Youshu Web easier to evaluate, self-host, and contribute to.

## Tasks

- [ ] Add complete Supabase setup documentation.
- [ ] Add product screenshots with demo data.
- [ ] Add tests for asset and stock calculation logic.
- [ ] Review protected routes and Supabase RLS assumptions.
- [ ] Improve release note and changelog workflow.

## Notes

This issue is intentionally broad and can be split into smaller issues as the project grows.
```

## Issue 2

Title: `Add tests for stock holdings and P&L calculations`

Labels: `testing`, `stock-module`, `good first issue`

Body:

```markdown
## Problem

The stock module includes holdings, transaction history, and profit/loss calculations. These are core financial workflows and need tests to prevent regressions.

## Proposed Work

- Add deterministic sample transaction data.
- Test buy/sell aggregation by symbol.
- Test realized and floating P&L assumptions.
- Document any cost-basis assumptions used by the implementation.

## Acceptance Criteria

- Tests can run locally.
- Edge cases such as partial sells and multiple currencies are covered or explicitly documented.
```

## Issue 3

Title: `Document Supabase setup and Row Level Security expectations`

Labels: `documentation`, `security`, `supabase`

Body:

```markdown
## Problem

Youshu Web depends on Supabase Auth, PostgreSQL tables, and Row Level Security. Contributors and self-hosters need clearer setup and security guidance.

## Proposed Work

- Document how to apply the SQL files in `supabase/`.
- Explain required environment variables.
- List expected RLS behavior for user-owned records.
- Add a checklist for verifying users cannot access each other's assets, stock transactions, or metrics.

## Acceptance Criteria

- A new contributor can set up a local Supabase-backed app from the docs.
- Security-sensitive assumptions are visible in the docs.
```

## Issue 4

Title: `Add product screenshots with sample data`

Labels: `documentation`, `ui`, `good first issue`

Body:

```markdown
## Goal

Add clear screenshots to help users and reviewers understand what Youshu Web does without signing in first.

## Screenshots Needed

- Login page.
- Asset dashboard.
- Stock holdings and transaction history.
- Metrics page.
- Mobile dashboard view.

## Requirements

- Use sample data only.
- Do not include real financial records, emails, tokens, or Supabase identifiers.
- Update the root README after screenshots are added.
```

## Issue 5

Title: `Review route protection and user data access patterns`

Labels: `security`, `auth`, `supabase`

Body:

```markdown
## Problem

Youshu Web handles private financial and personal metric data. Route protection and Supabase queries should be reviewed regularly.

## Review Areas

- Server-side user lookup before reading user-owned records.
- Queries filtered by authenticated `user_id`.
- Password reset and login flows.
- Client/server boundaries for Supabase access.
- Empty, loading, and unauthorized states.

## Acceptance Criteria

- Findings are documented.
- Any risky access pattern is fixed or tracked in a follow-up issue.
- RLS expectations are reflected in documentation.
```

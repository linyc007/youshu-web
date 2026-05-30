# Changelog

All notable changes to Youshu Web will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows semantic versioning while it is practical for an early-stage application.

## [Unreleased]

### Added

- Added Dependabot configuration for weekly npm dependency update pull requests.
- Added CODEOWNERS so repository ownership is explicit.

### Planned

- Add complete Supabase setup and self-hosting documentation.
- Add tests for asset daily cost, stock holdings, and profit/loss calculations.
- Review protected routes, Supabase queries, and Row Level Security assumptions.
- Add product screenshots with sample data.
- Improve release notes and maintainer workflow.

## [0.1.0] - 2026-05-31

### Added

- Initial public open-source release of Youshu Web.
- Next.js 14 App Router application with TypeScript and Tailwind CSS.
- Supabase Auth integration for login, password reset, and protected app routes.
- Asset dashboard for active and sold assets.
- Asset create, edit, delete, sell, and undo-sell flows.
- Multi-currency asset summaries.
- Stock transaction management with holdings and history views.
- Metrics visualization page.
- Supabase SQL schema and migration files.
- MIT OR Apache-2.0 dual licensing.
- Security policy, contributing guide, issue templates, PR template, roadmap, and starter issues.

### Security

- Added a public security policy for vulnerability reporting.
- Documented Row Level Security as a core review area.

[Unreleased]: https://github.com/linyc007/youshu-web/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/linyc007/youshu-web/releases/tag/v0.1.0

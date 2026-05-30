# Security Policy

Youshu Web handles personal asset, stock transaction, and metric data. Security reports are taken seriously, especially issues involving authentication, authorization, Supabase Row Level Security, private user records, database access, and dependency vulnerabilities.

## Supported Versions

The `main` branch is the only actively supported development line at this stage.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability.

Preferred reporting path:

1. Use GitHub private vulnerability reporting if it is enabled for this repository.
2. If private reporting is not available, contact the maintainer privately through the GitHub profile for `@linyc007`.
3. Include a minimal description, affected area, reproduction steps, expected impact, and any relevant logs or screenshots with secrets removed.

Please avoid including real financial data, Supabase keys, access tokens, cookies, or personally identifiable information in reports.

## Scope

Security-sensitive areas include:

- Supabase Auth flows, sessions, password reset, and route protection.
- Row Level Security policies and database access patterns.
- Asset, stock transaction, and metric records that belong to a specific user.
- Server/client boundary mistakes that may expose private data.
- Input validation for forms and database writes.
- Dependency vulnerabilities that affect deployed builds.

## Response Expectations

This is an early-stage project maintained by a single maintainer. I will make a best effort to acknowledge credible reports promptly, reproduce the issue, and prioritize fixes based on impact.

When a fix is available, I may publish a short security note that explains the affected area and recommended upgrade path without exposing unnecessary exploit detail.

## Safe Testing

Please test only against your own local deployment or data you control. Do not attempt to access, modify, or exfiltrate another user's data.

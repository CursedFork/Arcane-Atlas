# Security Policy

## Threat Model

Arcane Atlas MVP stores all user data locally (localStorage) with no backend.
The attack surface is limited but real:

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|-----------|
| Malicious JSON import | Medium | XSS / state corruption | Zod parse + string sanitization |
| Supply chain attack (npm) | Low | Full compromise | Dependabot + `npm audit` in CI |
| Clickjacking | Low | UI redress | `X-Frame-Options: DENY` |
| MIME sniffing | Low | Content injection | `X-Content-Type-Options: nosniff` |
| localStorage exfiltration | Low | Character data loss | No auth data stored; CSP restricts scripts |

## What Is In Scope

- Client-side vulnerabilities in the Next.js app
- Malformed input handling (JSON import, form fields)
- Dependency vulnerabilities in bundled packages

## What Is Out of Scope (MVP)

- Backend/server attacks (no backend exists)
- Authentication bypass (no auth in MVP)
- Database attacks (no database in MVP)

## Security Controls Implemented

### Content Security Policy
Strict CSP in `next.config.ts`:
- `default-src 'self'` — no external script/style/font loads except allowlisted
- `frame-ancestors 'none'` — prevents embedding
- Image allowlist for Open5e CDN monster art

### HTTP Security Headers
All responses include:
- `Strict-Transport-Security` (HSTS, 2-year max-age)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, mic, geolocation blocked

### Input Validation
- All homebrew JSON import goes through Zod `.safeParse()` before touching state
- String fields are length-capped (backstory ≤ 10,000 chars, names ≤ 100 chars, etc.)
- Array fields are length-capped (max 100 items per list)
- Files > 1 MB are rejected at the import handler
- Unknown fields are stripped by Zod's `.strip()` mode (default)

### Rendering Safety
- No `dangerouslySetInnerHTML` anywhere in the codebase
- Spell/monster descriptions rendered as plain text or safe markdown (HTML disabled)
- PDF renderer uses `@react-pdf/renderer` primitives — no HTML injection surface

### Dependencies
- `npm audit` run in CI on every PR
- Dependabot configured for weekly updates
- Node version pinned in `.nvmrc`

## Rate Limiting Plan (Post-MVP)

When Supabase is added:
- Row-level security on all user tables — users can only read/write their own data
- Supabase Edge Functions for any AI calls — rate-limited per user
- API routes protected with `createMiddlewareClient` auth check
- PDF generation endpoint: 10 req/min per IP via Upstash Redis

## Reporting Vulnerabilities

Please report security issues to: **security@arcane-atlas.app** (placeholder — update before launch)

**Do not open a public GitHub issue for security vulnerabilities.**

We aim to respond within 48 hours and publish fixes within 7 days of confirmation.

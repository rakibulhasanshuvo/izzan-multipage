# Security Audit Report — izzan_multipage

**Date:** 2026-08-23
**Scope:** Full codebase review (`src/`, `prisma/`, `scripts/`, Docker/deploy config, dependencies)
**Auditor:** Automated + manual source review
**Overall risk:** **HIGH** — primarily due to vulnerable dependencies and one exploitable upload flaw

---

## Executive Summary

The application is a Next.js 16 e-commerce storefront with a Prisma/SQLite backend, NextAuth credentials-based admin area, file uploads, and Docker deployment. The codebase shows strong security fundamentals (Zod validation, sanitized HTML, timing-safe token comparison, bcrypt-12, DB-side price recalculation, security headers). However, it ships with **9 known dependency vulnerabilities (1 critical, 7 high)**, a **stored-XSS path in the upload endpoint**, **spoofable rate-limit keys**, and several configuration weaknesses. No secrets were found committed to git.

**Test status at time of audit:** 37/37 unit tests passing (`npm test`).
**Secrets hygiene:** `.env` and `prisma/dev.db` are NOT tracked in git (verified via `git log --all`) — good.

---

## Findings

### CRITICAL

#### C1. Vulnerable `next-auth` ≤4.24.14 (npm audit: critical)
- **Where:** `package.json:32`
- **Detail:** Three advisories apply:
  - GHSA-7rqj-j65f-68wh — email normalizer homoglyph `@` bypass
  - GHSA-xmf8-cvqr-rfgj — `getToken()` throws uncaught exception on malformed Bearer headers (DoS on any route using it)
  - GHSA-x445-f3h2-j279 — OAuth state/nonce/PKCE cookies not bound to provider
- **Impact:** App uses only Credentials provider, so OAuth issues are latent, but the malformed-header DoS affects the auth surface directly.
- **Fix:** Upgrade to patched release (`npm audit fix`), or plan migration to Auth.js v5.

### HIGH

#### H1. Stored XSS via unrestricted upload extension (upload route)
- **Where:** `src/app/api/admin/upload/route.ts:68–73`
- **Detail:** MIME type and magic bytes are validated, but the saved file's extension is taken verbatim from `path.extname(file.name)`. A request declaring `video/mp4` with valid MP4 magic bytes but filename `evil.html` is stored as `public/uploads/evil_<ts>.html` and served from the site origin.
- **Impact:** Attacker-controlled HTML/JS on the main origin. CSP does not prevent this because `script-src 'unsafe-inline'` is allowed (see M3). Combined with the `admin_token` cookie read in `src/lib/auth.ts:33`, JS execution enables full admin API access.
- **Fix:** Allowlist extensions per detected content class (`[.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm]`); serve uploads from a separate cookie-less domain or add `Content-Disposition: attachment` / `X-Content-Type-Options` for `/uploads`; remove `'unsafe-inline'`.

#### H2. `sharp` <0.35 — libvips CVEs (CVE-2026-33327/33328/35590/35591)
- **Where:** `package.json:40`, used on every admin image upload (`upload/route.ts:60`)
- **Impact:** Image-parsing memory-corruption class bugs processing untrusted uploads. Auth-gated, but admins are high-value targets.
- **Fix:** `npm audit fix --force` → sharp 0.35.3 (breaking change; verify resize/webp pipeline).

#### H3. Rate-limit bypass via spoofable `X-Forwarded-For`
- **Where:** `src/lib/rate-limit.ts:29–40` (also `auth-options.ts:24–27`)
- **Detail:** Client IP is taken from the first `x-forwarded-for` entry with no trusted-proxy check. Direct-to-origin deployments let attackers rotate the header per request to defeat login/order/admin rate limits entirely.
- **Impact:** Brute-force and spam protection becomes advisory only.
- **Fix:** Trust XFF only when behind a known proxy (platform-aware), else use peer address; document topology.

#### H4. Static `ADMIN_TOKEN` bearer backdoor
- **Where:** `src/lib/auth.ts:30–48`
- **Detail:** All admin APIs accept a long-lived shared static token via `Authorization: Bearer` or an `admin_token` cookie in addition to sessions. No expiry, rotation, scoping, or audit attribution; the current local value is predictable (`dev-admin-token-secret-12345`). Comparison is timing-safe (good), but any leak grants permanent full admin access.
- **Fix:** Remove bearer path in production or replace with short-lived signed tokens; rotate current value; never reuse dev values across environments.

### MEDIUM

| ID | Finding | Location | Notes |
|----|---------|----------|-------|
| M1 | Redis password defaults to `changeme` if env unset | `docker-compose.yml:22,36` | Not host-exposed (good) but weak default; make required via `${REDIS_PASSWORD:?}` |
| M2 | Weak dev secrets in local `.env` (`dev-admin-token-secret-12345`, `adminpassword123`, `INITIAL_ADMIN_PASSWORD=adminpassword123`) | `.env` | Gitignored (verified), but risk of copy-paste into staging/prod. Rotate post-setup |
| M3 | CSP allows `script-src 'unsafe-inline' blob: data:` | `next.config.ts:7` | Defeats browser XSS mitigations; move to nonce/hash-based CSP |
| M4 | Internal error messages leaked to clients | `src/lib/api.ts:27` (`"Bad Request: " + err.message`), `orders/route.ts:206` (raw `err.message`) | Exposes Prisma/schema internals; return generic messages, log details server-side |
| M5 | CSRF origin check fails open | `orders/route.ts:13–23` | If both Origin and Referer are absent, request passes; also trusts Host header |
| M6 | Login rate limit too generous: 100 attempts / 15 min / IP, in-memory (resets on restart, per-instance) | `rate-limit.ts:11–12` | Lower for `login:` bucket; Redis mode already exists |
| M7 | Server action `updateOrderStatus` lacks status whitelist | `actions.ts:18–39` | API route enforces whitelist (`admin/orders/route.ts:5`); action accepts any string |
| M8 | `build` runs `prisma db push --accept-data-loss && prisma db seed` | `package.json:7` | Deploy-time data-loss footgun; use `prisma migrate deploy`, seed separately |
| M9 | Upload disk exhaustion: 100 MB videos stored raw, no quota/cleanup | `upload/route.ts:37,82–89` | Add per-user quotas and lifecycle cleanup |

### LOW

| ID | Finding | Location | Notes |
|----|---------|----------|-------|
| L1 | Unused/suspicious-looking dep `playright@0.0.22` (typo wrapper of playwright, stale since ~2021) | `package.json:34` | Verified non-malicious (wrapper around real playwright), but remove it; install `playwright` as devDependency if needed |
| L2 | Transitive vulns: nanoid (high), deepmerge-ts via prisma (high), postcss (high), undici (moderate) | lockfile | `npm audit fix` covers all but deepmerge-ts (needs prisma bump) |
| L3 | Hardcoded `http://localhost:3000` sitemap/NEXTAUTH_URL defaults | `robots.ts:10`, `.env` | Derive from `NEXT_PUBLIC_SITE_URL` |
| L4 | `next` listed under devDependencies | `package.json:57` | Breaks `npm ci --omit=dev` production installs; move to dependencies |
| L5 | Backups unencrypted, contain customer PII (names, phones, addresses) | `scripts/backup.sh` | Encrypt at rest, restrict permissions, retention currently commented out |
| L6 | HSTS `preload` declared before HTTPS/domain rollout confirmed | `next.config.ts:39` | Preload is hard to revoke; enable after domain verification |

---

## What Is Done Well

- `.env*`, `*.db`, uploads gitignored and verified never committed
- Zod validation on all public/admin inputs; order totals recalculated from DB (client price ignored)
- Stock decrement + order creation inside a transaction with post-check; idempotency keys
- bcrypt cost-12; `crypto.timingSafeEqual` for token comparison
- `sanitize-html` applied at write time (CMS API) and render time (Story component) — defense in depth
- Security headers suite: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy
- Uploads: MIME allowlist + magic-byte sniffing + size limits + sharp re-encode to WebP for images
- Env validation module blocks placeholder secrets in production and detects sensitive `NEXT_PUBLIC_*` leaks (`src/lib/env.ts`)
- Docker: multi-stage build, non-root user, Redis not exposed to host
- Separate rate-limit buckets for login/orders/admin; Redis-backed option with auth
- 37 unit tests covering auth/API logic, all passing

---

## Prioritized Remediation Plan

1. **Now:** `npm audit fix` (nanoid/postcss/undici/next-auth), then controlled upgrade `sharp@0.35.x` and `prisma` (fixes deepmerge-ts). Re-run test suite.
2. **Now:** Extension allowlist in upload route + stop serving user uploads inline from main origin (H1).
3. **This week:** Trusted-proxy IP handling (H3); decide fate of ADMIN_TOKEN bearer path and rotate it (H4).
4. **This week:** Make `REDIS_PASSWORD` required; rotate dev-only secrets; enforce strong initial admin password.
5. **Next sprint:** Nonce-based CSP without `unsafe-inline`; fail-closed origin check; generic error responses; status whitelist in server action.
6. **Next sprint:** Replace `db push --accept-data-loss` in build with migrations; add upload quotas/cleanup; encrypt backups.
7. **Hygiene:** Remove `playright`; move `next` to dependencies; derive URLs from env; revisit HSTS preload.

---

## Appendix — Verification Commands Used

```
npm audit --omit=dev        # 9 vulnerabilities (1 critical, 7 high, 1 moderate)
npm test                    # 4 files, 37 tests passed
git log --all -- .env prisma/dev.db   # no history → never committed
grep dangerouslySetInnerHTML src/**      # 2 uses, both sanitized
grep -E "(sk-...|AKIA...)" src/**        # no hardcoded secrets
```

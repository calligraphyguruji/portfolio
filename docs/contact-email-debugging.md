# Contact API startup and delivery investigation — 2026-10-27

## Root cause and evidence

The deployed contact routes returned HTTP 500 `FUNCTION_INVOCATION_FAILED` for GET requests, an empty POST body, and even a disallowed origin. These probes cannot send email. `/api/copilot` remained healthy. This establishes a contact function startup failure before the handler's validation, Turnstile request, database queries or Resend request. The frontend tried to parse Vercel's plain-text error as JSON, then displayed its generic email-service fallback.

The startup bug was reproduced using the actual `@vercel/node` builder in a temporary directory. It emitted `api/contact/[action].js` containing `export { default } from '../contact.ts'` and `api/contact.js` importing `../server/contact/service.ts`, while shipping those dependencies as `.js` files. Importing the built handler failed:

```text
Built handler: api/contact/[action].js runtime: nodejs files: 71
IMPORT FAILED: ERR_MODULE_NOT_FOUND Cannot find module '.../api/contact.ts'
```

`rewriteRelativeImportExtensions` was only enabled in `tsconfig.node.json`. Vercel resolves the root `tsconfig.json` for these routes and does not use the application's project reference the same way as `tsc -b`. Adding `rewriteRelativeImportExtensions: true` to the root compiler options corrected the runtime artifact:

```text
Built handler: api/contact/[action].js runtime: nodejs files: 73
IMPORT OK, handler type: function
```

A regression test emits only JavaScript artifacts using the root compiler options, imports both entry points and invokes the handlers. It would fail with the previous root configuration. Local native TypeScript tests alone had missed this deployment-only failure.

A separate read-only Neon inspection found no tables in `neondb` on project `nameless-river-99669120`, branch `production` (`br-small-king-a1xxyknw`). The contact service also requires `contact_submissions` and `contact_rate_events`, so its existing migration must be applied before production can send verification emails.

## Fixes

- Corrected the root TypeScript setting without changing routes or replacing Resend.
- Added structured, server-only configuration/database/Turnstile/email diagnostics, correlated by a generated request ID. Logs contain only known stage/reason/status fields and missing variable names, never raw exceptions, provider bodies, form data, email addresses, IPs, database URLs, tokens or API key values.
- Added separate CAPTCHA-service and email-service error codes. Resend 401/403/422/429/5xx failures are diagnosed privately and never reported as successful acceptance.
- Validated required fields and missing CAPTCHA tokens before infrastructure-dependent work. Missing/invalid configuration fails closed with safe public text.
- Preserved failed form inputs and reset both CAPTCHA token states. Turnstile error callbacks clear stale tokens. Browser storage failure cannot convert a successful verification-email response into an apparent send error.
- Preserved the existing 15-minute, single-use mailbox ownership flow, persistent rate limits, atomic consumption, and idempotent outbox delivery. A verification-email success means “check your inbox”, not that the contact message has already reached Aman.
- Added `npm run contact:check` for operator checks of variable presence, minimum HMAC-secret length, site URL, database connectivity, required tables, RLS and the backend owner role. It sends no email and prints no secret values.

## Files changed in this fix

`tsconfig.json`; `api/contact.ts`; `server/contact/service.ts`; `server/contact/email.ts`; new `server/contact/errors.ts`; `src/services/emailService.ts`; `src/components/sections/Contact.tsx`; `tests/contactApi.test.ts`; new `tests/contactRuntime.test.ts`; new `scripts/check-contact-config.mjs`; `package.json`; this report.

## Verification

- Real Vercel Node builder: corrected artifact imports successfully.
- HTTP smoke check against that emitted artifact: GET 405, disallowed-origin POST 403, missing fields 400, missing infrastructure configuration 503 with a safe `configuration_error` response.
- Full suite with isolated local PostgreSQL schema: 218 passing tests, no failures/skips. Cloudflare and Resend are mocked; no real emails are sent.
- `npm run build`: passes TypeScript checks, API bundling and Vite compilation. Existing bundle-size warning remains.
- `git diff --check`: passes. No lint script is configured in this repository.
- One-off server-rendered comparison: initial contact HTML exactly matches the previous committed component, including the Turnstile container. Navbar, stylesheet, typography, spacing, animations and responsive classes are unchanged. This is not a desktop/mobile pixel comparison.
- `npm run contact:check` correctly fails locally: there is no `.env` or `.env.local` in this workspace and required values are absent. This is not evidence that those values are absent from Vercel.

## Production status and remaining actions

No production code, secrets, DNS records or database tables were changed in this investigation. Existing local Vercel credentials return HTTP 403 `Not authorized`, preventing production-log, secret-configuration and deployment inspection. Runtime logs were requested from the owner; the startup mechanism above was independently reproduced from the source and builder rather than asserted from inaccessible production logs.

The Neon migration tool blocked the attempted additive migration: `MCP tool call requires approval, but approval policy is never`. The migration did not run. Run the existing [001_contact_verification.sql](../migrations/001_contact_verification.sql) once through Neon's SQL Editor as the backend table-owner role, or using a direct database connection. Do not bypass the tool's approval restriction.

Required Vercel Production variables:

- `DATABASE_URL` — the backend owner's private PostgreSQL TLS connection string (pooled for application traffic).
- `RESEND_API_KEY` — an active Resend sending key.
- `EMAIL_FROM` — a valid address on the domain verified in Resend, optionally with a display name.
- `TURNSTILE_SECRET_KEY` — existing Cloudflare secret.
- `VITE_TURNSTILE_SITE_KEY` — existing public widget key.
- `CONTACT_RATE_LIMIT_SECRET` — at least 32 random characters.
- `CRON_SECRET` — maintenance bearer credential.

Keep `CONTACT_SITE_URL=https://calligraphyguruji.dev`, `TURNSTILE_ALLOWED_HOSTNAMES=calligraphyguruji.dev,www.calligraphyguruji.dev`, and the existing `CONTACT_RECEIVER_EMAIL` (or the unchanged default inbox). Confirm sender SPF/DKIM/DMARC and disable verification-link click tracking in Resend. Existing optional contact limits remain unchanged.

After configuration, push this fix and redeploy Vercel so the changed root compiler options apply to the functions. Inspect the private `[contact]` event if any request still fails; its request ID and sanitized reason distinguish missing configuration, missing schema, CAPTCHA availability, and provider rejection. Confirm GET `/api/contact/request-verification` returns 405 instead of a platform 500. Then submit using your own mailbox, receive the verification email, click its link, and confirm the final message in the recipient inbox. Actual production email receipt and delivery have not been verified.

## Final self-check

Accuracy 4/5: startup failure and fix reproduced with the Vercel builder; production runtime logs are unavailable. Completeness 3/5: repository fix, diagnostics and tests are complete, but migration/deployment and live mailbox receipt remain blocked. Clarity 4/5: separate evidence for startup, schema and provider states. Actionability 4/5: exact migration, variables, diagnostic command and release checks are provided; operator access is still necessary. Conciseness 4/5: detailed evidence is kept here so the handoff can remain short. Overall 3.8/5. The remaining completeness gap requires the authorized operator to apply the migration and redeploy, then test their mailbox.

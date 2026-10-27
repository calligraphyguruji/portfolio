# Contact email investigation — 2026-10-27

## Current production evidence and root-cause limit

The current live deployment starts its contact function correctly. At 06:28 UTC:

- `https://calligraphyguruji.dev/api/contact` redirects with HTTP 308 to the www host.
- GET `https://www.calligraphyguruji.dev/api/contact` returns HTTP 200 and reports Resend, Turnstile, database and recipient configuration present. Request ID: `d8bc0793-bd5c-4649-bd0d-aa49cd4d03bd`.
- An empty JSON POST from the allowed www origin returns HTTP 400 `validation`. Request ID: `72414f46-93f1-4ff6-9c6e-181270ae51be`.

These checks cannot send mail. They establish routing and handler startup, not validity of provider credentials, sender domain verification or delivery. The previous version of this report described an earlier function startup failure; that explanation does not match the current live probes.

**The exact cause of the reported production send failure remains unconfirmed.** No failed real submission's private runtime log or provider response is accessible. Local Vercel credentials return HTTP 403 from `/v2/user`; no Vercel connector is available. There are no local email/Turnstile credentials. A sanitized failing request log was requested from the operator. Do not assume the provider, missing keys, or database caused the reported failure.

The connected Neon account lists a project named `portfolio-mail` and a production branch. The read-only schema query was rejected: `MCP tool call requires approval, but approval policy is never`. Its tables and the website's actual database binding remain unverified; no production SQL or migration ran. Codebase graph tools were unavailable, so discovery used repository source.

## Audited flow and confirmed code defects

`src/components/sections/Contact.tsx` → `src/services/emailService.ts` → same-origin POST `/api/contact` → `api/contact.ts` → `server/contact/service.ts` → Cloudflare Siteverify → rate reservation → `server/contact/email.ts` → Resend REST API (optional existing EmailJS fallback).

`api/contact/[action].ts` delegates to the same handler. Vercel's SPA rewrite excludes `/api/`; the root TypeScript config already rewrites relative `.ts` imports for emitted functions. `vite.config.ts` provides local API middleware. `server/index.ts` is the separate AI backend, not this contact route.

Confirmed defects fixed directly in the repository:

- Missing Turnstile secret allowed a literal `test-challenge` token even in production, and arbitrary tokens in development. All environments now require server-side Siteverify; use Cloudflare's test keys locally. Unlisted preview hostnames are no longer trusted by suffix.
- The direct Resend path accepted any HTTP 2xx response, even invalid JSON or missing message ID. It now reuses the existing transactional sender and requires a nonempty string acceptance ID.
- Duplicate/rate checks ran before sending but recorded only after sending, allowing concurrent duplicates and unlimited simultaneous attempts. Reservations now happen before dispatch. With `DATABASE_URL`, PostgreSQL transaction advisory locks and the existing `contact_rate_events` table share limits across instances/cold starts. A configured database failure fails closed and is logged safely. Without a database, limits remain per-process and cannot guarantee distributed enforcement.
- Provider retry keys included the current time, defeating safe retry. The key now hashes normalized contact content and name. Resend retains idempotency keys for 24 hours, so identical payloads during that window reuse acceptance rather than send another copy. Changing sender/recipient configuration during a retry can cause a safe provider idempotency conflict.
- Ambiguous Resend failures could switch providers after an email might already have been accepted. EmailJS fallback is retained only for definite Resend 400/401/403/422 rejections and complete server-side fallback configuration. EmailJS now has a timeout and requires a successful status plus `OK`. EmailJS has no equivalent provider idempotency guarantee; its ambiguous network failures cannot establish whether a message was accepted.
- Honeypot and obsolete verification endpoints falsely claimed successful sending without dispatching mail. Honeypot requests now fail validation; obsolete verification/resend requests return an expired-link response directing visitors to submit again.
- Frontend submission now has a synchronous in-flight guard and resets CAPTCHA after success as well as failure. Its request timeout accommodates the API's 60-second execution budget. Existing behavior preserves entered fields on failure and clears them only after backend acceptance.

Reply-To remains the visitor's validated email; the sender stays on the configured domain. HTML escaping, plain-text content, validation, body-size limits and sanitized diagnostics remain in place. No new dependencies, styles, layout, typography, animations or other portfolio sections changed.

## API contract

POST `/api/contact`, `Content-Type: application/json`, same-origin `Origin` header. Body: `name`, `email`, optional `subject`, `message`, `turnstileToken`, optional empty `company_hp`.

- 200: `{ success: true, code: 'sent', message, requestId }` only after provider acceptance.
- 400: invalid fields or CAPTCHA (`validation` / `turnstile`).
- 403: origin rejected; 404: unknown action; 413: body too large; 415: wrong content type.
- 429: `rate_limited` or `duplicate`, with `Retry-After: 60` (a retry may still be blocked by an hourly or duplicate window).
- 502: `email_unavailable` or `turnstile_unavailable`.
- 503: missing configuration or unexpected infrastructure failure.

Default limits: 30-second IP burst, 5 attempts/IP/hour, 3 attempts/email/hour, 15-minute content duplicate window. Failed email attempts count against limits; their duplicate reservation is released to permit a later retry with fresh CAPTCHA. No raw provider bodies, credentials, visitor messages or stack traces are returned/logged. CAPTCHA tokens are also rejected by Cloudflare when expired or reused.

## Environment and deployment requirements

Configure in **Vercel → project → Settings → Environment Variables → Production**, preserving existing correct values, then redeploy:

| Variable | Requirement |
| --- | --- |
| `RESEND_API_KEY` | Server-only active sending key, authorized for the sender domain. Presence is reported by live health; validity remains unverified. |
| `EMAIL_FROM` | Address on a domain verified in Resend; optional display name. Defaults to `Aman Mishra Portfolio <contact@calligraphyguruji.dev>`. Verify that domain's DNS in Resend; no sender verification was performed here. |
| `CONTACT_RECEIVER_EMAIL` | Intended recipient inbox; existing default is `amanmishra7774@gmail.com`. |
| `TURNSTILE_SECRET_KEY` | Server-only secret matching the public widget key. |
| `VITE_TURNSTILE_SITE_KEY` | Public widget key, required at frontend build time. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | `calligraphyguruji.dev,www.calligraphyguruji.dev`; add only specifically trusted preview hostnames if needed. |
| `CONTACT_SITE_URL` | `https://calligraphyguruji.dev`; explicit trusted site origin. |
| `DATABASE_URL` | Server-only PostgreSQL connection string for shared production limits. The existing migration must be applied by the backend table owner before release. |
| `CRON_SECRET` | Server-only credential for existing authenticated maintenance cron. |

Optional existing fallback: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `EMAILJS_PRIVATE_KEY` if required by account settings. Its existing template must target the intended recipient and map `reply_to`; account/template settings could not be verified. Primary Resend configuration remains preferred. Do not put any private value in a `VITE_` variable. Optional `CONTACT_MAX_IP_PER_HOUR` and `CONTACT_MAX_EMAIL_PER_HOUR` adjust limits. `CONTACT_RATE_LIMIT_SECRET` from older documentation is not referenced by the current implementation.

**Migration prerequisite:** inspect the target database as the backend role. If the contact tables do not exist, apply `migrations/001_contact_verification.sql` once. If they already exist, verify schema/permissions; do not blindly rerun its CREATE TABLE statements. Reservations now require the rate-events table when a database URL is configured. Run `npm run contact:check` with the target deployment variables available securely; it prints configuration status without private values. This checks presence/database readability, not provider authentication or delivery.

No production code, configuration, DNS, tables or deployment were changed. Release still requires authorized Vercel access and database readiness. After deploying, inspect a real failed submission's `[contact]` diagnostic by `requestId`: `authentication_failed`, `sender_or_permission_rejected`, `provider_rate_limited`, `provider_unavailable`, or database/Turnstile stages distinguish the failure. Confirm the corresponding private provider event and sender verification before changing credentials/DNS.

Then submit from the deployed form using a real solved CAPTCHA and an owner-controlled mailbox, confirm a provider acceptance ID, and verify the message arrives in the configured recipient inbox (including spam). Provider acceptance alone is not inbox delivery. **Real production delivery remains unverified.**

## Changed files

- `api/contact.ts`
- `server/contact/email.ts`
- `server/contact/service.ts`
- `src/components/sections/Contact.tsx`
- `src/services/emailService.ts`
- `tests/contactApi.test.ts`
- `scripts/check-contact-config.mjs`
- `scripts/testContactSimulation.ts`
- `.env.example`
- `package.json`
- `postman/mocks/contact-resend/config.yaml`, `default.js`
- `postman/mocks/contact-turnstile/config.yaml`, `default.js`
- `postman/simulations/contact.sim.yaml`, `contact.context.md`
- `docs/contact-email-debugging.md`

## Validation

- Contact tests: 53 passing, including all 12 requested scenarios and additional concurrent duplicates, hourly/burst limits, malformed acceptance, fallback behavior, stable idempotency keys, HTML escaping, origin restrictions and retired-endpoint failures.
- Full `npm test`: 219 passing, no failures/skips.
- `npm run test:contact:simulation`: 16 checks passed against local Postman HTTP stand-ins and a real isolated local PostgreSQL schema, removed afterward. Both upstream members received traffic. No real email sent. See `postman/simulations/contact.context.md` for reproduction.
- `npm run build`: TypeScript checks, API bundling and production Vite build passed. Existing bundle-size warning remains.
- `git diff --check`: passed. No lint script/config is provided by this repository, so no lint pass is claimed.
- `npm run contact:check`: correctly fails locally because `.env`/`.env.local` and required credentials are absent. This does not establish missing production variables.
- No browser pixel comparison or real solved-CAPTCHA production submission was performed. Contact JSX/layout/classes are unchanged.

## Provider references

[Cloudflare server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [EmailJS REST API](https://www.emailjs.com/docs/rest-api/send/).

## Self-evaluation

Accuracy 4/5: local defects reproduced and checked, but current production failure has no private log evidence. Completeness 3/5: implementation and tests are complete locally; actual production diagnosis, deployment, target schema and inbox receipt remain unverified. Clarity 4/5: separates observed production behavior from local fixes, with a necessarily detailed release guide. Actionability 4/5: exact variables, migration prerequisite and commands supplied; an authorized operator is still needed. Conciseness 4/5: the report is detailed to preserve reproducibility. Overall 3.8/5. Highest-impact next step: obtain the failed production request log, validate the target schema/provider configuration, deploy, and confirm recipient inbox receipt. The incomplete production evidence is explicitly disclosed so the assessment matches the user's outstanding objective.

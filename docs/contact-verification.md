# Contact email ownership verification

## Audit and implementation

The frontend is React 18, Vite, TypeScript and Tailwind, with a small custom pathname router in `src/App.tsx`. The contact endpoint is a Vercel Node serverless function. `server/index.ts` serves the separate Mantri AI backend. Its file-based SQLite conversation store is not appropriate for contact verification across Vercel instances.

Previously, `api/contact.ts` sent immediately using the EmailJS REST API. It had syntax/length validation, a honeypot, message-quality filters, a 30-second in-memory burst limiter and duplicate cache. Turnstile used the existing React widget and server-side Siteverify, but the server skipped validation when the secret was absent. The old origin check accepted unsafe substring/suffix matches. These protections did not prove mailbox control, and process-local rate limits did not survive serverless restarts.

The revised flow is:

1. The unchanged form posts to `/api/contact/request-verification`. The legacy `/api/contact` is an alias for this step, never a direct delivery path.
2. Strict same-origin JSON requests, input lengths/types, existing spam checks, persistent IP limits, required Turnstile Siteverify success and an allowed hostname are validated. Missing secrets fail closed.
3. PostgreSQL stores the message, UUID, hashed receipt and SHA-256 hash of a random 256-bit single-use token. Token expiry is 15 minutes. HMAC identifiers protect rate-limit email/IP data. Advisory locks serialize concurrent checks. Email limits and cooldowns include resends and failed sends.
4. Resend sends a responsive HTML and plain-text verification email. The inbox receives nothing yet. Tokens are in URL fragments, not query strings, and only in the verification email. Disable provider click tracking/link rewriting on these emails and verify your mailbox/security tooling preserves fragments. Never instrument the page hash, request bodies or email content in analytics/logging.
5. `/contact/verify` strips the fragment and posts the token to `/api/contact/verify`. Row locking makes token consumption, submission verification and creation of the durable outbox atomic.
6. Delivery claims a database lease and sends the saved payload with the immutable Resend idempotency key `contact/<submission-id>`. Reply-to is the verified visitor; From is the authenticated portfolio sender. The configured recipient remains `CONTACT_RECEIVER_EMAIL`, falling back to the existing `amanmishra7774@gmail.com` address.
7. Provider acceptance is recorded as `accepted`, not a guarantee of inbox arrival. Personal message content and the outbox payload are then cleared. Replays return an already-used status. Failures remain pending and can be retried by the verification page or maintenance job without creating another message.

Resend replaces EmailJS for contact delivery because this implementation needs provider idempotency to recover from a send accepted by the provider followed by a function crash or lost response. EmailJS template/API configuration is no longer used; existing environment variables need not be deleted. **Disable the old EmailJS service/template or its public browser sending access during rollout**, otherwise its external API could still be used independently of this website. No application route calls it now.

## Files

Created: `api/contact/[action].ts`; `server/contact/{db,email,service,validation}.ts`; `migrations/001_contact_verification.sql`; `src/components/sections/ContactVerification.tsx`; this guide and `docs/contact-verification-qa.md`.

Modified: `api/contact.ts`; `src/services/emailService.ts`; `src/components/sections/Contact.tsx`; `src/App.tsx`; `src/types/index.ts`; `vite.config.ts`; `tsconfig.node.json`; `vercel.json`; `.env.example`; `.gitignore`; `package.json`; `package-lock.json`; `tests/contactApi.test.ts`; `README.md`.

## Production setup

No production secrets, databases, DNS records or deployments were modified by implementation.

1. Provision private managed PostgreSQL (Neon, Supabase or another Vercel-compatible provider). Use its TLS connection string and pooler where recommended. Use a dedicated server-only role, not browser/anonymous credentials. Run the migration as that role so it owns the tables:

   ```sh
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_contact_verification.sql
   ```

   This is a versioned one-time migration. Both tables enable RLS and revoke PUBLIC access. The backend owner role has owner access; no browser roles have policies. Do not share the owner's credentials with another client. Keep provider encryption at rest and TLS enabled. Restrict database dashboard/admin access.

2. Configure server-only variables in Vercel:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | Private TLS PostgreSQL connection string |
   | `RESEND_API_KEY` | Sending API key for the authenticated domain |
   | `EMAIL_FROM` | Authenticated sender, e.g. `Aman Mishra <contact@mail.calligraphyguruji.dev>` |
   | `CONTACT_RECEIVER_EMAIL` | Optional; existing inbox remains the default |
   | `CONTACT_SITE_URL` | `https://calligraphyguruji.dev`; must match the actual origin used by verification links |
   | `CONTACT_RATE_LIMIT_SECRET` | Random private string of at least 32 characters, used for HMAC rate keys |
   | `TURNSTILE_SECRET_KEY` | Existing Cloudflare server secret; required |
   | `TURNSTILE_ALLOWED_HOSTNAMES` | Comma-separated exact widget hostnames |
   | `CRON_SECRET` | Private random scheduler bearer credential |

   Preserve existing values. Only `VITE_TURNSTILE_SITE_KEY` is public; it remains the existing widget key. Never prefix database/email/HMAC/cron secrets with `VITE_`. Generate each private random value separately, e.g. `openssl rand -hex 32`. For local Vite development, use an ignored `.env.local`, `CONTACT_SITE_URL=http://localhost:3000`, and Cloudflare's documented development test keys/hostnames. Production only permits HTTPS links. Preview origins must be configured explicitly; arbitrary `*.vercel.app` origins are not trusted.

3. Verify the sender domain/subdomain in Resend. Publish the exact SPF and DKIM records Resend provides and confirm domain status is verified. Configure DMARC for the sender domain, starting with monitoring if necessary and moving to an enforcement policy after checking legitimate senders. Preserve existing SPF/DKIM records: merge SPF mechanisms into a single record where applicable. Disable click tracking for verification messages. No visitor address is ever used as From. See [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction).

4. Configure maintenance before launch. The included Vercel cron runs `GET /api/contact/maintenance` daily (compatible with Hobby). It requires `Authorization: Bearer <CRON_SECRET>`; Vercel supplies that header when the secret is configured. It cleans expired content and processes up to 10 pending deliveries per run. **For prompt automatic retries and timely expiry cleanup, schedule this authenticated endpoint every 5–10 minutes using Vercel Pro cron or an external scheduler.** Update the schedule to `*/10 * * * *` when your Vercel plan supports it. Increase invocation frequency for a sustained retry backlog; the endpoint is safe under concurrent runs. Monitor scheduler failures and private outbox statuses without logging message contents or tokens. See [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

5. Deploy after applying the migration and environment configuration. Confirm both apex and www routes use the expected Turnstile hostname configuration. Verify the browser receipt cookie on the origin that hosts the form; resends must use that same origin. It is HttpOnly, SameSite=Strict and Secure on HTTPS and scoped to `/api/contact`.

6. Exercise the real flow with your own mailbox: initial verification email, button and plain-text fallback link on mobile/desktop, final recipient and Reply-To, resend cooldown/rotation, expiry, duplicate link clicks and simulated provider outage. Check spam folders and sender-domain authentication. These live provider/DNS checks cannot be proved by mocked automated tests.

## Retention and failure boundaries

Expiry is enforced immediately by the verification endpoint, regardless of cleanup timing. Maintenance and initial requests erase expired unverified personal content, retaining only metadata/hash tombstones for feedback. Accepted submissions immediately lose personal content. Tombstones and remaining rows are deleted after two days; rate events after one hour. Database backups follow the provider's separate retention policy and should be configured accordingly.

Resend retains idempotency keys for [24 hours](https://resend.com/changelog/idempotency-keys). Automated delivery attempts stop after 20 hours from the first attempt. A stuck/ambiguous submission becomes `review` and its personal content is cleared; the UI reports that delivery could not be confirmed. It must **not** be blindly resent under a new key. A manual operator can check provider acceptance by the original submission key/ID before taking further action. The daily Hobby fallback may miss this retry window, so a frequent scheduler is required for dependable background retries. Refreshing a successful page uses a non-sensitive history result; pending retries require the original email link after a full refresh. No token or message is kept in browser storage.

Resends require the browser receipt from a submission that already passed Turnstile, exact-origin JSON, persistent IP/email limits, and the cooldown. They cannot change the saved message or email or deliver it. At most two unexpired unverified submissions per email are allowed by default. Once expired, submit a fresh form and complete Turnstile again. No registered-email lookup or account existence response is provided.

Limits are configurable with `CONTACT_MAX_EMAIL_PER_HOUR` (3), `CONTACT_MAX_IP_PER_HOUR` (5), `CONTACT_MAX_PENDING_PER_EMAIL` (2), and `CONTACT_RESEND_COOLDOWN_SECONDS` (60; minimum enforced). Token lifetime cannot exceed 15 minutes. Verification attempts have a separate persistent limit of 120/IP/hour.

## Tests

```sh
npm run build
npm test
# Enable real SQL integration tests against a LOCAL TEST database:
CONTACT_TEST_DATABASE_URL='postgresql:///postgres?host=/tmp' npm test
```

The integration suite creates a randomly named schema, applies the production migration, uses actual PostgreSQL transactions/locks, and drops only that schema afterwards. It mocks Cloudflare and Resend; no emails are sent. Without `CONTACT_TEST_DATABASE_URL`, SQL integration tests are explicitly skipped. Never point this variable at production. It is intentionally separate from `DATABASE_URL`.

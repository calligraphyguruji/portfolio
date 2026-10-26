# Contact verification validation — 2026-10-26

The implementation passes local build and automated verification. Production activation remains dependent on database/email/DNS/scheduler configuration in the [deployment guide](contact-verification.md).

## Evidence

- `CONTACT_TEST_DATABASE_URL='postgresql:///postgres?host=/tmp' npm test`: **205 tests passed, 21 suites, zero failures/skips**. Of these, 39 contact tests cover input checks, preserved message-quality examples, and actual PostgreSQL integration. SQL tests use a unique temporary schema, removed after the run; Cloudflare and email responses are mocked. No live emails were sent.
- `npm run build`: passes TypeScript checking, API bundling and Vite production compilation. Vite retains its existing large-bundle warning.
- `git diff --check`: passes.
- A one-off server-rendered comparison with the original git version found **identical initial contact HTML**, including the Turnstile container. `src/index.css`, the Turnstile component, navbar and footer have no changes. Existing field/button classes and responsive grid remain unchanged.
- Playwright desktop/mobile automation was attempted with local Chrome. Chrome aborted with `SIGABRT` and a process-permission error before opening a page. **Browser interaction, screenshots, desktop/mobile visual comparison and accessibility review are INCONCLUSIVE**, not passed. No visual baseline or browser performance measurements were produced.
- Dependency audit: production dependencies report four low-severity existing math-rendering dependency findings, no production high/critical findings. The full dependency tree also reports pre-existing development-tool findings. No dependency-wide audit fix was applied as part of contact verification.

## Scenario coverage

| Requested scenario | Result |
| --- | --- |
| Valid address receives verification only | Pass with mocked provider; real mailbox receipt requires live test |
| Valid link sends saved message | Pass; acceptance recorded, payload scrubbed |
| Fake/nonexistent address | No contact delivery without token; actual bounce handling belongs to provider |
| Another person's email | No contact delivery before someone with its link verifies |
| Expired link | Rejected; expiry enforced independently of cleanup |
| Used token/replay | Already-used result; no duplicate contact send |
| Invalid/malformed token | Rejected |
| Missing/wrong-type/over-limit fields | Rejected |
| Missing/failed Turnstile, wrong hostname, missing server secret | Rejected/fails closed |
| Rapid/concurrent requests | Persistent limits and cooldown enforced atomically |
| Resend | Browser receipt required; old token invalidated |
| Provider verification-email failure | Safe error; submission remains unverified |
| Provider delivery failure or accepted response lost | Pending status; identical idempotency key on retry |
| Concurrent verification calls | One provider contact acceptance |
| Overlapping transaction timestamps | No spurious cooldown when cooldown is zero |
| Refresh/replay | Server is idempotent; successful UI keeps non-sensitive history state; browser test pending |
| Cleanup and retry endpoint | Authentication, pending retry and expired-content clearing pass |
| Late ambiguous retry | Stops before the provider idempotency window expires; reports inability to confirm delivery |
| Desktop/mobile layout | Initial markup unchanged; visual confirmation pending due browser launch failure |
| Existing portfolio functionality | Existing routing, architecture and Mantri automated regression tests pass |

## Manual release checks

1. Provision database, apply migration, set backend variables and preserve Turnstile values.
2. Authenticate the Resend sender domain and confirm SPF/DKIM/DMARC; disable verification-link tracking. Disable the old EmailJS service/template or browser sending access.
3. Set a frequent authenticated maintenance schedule (5–10 minutes) for reliable background retries; the included daily Vercel Hobby schedule is a cleanup fallback.
4. Deploy a preview with explicit origin/Turnstile hostname configuration. Test your own mailbox, both link formats, final inbox, Reply-To, expired/reused links, outages, and desktop/mobile states in light/dark modes. Avoid sharing screenshots with real tokens.
5. Deploy to production after these checks. No production secrets or external state were changed here.

## Self-evaluation

Applied the agent-self-evaluation skill as a final completeness check.

| Axis | Score | Evidence / remaining improvement |
| --- | --- | --- |
| Accuracy | 4/5 | Real PostgreSQL locking/concurrency tests and production build pass; live provider and browser behavior remain unverified. |
| Completeness | 4/5 | Requested backend, frontend, migration and documentation supplied; production DNS, scheduler and visual checks require deployment access. |
| Clarity | 4/5 | Setup guide distinguishes provider acceptance from inbox delivery; the retry-window and scheduler details need deliberate operator review. |
| Actionability | 4/5 | Exact migration, env names and release checklist provided; live credentials and provider setup are intentionally absent. |
| Conciseness | 4/5 | Final handoff can stay short by linking the detailed guide; security/retry requirements require a longer operator document. |

Overall: **4.0/5**. Highest-impact follow-ups: configure and test live delivery; activate frequent maintenance; complete browser visual/interaction checks. This assessment reflects the distinction between tested local implementation and a configured production deployment.

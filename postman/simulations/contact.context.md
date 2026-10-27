# Contact upstream simulation

Created 2026-10-27 from the Cloudflare Siteverify and Resend send-email documentation linked in each handler. Owner mock search was unavailable because the Postman CLI is signed out; these are local contract stand-ins.

## Purpose

Exercise the real contact handler, HTTP clients and PostgreSQL reservations without sending real mail. The API under test runs outside the simulation. The synthetic subject markers select provider rejections; synthetic tokens select CAPTCHA failures.

## Execution

1. `postman simulation run postman/simulations/contact.sim.yaml --port 4900 --output ndjson --no-history > /tmp/contact-sim.ndjson 2> /tmp/contact-sim.err`
2. Set `CONTACT_TEST_DATABASE_URL` to a local PostgreSQL test database owned by the test role, then run `npm run test:contact:simulation`. Optionally set `CONTACT_SIMULATION_URL` to the URL from the listening event.
3. Read the final check count and both members' request events. Stop the simulation with Ctrl-C.

## Assumptions

- 2026-10-27: the harness creates and drops only a unique test schema; its role must be allowed to create schemas. The database URL must name localhost or 127.0.0.1. Real upstream URLs are rerouted to simulation members; unexpected URLs fail closed.
- This proves local request handling and shared database reservation behavior. It cannot prove real credentials, DNS/sender verification, provider account settings, Vercel secrets or inbox receipt.

## Observations

<!-- begin:observations -->
- 2026-10-27: 16 checks passed with local PostgreSQL. Resend served 10 requests and Turnstile served 17; neither member was silent. Failures, concurrent duplicate exclusion and reservations surviving a memory reset were exercised.
<!-- end:observations -->

## What didn't work

- 2026-10-27: CLI 1.75 rejected mock directory paths with “Mock 'file' must point to a file”; the simulation now points to each `config.yaml` explicitly.

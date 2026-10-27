import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import handler from '../api/contact.ts';
import { resetMemoryStoresForTesting } from '../server/contact/service.ts';
import { database } from '../server/contact/db.ts';

// Local-only integration harness: all upstream calls go over HTTP to Postman.
// No real provider URL can be reached. Use a dedicated local test database.
const simulation = process.env.CONTACT_SIMULATION_URL || 'http://127.0.0.1:4900';
const testDatabase = process.env.CONTACT_TEST_DATABASE_URL;
assert.ok(testDatabase, 'Set CONTACT_TEST_DATABASE_URL to a local PostgreSQL test database.');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(testDatabase).hostname), 'Only a local test database is allowed.');
const schema = `contact_test_${randomUUID().replaceAll('-', '')}`;
const admin = new pg.Client({ connectionString: testDatabase });
await admin.connect();
await admin.query(`CREATE SCHEMA ${schema}`);
const scopedUrl = new URL(testDatabase);
scopedUrl.searchParams.set('options', `-c search_path=${schema}`);
process.env.DATABASE_URL = scopedUrl.toString();
process.env.NODE_ENV = 'production';
process.env.RESEND_API_KEY = 're_simulation_only';
process.env.TURNSTILE_SECRET_KEY = 'simulation_only';
process.env.EMAIL_FROM = 'Portfolio <contact@example.com>';
process.env.CONTACT_RECEIVER_EMAIL = 'owner@example.com';
process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'calligraphyguruji.dev';
for (const key of Object.keys(process.env).filter(key => /^(VITE_)?EMAILJS_/.test(key))) delete process.env[key];
const realFetch = globalThis.fetch;
let resendCalls = 0, turnstileCalls = 0;
globalThis.fetch = (url, init) => {
  const address = String(url);
  if (address === 'https://api.resend.com/emails') {
    resendCalls++;
    return realFetch(`${simulation}/resend/emails`, init);
  }
  if (address === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
    turnstileCalls++;
    return realFetch(`${simulation}/turnstile/turnstile/v0/siteverify`, init);
  }
  throw new Error('Unexpected upstream URL; real delivery is prohibited.');
};
const server = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const incoming = Object.assign(req, { body: JSON.parse(raw || '{}') });
  const reply = Object.assign(res, {
    status(code: number) { res.statusCode = code; return reply; },
    json(value: unknown) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return reply; },
  });
  await handler(incoming, reply);
});
let passed = 0;
const input = {
  name: 'Test Visitor', email: 'visitor@example.com', subject: 'Project inquiry',
  message: 'Hello Aman, I would like to discuss a software project collaboration with you.',
};
async function submit(patch: Record<string, unknown> = {}, ip = '192.0.2.1') {
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await realFetch(`http://127.0.0.1:${address.port}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://calligraphyguruji.dev', 'x-real-ip': ip },
    body: JSON.stringify({ ...input, turnstileToken: randomUUID(), ...patch }),
  });
  return { status: response.status, body: await response.json() };
}
async function check(name: string, run: () => Promise<void>) {
  await admin.query(`TRUNCATE ${schema}.contact_rate_events, ${schema}.contact_submissions`);
  resetMemoryStoresForTesting();
  await run();
  passed++;
  console.log(`PASS ${name}`);
}
try {
  await admin.query(`SET search_path TO ${schema}`);
  await admin.query(await readFile(new URL('../migrations/001_contact_verification.sql', import.meta.url), 'utf8'));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  await check('HTTP API success with PostgreSQL reservation and mocked providers', async () => {
    const result = await submit();
    assert.equal(result.status, 200); assert.equal(result.body.code, 'sent');
    assert.ok(result.body.requestId);
    const { rows } = await admin.query('SELECT status, provider_id FROM contact_submissions');
    assert.equal(rows.length, 1); assert.equal(rows[0].status, 'accepted');
    assert.ok(rows[0].provider_id);
  });
  for (const [patch, status, code] of [
    [{ email: 'invalid' }, 400, 'validation'], [{ name: '' }, 400, 'validation'],
    [{ turnstileToken: '' }, 400, 'turnstile'], [{ turnstileToken: `invalid-${randomUUID()}` }, 400, 'turnstile'],
    [{ turnstileToken: `expired-${randomUUID()}` }, 400, 'turnstile'],
    ...['401', '403', '429', '503', 'malformed'].map(value => [{ subject: `Project inquiry [${value}]` }, 502, 'email_unavailable']),
  ] as [Record<string, unknown>, number, string][]) {
    await check(`HTTP failure ${JSON.stringify(patch)}`, async () => {
      const result = await submit(patch); assert.equal(result.status, status);
      assert.equal(result.body.code, code); assert.equal(result.body.success, false);
    });
  }
  await check('missing email key returns 503 without email dispatch', async () => {
    delete process.env.RESEND_API_KEY;
    const calls = resendCalls;
    try { assert.equal((await submit()).status, 503); assert.equal(resendCalls, calls); }
    finally { process.env.RESEND_API_KEY = 're_simulation_only'; }
  });
  await check('PostgreSQL prevents concurrent duplicates from separate IPs', async () => {
    const calls = resendCalls;
    const results = await Promise.all([submit({}, '192.0.2.2'), submit({}, '192.0.2.3')]);
    assert.deepEqual(results.map(value => value.status).sort(), [200, 429]);
    assert.equal(resendCalls - calls, 1);
  });
  await check('PostgreSQL retains duplicates after memory reset (cold start)', async () => {
    assert.equal((await submit()).status, 200);
    resetMemoryStoresForTesting();
    const duplicate = await submit({}, '192.0.2.4');
    assert.equal(duplicate.status, 429); assert.equal(duplicate.body.code, 'duplicate');
  });
  await check('PostgreSQL enforces concurrent burst limit for different messages', async () => {
    const results = await Promise.all([submit({ subject: 'Project one' }), submit({ subject: 'Project two' })]);
    assert.deepEqual(results.map(value => value.status).sort(), [200, 429]);
  });
  await check('failed email attempts remain rate limited', async () => {
    assert.equal((await submit({ subject: 'Project [503]' })).status, 502);
    assert.equal((await submit()).status, 429);
  });
  console.log(`${passed} integration checks passed; Resend requests: ${resendCalls}; Turnstile requests: ${turnstileCalls}. No real email sent.`);
} finally {
  globalThis.fetch = realFetch;
  server.closeAllConnections();
  await new Promise<void>(resolve => server.close(() => resolve()));
  await database().end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
}

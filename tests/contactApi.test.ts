import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import handler from '../api/contact.ts';
import { database, cleanup } from '../server/contact/db.ts';
import { hashToken, validateInput } from '../server/contact/service.ts';
import { escapeHtml } from '../server/contact/email.ts';
import { isValidEmailFormat, validateMessageQuality } from '../server/contact/validation.ts';

const input = { name: 'Test Visitor', email: 'visitor@example.com', subject: 'Project inquiry', message: 'I would like to discuss a web development project with you.', turnstileToken: 'test-challenge' };

describe('Contact validation', () => {
  test('validates email format and required fields', () => {
    assert.equal(isValidEmailFormat('person@example.com'), true);
    for (const email of ['bad', 'test..name@example.com', 'person@example', 'a@b.c']) assert.equal(isValidEmailFormat(email), false);
    for (const body of [null, [], {}, { ...input, name: 123 }, { ...input, email: 'bad' }, { ...input, message: '' }, { ...input, subject: 'header\ninjection' }]) assert.throws(() => validateInput(body));
    assert.equal(validateInput(input).email, input.email);
  });
  test('preserves spam heuristics and escapes rendered HTML', () => {
    assert.equal(validateMessageQuality('Visitor', '', input.message).passes, true);
    for (const text of ['hi bro', 'test test test test', 'buy backlinks make money fast', 'HELLO BRO CALL ME FAST']) assert.equal(validateMessageQuality('Visitor', '', text).passes, false);
    assert.equal(escapeHtml('<script>"x" & \'y\'</script>'), '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');
    assert.match(hashToken('secret'), /^[a-f0-9]{64}$/);
    assert.notEqual(hashToken('secret'), 'secret');
  });
});

  describe('3. Professional Message Quality Filter (Requirements 16-19)', () => {
    // Tests for messages that MUST BE ACCEPTED
    test('accepts valid recruiter internship discussion', () => {
      const msg =
        'Hello Aman, I came across your portfolio and would like to discuss a frontend development internship opportunity. Could we schedule a call this week?';
      assert.strictEqual(validateMessageQuality('Recruiter Jane', 'Internship Opportunity', msg).passes, true);
    });

    test('accepts web collaboration inquiry', () => {
      const msg =
        "Hi Aman, I'm working on a web application and would like to discuss a potential collaboration. Please let me know your availability.";
      assert.strictEqual(validateMessageQuality('Alex Dev', 'Collaboration', msg).passes, true);
    });

    test('accepts client project services inquiry', () => {
      const msg =
        'Hello, I would like to know more about your software development services and discuss a potential project.';
      assert.strictEqual(validateMessageQuality('Client Robert', 'Project Inquiry', msg).passes, true);
    });

    test('accepts concise legitimate internship inquiry', () => {
      const msg = "Hello, I'd like to discuss an internship opportunity.";
      assert.strictEqual(validateMessageQuality('Sarah', 'Discussion', msg).passes, true);
    });

    test('accepts natural Indian recruiter inquiry', () => {
      const msg = 'Hi Aman, I saw your portfolio and wanted to discuss an internship opportunity.';
      assert.strictEqual(validateMessageQuality('Pooja Sharma', 'Internship Role', msg).passes, true);
    });

    // Tests for messages that MUST BE REJECTED
    const rejectedExamples = [
      { text: 'hi bro', reason: 'too casual / insufficient words' },
      { text: 'hello sir plz contact me', reason: 'no clear intent / casual plz abbreviation' },
      { text: 'hey bro are u available', reason: 'chat slang dominance' },
      { text: 'send me ur number', reason: 'demanding number with slang' },
      { text: 'work hai bhai', reason: 'insufficient words / casual chat' },
      { text: 'urgent work pls dm', reason: 'urgent chat spam' },
      { text: 'aaaaaaaaaaaa', reason: 'character repetition flood' },
      { text: '!!!!!!', reason: 'punctuation repetition flood' },
      { text: 'test test test', reason: 'word loop / repetition' },
      { text: 'asdfghjkl', reason: 'keyboard smash / consonant cluster' },
      { text: '🔥🔥🔥🔥🔥🔥🔥', reason: 'emoji only' },
      { text: 'make money fast click here', reason: 'promotional spam' },
      { text: 'hi bhai internship hai call me asap', reason: 'low quality chat slang combination' },
      { text: 'hello what are you doing?', reason: 'casual social small talk in message body' },
      { text: 'how are you doing', reason: 'casual greeting without project substance' },
    ];

    for (const { text, reason } of rejectedExamples) {
      test(`rejects low-quality spam: "${text}" (${reason})`, () => {
        const evaluation = validateMessageQuality('Spam Tester', 'Inquiry', text);
        assert.strictEqual(evaluation.passes, false);
        assert.strictEqual(
          evaluation.userMessage,
          'Please provide a clear and professional message describing your inquiry.'
        );
      });
    }

    test('rejects professional subject spoofing with casual small talk body', () => {
      const evaluation = validateMessageQuality('Aman', 'project discussion', 'hello what are you doing?');
      assert.strictEqual(evaluation.passes, false);
      assert.strictEqual(
        evaluation.userMessage,
        'Please provide a clear and professional message describing your inquiry.'
      );
    });

  });

// Opt-in only: a unique schema is created and dropped in the supplied TEST database.
// No live Cloudflare or email requests are made.
const testUrl = process.env.CONTACT_TEST_DATABASE_URL;
describe('Persistent contact verification integration', { skip: !testUrl, concurrency: false }, () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  const schema = `contact_test_${randomUUID().replaceAll('-', '')}`;
  let admin: pg.Pool;
  let sent: { payload: any; key: string }[] = [];
  let challenge = true;
  let hostname = 'calligraphyguruji.dev';
  let providerFails = false;
  let acceptedButResponseLost = false;
  const accepted = new Map<string, string>();

  async function call(action = 'request-verification', body: unknown = input, cookie = '', overrides: Record<string, unknown> = {}) {
    const headers: Record<string, string> = {};
    let status = 200, data: any;
    const res: any = { setHeader: (key: string, value: string) => { headers[key] = value; }, status: (value: number) => { status = value; return res; }, json: (value: unknown) => { data = value; return res; } };
    await handler({ method: 'POST', url: `/api/contact/${action}`, headers: { origin: 'https://calligraphyguruji.dev', 'content-type': 'application/json', cookie }, body, socket: { remoteAddress: '192.0.2.1' }, ...overrides }, res);
    return { status, data, headers };
  }
  const currentToken = () => new URL(sent.filter(x => x.key.startsWith('verification/')).at(-1)!.payload.text.match(/https:\/\/\S+#token=\S+/)[0]).hash.slice(7);
  async function request() {
    const result = await call();
    assert.equal(result.status, 200);
    return { token: currentToken(), cookie: result.headers['Set-Cookie'].split(';')[0] };
  }
  const ageCooldown = async () => { await database().query("UPDATE contact_rate_events SET created_at=now()-interval '61 seconds'"); };

  before(async () => {
    admin = new pg.Pool({ connectionString: testUrl });
    await admin.query(`CREATE SCHEMA ${schema}`);
    const url = new URL(testUrl!);
    url.searchParams.set('options', `-csearch_path=${schema}`);
    Object.assign(process.env, { DATABASE_URL: url.toString(), NODE_ENV: 'test', RESEND_API_KEY: 'test-only', EMAIL_FROM: 'Portfolio <contact@example.com>', TURNSTILE_SECRET_KEY: 'test-only', CONTACT_RATE_LIMIT_SECRET: 'test-only-private-rate-limit-secret-32-bytes', CONTACT_SITE_URL: 'https://calligraphyguruji.dev', CRON_SECRET: 'test-only-cron-secret' });
    await database().query(readFileSync(new URL('../migrations/001_contact_verification.sql', import.meta.url), 'utf8'));
    globalThis.fetch = async (url, options) => {
      if (String(url).includes('siteverify')) return new Response(JSON.stringify({ success: challenge, hostname }), { status: 200 });
      assert.equal(String(url), 'https://api.resend.com/emails');
      if (providerFails) return new Response('{}', { status: 503 });
      const key = (options!.headers as Record<string, string>)['Idempotency-Key'];
      if (!accepted.has(key)) {
        accepted.set(key, randomUUID());
        sent.push({ payload: JSON.parse(String(options!.body)), key });
      }
      if (acceptedButResponseLost && key.startsWith('contact/')) { acceptedButResponseLost = false; throw new Error('Simulated lost provider response'); }
      return new Response(JSON.stringify({ id: accepted.get(key) }), { status: 200 });
    };
  });
  beforeEach(async () => {
    sent = []; challenge = true; hostname = 'calligraphyguruji.dev'; providerFails = false; acceptedButResponseLost = false; accepted.clear();
    await database().query('TRUNCATE contact_submissions, contact_rate_events');
  });
  after(async () => {
    globalThis.fetch = originalFetch;
    await database().end();
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  });

  test('initial submission sends only the verification email and stores only token hashes', async () => {
    const { token, cookie } = await request();
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].payload.to, [input.email]);
    assert.equal(sent[0].payload.reply_to, undefined);
    assert.equal(sent[0].payload.subject, 'Verify Your Email — Aman Mishra Portfolio');
    assert.match(sent[0].payload.html, /Verify Email &amp; Send Message/);
    const { rows } = await database().query('SELECT * FROM contact_submissions');
    assert.equal(rows[0].status, 'unverified');
    assert.equal(rows[0].verified_at, null);
    assert.equal(rows[0].token_hash, hashToken(token));
    assert.equal(rows[0].receipt_hash, hashToken(cookie.split('=')[1]));
    assert.ok(new Date(rows[0].expires_at).getTime() - Date.now() <= 900000);
    assert.ok(!JSON.stringify(rows).includes(token));
  });
  test('only mailbox verification delivers the saved message with verified reply-to; replay is safe', async () => {
    const { token } = await request();
    const result = await call('verify', { token });
    assert.equal(result.data.code, 'accepted');
    assert.equal(sent.length, 2);
    assert.equal(sent[1].payload.reply_to, input.email);
    assert.deepEqual(sent[1].payload.to, [process.env.CONTACT_RECEIVER_EMAIL || 'amanmishra7774@gmail.com']);
    assert.notEqual(sent[1].payload.from, input.email);
    assert.equal((await call('verify', { token })).data.code, 'used');
    assert.equal(sent.length, 2);
    const { rows } = await database().query('SELECT * FROM contact_submissions');
    assert.equal(rows[0].message, null);
    assert.equal(rows[0].delivery_payload, null);
    assert.ok(rows[0].verified_at);
  });
  test('unverified fake or impersonated addresses never send contact mail', async () => {
    await request();
    await call('verify', { token: 'a'.repeat(43) });
    assert.equal(sent.filter(x => x.key.startsWith('contact/')).length, 0);
  });
  test('invalid and expired links are rejected', async () => {
    assert.equal((await call('verify', { token: 'invalid' })).data.code, 'invalid');
    const { token } = await request();
    await database().query("UPDATE contact_submissions SET expires_at=now()-interval '1 second'");
    assert.equal((await call('verify', { token })).data.code, 'expired');
    assert.equal(sent.length, 1);
  });
  test('requires correct Turnstile success, token, hostname and server secret', async () => {
    assert.equal((await call('request-verification', { ...input, turnstileToken: '' })).data.code, 'turnstile');
    challenge = false;
    assert.equal((await call()).data.code, 'turnstile');
    challenge = true; hostname = 'attacker.example';
    assert.equal((await call()).data.code, 'turnstile');
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal((await call()).status, 503);
    process.env.TURNSTILE_SECRET_KEY = 'test-only';
    assert.equal(sent.length, 0);
  });
  test('rejects cross-origin, missing-origin, non-JSON and malformed input', async () => {
    for (const headers of [{ origin: 'https://evilcalligraphyguruji.dev', 'content-type': 'application/json' }, { 'content-type': 'application/json' }, { origin: 'https://calligraphyguruji.dev', 'content-type': 'text/plain' }]) assert.ok((await call('request-verification', input, '', { headers })).status >= 400);
    for (const body of [null, {}, { ...input, name: 2 }, { ...input, message: '' }]) assert.equal((await call('request-verification', body)).status, 400);
    assert.equal(sent.length, 0);
  });
  test('honeypot and legacy endpoint cannot bypass ownership verification', async () => {
    await call('request-verification', { ...input, company_hp: 'bot' });
    assert.equal(sent.length, 0);
    assert.equal((await call('', input)).status, 200);
    assert.equal(sent.length, 1);
  });
  test('resend requires browser receipt, cooldown; rotates token', async () => {
    const { token, cookie } = await request();
    assert.equal((await call('resend-verification', {}, cookie)).status, 429);
    assert.equal((await call('resend-verification')).status, 400);
    await ageCooldown();
    assert.equal((await call('resend-verification', {}, cookie)).status, 200);
    const replacement = currentToken();
    assert.notEqual(replacement, token);
    assert.equal((await call('verify', { token })).data.code, 'invalid');
    assert.equal((await call('verify', { token: replacement })).data.code, 'accepted');
  });
  test('concurrent verifications cannot duplicate contact delivery', async () => {
    const { token } = await request();
    const results = await Promise.all(Array.from({ length: 12 }, () => call('verify', { token })));
    assert.ok(results.every(x => ['accepted', 'used', 'pending'].includes(x.data.code)), JSON.stringify(results.map(x => ({ status: x.status, code: x.data.code }))));
    assert.equal(sent.filter(x => x.key.startsWith('contact/')).length, 1);
  });
  test('zero-cooldown verification limits tolerate overlapping transaction timestamps', async () => {
    const { token } = await request();
    await call('verify', { token });
    // A waiting transaction can start before an earlier lock holder records its timestamp.
    await database().query("UPDATE contact_rate_events SET created_at=now()+interval '1 second'");
    assert.equal((await call('verify', { token })).data.code, 'used');
  });
  test('concurrent initial requests enforce cooldown atomically', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => call()));
    assert.equal(results.filter(x => x.status === 200).length, 1);
    assert.equal(sent.length, 1);
  });
  test('email hourly and IP hourly caps and pending limits are persistent', async () => {
    const { cookie } = await request();
    for (let i = 0; i < 2; i++) { await ageCooldown(); assert.equal((await call('resend-verification', {}, cookie)).status, 200); }
    await ageCooldown();
    assert.equal((await call('resend-verification', {}, cookie)).status, 429);
    await database().query('TRUNCATE contact_submissions, contact_rate_events');
    for (let i = 0; i < 5; i++) assert.equal((await call('request-verification', { ...input, email: `person${i}@example.com` })).status, 200);
    assert.equal((await call('request-verification', { ...input, email: 'other@example.com' })).status, 429);
    await database().query('TRUNCATE contact_submissions, contact_rate_events');
    await request(); await ageCooldown(); await request(); await ageCooldown();
    assert.equal((await call()).status, 429);
  });
  test('provider failure during verification email never delivers the contact', async () => {
    providerFails = true;
    const result = await call();
    assert.equal(result.status, 503);
    assert.match(result.headers['Set-Cookie'], /HttpOnly; SameSite=Strict/);
    assert.equal(sent.length, 0);
    assert.equal((await database().query('SELECT status FROM contact_submissions')).rows[0].status, 'unverified');
  });
  test('delivery failure stays pending; lost response retries use the identical idempotency key', async () => {
    const { token } = await request();
    acceptedButResponseLost = true;
    assert.equal((await call('verify', { token })).data.code, 'pending');
    assert.equal((await database().query('SELECT status FROM contact_submissions')).rows[0].status, 'pending');
    await database().query("UPDATE contact_submissions SET lease_until=now()-interval '1 second'");
    assert.equal((await call('verify', { token })).data.code, 'accepted');
    assert.equal(sent.filter(x => x.key.startsWith('contact/')).length, 1);
  });
  test('maintenance authenticates, retries pending work and scrubs expired content', async () => {
    const { token } = await request();
    providerFails = true;
    await call('verify', { token });
    providerFails = false;
    await database().query("UPDATE contact_submissions SET lease_until=now()-interval '1 second'");
    assert.equal((await call('maintenance', {}, '', { method: 'GET' })).status, 401);
    assert.equal((await call('maintenance', {}, '', { method: 'GET', headers: { authorization: 'Bearer test-only-cron-secret' } })).status, 200);
    assert.equal(sent.filter(x => x.key.startsWith('contact/')).length, 1);
    await database().query('TRUNCATE contact_submissions, contact_rate_events');
    const pending = await request();
    await database().query("UPDATE contact_submissions SET expires_at=now()-interval '1 minute'");
    await cleanup();
    const row = (await database().query('SELECT * FROM contact_submissions')).rows[0];
    assert.equal(row.message, null); assert.equal(row.email, null); assert.equal(row.status, 'expired');
    assert.equal((await call('verify', { token: pending.token })).data.code, 'expired');
  });
  test('stale ambiguous deliveries stop before provider deduplication expires', async () => {
    const { token } = await request();
    providerFails = true;
    await call('verify', { token });
    providerFails = false;
    await database().query("UPDATE contact_submissions SET first_attempt_at=now()-interval '21 hours', lease_until=NULL");
    await cleanup();
    assert.equal((await call('verify', { token })).data.code, 'delivery_failed');
    assert.equal(sent.filter(x => x.key.startsWith('contact/')).length, 0);
  });
});

import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, test } from 'node:test';
import handler from '../api/contact.ts';
import { isValidEmailFormat, validateMessageQuality } from '../server/contact/validation.ts';
import { validateInput, resetMemoryStoresForTesting } from '../server/contact/service.ts';
import { escapeHtml } from '../server/contact/email.ts';

const validPayload = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  subject: 'Project Inquiry',
  message: 'Hello Aman, I would like to discuss a potential software development project with you.',
  turnstileToken: 'mock-valid-turnstile-token',
};

describe('Contact validation', () => {
  test('validates email format and required fields', () => {
    assert.equal(isValidEmailFormat('person@example.com'), true);
    for (const email of ['bad', 'test..name@example.com', 'person@example', 'a@b.c']) {
      assert.equal(isValidEmailFormat(email), false);
    }
    for (const body of [
      null,
      [],
      {},
      { ...validPayload, name: 123 },
      { ...validPayload, email: 'bad' },
      { ...validPayload, message: '' },
      { ...validPayload, subject: 'header\ninjection' },
    ]) {
      assert.throws(() => validateInput(body));
    }
    assert.equal(validateInput(validPayload).email, validPayload.email);
  });

  test('preserves spam heuristics and escapes rendered HTML', () => {
    assert.equal(validateMessageQuality('Visitor', '', validPayload.message).passes, true);
    for (const text of ['hi bro', 'test test test test', 'buy backlinks make money fast', 'HELLO BRO CALL ME FAST']) {
      assert.equal(validateMessageQuality('Visitor', '', text).passes, false);
    }
    assert.equal(
      escapeHtml('<script>"x" & \'y\'</script>'),
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;'
    );
  });
});

describe('Professional Message Quality Filter (Spam & Abuse Protection)', () => {
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

// ============================================================================
// AUTOMATED TEST SUITE: ALL 12 REQUIRED SCENARIOS
// ============================================================================
describe('Contact API & Email Sending Scenarios (All 12 Required Tests)', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  let turnstileSuccess = true;
  let turnstileHostname = 'calligraphyguruji.dev';
  let turnstileErrorCodes: string[] = [];
  let turnstileNetworkCrash = false;

  let resendSuccess = true;
  let resendStatus = 200;
  let resendNetworkCrash = false;
  let sentEmails: any[] = [];

  async function makeRequest(
    body: unknown = validPayload,
    options: { method?: string; origin?: string; ip?: string; url?: string } = {}
  ) {
    const headers: Record<string, string> = {};
    let statusCode = 200;
    let responseData: any = null;

    const res: any = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      },
      end: () => res,
    };

    const req: any = {
      method: options.method || 'POST',
      url: options.url || '/api/contact',
      headers: {
        origin: options.origin || 'https://calligraphyguruji.dev',
        'content-type': 'application/json',
      },
      socket: { remoteAddress: options.ip || '192.0.2.1' },
      body,
    };

    await handler(req, res);
    return { status: statusCode, data: responseData, headers };
  }

  beforeEach(() => {
    resetMemoryStoresForTesting();
    turnstileSuccess = true;
    turnstileHostname = 'calligraphyguruji.dev';
    turnstileErrorCodes = [];
    turnstileNetworkCrash = false;

    resendSuccess = true;
    resendStatus = 200;
    resendNetworkCrash = false;
    sentEmails = [];

    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 're_test_mock_resend_key';
    process.env.EMAIL_FROM = 'Aman Mishra Portfolio <contact@calligraphyguruji.dev>';
    process.env.CONTACT_RECEIVER_EMAIL = 'amanmishra7774@gmail.com';
    process.env.TURNSTILE_SECRET_KEY = '0x4AAAAAAAMockTurnstileSecretKey';

    globalThis.fetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const urlStr = String(url);

      // 1. Cloudflare Turnstile Siteverify mock
      if (urlStr.includes('challenges.cloudflare.com/turnstile/v0/siteverify')) {
        if (turnstileNetworkCrash) {
          throw new Error('Simulated Cloudflare network outage');
        }
        return new Response(
          JSON.stringify({
            success: turnstileSuccess,
            hostname: turnstileHostname,
            'error-codes': turnstileErrorCodes,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 2. Resend Email mock
      if (urlStr.includes('api.resend.com/emails')) {
        if (resendNetworkCrash) {
          throw new Error('Simulated Resend API network outage');
        }
        if (!resendSuccess || resendStatus >= 400) {
          return new Response(
            JSON.stringify({
              statusCode: resendStatus,
              message: 'Resend mock failure',
              name: 'provider_error',
            }),
            { status: resendStatus, headers: { 'Content-Type': 'application/json' } }
          );
        }
        const parsedBody = JSON.parse(String(init?.body || '{}'));
        sentEmails.push(parsedBody);
        return new Response(
          JSON.stringify({ id: 'resend_mock_id_12345' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return originalFetch(url, init);
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const k of Object.keys(process.env)) {
      if (!(k in originalEnv)) delete process.env[k];
    }
    Object.assign(process.env, originalEnv);
  });

  // 1. Successful email submission
  test('1. Successful email submission', async () => {
    const res = await makeRequest({
      ...validPayload,
      email: 'recruiter@company.com',
      turnstileToken: 'token-success-1',
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.code, 'sent');
    assert.match(res.data.message, /sent successfully/i);
    assert.equal(sentEmails.length, 1);
    assert.deepEqual(sentEmails[0].to, ['amanmishra7774@gmail.com']);
    assert.equal(sentEmails[0].reply_to, 'recruiter@company.com');
  });

  // 2. Invalid email address
  test('2. Invalid email address', async () => {
    const res = await makeRequest({
      ...validPayload,
      email: 'not-an-email',
      turnstileToken: 'token-invalid-email',
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.code, 'validation');
    assert.match(res.data.message, /valid email address/i);
    assert.equal(sentEmails.length, 0);
  });

  // 3. Missing required fields
  test('3. Missing required fields', async () => {
    for (const missingField of ['name', 'email', 'message']) {
      const payload: any = { ...validPayload, turnstileToken: `token-missing-${missingField}` };
      delete payload[missingField];
      const res = await makeRequest(payload);
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /required fields|check the form/i);
      assert.equal(sentEmails.length, 0);
    }
  });

  // 4. Missing CAPTCHA token
  test('4. Missing CAPTCHA token', async () => {
    const res = await makeRequest({
      ...validPayload,
      turnstileToken: '',
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.code, 'turnstile');
    assert.match(res.data.message, /verification failed/i);
    assert.equal(sentEmails.length, 0);
  });

  // 5. Invalid CAPTCHA token
  test('5. Invalid CAPTCHA token', async () => {
    turnstileSuccess = false;
    turnstileErrorCodes = ['invalid-input-response'];
    const res = await makeRequest({
      ...validPayload,
      turnstileToken: 'token-invalid-captcha',
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.code, 'turnstile');
    assert.match(res.data.message, /verification failed/i);
    assert.equal(sentEmails.length, 0);
  });

  // 6. Expired CAPTCHA token / Replay rejection
  test('6. Expired CAPTCHA token / Replayed token rejected', async () => {
    const token = 'token-single-use-replay-check';
    const first = await makeRequest({ ...validPayload, email: 'user1@example.com', turnstileToken: token });
    assert.equal(first.status, 200);

    // Second submission using identical token must be rejected
    const second = await makeRequest({ ...validPayload, email: 'user2@example.com', turnstileToken: token });
    assert.equal(second.status, 400);
    assert.equal(second.data.code, 'turnstile');
    assert.match(second.data.message, /verification failed/i);
  });

  // 7. Email provider authentication failure (401/403)
  test('7. Email provider authentication failure', async () => {
    resendSuccess = false;
    resendStatus = 401;
    const res = await makeRequest({
      ...validPayload,
      email: 'authfail@example.com',
      turnstileToken: 'token-auth-failure',
    });
    assert.equal(res.status, 502);
    assert.equal(res.data.success, false);
    assert.equal(res.data.code, 'email_unavailable');
    assert.match(res.data.message, /couldn’t send your message right now/i);
  });

  // 8. Email provider service outage (500/503/Network)
  test('8. Email provider service outage', async () => {
    resendNetworkCrash = true;
    const res = await makeRequest({
      ...validPayload,
      email: 'outage@example.com',
      turnstileToken: 'token-outage',
    });
    assert.equal(res.status, 502);
    assert.equal(res.data.success, false);
    assert.equal(res.data.code, 'email_unavailable');
    assert.match(res.data.message, /couldn’t send your message right now/i);
  });

  // 9. Missing email API key
  test('9. Missing email API key', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAILJS_SERVICE_ID;
    const res = await makeRequest({
      ...validPayload,
      email: 'nokey@example.com',
      turnstileToken: 'token-no-api-key',
    });
    assert.equal(res.status, 503);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /couldn’t send your message right now/i);
    assert.equal(sentEmails.length, 0);
  });

  // 10. Duplicate submissions
  test('10. Duplicate submissions', async () => {
    const duplicateEmail = 'duplicate.sender@example.com';
    const first = await makeRequest({
      ...validPayload,
      email: duplicateEmail,
      turnstileToken: 'token-duplicate-1',
    });
    assert.equal(first.status, 200);

    const second = await makeRequest({
      ...validPayload,
      email: duplicateEmail,
      turnstileToken: 'token-duplicate-2',
    });
    assert.equal(second.status, 429);
    assert.equal(second.data.code, 'duplicate');
    assert.match(second.data.message, /duplicate message detected/i);
  });

  // 11. Rate limiting
  test('11. Rate limiting (hourly / burst)', async () => {
    const ip = '203.0.113.42';
    // Burst limit: immediate 2nd request from same IP with different content
    const first = await makeRequest(
      {
        ...validPayload,
        email: 'rate1@example.com',
        message: 'Hello Aman, I would like to discuss a software project collaboration with you.',
        turnstileToken: 'token-rate-1',
      },
      { ip }
    );
    assert.equal(first.status, 200);

    const burst = await makeRequest(
      {
        ...validPayload,
        email: 'rate2@example.com',
        message: 'Hello Aman, following up regarding internship opportunities on your team.',
        turnstileToken: 'token-rate-2',
      },
      { ip }
    );
    assert.equal(burst.status, 429);
    assert.equal(burst.data.code, 'rate_limited');
    assert.match(burst.data.message, /too many requests/i);
  });

  // 12. Successful end-to-end API response
  test('12. Successful end-to-end API response and health check', async () => {
    // Test GET /api/contact health
    const health = await makeRequest(null, { method: 'GET' });
    assert.equal(health.status, 200);
    assert.equal(health.data.status, 'healthy');
    assert.equal(health.data.emailProvider, 'resend');
    assert.equal(health.data.turnstileConfigured, true);

    // Test successful POST submission
    const res = await makeRequest({
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@cyberdyne.org',
      subject: 'AI Research Collaboration',
      message: 'Hello Aman, We reviewed your projects and would love to discuss a research collaboration opportunity.',
      turnstileToken: 'token-e2e-final',
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.code, 'sent');
    assert.equal(
      res.data.message,
      'Your message has been sent successfully! I’ll get back to you soon.'
    );
    assert.ok(res.data.requestId);
  });
});

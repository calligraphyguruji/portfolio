import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleContactSubmission,
  isValidEmailFormat,
  isSpamContent,
  checkRateLimit,
  recordSubmission,
  checkAndRecordDuplicate,
} from '../api/contact.ts';

describe('Contact API & Anti-Spam Pipeline Test Suite', () => {
  const mockEnv = {
    TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    EMAILJS_SERVICE_ID: 'test-service-id',
    EMAILJS_TEMPLATE_ID: 'test-template-id',
    EMAILJS_PUBLIC_KEY: 'test-public-key',
    EMAILJS_PRIVATE_KEY: 'test-private-key',
  };

  // Mock global fetch to intercept Turnstile & EmailJS calls
  let fetchCalls: { url: string; body: any }[] = [];
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchCalls = [];
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      let parsedBody: any = null;
      if (init?.body && typeof init.body === 'string') {
        try {
          parsedBody = JSON.parse(init.body);
        } catch {
          parsedBody = init.body;
        }
      }
      fetchCalls.push({ url, body: parsedBody });

      // Turnstile endpoint mock
      if (url.includes('challenges.cloudflare.com')) {
        if (parsedBody?.response === 'valid-turnstile-token') {
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // EmailJS endpoint mock
      if (url.includes('api.emailjs.com')) {
        return new Response('OK', { status: 200 });
      }

      return new Response('Not Found', { status: 404 });
    };
  });

  describe('1. Email Syntax Validation', () => {
    test('accepts valid email addresses', () => {
      assert.strictEqual(isValidEmailFormat('test.user@example.com'), true);
      assert.strictEqual(isValidEmailFormat('intern.hire+swe@sub.domain.org'), true);
      assert.strictEqual(isValidEmailFormat('dev@company.tech'), true);
    });

    test('rejects malformed email addresses', () => {
      assert.strictEqual(isValidEmailFormat('plainaddress'), false);
      assert.strictEqual(isValidEmailFormat('@missingusername.com'), false);
      assert.strictEqual(isValidEmailFormat('missingatsign.com'), false);
      assert.strictEqual(isValidEmailFormat('user@.missingdomain.com'), false);
      assert.strictEqual(isValidEmailFormat('user@domain..com'), false);
      assert.strictEqual(isValidEmailFormat('user@domain.c'), false); // TLD < 2 chars
      assert.strictEqual(isValidEmailFormat(''), false);
    });
  });

  describe('2. Honeypot Trap (Bot Silencing & Quota Shield)', () => {
    test('silently returns 200 OK without calling EmailJS when honeypot is populated', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Spam Bot',
          email: 'bot@spamdomain.com',
          subject: 'Viagra offer',
          message: 'Buy now at http://spam.com',
          company_hp: 'http://botfilledthis.com', // TRAP TRIGGERED
          turnstileToken: 'valid-turnstile-token',
        },
        '192.168.1.100',
        mockEnv
      );

      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.success, true);
      // Crucial verification: EmailJS was NEVER invoked!
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });
  });

  describe('3. Message & Input Validation', () => {
    test('rejects submissions with name < 2 characters', async () => {
      const result = await handleContactSubmission(
        {
          name: 'A',
          email: 'valid@example.com',
          message: 'This is a legitimate message enquiry.',
          turnstileToken: 'valid-turnstile-token',
        },
        '10.0.0.1',
        mockEnv
      );

      assert.strictEqual(result.status, 400);
      assert.strictEqual(result.data.success, false);
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });

    test('rejects message shorter than 10 characters', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Hello', // < 10 chars
          turnstileToken: 'valid-turnstile-token',
        },
        '10.0.0.2',
        mockEnv
      );

      assert.strictEqual(result.status, 400);
      assert.strictEqual(result.data.success, false);
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });
  });

  describe('4. Spam Heuristics Detection', () => {
    test('flags messages with excessive URL density (> 3 links)', () => {
      const spamMsg = 'Check out https://a.com and http://b.com and https://c.com and https://d.com';
      assert.strictEqual(isSpamContent('Spammer', 'Links', spamMsg), true);
    });

    test('flags messages with character repetition flood', () => {
      const repeatMsg = 'Hellooooooooooooooooooooo please answer';
      assert.strictEqual(isSpamContent('Flooder', 'Hello', repeatMsg), true);
    });

    test('flags high-confidence spam keywords', () => {
      assert.strictEqual(isSpamContent('Marketer', 'Backlinks', 'Buy backlinks rank on google page 1'), true);
      assert.strictEqual(isSpamContent('Promo', 'Win', 'Free crypto airdrop double your btc'), true);
    });

    test('permits legitimate tech and internship inquiries', () => {
      const legitMsg =
        'Hi Aman, I saw your fullstack portfolio and projects on GitHub (https://github.com/calligraphyguruji). We have a React and TypeScript internship open at our startup. Would love to chat!';
      assert.strictEqual(isSpamContent('Recruiter Alice', 'Internship Opportunity', legitMsg), false);
    });
  });

  describe('5. Turnstile Bot Verification Gate', () => {
    test('rejects when Turnstile token is missing', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Legit User',
          email: 'legit@example.com',
          message: 'Interested in interviewing you for a SWE internship role.',
          turnstileToken: '', // Missing
        },
        '10.0.0.5',
        mockEnv
      );

      assert.strictEqual(result.status, 400);
      assert.match(result.data.message, /verification/i);
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });

    test('rejects when Cloudflare Turnstile token validation fails', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Bot User',
          email: 'bot@example.com',
          message: 'Valid message length for testing failure.',
          turnstileToken: 'invalid-turnstile-token',
        },
        '10.0.0.6',
        mockEnv
      );

      assert.strictEqual(result.status, 400);
      assert.match(result.data.message, /failed/i);
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });
  });

  describe('6. Server-side Rate Limiting & Quota Shield', () => {
    test('enforces burst protection (30s) and hourly cap (3 per hour)', () => {
      const testIpKey = 'ip:198.51.100.42';

      // 1st request should be allowed
      assert.strictEqual(checkRateLimit(testIpKey).allowed, true);
      recordSubmission(testIpKey);

      // Immediate 2nd request should be blocked by burst protection
      const burstCheck = checkRateLimit(testIpKey);
      assert.strictEqual(burstCheck.allowed, false);
    });

    test('detects duplicate message submissions', () => {
      const fingerprint = '10.0.0.9:user@test.com:hello aman, let us connect for coffee';
      // First submission is not a duplicate
      assert.strictEqual(checkAndRecordDuplicate(fingerprint), false);
      // Immediate resubmission with identical text is flagged as duplicate
      assert.strictEqual(checkAndRecordDuplicate(fingerprint), true);
    });
  });

  describe('7. End-to-End Legitimate Flow', () => {
    test('successful submission passes all gates and dispatches to EmailJS', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Sarah Connor',
          email: 'sarah.connor@sky.net',
          subject: 'Internship Opportunity',
          message: 'Hi Aman, loved your CredVidhi project. Would love to discuss a role with our team.',
          company_hp: '', // Clean honeypot
          turnstileToken: 'valid-turnstile-token',
        },
        '203.0.113.195',
        mockEnv
      );

      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.success, true);
      assert.match(result.data.message, /sent successfully/i);

      // Verify EmailJS was contacted with correct parameters
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 1);
      assert.strictEqual(emailJsCalls[0].body.service_id, 'test-service-id');
      assert.strictEqual(emailJsCalls[0].body.template_params.name, 'Sarah Connor');
      assert.strictEqual(emailJsCalls[0].body.template_params.email, 'sarah.connor@sky.net');
    });
  });
});

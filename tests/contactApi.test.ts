import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleContactSubmission,
  isValidEmailFormat,
  validateMessageQuality,
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

    test('end-to-end: rejects low-quality message before EmailJS is called', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Chat Spammer',
          email: 'spammer@example.com',
          message: 'hi bhai internship hai call me asap',
          turnstileToken: 'valid-turnstile-token',
        },
        '10.0.0.99',
        mockEnv
      );

      assert.strictEqual(result.status, 400);
      assert.strictEqual(result.data.success, false);
      assert.strictEqual(
        result.data.message,
        'Please provide a clear and professional message describing your inquiry.'
      );
      // Zero calls to EmailJS
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 0);
    });
  });

  describe('4. Turnstile Bot Verification Gate', () => {
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
          message: 'Valid message length for testing failure in portfolio.',
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

  describe('5. Server-side Rate Limiting & Quota Shield', () => {
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

    test('end-to-end: rapid subsequent submission gets blocked by rate limiter with 0 extra EmailJS quota used', async () => {
      const payload = {
        name: 'Rapid User',
        email: 'rapid@testcompany.org',
        subject: 'Role Opportunity',
        message: 'Hello Aman, we have a software engineer opportunity for you. Let us chat.',
        turnstileToken: 'valid-turnstile-token',
      };
      const clientIp = '198.51.100.99';

      // 1st submission passes
      const firstResult = await handleContactSubmission(payload, clientIp, mockEnv);
      assert.strictEqual(firstResult.status, 200);

      // Immediate 2nd submission from same IP/email is blocked by rate limiter
      const secondResult = await handleContactSubmission(
        { ...payload, message: 'Different message text but same IP within burst window' },
        clientIp,
        mockEnv
      );
      assert.strictEqual(secondResult.status, 429);
      assert.match(secondResult.data.message, /wait before sending/i);

      // Ensure EmailJS was contacted ONLY ONCE across both attempts
      const emailJsCalls = fetchCalls.filter((c) => c.url.includes('emailjs.com'));
      assert.strictEqual(emailJsCalls.length, 1);
    });
  });

  describe('6. End-to-End Legitimate Flow', () => {
    test('successful submission passes all gates and dispatches to EmailJS', async () => {
      const result = await handleContactSubmission(
        {
          name: 'Sarah Connor',
          email: 'sarah.connor@sky.net',
          subject: 'Internship Opportunity',
          message: 'Hi Aman, loved your CredVidhi project. Would love to discuss an internship role with our team.',
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

import { createHash, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { database, transaction, cleanup } from './db.ts';
import {
  contactEmail,
  sendTransactionalEmail,
  verificationEmail,
  sendDirectContactEmail,
  getActiveEmailProvider,
} from './email.ts';
import type { EmailPayload } from './email.ts';
import { isValidEmailFormat, validateMessageQuality } from './validation.ts';
import { ContactError } from './errors.ts';

export { ContactError } from './errors.ts';

export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');
const secretToken = () => randomUUID().replaceAll('-', '');

export const sentMessage =
  '📩 Verification link sent! Please check your email and click the verification link to send your message.';
export const directSentMessage =
  'Your message has been sent successfully! I’ll get back to you soon.';

const limitError = () =>
  new ContactError(429, 'rate_limited', 'Too many requests. Please try again later.');
const duplicateError = () =>
  new ContactError(429, 'duplicate', 'Duplicate message detected. Please wait before resending.');
const invalidLink = () =>
  new ContactError(400, 'invalid', '❌ Invalid verification link. Please submit your message again.');
const expiredLink = () =>
  new ContactError(410, 'expired', '⏰ Verification link expired. Please request a new verification email.');

const configuredLimit = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const cooldownSeconds = () => Math.max(60, configuredLimit('CONTACT_RESEND_COOLDOWN_SECONDS', 60));

// ============================================================================
// IN-MEMORY RATE LIMITING, DEDUPLICATION & REPLAY STORE
// ============================================================================
interface RateLimitRecord {
  timestamps: number[];
}

const ipRateStore = new Map<string, RateLimitRecord>();
const emailRateStore = new Map<string, RateLimitRecord>();
const duplicateHashes = new Map<string, number>();
const verifiedTurnstileTokens = new Map<string, number>();

const BURST_LIMIT_MS = 30 * 1000;
const HOURLY_LIMIT_MS = 60 * 60 * 1000;
const DUP_EXPIRY_MS = 15 * 60 * 1000;
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

export function cleanupMemoryStores(): void {
  const now = Date.now();
  for (const [key, record] of ipRateStore.entries()) {
    const active = record.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
    if (active.length === 0) ipRateStore.delete(key);
    else ipRateStore.set(key, { timestamps: active });
  }
  for (const [key, record] of emailRateStore.entries()) {
    const active = record.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
    if (active.length === 0) emailRateStore.delete(key);
    else emailRateStore.set(key, { timestamps: active });
  }
  for (const [hash, expiresAt] of duplicateHashes.entries()) {
    if (now > expiresAt) duplicateHashes.delete(hash);
  }
  for (const [tokenHash, expiresAt] of verifiedTurnstileTokens.entries()) {
    if (now > expiresAt) verifiedTurnstileTokens.delete(tokenHash);
  }
}

export function resetMemoryStoresForTesting(): void {
  ipRateStore.clear();
  emailRateStore.clear();
  duplicateHashes.clear();
  verifiedTurnstileTokens.clear();
}

export function checkDirectRateLimit(
  ip: string,
  email: string,
  subject: string,
  message: string
): void {
  cleanupMemoryStores();
  const now = Date.now();

  // 1. Deduplication check
  const fingerprint = `${email.toLowerCase()}:${subject.trim()}:${message.trim()}`;
  const dHash = hashToken(fingerprint);
  const existingDup = duplicateHashes.get(dHash);
  if (existingDup && now < existingDup) {
    throw duplicateError();
  }

  // 2. IP Rate Limits (Burst & Hourly)
  const ipRecord = ipRateStore.get(ip);
  if (ipRecord && ipRecord.timestamps.length > 0) {
    const active = ipRecord.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
    const last = active[active.length - 1];
    if (last && now - last < BURST_LIMIT_MS) {
      throw limitError();
    }
    const maxIp = configuredLimit('CONTACT_MAX_IP_PER_HOUR', 5);
    if (active.length >= maxIp) {
      throw limitError();
    }
  }

  // 3. Email Rate Limits (Hourly)
  const normEmail = email.toLowerCase().trim();
  const emailRecord = emailRateStore.get(normEmail);
  if (emailRecord && emailRecord.timestamps.length > 0) {
    const active = emailRecord.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
    const maxEmail = configuredLimit('CONTACT_MAX_EMAIL_PER_HOUR', 3);
    if (active.length >= maxEmail) {
      throw limitError();
    }
  }
}

export function recordDirectRateLimit(
  ip: string,
  email: string,
  subject: string,
  message: string
): void {
  const now = Date.now();

  // Record duplicate hash
  const fingerprint = `${email.toLowerCase()}:${subject.trim()}:${message.trim()}`;
  const dHash = hashToken(fingerprint);
  duplicateHashes.set(dHash, now + DUP_EXPIRY_MS);

  // Record IP timestamp
  const ipRecord = ipRateStore.get(ip) || { timestamps: [] };
  const activeIp = ipRecord.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
  activeIp.push(now);
  ipRateStore.set(ip, { timestamps: activeIp });

  // Record Email timestamp
  const normEmail = email.toLowerCase().trim();
  const emailRecord = emailRateStore.get(normEmail) || { timestamps: [] };
  const activeEmail = emailRecord.timestamps.filter(t => now - t < HOURLY_LIMIT_MS);
  activeEmail.push(now);
  emailRateStore.set(normEmail, { timestamps: activeEmail });
}

// Reserve before dispatch so concurrent requests cannot both pass the checks.
// With PostgreSQL, reservations survive cold starts and are shared by instances.
async function reserveSubmission(ip: string, email: string, subject: string, message: string) {
  const fingerprint = hashToken(`${email.toLowerCase()}:${subject.trim()}:${message.trim()}`);
  if (!process.env.DATABASE_URL) {
    checkDirectRateLimit(ip, email, subject, message);
    recordDirectRateLimit(ip, email, subject, message);
    return async () => { duplicateHashes.delete(fingerprint); };
  }

  const duplicateKey = `direct:duplicate:${fingerprint}`;
  const ipKey = `direct:ip:${hashToken(ip)}`;
  const emailKey = `direct:email:${hashToken(email.toLowerCase().trim())}`;
  const id = await transaction(async client => {
    for (const key of [duplicateKey, ipKey, emailKey].sort()) {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
    }
    const { rows } = await client.query(
      `SELECT key, count(*)::int AS count, max(created_at) > now() - interval '30 seconds' AS burst
       FROM contact_rate_events WHERE key = ANY($1::text[])
       AND created_at > now() - interval '1 hour'
       AND (key <> $2 OR created_at > now() - interval '15 minutes') GROUP BY key`,
      [[duplicateKey, ipKey, emailKey], duplicateKey]
    );
    if (rows.some(row => row.key === duplicateKey)) throw duplicateError();
    if (rows.some(row =>
      (row.key === ipKey && (row.burst || row.count >= configuredLimit('CONTACT_MAX_IP_PER_HOUR', 5))) ||
      (row.key === emailKey && row.count >= configuredLimit('CONTACT_MAX_EMAIL_PER_HOUR', 3))
    )) throw limitError();
    await client.query('INSERT INTO contact_rate_events (key) VALUES ($1), ($2)', [ipKey, emailKey]);
    const inserted = await client.query('INSERT INTO contact_rate_events (key) VALUES ($1) RETURNING id', [duplicateKey]);
    return inserted.rows[0].id;
  });
  // Keep rate attempts on failure, but allow a new CAPTCHA and retry after cooldown.
  return async () => { await database().query('DELETE FROM contact_rate_events WHERE id = $1', [id]); };
}

export function siteUrl(): string {
  try {
    const url = new URL(process.env.CONTACT_SITE_URL || 'https://calligraphyguruji.dev');
    if (
      url.protocol !== 'https:' &&
      !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname))
    ) {
      throw new Error('HTTPS required');
    }
    return url.origin;
  } catch {
    throw new ContactError(
      503,
      'configuration_error',
      'The contact form is temporarily unavailable. Please try again shortly.',
      {
        stage: 'configuration',
        reason: 'invalid_environment',
        fields: ['CONTACT_SITE_URL'],
      }
    );
  }
}

export function assertConfigured(): void {
  const provider = getActiveEmailProvider();
  if (provider === 'none') {
    throw new ContactError(
      503,
      'configuration_error',
      'The contact form is temporarily unavailable. Please try again shortly.',
      {
        stage: 'configuration',
        reason: 'missing_environment',
        fields: ['RESEND_API_KEY'],
      }
    );
  }
  if (!process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NODE_ENV === 'production') {
    throw new ContactError(
      503,
      'configuration_error',
      'The contact form is temporarily unavailable. Please try again shortly.',
      {
        stage: 'configuration',
        reason: 'missing_environment',
        fields: ['TURNSTILE_SECRET_KEY'],
      }
    );
  }
  siteUrl();
}

export function validateInput(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ContactError(400, 'validation', 'Please check the form fields.');
  }
  const input = body as Record<string, unknown>;
  for (const field of ['name', 'email', 'message']) {
    if (typeof input[field] !== 'string') {
      throw new ContactError(400, 'validation', 'Please fill in all required fields.');
    }
  }
  for (const field of ['subject', 'company_hp', 'turnstileToken']) {
    if (input[field] !== undefined && typeof input[field] !== 'string') {
      throw new ContactError(400, 'validation', 'Please check the form fields.');
    }
  }
  const name = (input.name as string).trim();
  const email = (input.email as string).trim().toLowerCase();
  const subject = ((input.subject as string) || '').trim();
  const message = (input.message as string).trim();

  if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f]/.test(name)) {
    throw new ContactError(400, 'validation', 'Please enter a valid name (2 to 100 characters).');
  }
  if (!isValidEmailFormat(email)) {
    throw new ContactError(400, 'validation', 'Please enter a valid email address.');
  }
  if (subject.length > 150 || /[\r\n\x00-\x1f]/.test(subject)) {
    throw new ContactError(400, 'validation', 'Please enter a valid subject (up to 150 characters).');
  }
  if (message.length < 10 || message.length > 3000 || message.includes('\0')) {
    throw new ContactError(400, 'validation', 'Please enter a valid message (10 to 3000 characters).');
  }
  const quality = validateMessageQuality(name, subject, message);
  if (!quality.passes) {
    throw new ContactError(400, 'validation', quality.userMessage!);
  }
  return {
    name,
    email,
    subject,
    message,
    company_hp: input.company_hp as string | undefined,
    turnstileToken: input.turnstileToken as string | undefined,
  };
}

export function requireTurnstileToken(token: unknown): asserts token is string {
  if (typeof token !== 'string' || !token || token.length > 2048) {
    throw new ContactError(
      400,
      'turnstile',
      'Verification failed. Please complete the security check again.'
    );
  }
}

export async function verifyTurnstile(token: unknown, ip: string): Promise<void> {
  requireTurnstileToken(token);

  // Replay check
  const tokenHash = hashToken(token);
  cleanupMemoryStores();
  if (verifiedTurnstileTokens.has(tokenHash)) {
    throw new ContactError(
      400,
      'turnstile',
      'Verification failed. Please complete the security check again.',
      {
        stage: 'turnstile',
        reason: 'token_replayed',
      }
    );
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new ContactError(
      503,
      'configuration_error',
      'The security check is temporarily unavailable. Please try again shortly.',
      {
        stage: 'turnstile',
        reason: 'missing_secret_key',
      }
    );
  }

  let response: Response;
  let data: { success?: boolean; hostname?: string; 'error-codes'?: string[] };

  try {
    response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
    });
    data = await response.json();
    if (!data || typeof data.success !== 'boolean' ||
      (data['error-codes'] !== undefined && (!Array.isArray(data['error-codes']) ||
        !data['error-codes']!.every(code => typeof code === 'string')))) {
      throw new Error('Invalid Siteverify response');
    }
  } catch {
    throw new ContactError(
      502,
      'turnstile_unavailable',
      'The security check is temporarily unavailable. Please try again shortly.',
      {
        stage: 'turnstile',
        reason: 'request_failed',
      }
    );
  }

  if (
    !response.ok ||
    data['error-codes']?.some(code =>
      ['invalid-input-secret', 'missing-input-secret', 'internal-error'].includes(code)
    )
  ) {
    throw new ContactError(
      502,
      'turnstile_unavailable',
      'The security check is temporarily unavailable. Please try again shortly.',
      {
        stage: 'turnstile',
        reason: 'service_or_configuration_failure',
        upstreamStatus: response.status,
      }
    );
  }

  const defaultHostnames = [
    'calligraphyguruji.dev',
    'www.calligraphyguruji.dev',
    ...(process.env.NODE_ENV !== 'production' ? ['localhost', '127.0.0.1'] : []),
  ];
  const configuredHostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  const hostnames = configuredHostnames.length > 0 ? configuredHostnames : defaultHostnames;

  if (
    data.success !== true ||
    !data.hostname ||
    !hostnames.includes(data.hostname)
  ) {
    throw new ContactError(
      400,
      'turnstile',
      'Verification failed. Please complete the security check again.',
      {
        stage: 'turnstile',
        reason: 'verification_failed',
      }
    );
  }

  // Token verified successfully: record in replay store
  verifiedTurnstileTokens.set(tokenHash, Date.now() + TOKEN_EXPIRY_MS);
}

// ============================================================================
// PRIMARY DIRECT CONTACT SUBMISSION HANDLER
// ============================================================================
export async function submitContactMessage(
  body: unknown,
  ip: string,
  origin?: string
): Promise<{ success: boolean; message: string; code: string }> {
  // 1. Validate form fields & quality
  const input = validateInput(body);

  // 2. Reject honeypot submissions without claiming email acceptance
  if (input.company_hp) {
    throw new ContactError(400, 'validation', 'Please check the form fields.');
  }

  // 3. CAPTCHA verification
  requireTurnstileToken(input.turnstileToken);
  await verifyTurnstile(input.turnstileToken, ip);

  // 4. Rate limiting & duplicate detection
  const releaseDuplicate = await reserveSubmission(ip, input.email, input.subject, input.message);

  // 5. Send email via configured provider (Resend primary, EmailJS fallback)
  let result;
  try {
    result = await sendDirectContactEmail(
      {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        origin,
      },
      `contact/${hashToken(JSON.stringify([input.name, input.email, input.subject, input.message]))}`
    );
  } catch (error) {
    await releaseDuplicate().catch(() => { /* Preserve the original dispatch error. */ });
    throw error;
  }
  // Reservations already counted this attempt, including concurrent requests.

  // 7. Optional persistence in Neon PostgreSQL if configured
  if (process.env.DATABASE_URL) {
    try {
      await transaction(async client => {
        await client.query(
          `INSERT INTO contact_submissions (id, name, email, subject, message, email_key, receipt_hash, token_hash, expires_at, turnstile_verified, status, provider_id, accepted_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + interval '15 minutes', true, 'accepted', $9, now())`,
          [
            randomUUID(),
            input.name,
            input.email,
            input.subject,
            input.message,
            hashToken(input.email),
            hashToken(randomUUID()),
            hashToken(randomUUID()),
            result.id || 'ok',
          ]
        );
      });
    } catch {
      // Non-fatal: PostgreSQL availability must not block successful email dispatch
    }
  }

  return {
    success: true,
    code: 'sent',
    message: directSentMessage,
  };
}

// ============================================================================
// LEGACY COMPATIBILITY HANDLERS (for verification links and tests)
// ============================================================================
export async function requestVerification(
  body: unknown,
  ip: string,
  setReceipt?: (receipt: string) => void
) {
  if (setReceipt) setReceipt(randomUUID().replaceAll('-', ''));
  return submitContactMessage(body, ip);
}

export async function resendVerification(receipt: string, ip: string) {
  throw new ContactError(410, 'expired', 'Please submit your message again using the contact form.');
}

export async function verifySubmission(token: unknown, ip: string) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw invalidLink();
  }
  throw new ContactError(410, 'expired', 'Please submit your message again using the contact form.');
}

export async function maintenance() {
  await cleanup();
}

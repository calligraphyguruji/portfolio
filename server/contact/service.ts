import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { database, transaction, cleanup } from './db.ts';
import { contactEmail, sendTransactionalEmail, verificationEmail } from './email.ts';
import type { EmailPayload } from './email.ts';
import { isValidEmailFormat, validateMessageQuality } from './validation.ts';

export class ContactError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message); this.status = status; this.code = code;
  }
}
export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');
const secretToken = () => randomBytes(32).toString('base64url');
const privateKey = (value: string) => createHmac('sha256', process.env.CONTACT_RATE_LIMIT_SECRET!).update(value).digest('hex');
export const sentMessage = '📩 Verification link sent! Please check your email and click the verification link to send your message.';
const limitError = () => new ContactError(429, 'rate_limited', 'Please wait before requesting another verification email.');
const invalidLink = () => new ContactError(400, 'invalid', '❌ Invalid verification link. Please submit your message again.');
const expiredLink = () => new ContactError(410, 'expired', '⏰ Verification link expired. Please request a new verification email.');
const configuredLimit = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};
export const cooldownSeconds = () => Math.max(60, configuredLimit('CONTACT_RESEND_COOLDOWN_SECONDS', 60));

export function siteUrl() {
  const url = new URL(process.env.CONTACT_SITE_URL || 'https://calligraphyguruji.dev');
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('HTTPS required');
  }
  return url.origin;
}
export function assertConfigured() {
  for (const key of ['DATABASE_URL', 'RESEND_API_KEY', 'EMAIL_FROM', 'TURNSTILE_SECRET_KEY', 'CONTACT_RATE_LIMIT_SECRET']) {
    if (!process.env[key]?.trim()) throw new Error('Contact service unavailable');
  }
  if (process.env.CONTACT_RATE_LIMIT_SECRET!.length < 32) throw new Error('Contact service unavailable');
  siteUrl();
}

async function lock(client: PoolClient, keys: string[]) {
  for (const key of [...new Set(keys)].sort()) {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
  }
}
async function rate(client: PoolClient, key: string, max: number, cooldown = 0) {
  const { rows } = await client.query(`SELECT count(*)::int AS count,
    COALESCE(extract(epoch FROM (now()-max(created_at))), 999999)::float AS elapsed
    FROM contact_rate_events WHERE key=$1 AND created_at > now()-interval '1 hour'`, [key]);
  if (rows[0].count >= max || (cooldown > 0 && rows[0].elapsed < cooldown)) throw limitError();
  await client.query('INSERT INTO contact_rate_events(key) VALUES($1)', [key]);
}
export async function ipRate(ip: string, verify = false) {
  const key = privateKey(`${verify ? 'verify' : 'request'}:ip:${ip}`);
  await transaction(async client => {
    await lock(client, [key]);
    await rate(client, key, verify ? 120 : configuredLimit('CONTACT_MAX_IP_PER_HOUR', 5));
  });
}

export function validateInput(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ContactError(400, 'validation', 'Please check the form fields.');
  const input = body as Record<string, unknown>;
  for (const field of ['name', 'email', 'message']) {
    if (typeof input[field] !== 'string') throw new ContactError(400, 'validation', 'Please fill in all required fields.');
  }
  for (const field of ['subject', 'company_hp', 'turnstileToken']) {
    if (input[field] !== undefined && typeof input[field] !== 'string') throw new ContactError(400, 'validation', 'Please check the form fields.');
  }
  const name = (input.name as string).trim();
  const email = (input.email as string).trim().toLowerCase();
  const subject = ((input.subject as string) || '').trim();
  const message = (input.message as string).trim();
  if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f]/.test(name)) throw new ContactError(400, 'validation', 'Please enter a valid name (2 to 100 characters).');
  if (!isValidEmailFormat(email)) throw new ContactError(400, 'validation', 'Please enter a valid email address.');
  if (subject.length > 150 || /[\r\n\x00-\x1f]/.test(subject)) throw new ContactError(400, 'validation', 'Please enter a valid subject (up to 150 characters).');
  if (message.length < 10 || message.length > 3000 || message.includes('\0')) throw new ContactError(400, 'validation', 'Please enter a valid message (10 to 3000 characters).');
  const quality = validateMessageQuality(name, subject, message);
  if (!quality.passes) throw new ContactError(400, 'validation', quality.userMessage!);
  return { name, email, subject, message, company_hp: input.company_hp, turnstileToken: input.turnstileToken };
}

async function verifyTurnstile(token: unknown, ip: string) {
  if (typeof token !== 'string' || !token || token.length > 2048) throw new ContactError(400, 'turnstile', 'Please complete the security verification.');
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  });
  const data = await response.json() as { success?: boolean; hostname?: string };
  const hostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || `${new URL(siteUrl()).hostname},www.calligraphyguruji.dev`).split(',').map(x => x.trim());
  if (!response.ok || !data.success || !data.hostname || !hostnames.includes(data.hostname)) {
    throw new ContactError(400, 'turnstile', 'Security check failed. Please refresh and try again.');
  }
}

export async function requestVerification(body: unknown, ip: string, setReceipt: (receipt: string) => void) {
  const input = validateInput(body);
  if (input.company_hp) return { success: true, code: 'verification_sent', message: sentMessage, cooldownSeconds: cooldownSeconds() };
  await ipRate(ip);
  await verifyTurnstile(input.turnstileToken, ip);
  await cleanup();
  const id = randomUUID(), token = secretToken(), receipt = secretToken();
  const emailKey = privateKey(`email:${input.email}`);
  await transaction(async client => {
    await lock(client, [emailKey]);
    await rate(client, emailKey, configuredLimit('CONTACT_MAX_EMAIL_PER_HOUR', 3), cooldownSeconds());
    const { rows } = await client.query(`SELECT count(*)::int AS count FROM contact_submissions
      WHERE email_key=$1 AND status='unverified' AND expires_at > now()`, [emailKey]);
    if (rows[0].count >= configuredLimit('CONTACT_MAX_PENDING_PER_EMAIL', 2)) throw limitError();
    await client.query(`INSERT INTO contact_submissions
      (id,name,email,subject,message,email_key,receipt_hash,token_hash,expires_at,turnstile_verified)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '15 minutes',true)`,
    [id, input.name, input.email, input.subject, input.message, emailKey, hashToken(receipt), hashToken(token)]);
  });
  setReceipt(receipt);
  await sendTransactionalEmail(verificationEmail(input.name, input.email, `${siteUrl()}/contact/verify#token=${token}`), `verification/${id}/${hashToken(token)}`);
  return { success: true, code: 'verification_sent', message: sentMessage, cooldownSeconds: cooldownSeconds() };
}

export async function resendVerification(receipt: string, ip: string) {
  await ipRate(ip);
  if (!/^[A-Za-z0-9_-]{43}$/.test(receipt)) throw invalidLink();
  const token = secretToken();
  const row = await transaction(async client => {
    // Read only to establish lock ordering shared with initial submissions.
    const lookup = await client.query('SELECT email_key FROM contact_submissions WHERE receipt_hash=$1', [hashToken(receipt)]);
    if (!lookup.rows[0]) throw invalidLink();
    await lock(client, [lookup.rows[0].email_key]);
    const { rows } = await client.query('SELECT * FROM contact_submissions WHERE receipt_hash=$1 FOR UPDATE', [hashToken(receipt)]);
    const saved = rows[0];
    if (!saved || saved.status !== 'unverified' || !saved.turnstile_verified) throw invalidLink();
    if (new Date(saved.expires_at).getTime() <= Date.now()) throw expiredLink();
    await rate(client, saved.email_key, configuredLimit('CONTACT_MAX_EMAIL_PER_HOUR', 3), cooldownSeconds());
    await client.query(`UPDATE contact_submissions SET token_hash=$2, expires_at=now()+interval '15 minutes',
      last_verification_at=now() WHERE id=$1`, [saved.id, hashToken(token)]);
    return saved;
  });
  // A resend is bound to the HttpOnly receipt of a previously Turnstile-verified submission.
  await sendTransactionalEmail(verificationEmail(row.name, row.email, `${siteUrl()}/contact/verify#token=${token}`), `verification/${row.id}/${hashToken(token)}`);
  return { success: true, code: 'verification_sent', message: sentMessage, cooldownSeconds: cooldownSeconds() };
}

export async function deliver(id: string): Promise<boolean> {
  const { rows } = await database().query(`UPDATE contact_submissions
    SET lease_until=now()+interval '60 seconds', first_attempt_at=COALESCE(first_attempt_at, now())
    WHERE id=$1 AND status='pending' AND verified_at IS NOT NULL
      AND (lease_until IS NULL OR lease_until < now())
      AND (first_attempt_at IS NULL OR first_attempt_at > now()-interval '20 hours')
    RETURNING delivery_payload`, [id]);
  if (!rows[0]) return false;
  try {
    const providerId = await sendTransactionalEmail(rows[0].delivery_payload as EmailPayload, `contact/${id}`);
    await database().query(`UPDATE contact_submissions SET status='accepted', provider_id=$2, accepted_at=now(),
      name=NULL,email=NULL,subject=NULL,message=NULL,delivery_payload=NULL,lease_until=NULL WHERE id=$1`, [id, providerId]);
    return true;
  } catch {
    // Leave the durable outbox pending. The lease prevents immediate repeated provider calls.
    return false;
  }
}

export async function verifySubmission(token: unknown, ip: string) {
  await ipRate(ip, true);
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw invalidLink();
  const row = await transaction(async client => {
    const { rows } = await client.query('SELECT * FROM contact_submissions WHERE token_hash=$1 FOR UPDATE', [hashToken(token)]);
    const saved = rows[0];
    if (!saved || !saved.turnstile_verified) throw invalidLink();
    if (saved.status === 'expired') throw expiredLink();
    if (saved.status !== 'unverified') return saved;
    if (new Date(saved.expires_at).getTime() <= Date.now()) throw expiredLink();
    const payload = contactEmail(saved);
    // Consumption and outbox creation are one transaction. This token never authorizes another message.
    await client.query(`UPDATE contact_submissions SET verified_at=now(), status='pending', delivery_payload=$2 WHERE id=$1`, [saved.id, JSON.stringify(payload)]);
    return { ...saved, status: 'pending' };
  });
  if (row.status === 'accepted') return { success: true, code: 'used', message: '✅ This verification link has already been used. Your message will not be sent again.' };
  if (row.status === 'review') return { success: false, code: 'delivery_failed', message: 'Your email is verified, but we could not confirm message delivery. Please contact Aman directly.' };
  if (await deliver(row.id)) return { success: true, code: 'accepted', message: '✅ Email Verified Successfully! Your message has been sent to Aman. Thank you for reaching out! I’ll get back to you as soon as possible.' };
  return { success: false, code: 'pending', message: 'Your email is verified. Message delivery is pending. Please check again shortly; your message will not be sent twice.' };
}

export async function maintenance() {
  await cleanup();
  const { rows } = await database().query(`SELECT id FROM contact_submissions WHERE status='pending'
    AND (lease_until IS NULL OR lease_until < now()) ORDER BY created_at LIMIT 10`);
  const started = Date.now();
  for (const row of rows) {
    if (Date.now() - started > 30000) break;
    await deliver(row.id);
  }
}

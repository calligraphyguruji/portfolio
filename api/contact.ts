import { randomUUID, timingSafeEqual } from 'node:crypto';
import {
  ContactError,
  maintenance,
  siteUrl,
  verifySubmission,
  resendVerification,
  submitContactMessage,
} from '../server/contact/service.ts';
import { getActiveEmailProvider } from '../server/contact/email.ts';
import { reportContactError } from '../server/contact/errors.ts';

export const maxDuration = 60;
export const config = { api: { bodyParser: { sizeLimit: '16kb' } } };

export default async function handler(req: any, res: any) {
  const requestId = randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Vary', 'Origin');

  const incomingOrigin = req.headers?.origin || '';
  const origins = new Set([
    siteUrl(),
    'https://calligraphyguruji.dev',
    'https://www.calligraphyguruji.dev',
  ]);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:5173');
  }

  const isAllowedOrigin = (origin: string): boolean => {
    if (!origin) return false;
    if (origins.has(origin)) return true;
    try {
      const url = new URL(origin);
      if (
        process.env.NODE_ENV !== 'production' &&
        url.origin === origin &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      ) {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const corsOrigin = incomingOrigin && isAllowedOrigin(incomingOrigin) ? incomingOrigin : siteUrl();
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const pathname = new URL(req.url || '/api/contact', 'http://localhost').pathname;
  const parts = pathname.split('/').filter(Boolean);
  const action = req.query?.action || (parts.length >= 3 ? parts[2] : 'send');

  // GET Routing
  if (req.method === 'GET') {
    if (action === 'maintenance') {
      const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
      const actual = req.headers?.authorization || '';
      if (
        !process.env.CRON_SECRET ||
        Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
        !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
      ) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
      }
      await maintenance();
      return res.status(200).json({ success: true });
    }

    if (action !== 'send' && action !== 'health') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const emailProvider = getActiveEmailProvider();
    return res.status(200).json({
      status: 'healthy',
      emailProvider,
      turnstileConfigured: Boolean(process.env.TURNSTILE_SECRET_KEY),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      configuredReceiver: Boolean(process.env.CONTACT_RECEIVER_EMAIL),
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const origin = req.headers?.origin;
    const isOriginAllowed = typeof origin === 'string' && isAllowedOrigin(origin);

    if (!isOriginAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Please submit this form from the portfolio website.',
      });
    }

    if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) {
      return res.status(415).json({ success: false, message: 'Please submit a valid form.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        throw new ContactError(400, 'validation', 'Please submit a valid form.');
      }
    }

    if (Buffer.byteLength(JSON.stringify(body ?? {})) > 16384) {
      return res.status(413).json({ success: false, message: 'Your message is too large.' });
    }

    const forwardedFor =
      req.headers?.['x-forwarded-for'] ||
      (typeof req.headers?.get === 'function' ? req.headers.get('x-forwarded-for') : null);
    const ip =
      process.env.VERCEL === '1'
        ? String(forwardedFor || '').split(',')[0].trim() || 'unknown'
        : (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
          req.headers?.['x-real-ip'] ||
          req.socket?.remoteAddress ||
          'local';

    let result;
    if (action === 'verify') {
      result = await verifySubmission(body?.token, ip);
    } else if (action === 'resend-verification') {
      const receipt =
        String(req.headers?.cookie || '').match(
          /(?:^|;\s*)contact_receipt=([A-Za-z0-9_-]{43})(?:;|$)/
        )?.[1] || '';
      result = await resendVerification(receipt, ip);
    } else if (['send', 'request-verification'].includes(action)) {
      // Direct send & backward-compatible 'request-verification' / 'send'
      result = await submitContactMessage(body, ip, incomingOrigin);
    } else {
      return res.status(404).json({ success: false, message: 'Endpoint not found.', requestId });
    }

    return res.status(200).json({ ...result, requestId });
  } catch (error) {
    if (!(error instanceof ContactError) || error.status >= 500) {
      reportContactError(error, action, requestId);
    }
    if (error instanceof ContactError) {
      if (error.status === 429) res.setHeader('Retry-After', '60');
      return res
        .status(error.status)
        .json({ success: false, code: error.code, message: error.message, requestId });
    }

    return res.status(503).json({
      success: false,
      code: 'unavailable',
      message: 'We couldn’t send your message right now. Please try again shortly.',
      requestId,
    });
  }
}

import { timingSafeEqual } from 'node:crypto';
import { assertConfigured, ContactError, maintenance, requestVerification, resendVerification, siteUrl, verifySubmission } from '../server/contact/service.ts';

export const maxDuration = 60;
export const config = { api: { bodyParser: { sizeLimit: '16kb' } } };

// The legacy /api/contact route now requests verification; it cannot deliver mail directly.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const pathname = new URL(req.url || '/api/contact', 'http://localhost').pathname;
  const action = req.query?.action || pathname.split('/')[3] || 'request-verification';
  try {
    if (action === 'maintenance') {
      if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' });
      const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
      const actual = req.headers?.authorization || '';
      if (!process.env.CRON_SECRET || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
      }
      assertConfigured();
      await maintenance();
      return res.status(200).json({ success: true });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }
    const origins = new Set([siteUrl(), 'https://calligraphyguruji.dev', 'https://www.calligraphyguruji.dev']);
    if (process.env.NODE_ENV !== 'production') origins.add('http://localhost:3000');
    if (typeof req.headers?.origin !== 'string' || !origins.has(req.headers.origin)) {
      return res.status(403).json({ success: false, message: 'Please submit this form from the portfolio website.' });
    }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) {
      return res.status(415).json({ success: false, message: 'Please submit a valid form.' });
    }
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { throw new ContactError(400, 'validation', 'Please submit a valid form.'); }
    }
    if (Buffer.byteLength(JSON.stringify(body ?? {})) > 16384) {
      return res.status(413).json({ success: false, message: 'Your message is too large.' });
    }
    assertConfigured();
    // On Vercel this header is overwritten by the platform. Local dev uses the socket address.
    const ip = process.env.VERCEL === '1'
      ? String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
      : req.socket?.remoteAddress || 'local';
    let result;
    if (action === 'request-verification') {
      result = await requestVerification(body, ip, receipt => {
        res.setHeader('Set-Cookie', `contact_receipt=${receipt}; HttpOnly; SameSite=Strict; Path=/api/contact; Max-Age=3600${siteUrl().startsWith('https:') ? '; Secure' : ''}`);
      });
    } else if (action === 'resend-verification') {
      const receipt = String(req.headers?.cookie || '').match(/(?:^|;\s*)contact_receipt=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1] || '';
      result = await resendVerification(receipt, ip);
    } else if (action === 'verify') {
      result = await verifySubmission(body?.token, ip);
    } else {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }
    return res.status(result.code === 'pending' ? 202 : result.code === 'delivery_failed' ? 503 : 200).json(result);
  } catch (error) {
    if (error instanceof ContactError) {
      if (error.status === 429) res.setHeader('Retry-After', '60');
      return res.status(error.status).json({ success: false, code: error.code, message: error.message });
    }
    // Do not log raw requests, database exceptions, email responses or verification tokens.
    return res.status(503).json({ success: false, code: 'unavailable', message: 'The email service is temporarily unavailable. Please try again shortly.' });
  }
}

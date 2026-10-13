import crypto from 'node:crypto';

// In-memory rate limiting map for Mantri queries: max 30 queries per IP per 5 minutes
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count += 1;
  return true;
}

export default async function handler(req: any, res: any) {
  const isAllowedOrigin = (origin: string | null) =>
    !origin ||
    origin.endsWith('calligraphyguruji.dev') ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');

  const incomingOrigin = req.headers?.origin || '';
  const corsOrigin = isAllowedOrigin(incomingOrigin) && incomingOrigin ? incomingOrigin : '*';

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { copilotOrchestrator } = await import('../src/copilot/services/copilotOrchestrator.ts');

    if (req.method === 'GET') {
      const health = copilotOrchestrator.getHealth();
      return res.status(200).json(health);
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const forwardedFor = req.headers?.['x-forwarded-for'];
    const clientIp =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
      req.headers?.['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment before sending more queries.',
      });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: messages array is required.' });
    }

    const lastMsg = body.messages[body.messages.length - 1];
    if (typeof lastMsg.content !== 'string' || lastMsg.content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    if (lastMsg.content.length > 800) {
      lastMsg.content = lastMsg.content.slice(0, 800);
    }

    const response = await copilotOrchestrator.handleChat(body);
    return res.status(200).json(response);
  } catch (err: any) {
    console.error('[Mantri API Error]:', err);
    return res.status(500).json({
      error: err?.message || 'Server error',
      stack: String(err?.stack || err),
    });
  }
}

import { copilotOrchestrator } from '../../src/copilot/services/copilotOrchestrator.ts';
import type { CopilotChatRequest } from '../../src/copilot/types.ts';

// In-memory rate limiting map for Copilot queries: max 30 queries per IP per 5 minutes
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

export default async function handler(req: any, res?: any) {
  const isAllowedOrigin = (origin: string | null) =>
    !origin ||
    origin.endsWith('calligraphyguruji.dev') ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');

  const incomingOrigin =
    req.headers?.origin ||
    (typeof req.headers?.get === 'function' ? req.headers.get('origin') : null);
  const corsOrigin = isAllowedOrigin(incomingOrigin) && incomingOrigin ? incomingOrigin : '*';

  const setCors = (headers: Record<string, string>) => {
    headers['Access-Control-Allow-Origin'] = corsOrigin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  };

  if (req.method === 'OPTIONS') {
    if (res?.status) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }
    const headers: Record<string, string> = {};
    setCors(headers);
    return new Response(null, { status: 204, headers });
  }

  // Health Check Endpoint
  if (req.method === 'GET') {
    const health = copilotOrchestrator.getHealth();
    if (res?.status) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      return res.status(200).json(health);
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    setCors(headers);
    return new Response(JSON.stringify(health), { status: 200, headers });
  }

  if (req.method !== 'POST') {
    if (res?.status) {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const forwardedFor =
    req.headers?.['x-forwarded-for'] ||
    (typeof req.headers?.get === 'function' ? req.headers.get('x-forwarded-for') : null);
  const clientIp =
    (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'anonymous';

  if (!checkRateLimit(clientIp)) {
    const errPayload = {
      error: 'Rate limit exceeded. Please wait a few moments before sending more requests.',
    };
    if (res?.status) {
      return res.status(429).json(errPayload);
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    setCors(headers);
    return new Response(JSON.stringify(errPayload), { status: 429, headers });
  }

  try {
    let body: CopilotChatRequest = {};
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else if (typeof req.json === 'function') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {
        body = {};
      }
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      const errPayload = { error: 'Invalid request: messages array is required.' };
      if (res?.status) {
        return res.status(400).json(errPayload);
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      setCors(headers);
      return new Response(JSON.stringify(errPayload), { status: 400, headers });
    }

    // Enforce message length bounds
    const lastMsg = body.messages[body.messages.length - 1];
    if (typeof lastMsg.content !== 'string' || lastMsg.content.trim().length === 0) {
      const errPayload = { error: 'Message content cannot be empty.' };
      if (res?.status) {
        return res.status(400).json(errPayload);
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      setCors(headers);
      return new Response(JSON.stringify(errPayload), { status: 400, headers });
    }
    if (lastMsg.content.length > 800) {
      lastMsg.content = lastMsg.content.slice(0, 800);
    }

    const response = await copilotOrchestrator.handleChat(body);
    if (res?.status) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      return res.status(200).json(response);
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    setCors(responseHeaders);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    console.error('[Copilot API Error]:', err);
    const errPayload = {
      error: 'An internal error occurred while processing the request.',
    };
    if (res?.status) {
      return res.status(500).json(errPayload);
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    setCors(headers);
    return new Response(JSON.stringify(errPayload), { status: 500, headers });
  }
}

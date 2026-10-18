import { copilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
import type { CopilotChatRequest } from '../src/copilot/types.ts';

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.expiresAt) rateLimitMap.delete(key);
    }
  }
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

  const incomingOrigin =
    req.headers?.origin ||
    (typeof req.headers?.get === 'function' ? req.headers.get('origin') : '');
  const corsOrigin = isAllowedOrigin(incomingOrigin) && incomingOrigin ? incomingOrigin : '*';

  if (res?.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    if (res?.status) {
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    if (req.method === 'GET') {
      const health = copilotOrchestrator.getHealth();
      if (res?.status) {
        return res.status(200).json(health);
      }
      return new Response(JSON.stringify(health), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }

    if (req.method !== 'POST') {
      if (res?.status) {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }

    const forwardedFor =
      req.headers?.['x-forwarded-for'] ||
      (typeof req.headers?.get === 'function' ? req.headers.get('x-forwarded-for') : null);
    const clientIp =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
      req.headers?.['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      const errPayload = {
        error: 'Rate limit exceeded. Please wait a moment before sending more queries.',
      };
      if (res?.status) {
        return res.status(429).json(errPayload);
      }
      return new Response(JSON.stringify(errPayload), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }

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
      return new Response(JSON.stringify(errPayload), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }

    const lastMsg = body.messages[body.messages.length - 1];
    if (typeof lastMsg.content !== 'string' || lastMsg.content.trim().length === 0) {
      const errPayload = { error: 'Message content cannot be empty.' };
      if (res?.status) {
        return res.status(400).json(errPayload);
      }
      return new Response(JSON.stringify(errPayload), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }

    if (lastMsg.content.length > 800) {
      lastMsg.content = lastMsg.content.slice(0, 800);
    }

    // Proxy to self-hosted inference backend if configured
    const backendUrl = process.env.MANTRI_BACKEND_URL;
    if (backendUrl) {
      try {
        const proxyRes = await fetch(`${backendUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (res?.status) {
            return res.status(200).json(proxyData);
          }
          return new Response(JSON.stringify(proxyData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': corsOrigin,
            },
          });
        }
      } catch (proxyErr) {
        console.warn('[Mantri Vercel Proxy] Remote backend unreachable, engaging dynamic router:', proxyErr);
      }
    }

    const response = await copilotOrchestrator.handleChat(body);
    if (res?.status) {
      return res.status(200).json(response);
    }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
      },
    });
  } catch (err: any) {
    console.error('[Mantri API Error]:', err);
    const errPayload = {
      error: err?.message || 'Server error',
    };
    if (res?.status) {
      return res.status(500).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
      },
    });
  }
}

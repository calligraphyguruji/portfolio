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

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Health Check Endpoint
  if (req.method === 'GET') {
    const health = copilotOrchestrator.getHealth();
    return res.status(200).json(health);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'anonymous';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a few moments before sending more requests.',
    });
  }

  try {
    const body: CopilotChatRequest = req.body || {};
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: messages array is required.' });
    }

    // Enforce message length bounds (max 800 chars per message to prevent context flooding)
    const lastMsg = body.messages[body.messages.length - 1];
    if (typeof lastMsg.content !== 'string' || lastMsg.content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }
    if (lastMsg.content.length > 800) {
      lastMsg.content = lastMsg.content.slice(0, 800);
    }

    const response = await copilotOrchestrator.handleChat(body);
    return res.status(200).json(response);
  } catch (err: unknown) {
    console.error('[Copilot API Error]:', err);
    return res.status(500).json({
      error: 'An internal error occurred while processing the request.',
    });
  }
}

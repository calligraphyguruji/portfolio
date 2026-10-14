import http from 'node:http';
import { URL } from 'node:url';
import crypto from 'node:crypto';
import { copilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
import { conversationMemory } from '../src/copilot/services/conversationMemory.ts';
import { localVectorStore } from '../src/copilot/services/localVectorStore.ts';
import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../src/copilot/data/verifiedKnowledge.ts';
import { AI_CONFIG } from '../src/copilot/config/aiConfig.ts';

const PORT = AI_CONFIG.backendPort;
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
    rateLimitMap.set(ip, { count: 1, expiresAt: now + AI_CONFIG.rateLimitWindowMs });
    return true;
  }
  if (entry.count >= AI_CONFIG.rateLimitMaxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return (
    origin.endsWith('calligraphyguruji.dev') ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );
}

function verifyAdminAuth(req: http.IncomingMessage): boolean {
  if (!AI_CONFIG.adminApiKey) {
    // If no admin key configured, refuse administrative changes for security
    return false;
  }
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === AI_CONFIG.adminApiKey;
}

async function parseJsonBody(req: http.IncomingMessage, maxBytes = 1024 * 1024): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      body += chunk.toString('utf-8');
    });

    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

export function createMantriServer(): http.Server {
  return http.createServer(async (req, res) => {
    const requestId = crypto.randomUUID();
    const origin = req.headers['origin'] || '';
    const corsOrigin = isAllowedOrigin(origin) && origin ? origin : '*';

    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Conversation-Id');
    res.setHeader('X-Request-Id', requestId);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const clientIp =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : '') || req.socket.remoteAddress || '127.0.0.1';

    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    // Fast-path health check (no rate limit)
    if (req.method === 'GET' && pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(copilotOrchestrator.getHealth()));
      return;
    }

    // Apply Rate Limiting
    if (!checkRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }));
      return;
    }

    try {
      // 1. GET /api/ai/status
      if (req.method === 'GET' && pathname === '/api/ai/status') {
        const detailed = await copilotOrchestrator.getDetailedStatus();
        const vectorStatus = localVectorStore.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...detailed, vectorStore: vectorStatus }));
        return;
      }

      // 2. GET /api/ai/models
      if (req.method === 'GET' && pathname === '/api/ai/models') {
        const models = await copilotOrchestrator.getPrimaryProvider().list_models();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            configuredModel: copilotOrchestrator.getPrimaryProvider().getModelName(),
            models,
          })
        );
        return;
      }

      // 3. POST /api/chat
      if (req.method === 'POST' && pathname === '/api/chat') {
        const body = await parseJsonBody(req);
        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'messages array is required and must not be empty.' }));
          return;
        }

        const lastMsg = body.messages[body.messages.length - 1];
        if (!lastMsg.content || typeof lastMsg.content !== 'string' || !lastMsg.content.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message content cannot be empty.' }));
          return;
        }

        if (lastMsg.content.length > 2000) {
          lastMsg.content = lastMsg.content.slice(0, 2000);
        }

        const chatResponse = await copilotOrchestrator.handleChat(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(chatResponse));
        return;
      }

      // 4. POST /api/chat/stream (Server-Sent Events)
      if (req.method === 'POST' && pathname === '/api/chat/stream') {
        const body = await parseJsonBody(req);
        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'messages array is required.' }));
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });

        // Abort on client disconnect
        let isClosed = false;
        req.on('close', () => {
          isClosed = true;
        });

        try {
          for await (const token of copilotOrchestrator.streamChat(body)) {
            if (isClosed) break;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
          if (!isClosed) {
            res.write(`data: [DONE]\n\n`);
            res.end();
          }
        } catch (streamErr: any) {
          if (!isClosed) {
            res.write(`data: ${JSON.stringify({ error: streamErr?.message || 'Streaming failed' })}\n\n`);
            res.end();
          }
        }
        return;
      }

      // 5. GET /api/conversations
      if (req.method === 'GET' && pathname === '/api/conversations') {
        const convs = conversationMemory.listConversations();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(convs));
        return;
      }

      // 6. GET /api/conversations/:id
      const convMatch = pathname.match(/^\/api\/conversations\/([a-zA-Z0-9_\-]+)$/);
      if (req.method === 'GET' && convMatch) {
        const convId = convMatch[1];
        const msgs = conversationMemory.getMessages(convId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ conversationId: convId, messages: msgs }));
        return;
      }

      // 7. DELETE /api/conversations/:id
      if (req.method === 'DELETE' && convMatch) {
        const convId = convMatch[1];
        const deleted = conversationMemory.deleteConversation(convId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: deleted, conversationId: convId }));
        return;
      }

      // 8. GET /api/knowledge/status
      if (req.method === 'GET' && pathname === '/api/knowledge/status') {
        const status = localVectorStore.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
        return;
      }

      // 9. POST /api/knowledge/ingest (Admin Protected)
      if (req.method === 'POST' && pathname === '/api/knowledge/ingest') {
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized: valid ADMIN_API_KEY required' }));
          return;
        }

        const body = await parseJsonBody(req);
        if (!body.title || !body.content || !body.id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'id, title, and content are required' }));
          return;
        }

        const doc = {
          id: body.id,
          title: body.title,
          category: body.category || 'project',
          url: body.url || 'https://www.calligraphyguruji.dev',
          content: body.content,
          metadata: {
            technologies: body.technologies || [],
            status: 'implemented' as const,
            updatedAt: new Date().toISOString(),
          },
        };

        const result = await localVectorStore.indexDocuments(
          [doc],
          copilotOrchestrator.getPrimaryProvider()
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
        return;
      }

      // 10. POST /api/knowledge/reindex (Admin Protected)
      if (req.method === 'POST' && pathname === '/api/knowledge/reindex') {
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized: valid ADMIN_API_KEY required' }));
          return;
        }

        const result = await localVectorStore.indexDocuments(
          VERIFIED_KNOWLEDGE_DOCUMENTS,
          copilotOrchestrator.getPrimaryProvider()
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
        return;
      }

      // Not Found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Endpoint ${pathname} not found` }));
    } catch (err: any) {
      if (err?.message === 'PAYLOAD_TOO_LARGE') {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body exceeds 1MB limit' }));
        return;
      }
      if (err?.message === 'INVALID_JSON') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }

      console.error(`[Mantri Server Error ${requestId}]:`, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error', requestId }));
    }
  });
}

// Start server when run directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.ts') || process.argv[1].endsWith('server/index.js'))
) {
  const server = createMantriServer();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mantri Engine] Running on http://localhost:${PORT}`);
    console.log(`[Mantri Engine] Health check at http://localhost:${PORT}/api/health`);
    console.log(`[Mantri Engine] Connected to Ollama at ${AI_CONFIG.ollamaBaseUrl}`);
  });
}

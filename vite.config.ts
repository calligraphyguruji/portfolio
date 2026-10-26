import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

function contactApiDevPlugin(): Plugin {
  return {
    name: 'contact-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url?.split('?')[0] === '/api/contact' || req.url?.startsWith('/api/contact/')) {
          let rawData = '';
          let tooLarge = false;
          req.on('data', (chunk: Buffer) => {
            if (Buffer.byteLength(rawData) + chunk.length > 16384) { tooLarge = true; return; }
            rawData += chunk.toString();
          });
          req.on('end', async () => {
            const reply: any = res;
            reply.status = (code: number) => { res.statusCode = code; return reply; };
            reply.json = (data: unknown) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
            if (tooLarge) return reply.status(413).json({ success: false, message: 'Your message is too large.' });
            try {
              (req as any).body = rawData ? JSON.parse(rawData) : {};
            } catch { return reply.status(400).json({ success: false, message: 'Please submit a valid form.' }); }
            const { default: handler } = await import('./api/contact');
            await handler(req, reply);
          });
        } else { next(); }
      });
    },
  };
}

function copilotApiDevPlugin(): Plugin {
  return {
    name: 'copilot-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/copilot' || url === '/api/chat') {
          try {
            // @ts-ignore
            const { default: handler } = await import('./api/copilot.js');
            const mockRes: any = res;
            mockRes.status = (code: number) => {
              res.statusCode = code;
              return mockRes;
            };
            mockRes.json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return mockRes;
            };
            if (req.method === 'GET') {
              await handler(req, mockRes);
              return;
            }
            if (req.method === 'POST') {
              let rawData = '';
              req.on('data', (chunk: Buffer) => {
                rawData += chunk.toString();
              });
              req.on('end', async () => {
                try {
                  (req as any).body = rawData ? JSON.parse(rawData) : {};
                  await handler(req, mockRes);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err?.message || 'Server error' }));
                }
              });
              return;
            }
          } catch (err: any) {
            console.error('Local dev API copilot error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) if (process.env[key] === undefined) process.env[key] = value;
  return {
    plugins: [react(), contactApiDevPlugin(), copilotApiDevPlugin()],
    server: {
      port: 3000,
      open: false,
    },
  };
});

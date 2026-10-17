import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

function contactApiDevPlugin(): Plugin {
  return {
    name: 'contact-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/api/contact' && req.method === 'POST') {
          let rawData = '';
          req.on('data', (chunk: Buffer) => {
            rawData += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const body = rawData ? JSON.parse(rawData) : {};
              const { handleContactSubmission } = await import('./api/contact');

              const forwardedFor = req.headers['x-forwarded-for'];
              const clientIp =
                (typeof forwardedFor === 'string'
                  ? forwardedFor.split(',')[0].trim()
                  : '') ||
                req.headers['x-real-ip'] ||
                req.socket?.remoteAddress ||
                '127.0.0.1';

              const result = await handleContactSubmission(body, String(clientIp));

              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.data));
            } catch (err) {
              console.error('Local dev API contact error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  message: 'Local server error processing contact form.',
                })
              );
            }
          });
        } else {
          next();
        }
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

export default defineConfig({
  plugins: [react(), contactApiDevPlugin(), copilotApiDevPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});


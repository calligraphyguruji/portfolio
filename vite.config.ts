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

export default defineConfig({
  plugins: [react(), contactApiDevPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});

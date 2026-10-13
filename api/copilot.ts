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

  try {
    const { copilotOrchestrator } = await import('../src/copilot/services/copilotOrchestrator.ts');

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

    let body: any = {};
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

    const response = await copilotOrchestrator.handleChat(body);

    if (res?.status) {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      return res.status(200).json(response);
    }

    const responseHeaders = { 'Content-Type': 'application/json' };
    setCors(responseHeaders);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[Mantri Endpoint Error]:', err);
    const errPayload = {
      error: err?.message || 'Server error',
      stack: String(err?.stack || err),
    };
    if (res?.status) {
      return res.status(500).json(errPayload);
    }
    const headers = { 'Content-Type': 'application/json' };
    setCors(headers);
    return new Response(JSON.stringify(errPayload), { status: 500, headers });
  }
}

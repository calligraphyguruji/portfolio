// Contract: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
const http = require('http');
const used = new Set();
http.createServer((req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'POST' || req.url !== '/turnstile/v0/siteverify') { res.statusCode = 501; return res.end('{}'); }
    const body = JSON.parse(raw || '{}');
    const token = body.response;
    const code = !body.secret ? 'missing-input-secret' : !token ? 'missing-input-response' :
      token.startsWith('invalid') ? 'invalid-input-response' : token.startsWith('expired') || used.has(token) ? 'timeout-or-duplicate' : '';
    if (code) return res.end(JSON.stringify({ success: false, 'error-codes': [code] }));
    used.add(token);
    res.end(JSON.stringify({ success: true, hostname: 'calligraphyguruji.dev', 'error-codes': [] }));
  });
}).listen(process.env.PORT || 4902);

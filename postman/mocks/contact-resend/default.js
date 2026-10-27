// Contract: https://resend.com/docs/api-reference/emails/send-email
const http = require('http');
http.createServer((req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', () => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method !== 'POST' || req.url !== '/emails') return send(501, { message: 'Not modeled' });
    const body = JSON.parse(raw || '{}');
    if (!req.headers.authorization?.startsWith('Bearer ') || !req.headers['idempotency-key']) return send(400, { name: 'validation_error' });
    if (!body.from || !Array.isArray(body.to) || !body.reply_to || !body.text || !body.html) return send(422, { name: 'validation_error' });
    const status = Number(body.subject.match(/\[(401|403|429|503)\]/)?.[1] || 200);
    if (status !== 200) return send(status, { name: status === 401 ? 'validation_error' : 'application_error', message: 'Simulated rejection' });
    if (body.subject.includes('[malformed]')) return send(200, {});
    return send(200, { id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' });
  });
}).listen(process.env.PORT || 4901);

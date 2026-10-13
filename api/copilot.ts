export default async function handler(req: any, res?: any) {
  const payload = { status: 'healthy', version: '1.0.0', service: 'mantri' };
  if (res?.status) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(payload);
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

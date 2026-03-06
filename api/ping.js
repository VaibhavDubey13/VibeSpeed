// api/ping.js — proxies Cloudflare trace through our domain
// Bypasses ad blockers that block speed.cloudflare.com

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const r = await fetch('https://speed.cloudflare.com/cdn-cgi/trace', {
      cache: 'no-store',
    });
    const text = await r.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('error');
  }
}

// api/download.js — proxies Cloudflare __down through our domain
// Bypasses ad blockers that block speed.cloudflare.com
// Streams the response directly so the client gets live chunks

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache');
  res.setHeader('Content-Type', 'application/octet-stream');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const bytes = parseInt(req.query.bytes) || 1000000;
  // Cap at 100MB to prevent abuse
  const safebytes = Math.min(bytes, 100_000_000);

  try {
    const r = await fetch(`https://speed.cloudflare.com/__down?bytes=${safebytes}`, {
      cache: 'no-store',
    });

    // Stream directly to client — don't buffer the whole thing in memory
    if (r.body) {
      const reader = r.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      const buf = await r.arrayBuffer();
      res.send(Buffer.from(buf));
    }
  } catch (err) {
    res.status(500).end();
  }
}

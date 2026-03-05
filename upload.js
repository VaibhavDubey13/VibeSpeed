// api/upload.js — Vercel Serverless Function
// Browser POSTs data HERE (same origin = no CORS).
// This function forwards it to Cloudflare server-side (no CORS check server→server).
// Returns timing data so the client can calculate upload speed.

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Allow browser to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Read the incoming body as a buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const byteLength = body.length;

    const t0 = Date.now();

    // Forward to Cloudflare — server-to-server, no CORS
    const cfRes = await fetch('https://speed.cloudflare.com/__up', {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(byteLength),
      },
    });

    await cfRes.text(); // drain

    const elapsed = (Date.now() - t0) / 1000;

    res.status(200).json({ ok: true, bytes: byteLength, elapsed });
  } catch (err) {
    console.error('[upload proxy]', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

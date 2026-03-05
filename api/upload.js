// api/upload.js — Vercel Serverless Function
//
// PURPOSE: Receive uploaded bytes from the browser and immediately ACK.
// We do NOT forward to Cloudflare — the browser measures upload speed
// purely via xhr.upload.onprogress client-side timing, which accurately
// reflects bytes leaving the user's NIC over their ISP connection.
// The server just needs to drain the body and respond quickly.

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    // Drain body fast — just count bytes and discard, no processing
    let byteLength = 0;
    for await (const chunk of req) byteLength += chunk.length;

    // Respond immediately — minimal latency so client timing is accurate
    res.status(200).json({ ok: true, bytes: byteLength });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

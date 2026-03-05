export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '32mb',  // allow up to 32MB chunks for fast connections
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    let byteLength = 0;
    for await (const chunk of req) byteLength += chunk.length;
    res.status(200).json({ ok: true, bytes: byteLength });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

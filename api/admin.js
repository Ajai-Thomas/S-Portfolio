// Serverless admin API (Vercel function; also mounted by vite.config.js for `npm run dev`).
//
// Why this exists: anything prefixed VITE_ is copied into the public JavaScript bundle, so a
// password or Sanity write token stored that way is readable by every visitor. Here both stay
// on the server: the browser logs in with the password, gets a short-lived signed token, and
// asks this function to write to Sanity on its behalf.
//
// Environment variables (server only, no VITE_ prefix needed):
//   ADMIN_PASSWORD       the admin login password
//   SANITY_WRITE_TOKEN   a Sanity API token with Editor permission
// For convenience the old VITE_ADMIN_PASSWORD / VITE_SANITY_WRITE_TOKEN names are still read
// here (server side), but the browser code no longer references them.
import crypto from 'node:crypto';

const PROJECT_ID = '84ksnydx';
const DATASET = 'production';
const API_VERSION = '2024-05-14';
const HOST = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;
const ALLOWED_TYPES = new Set(['project', 'blogPost']);
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_UPLOAD = 4.4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies

const env = (name) => process.env[name] || process.env[`VITE_${name}`] || '';

const b64 = (s) => Buffer.from(s).toString('base64url');
const secretKey = (password) => crypto.createHash('sha256').update(`pf-admin:${password}`).digest();
const sign = (payload, password) => {
  const body = b64(JSON.stringify(payload));
  const mac = crypto.createHmac('sha256', secretKey(password)).update(body).digest('base64url');
  return `${body}.${mac}`;
};
const verify = (token, password) => {
  if (!token || !password) return false;
  const [body, mac] = token.split('.');
  if (!body || !mac) return false;
  const good = crypto.createHmac('sha256', secretKey(password)).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
};
const samePassword = (given, real) => {
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(given), h(real));
};

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

const sanity = async (path, init = {}, token) => {
  const res = await fetch(`${HOST}${path}`, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { error: text }; }
  return { status: res.status, json };
};

// Rough per-IP throttle for failed logins (best effort: serverless instances do not share memory).
const failures = new Map();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const password = env('ADMIN_PASSWORD');
  const writeToken = env('SANITY_WRITE_TOKEN');
  if (!password || !writeToken) {
    return res.status(500).json({ error: 'Server is missing ADMIN_PASSWORD or SANITY_WRITE_TOKEN. Add them to the environment variables and redeploy.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const raw = await readBody(req);
  const isJson = raw && typeof raw === 'object' && !Buffer.isBuffer(raw);
  let body = raw;
  if (typeof raw === 'string') { try { body = JSON.parse(raw); } catch { body = {}; } }
  const action = url.searchParams.get('action') || (isJson || typeof body === 'object' ? body?.action : '');

  // ── login ────────────────────────────────────────────────────────────────
  if (action === 'login') {
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();
    const f = failures.get(ip) || { n: 0, until: 0 };
    if (f.until > Date.now()) return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
    if (!samePassword(body?.password ?? '', password)) {
      f.n += 1;
      if (f.n >= 5) { f.until = Date.now() + 60_000; f.n = 0; }
      failures.set(ip, f);
      await new Promise((r) => setTimeout(r, 600));
      return res.status(401).json({ error: 'Incorrect password' });
    }
    failures.delete(ip);
    const exp = Date.now() + SESSION_MS;
    return res.status(200).json({ token: sign({ exp }, password), expiresAt: exp });
  }

  // everything below needs a valid session token
  const auth = String(req.headers.authorization || '');
  if (!verify(auth.replace(/^Bearer\s+/i, ''), password)) return res.status(401).json({ error: 'Session expired. Please log in again.' });

  if (action === 'ping') return res.status(200).json({ ok: true });

  // ── write to Sanity (create / patch / delete of projects and blog posts only) ─────
  if (action === 'mutate') {
    const mutations = body?.mutations;
    if (!Array.isArray(mutations) || !mutations.length || mutations.length > 50) return res.status(400).json({ error: 'Invalid mutations' });
    const ids = [];
    for (const m of mutations) {
      const kind = Object.keys(m)[0];
      if (Object.keys(m).length !== 1 || !['create', 'patch', 'delete'].includes(kind)) return res.status(400).json({ error: `Operation "${kind}" is not allowed` });
      if (kind === 'create') {
        if (!ALLOWED_TYPES.has(m.create?._type)) return res.status(400).json({ error: 'Only projects and blog posts can be created' });
      } else {
        const id = m[kind]?.id;
        if (typeof id !== 'string') return res.status(400).json({ error: 'Missing document id' });
        if (kind === 'patch' && Object.keys(m.patch).some((k) => !['id', 'set', 'unset'].includes(k))) return res.status(400).json({ error: 'Unsupported patch' });
        ids.push(id);
      }
    }
    if (ids.length) {
      const q = await sanity(`/data/query/${DATASET}?query=${encodeURIComponent('*[_id in $ids]{_id,_type}')}&$ids=${encodeURIComponent(JSON.stringify(ids))}`, {}, writeToken);
      const found = q.json?.result || [];
      if (found.length !== new Set(ids).size || found.some((d) => !ALLOWED_TYPES.has(d._type))) return res.status(400).json({ error: 'Target document not found or not editable here' });
    }
    const out = await sanity(`/data/mutate/${DATASET}?returnIds=true`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mutations }) }, writeToken);
    return res.status(out.status).json(out.json);
  }

  // ── image upload (raw bytes in the body) ─────────────────────────────────
  if (action === 'upload') {
    const buf = Buffer.isBuffer(body) ? body : null;
    const mime = url.searchParams.get('mime') || 'image/jpeg';
    if (!buf || !buf.length) return res.status(400).json({ error: 'Empty upload' });
    if (!mime.startsWith('image/')) return res.status(400).json({ error: 'Only images can be uploaded' });
    if (buf.length > MAX_UPLOAD) return res.status(413).json({ error: 'Image is too large for upload (max ~4.4 MB after compression)' });
    const filename = (url.searchParams.get('filename') || 'upload').replace(/[^\w.-]/g, '_').slice(0, 80);
    const out = await sanity(`/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`, { method: 'POST', headers: { 'Content-Type': mime }, body: buf }, writeToken);
    if (out.status >= 300) return res.status(out.status).json(out.json);
    return res.status(200).json({ _id: out.json.document?._id, url: out.json.document?.url });
  }

  return res.status(400).json({ error: 'Unknown action' });
}

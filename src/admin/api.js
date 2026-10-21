// Client side of the admin: talks to /api/admin (writes) and Sanity directly (reads).
import { createClient } from '@sanity/client';

// Uncached reads so the dashboard always shows what was just saved.
export const readClient = createClient({ projectId: '84ksnydx', dataset: 'production', useCdn: false, apiVersion: '2024-05-14' });

const KEY = 'pf-admin-session';

export function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    return s && s.expiresAt > Date.now() ? s : null;
  } catch { return null; }
}
export const clearSession = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } };

async function call(action, { json, body, query = {}, token } = {}) {
  const qs = new URLSearchParams({ action, ...query }).toString();
  const headers = {};
  const session = token ? { token } : getSession();
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  if (json) headers['Content-Type'] = 'application/json';
  else if (body) headers['Content-Type'] = 'application/octet-stream';
  let res;
  try {
    res = await fetch(`/api/admin?${qs}`, { method: 'POST', headers, body: json ? JSON.stringify(json) : body });
  } catch {
    throw new Error('Could not reach the server. Check your connection.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  if (res.status === 401 && action !== 'login') {
    clearSession();
    window.dispatchEvent(new Event('pf-admin-expired'));
  }
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
}

export async function login(password) {
  const data = await call('login', { json: { password } });
  sessionStorage.setItem(KEY, JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
  return data;
}
export const ping = () => call('ping');
export const mutate = (mutations) => call('mutate', { json: { mutations } });
export const createDoc = (doc) => mutate([{ create: doc }]);
export const patchDoc = (id, set, unset) => mutate([{ patch: { id, set, ...(unset ? { unset } : {}) } }]);
export const deleteDoc = (id) => mutate([{ delete: { id } }]);

export async function uploadImage(blob, filename) {
  return call('upload', { body: blob, query: { filename, mime: blob.type || 'image/jpeg' } });
}

// ── helpers ────────────────────────────────────────────────────────────────
export const makeKey = () => Math.random().toString(36).slice(2, 10);

export function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|[?&]v=)([\w-]{11})/);
  return m ? m[1] : null;
}

// Direct image URL that works in an <img> for Sanity, Drive and plain links.
export function imageSrc(url, w = 480) {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const id = url.match(/[-\w]{25,}/);
    return id ? `https://drive.google.com/uc?export=view&id=${id[0]}` : url;
  }
  if (url.includes('cdn.sanity.io')) return `${url}?w=${w}&auto=format&q=70`;
  return url;
}

// Downscale big camera files so they fit the upload limit; keeps small files untouched.
export async function prepareImage(file, { maxEdge = 3200, limit = 4.2 * 1024 * 1024 } = {}) {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { return file; }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= limit) { bitmap.close?.(); return file; }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  for (const q of [0.9, 0.82, 0.72, 0.6]) {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= limit) return blob;
  }
  throw new Error(`"${file.name}" is too large even after compression. Try a smaller export.`);
}

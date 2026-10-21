import { useEffect, useMemo, useRef, useState } from 'react';
import { createDoc, imageSrc, makeKey, patchDoc, prepareImage, readClient, uploadImage, youtubeId } from './api';
import { Field, useToast } from './ui';

const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');

export default function ProjectEditor({ project, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', category: '', date: '', excerpt: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!project);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [urlText, setUrlText] = useState('');
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState(null);
  const fileRef = useRef(null);
  const formRef = useRef(null);

  // load the full document (uncached)
  useEffect(() => {
    if (!project) return undefined;
    let alive = true;
    readClient.fetch('*[_type == "project" && _id == $id][0]{ title, category, date, excerpt, mediaItems[]{ ..., "existingUrl": coalesce(url, asset->url) } }', { id: project._id })
      .then((d) => {
        if (!alive || !d) return;
        setForm({ title: d.title || '', category: d.category || '', date: isoDate(d.date), excerpt: d.excerpt || '' });
        setItems((d.mediaItems || []).map((m) => ({
          key: m._key || makeKey(),
          type: m.type === 'youtube' ? 'youtube' : 'image',
          source: 'existing',
          raw: m,
          url: m.url || '',
          src: m.type === 'youtube' ? '' : imageSrc(m.existingUrl, 400),
          alt: m.alt || '',
        })));
      })
      .catch((err) => setError(`Could not load this album: ${err.message}`))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [project]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const touch = (fn) => { setDirty(true); fn(); };
  const setField = (k, v) => touch(() => setForm((f) => ({ ...f, [k]: v })));

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) { setError('Only image files can be uploaded here.'); return; }
    setError('');
    touch(() => setItems((s) => [...s, ...files.map((file) => ({ key: makeKey(), type: 'image', source: 'file', file, src: URL.createObjectURL(file), alt: '' }))]));
  };

  const addUrl = () => {
    const u = urlText.trim();
    if (!u) return;
    try { new URL(u); } catch { setError('That does not look like a valid link.'); return; }
    const yt = youtubeId(u);
    setError('');
    touch(() => setItems((s) => [...s, yt
      ? { key: makeKey(), type: 'youtube', source: 'url', url: u, src: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`, alt: '' }
      : { key: makeKey(), type: 'image', source: 'url', url: u, src: imageSrc(u, 400), alt: '' }]));
    setUrlText('');
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    touch(() => setItems((s) => { const a = [...s]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; }));
  };
  const remove = (i) => touch(() => setItems((s) => s.filter((_, k) => k !== i)));
  const setAlt = (i, v) => touch(() => setItems((s) => s.map((m, k) => (k === i ? { ...m, alt: v } : m))));
  const makeCover = (i) => move(i, items.findIndex((m) => m.type !== 'youtube'));

  const coverIndex = useMemo(() => items.findIndex((m) => m.type !== 'youtube'), [items]);

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('Give the album a title.'); formRef.current?.querySelector('input')?.focus(); return; }
    setError('');
    try {
      const out = [];
      const uploads = items.filter((m) => m.source === 'file').length;
      let done = 0;
      for (const m of items) {
        if (m.source === 'existing') {
          const { existingUrl: _e, ...raw } = m.raw;
          out.push({ ...raw, _key: raw._key || m.key, alt: m.alt });
        } else if (m.source === 'file') {
          setSaving(`Uploading photo ${done + 1} of ${uploads}…`);
          const blob = await prepareImage(m.file);
          const asset = await uploadImage(blob, m.file.name.replace(/\.\w+$/, '') + (blob.type === 'image/jpeg' ? '.jpg' : ''));
          done += 1;
          out.push({ _key: m.key, _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: m.alt });
        } else {
          out.push({ _key: m.key, _type: 'externalMedia', url: m.url, type: m.type, alt: m.alt });
        }
      }
      setSaving('Saving…');
      const set = { title: form.title.trim(), category: form.category.trim(), excerpt: form.excerpt.trim(), mediaItems: out };
      const unset = [];
      if (form.date) set.date = form.date; else unset.push('date');
      if (project?._id) await patchDoc(project._id, set, unset.length ? unset : undefined);
      else await createDoc({ _type: 'project', ...set, ...(form.date ? { date: form.date } : {}) });
      setDirty(false);
      toast(project ? 'Album saved' : 'Album created');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving('');
    }
  };

  const leave = () => { if (!dirty || window.confirm('Discard your unsaved changes?')) onDone(); };

  return (
    <div className="ad-shell ad-editor">
      <button className="ad-link" onClick={leave}>← Back to dashboard</button>
      <h1>{project ? 'Edit album' : 'New album'}</h1>
      {loading ? <p className="ad-muted">Loading…</p> : (
        <form onSubmit={save} ref={formRef}>
          <div className="ad-cols">
            <Field label="Title" htmlFor="ad-title"><input id="ad-title" className="ad-input" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Album name" /></Field>
            <Field label="Category" htmlFor="ad-cat"><input id="ad-cat" className="ad-input" value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Portraits, Events" /></Field>
            <Field label="Date" htmlFor="ad-date" hint="Shown as the album year on the site."><input id="ad-date" className="ad-input" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
          </div>
          <Field label="Description" htmlFor="ad-desc"><textarea id="ad-desc" className="ad-input" rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="One or two lines about this album" /></Field>

          <div className="ad-field">
            <div className="ad-split-head">
              <label>Photos &amp; videos <span className="ad-muted">({items.length})</span></label>
              <p className="ad-hint">The first photo is the album cover. Drag tiles, or use the arrows, to reorder.</p>
            </div>

            <div
              className={`ad-drop ${over ? 'is-over' : ''}`}
              onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { if (e.dataTransfer.files?.length) { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); } }}
            >
              <p>Drop photos here, or</p>
              <button type="button" className="ad-btn" onClick={() => fileRef.current?.click()}>Choose files</button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
              <p className="ad-hint">Large camera files are resized automatically (up to 3200px) before upload.</p>
            </div>

            <div className="ad-row ad-urlrow">
              <label className="ad-sr" htmlFor="ad-url">Add by link</label>
              <input id="ad-url" className="ad-input" type="url" placeholder="Paste a YouTube link, Google Drive link or image URL" value={urlText} onChange={(e) => setUrlText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} />
              <button type="button" className="ad-btn" onClick={addUrl}>Add</button>
            </div>

            {items.length > 0 && (
              <ul className="ad-media">
                {items.map((m, i) => (
                  <li
                    key={m.key}
                    className={`ad-tile ${dragFrom === i ? 'is-drag' : ''}`}
                    draggable
                    onDragStart={() => setDragFrom(i)}
                    onDragEnd={() => setDragFrom(null)}
                    onDragOver={(e) => dragFrom !== null && e.preventDefault()}
                    onDrop={(e) => { if (dragFrom !== null) { e.preventDefault(); move(dragFrom, i); setDragFrom(null); } }}
                  >
                    <div className="ad-tile__img">
                      {m.src ? <img src={m.src} alt="" loading="lazy" draggable="false" /> : <span>Video</span>}
                      {m.type === 'youtube' && <b className="ad-badge ad-badge--yt">YouTube</b>}
                      {i === coverIndex && <b className="ad-badge">Cover</b>}
                      {m.source === 'file' && <b className="ad-badge ad-badge--new">New</b>}
                    </div>
                    <label className="ad-sr" htmlFor={`alt-${m.key}`}>Caption for item {i + 1}</label>
                    <input id={`alt-${m.key}`} className="ad-input ad-input--sm" value={m.alt} onChange={(e) => setAlt(i, e.target.value)} placeholder={m.type === 'youtube' ? 'Video title' : 'Caption / alt text'} />
                    <div className="ad-tile__tools">
                      <button type="button" className="ad-icon" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)}>←</button>
                      <button type="button" className="ad-icon" aria-label="Move later" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>→</button>
                      {m.type !== 'youtube' && i !== coverIndex && <button type="button" className="ad-icon ad-icon--txt" onClick={() => makeCover(i)}>Cover</button>}
                      <button type="button" className="ad-icon ad-icon--danger" aria-label="Remove" onClick={() => remove(i)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="ad-error" role="alert">{error}</p>}
          <div className="ad-row ad-sticky">
            <button className="ad-btn ad-btn--primary" type="submit" disabled={!!saving}>{saving || (project ? 'Save changes' : 'Create album')}</button>
            <button className="ad-btn" type="button" onClick={leave} disabled={!!saving}>Cancel</button>
            {dirty && !saving && <span className="ad-muted">Unsaved changes</span>}
          </div>
        </form>
      )}
    </div>
  );
}

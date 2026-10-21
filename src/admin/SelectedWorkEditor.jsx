import { useEffect, useState } from 'react';
import { createDoc, patchDoc, readClient } from './api';
import ImagePicker from './ImagePicker';
import { emptyPic, picFromDoc, resolvePic } from './pic';
import { Field, useToast } from './ui';

const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');

export default function SelectedWorkEditor({ doc, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', category: '', date: '', description: '', alt: '', link: '' });
  const [pic, setPic] = useState(emptyPic);
  const [loading, setLoading] = useState(!!doc);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!doc) return undefined;
    let alive = true;
    readClient.fetch('*[_type == "selectedWork" && _id == $id][0]{ title, category, date, description, alt, link, imageUrl, "uploaded": image.asset->url }', { id: doc._id })
      .then((d) => {
        if (!alive || !d) return;
        setForm({ title: d.title || '', category: d.category || '', date: isoDate(d.date), description: d.description || '', alt: d.alt || '', link: d.link || '' });
        setPic(picFromDoc(d.uploaded, d.imageUrl));
      })
      .catch((err) => setError(`Could not load this item: ${err.message}`))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [doc]);

  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const setField = (k, v) => { setDirty(true); setForm((f) => ({ ...f, [k]: v })); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Give this work a title.'); return; }
    if (pic.kind === 'none') { setError('Add an image for this work.'); return; }
    if (form.link.trim()) { try { new URL(form.link.trim()); } catch { setError('The project link is not a valid URL.'); return; } }
    setError('');
    try {
      const img = await resolvePic(pic, 'image', 'imageUrl', setSaving);
      setSaving('Saving…');
      const set = { title: form.title.trim(), category: form.category.trim(), description: form.description.trim(), alt: form.alt.trim(), ...img.set };
      const unset = [...img.unset];
      for (const k of ['date', 'link']) { const v = k === 'link' ? form.link.trim() : form.date; if (v) set[k] = v; else unset.push(k); }
      if (doc?._id) await patchDoc(doc._id, set, unset.length ? unset : undefined);
      else await createDoc({ _type: 'selectedWork', ...set });
      setDirty(false);
      toast(doc ? 'Selected work saved' : 'Selected work added');
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
      <h1>{doc ? 'Edit selected work' : 'New selected work'}</h1>
      {loading ? <p className="ad-muted">Loading…</p> : (
        <form onSubmit={save}>
          <div className="ad-cols">
            <Field label="Title" htmlFor="sw-title"><input id="sw-title" className="ad-input" value={form.title} onChange={(e) => setField('title', e.target.value)} /></Field>
            <Field label="Category" htmlFor="sw-cat"><input id="sw-cat" className="ad-input" value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Portrait" /></Field>
            <Field label="Date" htmlFor="sw-date"><input id="sw-date" className="ad-input" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
          </div>
          <Field label="Description" htmlFor="sw-desc"><textarea id="sw-desc" className="ad-input" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} /></Field>
          <div className="ad-field">
            <label>Image</label>
            <ImagePicker id="sw-img" pic={pic} onChange={(p) => { setDirty(true); setPic(p); }} onError={setError} hint="Large files are resized automatically before upload." />
          </div>
          <div className="ad-cols">
            <Field label="Alt text" htmlFor="sw-alt" hint="Describes the image for screen readers."><input id="sw-alt" className="ad-input" value={form.alt} onChange={(e) => setField('alt', e.target.value)} /></Field>
            <Field label="Link (optional)" htmlFor="sw-link" hint="Adds a “View project” button."><input id="sw-link" className="ad-input" type="url" value={form.link} onChange={(e) => setField('link', e.target.value)} placeholder="https://…" /></Field>
          </div>
          {error && <p className="ad-error" role="alert">{error}</p>}
          <div className="ad-row ad-sticky">
            <button className="ad-btn ad-btn--primary" type="submit" disabled={!!saving}>{saving || (doc ? 'Save changes' : 'Add to selected works')}</button>
            <button className="ad-btn" type="button" onClick={leave} disabled={!!saving}>Cancel</button>
            {dirty && !saving && <span className="ad-muted">Unsaved changes</span>}
          </div>
        </form>
      )}
    </div>
  );
}

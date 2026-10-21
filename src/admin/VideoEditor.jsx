import { useEffect, useMemo, useState } from 'react';
import { createDoc, imageSrc, patchDoc, readClient, videoInfo } from './api';
import ImagePicker from './ImagePicker';
import { emptyPic, picFromDoc, resolvePic } from './pic';
import { Field, useToast } from './ui';

const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');
const LABEL = { youtube: 'YouTube', vimeo: 'Vimeo', mp4: 'Video file' };

export default function VideoEditor({ doc, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', videoUrl: '', duration: '', date: '', description: '' });
  const [pic, setPic] = useState(emptyPic);
  const [loading, setLoading] = useState(!!doc);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!doc) return undefined;
    let alive = true;
    readClient.fetch('*[_type == "videoEdit" && _id == $id][0]{ title, videoUrl, duration, date, description, thumbnailUrl, "uploaded": thumbnail.asset->url }', { id: doc._id })
      .then((d) => {
        if (!alive || !d) return;
        setForm({ title: d.title || '', videoUrl: d.videoUrl || '', duration: d.duration || '', date: isoDate(d.date), description: d.description || '' });
        setPic(picFromDoc(d.uploaded, d.thumbnailUrl));
      })
      .catch((err) => setError(`Could not load this video: ${err.message}`))
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
  const info = useMemo(() => videoInfo(form.videoUrl.trim()), [form.videoUrl]);
  const autoThumb = !pic.src && info.thumb;

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Give the video a title.'); return; }
    const url = form.videoUrl.trim();
    if (!url) { setError('Paste a video link.'); return; }
    if (!info.type) { setError('Use a YouTube or Vimeo link, or a direct link to an .mp4 file.'); return; }
    if (info.type === 'vimeo' && pic.kind === 'none') { setError('Vimeo does not provide a thumbnail automatically. Add one below.'); return; }
    setError('');
    try {
      const img = await resolvePic(pic, 'thumbnail', 'thumbnailUrl', setSaving);
      setSaving('Saving…');
      const set = { title: form.title.trim(), videoUrl: url, duration: form.duration.trim(), description: form.description.trim(), ...img.set };
      const unset = [...img.unset];
      if (form.date) set.date = form.date; else unset.push('date');
      if (doc?._id) await patchDoc(doc._id, set, unset.length ? unset : undefined);
      else await createDoc({ _type: 'videoEdit', ...set });
      setDirty(false);
      toast(doc ? 'Video saved' : 'Video added');
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
      <h1>{doc ? 'Edit video edit' : 'New video edit'}</h1>
      {loading ? <p className="ad-muted">Loading…</p> : (
        <form onSubmit={save}>
          <Field label="Title" htmlFor="ve-title"><input id="ve-title" className="ad-input" value={form.title} onChange={(e) => setField('title', e.target.value)} /></Field>
          <Field label="Video link" htmlFor="ve-url" hint="A YouTube or Vimeo link, or a direct link to a hosted .mp4 file.">
            <input id="ve-url" className="ad-input" type="url" value={form.videoUrl} onChange={(e) => setField('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=…" />
            {form.videoUrl.trim() && <p className={`ad-hint ${info.type ? 'ad-ok' : 'ad-bad'}`}>{info.type ? `Detected: ${LABEL[info.type]}` : 'Not recognised as YouTube, Vimeo or .mp4'}</p>}
          </Field>
          <div className="ad-cols">
            <Field label="Duration" htmlFor="ve-dur" hint="Shown on the card, e.g. 01:24"><input id="ve-dur" className="ad-input" value={form.duration} onChange={(e) => setField('duration', e.target.value)} placeholder="01:24" /></Field>
            <Field label="Date" htmlFor="ve-date"><input id="ve-date" className="ad-input" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
          </div>
          <Field label="Description" htmlFor="ve-desc"><textarea id="ve-desc" className="ad-input" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} /></Field>
          <div className="ad-field">
            <label>Thumbnail</label>
            {autoThumb && <div className="ad-pic"><img src={imageSrc(autoThumb)} alt="" /><p className="ad-hint">Using the YouTube thumbnail. Add your own below to override it.</p></div>}
            <ImagePicker id="ve-img" pic={pic} onChange={(p) => { setDirty(true); setPic(p); }} onError={setError} hint={info.type === 'vimeo' || info.type === 'mp4' ? 'Required for Vimeo, recommended for video files.' : 'Optional for YouTube.'} />
          </div>
          {error && <p className="ad-error" role="alert">{error}</p>}
          <div className="ad-row ad-sticky">
            <button className="ad-btn ad-btn--primary" type="submit" disabled={!!saving}>{saving || (doc ? 'Save changes' : 'Add video')}</button>
            <button className="ad-btn" type="button" onClick={leave} disabled={!!saving}>Cancel</button>
            {dirty && !saving && <span className="ad-muted">Unsaved changes</span>}
          </div>
        </form>
      )}
    </div>
  );
}

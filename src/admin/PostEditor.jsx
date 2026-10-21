import { useEffect, useMemo, useRef, useState } from 'react';
import { createDoc, patchDoc, readClient } from './api';
import { blocksToText, hasRichFormatting, textToBlocks } from './text';
import { Field, useToast } from './ui';

const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');

export default function PostEditor({ post, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', author: '', date: new Date().toISOString().slice(0, 10), excerpt: '', content: '' });
  const [loading, setLoading] = useState(!!post);
  const [rich, setRich] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const area = useRef(null);

  useEffect(() => {
    if (!post) return undefined;
    let alive = true;
    readClient.fetch('*[_type == "blogPost" && _id == $id][0]{ title, author, date, excerpt, content }', { id: post._id })
      .then((d) => {
        if (!alive || !d) return;
        setForm({ title: d.title || '', author: d.author || '', date: isoDate(d.date), excerpt: d.excerpt || '', content: blocksToText(d.content) });
        setRich(hasRichFormatting(d.content));
      })
      .catch((err) => setError(`Could not load this post: ${err.message}`))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [post]);

  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const setField = (k, v) => { setDirty(true); setForm((f) => ({ ...f, [k]: v })); };
  const blocks = useMemo(() => textToBlocks(form.content), [form.content]);
  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  // toggle a line prefix (## / ### / >) on the paragraph the cursor is in
  const format = (prefix) => {
    const el = area.current;
    const text = form.content;
    const pos = el ? el.selectionStart : text.length;
    const start = text.lastIndexOf('\n\n', pos - 1) + (text.lastIndexOf('\n\n', pos - 1) >= 0 ? 2 : 0);
    const para = text.slice(start);
    const had = ['### ', '## ', '> '].find((p) => para.startsWith(p));
    const body = had ? para.slice(had.length) : para;
    setField('content', text.slice(0, start) + (had === prefix ? '' : prefix) + body);
    el?.focus();
  };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('Give the post a title.'); return; }
    setSaving(true);
    setError('');
    try {
      const set = { title: form.title.trim(), author: form.author.trim(), excerpt: form.excerpt.trim(), content: blocks };
      const unset = [];
      if (form.date) set.date = form.date; else unset.push('date');
      if (post?._id) await patchDoc(post._id, set, unset.length ? unset : undefined);
      else await createDoc({ _type: 'blogPost', ...set });
      setDirty(false);
      toast(post ? 'Post saved' : 'Post published');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const leave = () => { if (!dirty || window.confirm('Discard your unsaved changes?')) onDone(); };

  return (
    <div className="ad-shell ad-editor">
      <button className="ad-link" onClick={leave}>← Back to dashboard</button>
      <h1>{post ? 'Edit post' : 'New post'}</h1>
      {loading ? <p className="ad-muted">Loading…</p> : (
        <form onSubmit={save}>
          <div className="ad-cols">
            <Field label="Title" htmlFor="ad-ptitle"><input id="ad-ptitle" className="ad-input" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Post title" /></Field>
            <Field label="Author" htmlFor="ad-author"><input id="ad-author" className="ad-input" value={form.author} onChange={(e) => setField('author', e.target.value)} /></Field>
            <Field label="Date" htmlFor="ad-pdate"><input id="ad-pdate" className="ad-input" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
          </div>
          <Field label="Excerpt" htmlFor="ad-excerpt" hint="Shown on the Diary list."><textarea id="ad-excerpt" className="ad-input" rows={2} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} /></Field>

          {rich && <p className="ad-notice">This post uses bold, italics or links from Sanity Studio. Saving here keeps the text but removes that formatting. Edit it in Studio to keep it.</p>}

          <div className="ad-field">
            <div className="ad-split-head">
              <label htmlFor="ad-content">Content</label>
              <div className="ad-row ad-tools">
                <button type="button" className="ad-btn ad-btn--sm" onClick={() => format('## ')}>Heading</button>
                <button type="button" className="ad-btn ad-btn--sm" onClick={() => format('### ')}>Subheading</button>
                <button type="button" className="ad-btn ad-btn--sm" onClick={() => format('> ')}>Quote</button>
                <button type="button" className={`ad-btn ad-btn--sm ${preview ? 'is-on' : ''}`} aria-pressed={preview} onClick={() => setPreview((v) => !v)}>Preview</button>
              </div>
            </div>
            <p className="ad-hint">Leave a blank line between paragraphs. Start a paragraph with ## for a heading, ### for a subheading, or &gt; for a quote.</p>
            {preview ? (
              <div className="ad-prose ad-input">
                {blocks.length === 0 && <p className="ad-muted">Nothing to preview yet.</p>}
                {blocks.map((b) => {
                  const t = b.children[0].text;
                  if (b.style === 'h2') return <h2 key={b._key}>{t}</h2>;
                  if (b.style === 'h3') return <h3 key={b._key}>{t}</h3>;
                  if (b.style === 'blockquote') return <blockquote key={b._key}>{t}</blockquote>;
                  return <p key={b._key}>{t}</p>;
                })}
              </div>
            ) : (
              <textarea id="ad-content" ref={area} className="ad-input ad-input--mono" rows={18} value={form.content} onChange={(e) => setField('content', e.target.value)} placeholder={'Write the post here…\n\nStart a new paragraph after a blank line.'} />
            )}
            <p className="ad-hint">{words} words · {blocks.length} paragraphs</p>
          </div>

          {error && <p className="ad-error" role="alert">{error}</p>}
          <div className="ad-row ad-sticky">
            <button className="ad-btn ad-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : post ? 'Save changes' : 'Publish post'}</button>
            <button className="ad-btn" type="button" onClick={leave} disabled={saving}>Cancel</button>
            {dirty && !saving && <span className="ad-muted">Unsaved changes</span>}
          </div>
        </form>
      )}
    </div>
  );
}

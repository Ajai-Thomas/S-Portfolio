import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteDoc, imageSrc, mutate, readClient, reorderMutations } from './api';
import { ConfirmDialog, useToast } from './ui';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date');
const ORD = 'order(coalesce(order, 9999) asc, date desc)';

// One entry per content type: what to fetch, what to call it, which rows can be reordered.
const TABS = [
  {
    id: 'projects', label: 'Albums', noun: 'album', add: '+ New album', empty: 'No albums yet. Create your first one.',
    query: `*[_type == "project"] | order(date desc) { _id, title, category, date,
      "thumb": mediaItems[type != "youtube"][0]{ "u": coalesce(url, asset->url) }.u,
      "photos": count(mediaItems[type != "youtube"]), "videos": count(mediaItems[type == "youtube"]) }`,
    search: (d) => `${d.title} ${d.category}`,
    lines: (d) => [[d.category, fmtDate(d.date)].filter(Boolean).join(' · '), `${d.photos || 0} photos${d.videos ? ` · ${d.videos} video${d.videos > 1 ? 's' : ''}` : ''}`],
  },
  {
    id: 'selected', label: 'Selected works', noun: 'selected work', add: '+ New selected work', empty: 'No selected works yet. Add the pieces you want to highlight.', reorder: true,
    query: `*[_type == "selectedWork"] | ${ORD} { _id, title, category, date, order, "thumb": coalesce(image.asset->url, imageUrl) }`,
    search: (d) => `${d.title} ${d.category}`,
    lines: (d) => [[d.category, fmtDate(d.date)].filter(Boolean).join(' · ')],
  },
  {
    id: 'videos', label: 'Video edits', noun: 'video', add: '+ New video edit', empty: 'No video edits yet. Add your first one.', reorder: true,
    query: `*[_type == "videoEdit"] | ${ORD} { _id, title, duration, date, order, videoUrl,
      "thumb": coalesce(thumbnail.asset->url, thumbnailUrl) }`,
    search: (d) => `${d.title} ${d.videoUrl}`,
    lines: (d) => [[d.duration, fmtDate(d.date)].filter(Boolean).join(' · '), d.videoUrl],
  },
  {
    id: 'posts', label: 'Diary', noun: 'post', add: '+ New post', empty: 'No posts yet. Write your first one.',
    query: '*[_type == "blogPost"] | order(date desc) { _id, title, author, date, excerpt }',
    search: (d) => `${d.title} ${d.author} ${d.excerpt}`,
    lines: (d) => [[d.author, fmtDate(d.date)].filter(Boolean).join(' · '), d.excerpt],
  },
];

export default function Dashboard({ tab, setTab, onEdit, onNew, onLogout }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [data, setData] = useState({}); // id -> list
  const [loadError, setLoadError] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [delError, setDelError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const lists = await Promise.all(TABS.map((t) => readClient.fetch(t.query)));
      setData(Object.fromEntries(TABS.map((t, i) => [t.id, lists[i] || []])));
    } catch (err) {
      setLoadError(`Could not load content: ${err.message}`);
      setData((d) => (Object.keys(d).length ? d : Object.fromEntries(TABS.map((t) => [t.id, []]))));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cfg = TABS.find((t) => t.id === tab);
  const list = data[tab];
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => (list || []).filter((d) => !q || cfg.search(d).toLowerCase().includes(q)), [list, q, cfg]);
  const count = (id) => (data[id] ? data[id].length : '–');
  const photos = (data.projects || []).reduce((n, p) => n + (p.photos || 0), 0);

  const move = async (index, dir) => {
    const muts = reorderMutations(list, index, index + dir);
    if (!muts.length) return;
    // optimistic: show the new order immediately
    setData((d) => { const a = [...d[tab]]; const [m] = a.splice(index, 1); a.splice(index + dir, 0, m); return { ...d, [tab]: a }; });
    try { await mutate(muts); } catch (err) { toast(err.message, 'error'); load(); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    setDelError('');
    try {
      await deleteDoc(target._id);
      toast(`Deleted "${target.title || 'Untitled'}"`);
      setTarget(null);
      load();
    } catch (err) {
      setDelError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ad-shell">
      <header className="ad-top">
        <div>
          <p className="ad-eyebrow">Site management</p>
          <h1>Dashboard</h1>
        </div>
        <div className="ad-row">
          <a className="ad-link" href="/" target="_blank" rel="noopener noreferrer">View site ↗</a>
          <button className="ad-btn ad-btn--ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <section className="ad-stats" aria-label="Overview">
        <div className="ad-stat"><strong>{count('projects')}</strong><span>Albums</span></div>
        <div className="ad-stat"><strong>{data.projects ? photos : '–'}</strong><span>Photos</span></div>
        <div className="ad-stat"><strong>{count('selected')}</strong><span>Selected works</span></div>
        <div className="ad-stat"><strong>{count('videos')}</strong><span>Video edits</span></div>
        <div className="ad-stat"><strong>{count('posts')}</strong><span>Diary posts</span></div>
      </section>

      <div className="ad-bar">
        <div className="ad-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`ad-tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => { setTab(t.id); setQuery(''); }}>{t.label}</button>
          ))}
        </div>
        <div className="ad-row ad-grow">
          <label className="ad-sr" htmlFor="ad-search">Search</label>
          <input id="ad-search" className="ad-input ad-search" type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="ad-btn ad-btn--primary" onClick={() => onNew(tab)}>{cfg.add}</button>
        </div>
      </div>

      {loadError && <p className="ad-error" role="alert">{loadError} <button className="ad-link" onClick={load}>Retry</button></p>}
      {cfg.reorder && list && list.length > 1 && !q && <p className="ad-hint">Use the arrows to set the order shown on the site.</p>}

      {!list ? <p className="ad-muted">Loading…</p>
        : shown.length === 0 ? <p className="ad-muted">{q ? 'Nothing matches your search.' : cfg.empty}</p>
          : (
            <ul className="ad-list">
              {shown.map((d, i) => (
                <li key={d._id} className="ad-item">
                  {'thumb' in d && (
                    <div className="ad-thumb">{d.thumb ? <img src={imageSrc(d.thumb, 200)} alt="" loading="lazy" /> : <span>{cfg.id === 'videos' ? 'Video' : 'No image'}</span>}</div>
                  )}
                  <div className="ad-meta">
                    <strong>{d.title || 'Untitled'}</strong>
                    {cfg.lines(d).filter(Boolean).map((l, k) => <span key={k} className="ad-clip">{l}</span>)}
                  </div>
                  <div className="ad-row">
                    {cfg.reorder && !q && (
                      <span className="ad-order">
                        <button className="ad-icon" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                        <button className="ad-icon" aria-label="Move down" disabled={i === shown.length - 1} onClick={() => move(i, 1)}>↓</button>
                      </span>
                    )}
                    <button className="ad-btn" onClick={() => onEdit(tab, d)}>Edit</button>
                    <button className="ad-btn ad-btn--danger-ghost" onClick={() => { setTarget(d); setDelError(''); }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

      {target && (
        <ConfirmDialog
          title={`Delete ${cfg.noun}?`}
          body={`"${target.title || 'Untitled'}" will be permanently removed from Sanity and from your site. This cannot be undone.`}
          busy={busy}
          error={delError}
          onConfirm={confirmDelete}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteDoc, imageSrc, readClient } from './api';
import { ConfirmDialog, useToast } from './ui';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date');

export default function Dashboard({ onEditProject, onNewProject, onEditPost, onNewPost, onLogout }) {
  const toast = useToast();
  const [tab, setTab] = useState('projects');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState(null);
  const [posts, setPosts] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [target, setTarget] = useState(null); // { kind, doc }
  const [busy, setBusy] = useState(false);
  const [delError, setDelError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const [p, b] = await Promise.all([
        readClient.fetch(`*[_type == "project"] | order(date desc) {
          _id, title, category, date, _updatedAt,
          "coverUrl": mediaItems[type != "youtube"][0]{ "u": coalesce(url, asset->url) }.u,
          "photos": count(mediaItems[type != "youtube"]),
          "videos": count(mediaItems[type == "youtube"])
        }`),
        readClient.fetch('*[_type == "blogPost"] | order(date desc) { _id, title, author, date, excerpt, _updatedAt }'),
      ]);
      setProjects(p || []);
      setPosts(b || []);
    } catch (err) {
      setLoadError(`Could not load content: ${err.message}`);
      setProjects((v) => v || []);
      setPosts((v) => v || []);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setBusy(true);
    setDelError('');
    try {
      await deleteDoc(target.doc._id);
      toast(`Deleted "${target.doc.title || 'Untitled'}"`);
      setTarget(null);
      load();
    } catch (err) {
      setDelError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const q = query.trim().toLowerCase();
  const shownProjects = useMemo(() => (projects || []).filter((p) => !q || `${p.title} ${p.category}`.toLowerCase().includes(q)), [projects, q]);
  const shownPosts = useMemo(() => (posts || []).filter((p) => !q || `${p.title} ${p.author} ${p.excerpt}`.toLowerCase().includes(q)), [posts, q]);
  const totalPhotos = (projects || []).reduce((n, p) => n + (p.photos || 0), 0);
  const totalVideos = (projects || []).reduce((n, p) => n + (p.videos || 0), 0);

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
        <div className="ad-stat"><strong>{projects ? projects.length : '–'}</strong><span>Albums</span></div>
        <div className="ad-stat"><strong>{projects ? totalPhotos : '–'}</strong><span>Photos</span></div>
        <div className="ad-stat"><strong>{projects ? totalVideos : '–'}</strong><span>Videos</span></div>
        <div className="ad-stat"><strong>{posts ? posts.length : '–'}</strong><span>Diary posts</span></div>
      </section>

      <div className="ad-bar">
        <div className="ad-tabs" role="tablist">
          {[['projects', 'Albums & videos'], ['posts', 'Diary']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`ad-tab ${tab === id ? 'is-on' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <div className="ad-row ad-grow">
          <label className="ad-sr" htmlFor="ad-search">Search</label>
          <input id="ad-search" className="ad-input ad-search" type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="ad-btn ad-btn--primary" onClick={tab === 'projects' ? onNewProject : onNewPost}>{tab === 'projects' ? '+ New album' : '+ New post'}</button>
        </div>
      </div>

      {loadError && <p className="ad-error" role="alert">{loadError} <button className="ad-link" onClick={load}>Retry</button></p>}

      {tab === 'projects' && (
        projects === null ? <p className="ad-muted">Loading…</p>
          : shownProjects.length === 0 ? <p className="ad-muted">{q ? 'Nothing matches your search.' : 'No albums yet. Create your first one.'}</p>
            : (
              <ul className="ad-list">
                {shownProjects.map((p) => (
                  <li key={p._id} className="ad-item">
                    <div className="ad-thumb">{p.coverUrl ? <img src={imageSrc(p.coverUrl, 200)} alt="" loading="lazy" /> : <span>No image</span>}</div>
                    <div className="ad-meta">
                      <strong>{p.title || 'Untitled'}</strong>
                      <span>{[p.category, fmtDate(p.date)].filter(Boolean).join(' · ')}</span>
                      <span>{p.photos || 0} photos{p.videos ? ` · ${p.videos} video${p.videos > 1 ? 's' : ''}` : ''}</span>
                    </div>
                    <div className="ad-row">
                      <button className="ad-btn" onClick={() => onEditProject(p)}>Edit</button>
                      <button className="ad-btn ad-btn--danger-ghost" onClick={() => { setTarget({ kind: 'album', doc: p }); setDelError(''); }}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
      )}

      {tab === 'posts' && (
        posts === null ? <p className="ad-muted">Loading…</p>
          : shownPosts.length === 0 ? <p className="ad-muted">{q ? 'Nothing matches your search.' : 'No posts yet. Write your first one.'}</p>
            : (
              <ul className="ad-list">
                {shownPosts.map((p) => (
                  <li key={p._id} className="ad-item">
                    <div className="ad-meta">
                      <strong>{p.title || 'Untitled'}</strong>
                      <span>{[p.author, fmtDate(p.date)].filter(Boolean).join(' · ')}</span>
                      {p.excerpt && <span className="ad-clip">{p.excerpt}</span>}
                    </div>
                    <div className="ad-row">
                      <button className="ad-btn" onClick={() => onEditPost(p)}>Edit</button>
                      <button className="ad-btn ad-btn--danger-ghost" onClick={() => { setTarget({ kind: 'post', doc: p }); setDelError(''); }}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
      )}

      {target && (
        <ConfirmDialog
          title={`Delete ${target.kind}?`}
          body={`"${target.doc.title || 'Untitled'}" will be permanently removed from Sanity and from your site. This cannot be undone.`}
          busy={busy}
          error={delError}
          onConfirm={confirmDelete}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
}

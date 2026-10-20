import { useState } from 'react';
import { PortableText } from '@portabletext/react';
import { Modal, SectionHead } from './Chrome';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function Blog({ posts, loaded }) {
  const [open, setOpen] = useState(null);
  return (
    <section id="blog" className="pf-section" aria-labelledby="blog-title">
      <div className="pf-wrap">
        <SectionHead n={4} total={5} title="Diary" kicker="WRITINGS" />
        <span id="blog-title" className="pf-sr">Diary</span>
        {!loaded && <p className="pf-mono pf-muted">LOADING…</p>}
        {loaded && !posts.length && <p className="pf-mono pf-muted">NO POSTS YET</p>}
        <ul className="pf-posts">
          {posts.map((p, i) => (
            <li key={p._id} className="pf-reveal" style={{ '--d': `${i * 80}ms` }}>
              <button className="pf-post" onClick={() => setOpen(p)} aria-label={`Read: ${p.title}`}>
                <span className="pf-mono pf-post__date">{fmt(p.date)}</span>
                <strong>{p.title}</strong>
                {p.excerpt && <span className="pf-muted">{p.excerpt}</span>}
                <span className="pf-mono pf-post__more">READ →</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <Modal label={`Post: ${open.title}`} onClose={() => setOpen(null)} className="pf-postview">
          <button className="pf-x" data-autofocus onClick={() => setOpen(null)} aria-label="Close post">×</button>
          <article className="pf-postview__body">
            <p className="pf-mono">{fmt(open.date)}{open.author ? ` · ${open.author}` : ''}</p>
            <h3>{open.title}</h3>
            <div className="pf-prose"><PortableText value={open.content || []} /></div>
          </article>
        </Modal>
      )}
    </section>
  );
}

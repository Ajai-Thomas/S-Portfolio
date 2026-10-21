import { useState } from 'react';
import Img from './Img';
import { Modal, SectionHead } from './Chrome';

// Highlighted pieces from Sanity ("selectedWork"). The first one leads the grid.
export default function SelectedWorks({ works, n = 1, total = 6 }) {
  const [open, setOpen] = useState(null);
  if (!works.length) return null;
  return (
    <section id="selected" className="pf-section" aria-labelledby="selected-title">
      <div className="pf-wrap">
        <SectionHead n={n} total={total} title="Selected Works" kicker="HIGHLIGHTS" />
        <span id="selected-title" className="pf-sr">Selected Works</span>
        <ul className="pf-selected">
          {works.map((w, i) => (
            <li key={w.id} className={`pf-reveal ${i === 0 ? 'is-lead' : ''}`} style={{ '--d': `${Math.min(i, 5) * 80}ms` }}>
              <button className="pf-work" onClick={() => setOpen(w)} aria-label={`View ${w.title}${w.year ? `, ${w.year}` : ''}`}>
                <span className="pf-work__img">
                  <Img photo={w.photo} seed={40 + i} w={1200} h={900} sizes={i === 0 ? '(min-width: 900px) 60vw, 92vw' : '(min-width: 900px) 30vw, 92vw'} />
                </span>
                <span className="pf-work__meta">
                  <strong>{w.title}</strong>
                  <span className="pf-mono">{[w.category, w.year].filter(Boolean).join(' · ')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <Modal label={`Selected work: ${open.title}`} onClose={() => setOpen(null)} className="pf-workview">
          <button className="pf-x" data-autofocus onClick={() => setOpen(null)} aria-label="Close">×</button>
          <figure className="pf-workview__fig">
            <img src={open.photo.full || open.photo.src} alt={open.photo.alt || open.title} data-cursor="view" />
            <figcaption>
              <p className="pf-mono">{[open.category, open.year].filter(Boolean).join(' · ')}</p>
              <h3>{open.title}</h3>
              {open.description && <p className="pf-workview__desc">{open.description}</p>}
              {open.link && <a className="pf-workview__link pf-mono" href={open.link} target="_blank" rel="noopener noreferrer">View project ↗</a>}
            </figcaption>
          </figure>
        </Modal>
      )}
    </section>
  );
}

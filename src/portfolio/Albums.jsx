import { useCallback, useEffect, useState } from 'react';
import Img from './Img';
import { Modal, SectionHead } from './Chrome';
import { placeholder } from './util';

function Lightbox({ album, start, onClose }) {
  const [i, setI] = useState(start);
  const n = album.photos.length;
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n]);
  const p = album.photos[i];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <Modal label={`${album.title} photo ${i + 1} of ${n}`} onClose={onClose} className="pf-lightbox">
      <button className="pf-x" data-autofocus onClick={onClose} aria-label="Close photo">×</button>
      <button className="pf-nav-btn prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
      <figure>
        <img
          src={p.src ? p.full || p.src : placeholder(album.seed * 10 + i, 'PLACEHOLDER', 1600, 1067)}
          alt={p.alt || ''}
          data-cursor="view"
        />
        <figcaption className="pf-mono">
          <span>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <span>{p.caption || album.title}</span>
        </figcaption>
      </figure>
      <button className="pf-nav-btn next" onClick={() => go(1)} aria-label="Next photo">›</button>
    </Modal>
  );
}

function AlbumView({ album, onClose }) {
  const [open, setOpen] = useState(null);
  return (
    <Modal label={`Album: ${album.title}`} onClose={onClose} className="pf-albumview">
      <div className="pf-albumview__bar">
        <div>
          <p className="pf-mono">{album.year} · {album.photos.length} PHOTOS</p>
          <h3>{album.title}</h3>
          {album.description && <p className="pf-muted">{album.description}</p>}
        </div>
        <button className="pf-x" data-autofocus onClick={onClose} aria-label="Close album">×</button>
      </div>
      <ul className="pf-albumview__grid">
        {album.photos.map((p, i) => (
          <li key={i}>
            <button onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}: ${p.alt || ''}`}>
              <Img photo={p} seed={album.seed * 10 + i} w={600} h={600} sizes="(min-width: 900px) 22vw, 45vw" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox album={album} start={open} onClose={() => setOpen(null)} />}
    </Modal>
  );
}

export default function Albums({ albums }) {
  const [active, setActive] = useState(null);
  return (
    <section id="albums" className="pf-section" aria-labelledby="albums-title">
      <div className="pf-wrap">
        <SectionHead n={2} title="Albums" kicker="SERIES" />
        <span id="albums-title" className="pf-sr">Albums</span>
        <ul className="pf-albums">
          {albums.map((a, i) => (
            <li key={a.id} className="pf-reveal" style={{ '--d': `${i * 90}ms` }}>
              <button className="pf-sleeve" onClick={() => setActive(a)} aria-label={`Open album ${a.title}, ${a.year}, ${a.photos.length} photos`}>
                <span className="pf-sleeve__holes" aria-hidden="true" />
                <span className="pf-sleeve__frame">
                  <span className="pf-sleeve__back"><Img photo={a.photos[1] || a.photos[0]} seed={a.seed * 10 + 1} w={640} h={800} sizes="(min-width: 900px) 30vw, 85vw" /></span>
                  <span className="pf-sleeve__cover">
                    <Img photo={a.cover} seed={a.seed} w={640} h={800} sizes="(min-width: 900px) 30vw, 85vw" />
                  </span>
                  <span className="pf-sleeve__curl" aria-hidden="true" />
                </span>
                <span className="pf-sleeve__meta">
                  <strong>{a.title}</strong>
                  <span className="pf-mono">{a.year} · {a.photos.length} PHOTOS</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active && <AlbumView album={active} onClose={() => setActive(null)} />}
    </section>
  );
}

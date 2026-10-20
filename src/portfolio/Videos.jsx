import { useState } from 'react';
import Img from './Img';
import { Modal, SectionHead } from './Chrome';

const toSeconds = (d = '00:00') => d.split(':').reduce((a, v) => a * 60 + Number(v), 0);
const timecode = (s, frames = 0) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(Math.floor(s % 60))}:${p(frames)}`;
};

function Player({ v }) {
  if (v.type === 'youtube') {
    return <iframe title={v.title} src={`https://www.youtube-nocookie.com/embed/${v.vid || v.id}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />;
  }
  if (v.type === 'vimeo') {
    return <iframe title={v.title} src={`https://player.vimeo.com/video/${v.id}?autoplay=1`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  }
  if (v.type === 'mp4') {
    return <video src={v.src} poster={v.thumb?.src} controls autoPlay playsInline />;
  }
  return (
    <div className="pf-ph-video pf-mono">
      <p>PLACEHOLDER VIDEO</p>
      <p>Set type to youtube, vimeo or mp4 in content.json</p>
    </div>
  );
}

function Card({ v, i, onOpen }) {
  const total = toSeconds(v.duration) || 60;
  const setHead = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    e.currentTarget.style.setProperty('--p', p);
    e.currentTarget.querySelector('.tc').textContent = `TC ${timecode(Math.floor(p * total), Math.floor(p * 24 * 10) % 24)}`;
  };
  return (
    <li className="pf-reveal" style={{ '--d': `${i * 90}ms` }}>
      <button className="pf-vcard" onClick={() => onOpen(v)} onPointerMove={setHead} aria-label={`Play ${v.title}`}>
        <span className="pf-vcard__thumb">
          <Img photo={v.thumb} seed={20 + i} w={1280} h={720} sizes="(min-width: 900px) 30vw, 90vw" />
          <span className="pf-vcard__play" aria-hidden="true" />
          <span className="pf-vcard__tl" aria-hidden="true">
            <span className="pf-vcard__ticks" />
            <span className="pf-vcard__head" />
            <span className="tc pf-mono">TC {timecode(0)}</span>
          </span>
        </span>
        <span className="pf-vcard__meta">
          <strong>{v.title}</strong>
          <span className="pf-mono">{v.duration ? `${v.duration} · ` : ''}V{i + 1}</span>
        </span>
      </button>
    </li>
  );
}

export default function Videos({ videos }) {
  const [active, setActive] = useState(null);
  return (
    <section id="video" className="pf-section" aria-labelledby="video-title">
      <div className="pf-wrap">
        <SectionHead n={3} title="Video Edits" kicker="MOTION" />
        <span id="video-title" className="pf-sr">Video Edits</span>
        <ul className="pf-videos">
          {videos.map((v, i) => <Card key={v.id} v={v} i={i} onOpen={setActive} />)}
        </ul>
      </div>
      {active && (
        <Modal label={`Video: ${active.title}`} onClose={() => setActive(null)} className="pf-videomodal">
          <button className="pf-x" data-autofocus onClick={() => setActive(null)} aria-label="Close video">×</button>
          <div className="pf-videomodal__box"><Player v={active} /></div>
          <p className="pf-mono pf-videomodal__cap">{active.title}{active.duration ? ` · ${active.duration}` : ''}</p>
        </Modal>
      )}
    </section>
  );
}

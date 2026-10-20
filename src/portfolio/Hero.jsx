import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from './util';

const pad = (n) => String(n).padStart(2, '0');
const SHUTTER = [30, 60, 125, 250, 500, 1000, 2000, 4000];

export default function Hero({ name, tagline }) {
  const root = useRef(null);
  const [flash, setFlash] = useState(false);
  const [frame, setFrame] = useState(1);
  const [exp, setExp] = useState({ iso: 400, f: 2.8, s: 250 });

  useEffect(() => {
    if (reducedMotion()) return;
    const el = root.current;
    let raf = 0, tx = 0.5, ty = 0.5, x = 0.5, y = 0.5, last = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      const now = performance.now();
      if (now - last > 80) {
        last = now;
        setExp({
          iso: Math.round((100 + tx * 6300) / 100) * 100,
          f: Math.round((1.4 + ty * 14.6) * 10) / 10,
          s: SHUTTER[Math.min(7, Math.floor(Math.hypot(tx - 0.5, ty - 0.5) * 11))],
        });
      }
    };
    const loop = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.setProperty('--mx', x.toFixed(3));
      el.style.setProperty('--my', y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener('pointermove', move);
    raf = requestAnimationFrame(loop);
    const shutter = setInterval(() => {
      setFlash(true);
      setFrame((f) => (f % 36) + 1);
      setTimeout(() => setFlash(false), 220);
    }, 9000);
    return () => {
      el.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      clearInterval(shutter);
    };
  }, []);

  const words = name.split(' ');
  const total = name.replace(/ /g, '').length;
  let idx = 0;

  return (
    <section id="intro" ref={root} className="pf-hero" aria-label="Introduction">
      <div className="pf-hero__shapes" aria-hidden="true">
        <i className="s1" /><i className="s2" /><i className="s3" /><i className="leak" />
      </div>

      <div className="pf-hero__inner">
        <h1 className="pf-hero__name" aria-label={name}>
          {words.map((w, wi) => (
            <span className="pf-word" key={wi} aria-hidden="true">
              {w.split('').map((c) => {
                const i = idx++;
                return (
                  <span className="pf-letter" key={i} style={{ '--i': i, '--n': total }}>
                    <span>{c}</span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        <p className="pf-hero__tag">{tagline}</p>
      </div>

      <div className="pf-vf" aria-hidden="true">
        <span className="c tl" /><span className="c tr" /><span className="c bl" /><span className="c br" />
        <span className="g gv1" /><span className="g gv2" /><span className="g gh1" /><span className="g gh2" />
        <span className="focus"><i /></span>
        <div className="readout top pf-mono"><span>REC ●</span><span>RAW + JPG</span><span>[ ◉ ] AF-S</span></div>
        <div className="readout bot pf-mono">
          <span>1/{exp.s}</span><span>F{exp.f.toFixed(1)}</span><span>ISO {exp.iso}</span><span>FRAME {pad(frame)}/36</span>
        </div>
      </div>

      <div className={`pf-flash ${flash ? 'is-on' : ''}`} aria-hidden="true" />
      <a href="#about" className="pf-scroll pf-mono" aria-label="Scroll to About">SCROLL<span /></a>
    </section>
  );
}

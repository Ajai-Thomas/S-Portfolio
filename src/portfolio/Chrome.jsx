// Page chrome: nav, cursor, loader, film strip, section heading, modal.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SECTIONS, finePointer, reducedMotion } from './util';

export function Nav({ initials, theme, onToggleTheme }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = ['intro', ...SECTIONS.map((s) => s.id)].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
    <span className="pf-nav__edge pf-mono" aria-hidden="true">PHOTOGRAPHY PORTFOLIO — {new Date().getFullYear()}</span>
    <header className="pf-nav">
      <a href="#intro" className="pf-nav__logo" aria-label="Back to top">{initials}</a>
      <nav aria-label="Sections">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>{s.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <button className="pf-nav__theme" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
      </button>
    </header>
    </>
  );
}

// Viewfinder-crosshair cursor (desktop only). Native cursor stays visible.
export function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const el = ref.current;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.25; y += (ty - y) * 0.25;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target;
      el.dataset.hidden = t.closest?.('.pf-gallery') ? 'true' : 'false';
      el.dataset.mode = t.closest?.('[data-cursor="view"], video, iframe')
        ? 'view'
        : t.closest?.('a, button, input, textarea') ? 'link' : 'idle';
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} className="pf-cursor" data-mode="idle" data-hidden="true" aria-hidden="true">
      <i /><i /><i /><i /><b />
    </div>
  );
}

// Aperture-blade loader with a real progress percentage. Fades out once `done`.
export function ApertureLoader({ progress = 0, done = false }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const b = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(b);
  }, [done]);
  if (gone) return null;
  const pct = Math.round((done ? 1 : progress) * 100);
  return (
    <div className={`pf-loader ${done ? 'is-out' : ''}`} role="status" aria-live="polite" aria-label={`Loading ${pct} percent`}>
      <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`rotate(${i * 60} 50 50)`}>
            <path className="pf-blade" d="M50 50 L50 6 A44 44 0 0 1 88 28 Z" style={{ '--open': 1 - pct / 100 }} />
          </g>
        ))}
      </svg>
      <span className="pf-mono pf-loader__pct">{String(pct).padStart(3, '0')}%</span>
      <span className="pf-mono pf-muted">DEVELOPING…</span>
    </div>
  );
}

export function FilmStrip({ frame = 1 }) {
  const cells = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pf-strip" aria-hidden="true">
      <div className="pf-strip__track">
        {[...cells, ...cells].map((i, k) => (
          <span key={k}>{String(((frame * 3 + i) % 36) + 1).padStart(2, '0')}A ▸</span>
        ))}
      </div>
    </div>
  );
}

export function SectionHead({ n, total = 5, title, kicker }) {
  const num = String(n).padStart(2, '0');
  return (
    <div className="pf-head">
      <div className="pf-head__num pf-reveal" aria-hidden="true">{num}</div>
      <div>
        <p className="pf-mono pf-reveal">FRAME {num} / {String(total).padStart(2, '0')}{kicker ? ` · ${kicker}` : ''}</p>
        <h2 className="pf-head__title"><span className="pf-reveal pf-mask"><span>{title}</span></span></h2>
      </div>
    </div>
  );
}

// Accessible modal: portal, Esc to close, focus trap, scroll lock, focus restore.
export function Modal({ label, onClose, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const root = ref.current;
    document.body.style.overflow = 'hidden';
    (root.querySelector('[data-autofocus]') || root).focus();
    return () => { document.body.style.overflow = ''; prev?.focus?.(); };
  }, []);
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...ref.current.querySelectorAll('button:not([disabled]), [href], input, textarea, video[controls]')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return createPortal(
    <div className="pf-root pf-modal-wrap" data-theme={document.querySelector('.pf-root')?.dataset.theme}>
      <div
        ref={ref}
        className={`pf-modal ${className}`}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

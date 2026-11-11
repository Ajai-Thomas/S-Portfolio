// Page chrome: nav, cursor, loader, film strip, section heading, modal.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NAV_ALIAS, SECTIONS } from './util';

export function Nav({ initials, theme, onToggleTheme, sections = SECTIONS }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = ['intro', ...sections.map((s) => s.id), ...Object.keys(NAV_ALIAS)].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(NAV_ALIAS[e.target.id] || e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <>
    <span className="pf-nav__edge pf-mono" aria-hidden="true">PHOTOGRAPHY PORTFOLIO — {new Date().getFullYear()}</span>
    <header className="pf-nav">
      <a href="#intro" className="pf-nav__logo" aria-label="Back to top">{initials}</a>
      <nav aria-label="Sections">
        <ul>
          {sections.map((s) => (
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
    const html = document.documentElement; // tells the 3D scene it is hidden: it stops drawing
    html.dataset.pfModal = String((+html.dataset.pfModal || 0) + 1);
    (root.querySelector('[data-autofocus]') || root).focus();
    return () => {
      document.body.style.overflow = '';
      const n = (+html.dataset.pfModal || 1) - 1;
      if (n <= 0) delete html.dataset.pfModal; else html.dataset.pfModal = String(n);
      prev?.focus?.();
    };
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

// Ruler-style progress scrubber for the break-apart sequence. Click or drag to jump.
import { useRef } from 'react';

const TICKS = ['ASSEMBLED', 'SEPARATE', 'EXPLODE', 'ANNOTATE', 'JOURNEY', 'REASSEMBLE'];

export default function Scrubber({ flowRef, rootRef }) {
  const bar = useRef(null);
  const dragging = useRef(false);
  const frac = (e) => {
    const r = bar.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const onDown = (e) => {
    dragging.current = true;
    bar.current.setPointerCapture(e.pointerId);
    flowRef.current?.scrubTo(frac(e), false);
  };
  const onMove = (e) => { if (dragging.current) flowRef.current?.scrubTo(frac(e), true); };
  const onUp = (e) => { dragging.current = false; bar.current.releasePointerCapture?.(e.pointerId); };
  const onKey = (e) => {
    const cur = parseFloat(rootRef.current?.style.getPropertyValue('--seq')) || 0;
    const step = e.shiftKey ? 0.2 : 0.06;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); flowRef.current?.scrubTo(cur + step); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); flowRef.current?.scrubTo(cur - step); }
  };
  return (
    <div className="pf-scrub" aria-label="Animation progress">
      <div
        ref={bar}
        className="pf-scrub__bar"
        role="slider"
        tabIndex={0}
        aria-label="Scrub through the camera sequence"
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <span className="pf-scrub__ticks" />
        <span className="pf-scrub__fill" />
        <span className="pf-scrub__head" />
      </div>
      <div className="pf-scrub__labels pf-mono" aria-hidden="true">{TICKS.map((t) => <span key={t}>{t}</span>)}</div>
    </div>
  );
}

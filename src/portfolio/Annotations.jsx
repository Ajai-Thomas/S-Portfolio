// Leader lines + service labels for the exploded camera.
// Each frame the engine projects every part's anchor to screen coordinates; this
// component turns those into elbow lines so they stay attached to the 3D parts.
import { useEffect, useMemo, useRef } from 'react';
import { PARTS, BREAKPOINTS as BP } from '../scene/explodeConfig';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function Annotations({ engineRef, ready, skills = {} }) {
  const labels = useMemo(
    () => PARTS.filter((d) => d.label).map((d) => ({ part: d.name, side: d.label.side, text: skills[d.name] || d.label.text })),
    [skills]
  );
  const wrap = useRef(null);
  const paths = useRef({});
  const dots = useRef({});
  const texts = useRef({});

  useEffect(() => {
    const engine = engineRef.current;
    if (!ready || !engine) return undefined;

    function place(part, d, rim, colX, rowY, side, draw, textA) {
      const p = paths.current[part], dot = dots.current[part], t = texts.current[part];
      if (!p) return;
      p.setAttribute('d', d);
      p.style.strokeDashoffset = String(1 - draw);
      dot.setAttribute('cx', rim[0]);
      dot.setAttribute('cy', rim[1]);
      dot.style.opacity = String(draw);
      t.style.opacity = String(textA);
      t.style.transform = `translate(${colX}px, ${rowY}px) translate(${side === 'L' ? '0' : '-100%'}, calc(-100% - 4px))`;
      t.style.textAlign = side === 'L' ? 'left' : 'right';
    }

    const off = engine.onFrame((st) => {
      const el = wrap.current;
      if (!el) return;
      const a = st.anno;
      el.style.opacity = a > 0.002 ? '1' : '0';
      el.style.pointerEvents = a > 0.6 ? 'auto' : 'none';
      el.setAttribute('aria-hidden', a > 0.3 ? 'false' : 'true');
      if (a <= 0.002) return;
      const W = window.innerWidth, H = window.innerHeight;
      const portrait = W / H < BP.portraitBelow;
      const colL = Math.max(12, W * 0.035), colR = W - Math.max(12, W * 0.035);
      const draw = clamp(a * 1.25);
      const textA = clamp((a - 0.25) / 0.5);

      ['L', 'R'].forEach((side) => {
        const group = labels.filter((l) => l.side === side && engine.anchors[l.part]?.c);
        if (!group.length) return;
        const pts = group.map((l) => {
          const an = engine.anchors[l.part];
          let rim;
          if (portrait) { // pick the rim facing the label column
            const all = [an.l, an.r, an.u, an.d];
            rim = side === 'L' ? all.reduce((m, q) => (q[0] < m[0] ? q : m)) : all.reduce((m, q) => (q[0] > m[0] ? q : m));
          } else { // rim facing away from the band: top for L, bottom for R
            const all = [an.u, an.d];
            rim = side === 'L' ? all.reduce((m, q) => (q[1] < m[1] ? q : m)) : all.reduce((m, q) => (q[1] > m[1] ? q : m));
          }
          return { l, rim, c: an.c };
        });
        const colX = side === 'L' ? colL : colR;
        if (portrait) {
          pts.forEach(({ l, rim }) => place(l.part, `M${rim[0]},${rim[1]} L${colX},${rim[1]}`, rim, colX, rim[1], side, draw, textA));
          return;
        }
        // sort so lines never cross: the nearest row goes to the part nearest its column
        pts.sort((p1, p2) => (side === 'L' ? p1.c[0] - p2.c[0] : p2.c[0] - p1.c[0]));
        const extreme = side === 'L' ? Math.min(...pts.map((q) => q.rim[1])) : Math.max(...pts.map((q) => q.rim[1]));
        const dir = side === 'L' ? -1 : 1;
        const base = extreme + dir * 34;
        const room = side === 'L' ? base - 84 : H - 70 - base;
        const gap = Math.min(30, Math.max(18, room / Math.max(1, pts.length)));
        pts.forEach(({ l, rim }, i) => {
          const rowY = base + dir * i * gap;
          place(l.part, `M${rim[0]},${rim[1]} L${rim[0]},${rowY} L${colX},${rowY}`, rim, colX, rowY, side, draw, textA);
        });
      });
    });
    return off;
  }, [engineRef, ready, labels]);

  const hl = (part) => engineRef.current?.setHighlight(part);
  return (
    <div ref={wrap} className="pf-anno" style={{ opacity: 0 }}>
      <svg className="pf-anno__svg" width="100%" height="100%" aria-hidden="true">
        {labels.map((l) => (
          <g key={l.part}>
            <path ref={(el) => { paths.current[l.part] = el; }} pathLength="1" className="pf-anno__line" />
            <circle ref={(el) => { dots.current[l.part] = el; }} r="3" className="pf-anno__dot" />
          </g>
        ))}
      </svg>
      <ul className="pf-anno__list" aria-label="Services">
        {labels.map((l, i) => (
          <li key={l.part} ref={(el) => { texts.current[l.part] = el; }} className="pf-anno__label pf-mono">
            <button
              type="button"
              onPointerEnter={() => hl(l.part)}
              onPointerLeave={() => hl(null)}
              onFocus={() => hl(l.part)}
              onBlur={() => hl(null)}
            >
              <span>{String(i + 1).padStart(2, '0')}</span> {l.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

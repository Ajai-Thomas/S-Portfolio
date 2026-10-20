// Smooth scroll (Lenis) + ScrollTrigger → one master progress value for the 3D scene.
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { at, SECTION_WEIGHTS } from './explodeConfig';

gsap.registerPlugin(ScrollTrigger);

// DOM ids in page order, paired with their weight key in SECTION_WEIGHTS.
const ORDER = [
  ['intro', 'hero'],
  ['tilt', 'tilt'],
  ['break', 'break'],
  ['explode', 'explode'],
  ['annotate', 'annotate'],
  ['about', 'about'],
  ['pullback', 'pullback'],
  ['works', 'works'],
  ['contact', 'contact'],
];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// The scrubber covers the break-apart sequence only (tilt → end of reassemble).
const SEQ0 = at('tilt', 0);
const SEQ1 = at('pullback', 1);

/**
 * @param rootRef   page root (receives --hero, --about, --seq, --seqshow CSS vars)
 * @param enabled   false → no Lenis, no scrubbing (static fallback)
 * @param engineRef ref holding the scene engine (setProgress / setEra / setCovered)
 * @param flowRef   receives { scrubTo(frac, immediate) } for the scrubber UI
 * @param entryCount number of journey entries (maps to the 0–4 "era" used by floaters)
 * @param reduced   prefers-reduced-motion: no wheel smoothing
 */
export function useScrollFlow({ rootRef, enabled, engineRef, flowRef, entryCount, reduced }) {
  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduced, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let anchors = [];
    const measure = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      anchors = ORDER.map(([id, key]) => {
        const el = document.getElementById(id);
        return { top: el ? el.getBoundingClientRect().top + y : 0, key, el };
      });
      const end = document.documentElement.scrollHeight - vh;
      anchors.forEach((a, i) => { a.end = i < anchors.length - 1 ? anchors[i + 1].top : end; });
    };
    measure();

    const galleryEl = root.querySelector('.pf-gallery');
    const proxy = { p: 0, era: 0 };
    const compute = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      let cum = 0;
      let p = 1;
      let aboutLocal = 0;
      for (const a of anchors) {
        const w = SECTION_WEIGHTS[a.key];
        const local = clamp((y - a.top) / Math.max(1, a.end - a.top));
        if (a.key === 'about') aboutLocal = clamp((y - a.top) / Math.max(1, a.end - a.top - vh));
        if (y < a.end || a === anchors[anchors.length - 1]) { p = cum + local * w; break; }
        cum += w;
      }
      // The gallery is opaque: while it fills the screen, stop drawing the scene behind it.
      const g = galleryEl && galleryEl.getBoundingClientRect();
      engineRef.current?.setCovered(!!g && g.top <= 1 && g.bottom >= vh - 1);
      root.style.setProperty('--hero', clamp(1 - y / (vh * 0.65)).toFixed(3));
      root.style.setProperty('--about', aboutLocal.toFixed(4));
      // scrubber: playhead position and visibility (hidden in Works)
      root.style.setProperty('--seq', clamp((p - SEQ0) / (SEQ1 - SEQ0)).toFixed(4));
      const show = clamp((p - at('hero', 0.8)) / 0.01) * (1 - clamp((p - at('pullback', 0.85)) / 0.02));
      root.style.setProperty('--seqshow', show.toFixed(3));
      root.dataset.seq = show > 0.5 ? 'on' : 'off';
      const era = clamp(aboutLocal * entryCount - 0.5, 0, entryCount - 1) * (4 / Math.max(1, entryCount - 1));
      gsap.to(proxy, { p, era, duration: 0.3, ease: 'power2.out', overwrite: true });
    };
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: compute, onRefresh: () => { measure(); compute(); } });
    compute();

    const push = () => {
      const e = engineRef.current;
      if (!e) return;
      const o = window.__pfProgress; // debug slider override
      e.setProgress(typeof o === 'number' ? o : proxy.p);
      e.setEra(proxy.era);
    };
    gsap.ticker.add(push);

    // master progress → scroll position (inverse of `compute`), used by the scrubber
    const pToY = (p) => {
      let cum = 0;
      for (const a of anchors) {
        const w = SECTION_WEIGHTS[a.key];
        if (p <= cum + w + 1e-9 || a === anchors[anchors.length - 1]) return a.top + clamp((p - cum) / w) * (a.end - a.top);
        cum += w;
      }
      return 0;
    };
    if (flowRef) {
      flowRef.current = {
        scrubTo: (frac, immediate = false) => {
          const p = SEQ0 + clamp(frac) * (SEQ1 - SEQ0);
          lenis.scrollTo(pToY(p), immediate ? { immediate: true, force: true } : { duration: 1.2 });
        },
      };
    }

    const onResize = () => { measure(); ScrollTrigger.refresh(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    // Layout shifts (images, fonts) change section heights: re-measure shortly after load
    const t = setTimeout(onResize, 1200);
    window.addEventListener('load', onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('load', onResize);
      gsap.ticker.remove(push);
      gsap.ticker.remove(raf);
      if (flowRef) flowRef.current = null;
      st.kill();
      lenis.destroy();
    };
  }, [rootRef, enabled, engineRef, flowRef, entryCount, reduced]);
}

// Smooth scroll (Lenis) + ScrollTrigger → one master progress value for the 3D scene.
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SECTION_WEIGHTS } from './config';

gsap.registerPlugin(ScrollTrigger);

// DOM ids in page order, paired with their weight key in SECTION_WEIGHTS.
const ORDER = [
  ['intro', 'hero'],
  ['dive', 'dive'],
  ['about', 'about'],
  ['pullback', 'pullback'],
  ['works', 'works'],
  ['contact', 'contact'],
];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * @param rootRef   page root (receives --hero, --dive, --about CSS vars)
 * @param enabled   false → no Lenis, no scrubbing (static fallback)
 * @param engineRef ref holding the scene engine (setProgress / setEra)
 * @param entryCount number of journey entries (maps to the 0–4 "era" used by floaters)
 */
export function useScrollFlow({ rootRef, enabled, engineRef, entryCount }) {
  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
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
      root.style.setProperty('--hero', clamp(1 - y / (vh * 0.65)).toFixed(3));
      root.style.setProperty('--about', aboutLocal.toFixed(4));
      root.style.setProperty('--dive', clamp((y - vh * 0.5) / (vh * 1.2)).toFixed(3));
      const era = clamp(aboutLocal * entryCount - 0.5, 0, entryCount - 1) * (4 / Math.max(1, entryCount - 1));
      // GSAP scrubs the master timeline value toward the scroll-derived target
      gsap.to(proxy, { p, era, duration: 0.45, ease: 'power2.out', overwrite: true });
    };
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: compute, onRefresh: () => { measure(); compute(); } });
    compute();

    const push = () => {
      const e = engineRef.current;
      if (e) { e.setProgress(proxy.p); e.setEra(proxy.era); }
    };
    gsap.ticker.add(push);

    const onResize = () => { measure(); ScrollTrigger.refresh(); };
    window.addEventListener('resize', onResize);
    // Layout shifts (images, fonts) change section heights: re-measure shortly after load
    const t = setTimeout(onResize, 1200);
    window.addEventListener('load', onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      gsap.ticker.remove(push);
      gsap.ticker.remove(raf);
      st.kill();
      lenis.destroy();
    };
  }, [rootRef, enabled, engineRef, entryCount]);
}

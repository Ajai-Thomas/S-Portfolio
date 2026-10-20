// Fixed full-screen canvas. Lazy-loads the engine (and three.js) after first paint.
import { useEffect, useRef } from 'react';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch { return false; }
}

export default function Scene({ theme, photos, engineRef, onProgress, onReady, onFallback, onShutter }) {
  const canvas = useRef(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (!hasWebGL()) { onFallback(); return; }
    let engine = null;
    let cancelled = false;
    const lite = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;

    const boot = async () => {
      try {
        const { createScene } = await import('./engine');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const e = await createScene({ canvas: canvas.current, lite, reduced, theme: themeRef.current, photos, onProgress, onShutter });
        if (cancelled) { e.dispose(); return; }
        engine = e;
        engineRef.current = e;
        if (new URLSearchParams(window.location.search).get('debug') === '1') window.__pfEngine = e;
        e.start();
        onReady(e);
      } catch (err) {
        console.warn('3D scene unavailable, using static layout.', err);
        if (!cancelled) onFallback();
      }
    };
    // after first paint
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 60));
    const h = idle(boot);

    // pointer / touch / gyro → tilt
    const move = (ev) => engineRef.current?.setPointer((ev.clientX / window.innerWidth - 0.5) * 2, (ev.clientY / window.innerHeight - 0.5) * 2);
    const tilt = (ev) => {
      if (ev.gamma == null) return;
      engineRef.current?.setPointer(Math.max(-1, Math.min(1, ev.gamma / 30)), Math.max(-1, Math.min(1, ((ev.beta || 45) - 45) / 30)));
    };
    window.addEventListener('pointermove', move, { passive: true });
    if (lite) window.addEventListener('deviceorientation', tilt, { passive: true });

    return () => {
      cancelled = true;
      (window.cancelIdleCallback || clearTimeout)(h);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('deviceorientation', tilt);
      engine?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { engineRef.current?.setTheme(theme); }, [theme, engineRef]);

  return <canvas ref={canvas} className="pf-canvas" aria-hidden="true" />;
}

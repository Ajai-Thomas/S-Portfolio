// ?debug=1 → lil-gui panel with a progress slider, FPS counter and part-name overlay.
import { useEffect, useRef } from 'react';

export default function DebugTools({ engineRef, ready }) {
  const fpsEl = useRef(null);
  const namesEl = useRef(null);
  useEffect(() => {
    if (!ready) return undefined;
    let gui = null;
    let off = () => {};
    let alive = true;
    const eng = engineRef.current;
    (async () => {
      const { default: GUI } = await import('lil-gui');
      if (!alive) return;
      const engine = engineRef.current;
      engine.setProfile(true);
      const opts = { live: true, progress: 0, showNames: false };
      gui = new GUI({ title: 'Camera sequence' });
      let liveCtl = null;
      const slider = gui.add(opts, 'progress', 0, 1, 0.001).name('progress (0–1)').onChange((v) => {
        opts.live = false;
        window.__pfProgress = v;
        liveCtl?.updateDisplay();
      });
      liveCtl = gui.add(opts, 'live').name('follow scroll').onChange((v) => { if (v) window.__pfProgress = undefined; });
      gui.add(opts, 'showNames').name('part names + anchors').onChange((v) => { window.__pfDebugAnchors = v; namesEl.current.style.display = v ? 'block' : 'none'; });

      let frames = 0, t0 = performance.now();
      const spans = {};
      engine.partNames.forEach((n) => {
        const s = document.createElement('span');
        s.textContent = n;
        namesEl.current.appendChild(s);
        spans[n] = s;
      });
      off = engine.onFrame((st) => {
        frames++;
        const now = performance.now();
        if (now - t0 > 500) {
          const s = engine.stats();
          fpsEl.current.textContent = `${Math.round((frames * 1000) / (now - t0))} FPS · p=${st.shown.toFixed(3)} · ${s.calls} calls · ${(s.triangles / 1000).toFixed(1)}k tris · DPR ${s.dpr.toFixed(2)}/${s.qualityDpr.toFixed(2)} · DOF ${s.dof ? 'on' : 'off'} · ${s.mode} · CPU ${s.cpuMs.toFixed(1)}ms${s.gpuMs === null ? '' : ` · GPU ${s.gpuMs.toFixed(1)}ms`}`;
          frames = 0;
          t0 = now;
        }
        if (opts.live) { opts.progress = st.shown; slider.updateDisplay(); }
        if (opts.showNames) {
          engine.partNames.forEach((n) => {
            const a = engine.anchors[n];
            if (a?.c) { spans[n].style.transform = `translate(${a.c[0]}px, ${a.c[1]}px)`; spans[n].style.display = 'block'; }
          });
        }
      });
    })();
    return () => { alive = false; off(); gui?.destroy(); window.__pfProgress = undefined; window.__pfDebugAnchors = false; eng?.setProfile(false); };
  }, [engineRef, ready]);
  return (
    <>
      <div ref={fpsEl} className="pf-debug-fps pf-mono">FPS</div>
      <div ref={namesEl} className="pf-debug-names pf-mono" style={{ display: 'none' }} />
    </>
  );
}

// Single-page portfolio mounted at "/".
// One fixed WebGL canvas (src/scene) is the background; this is the HTML laid over it.
// The gallery section renders the existing GalleryPage untouched.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import content from './content.json';
import './portfolio.css';
import { reducedMotion, resolveAlbum, useNear, useReveal } from './util';
import { ApertureLoader, Cursor, FilmStrip, Nav, SectionHead } from './Chrome';
import Hero from './Hero';
import Journey from './Journey';
import Albums from './Albums';
import Videos from './Videos';
import Contact from './Contact';
import Blog from './Blog';
import { useSanityPortfolio } from './sanityContent';
import GalleryPage from '../components/GalleryPage';
import Annotations from './Annotations';
import Scrubber from './Scrubber';
import DebugTools from './DebugTools';
import { useScrollFlow } from '../scene/useScrollFlow';

const Scene = lazy(() => import('../scene/Scene'));

const getInitialTheme = () => {
  try { return localStorage.getItem('pf-theme') || 'dark'; } catch { return 'dark'; }
};

export default function Home({ galleryImages }) {
  const root = useRef(null);
  const galleryBox = useRef(null);
  const engineRef = useRef(null);
  const [theme, setTheme] = useState(getInitialTheme);
  // 'loading' → 'ready' (3D running) or 'static' (reduced motion / no WebGL / error)
  const [mode, setMode] = useState('loading');
  const reduced = reducedMotion();
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  const flowRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const nearGallery = useNear(galleryBox);
  const sanity = useSanityPortfolio();
  // Albums/videos come from Sanity; content.json is the placeholder fallback.
  const albums = (sanity.albums.length ? sanity.albums : sanity.loaded ? content.albums : []).map(resolveAlbum);
  const videos = sanity.videos.length ? sanity.videos : content.videos;
  const is3d = mode !== 'static';

  useReveal(root);
  useScrollFlow({ rootRef: root, enabled: is3d, engineRef, flowRef, entryCount: content.about.timeline.length, reduced });

  useEffect(() => {
    document.documentElement.classList.add('pf-smooth');
    return () => document.documentElement.classList.remove('pf-smooth');
  }, []);
  useEffect(() => {
    document.title = `${content.site.name} — Photography`;
    try { localStorage.setItem('pf-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const shutter = useCallback(() => {
    engineRef.current?.pulse();
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
  }, []);

  // Shutter click when arriving at each Works section and at Contact.
  useEffect(() => {
    if (!is3d || mode !== 'ready') return;
    const ids = ['gallery', 'albums', 'video', 'blog', 'contact'];
    const seen = new Set();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !seen.has(e.target.id)) { seen.add(e.target.id); shutter(); }
    }), { threshold: 0.35 });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [is3d, mode, shutter]);

  const onFallback = useCallback(() => setMode('static'), []);

  return (
    <div ref={root} className={`pf-root ${is3d ? 'pf-3d' : 'pf-static'}`} data-theme={theme}>
      <a className="pf-skip" href="#about">Skip to content</a>
      {mode !== 'static' && <ApertureLoader progress={progress} done={mode === 'ready'} />}
      <Cursor />
      <Nav initials={content.site.initials} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      {is3d && (
        <Suspense fallback={null}>
          <Scene
            theme={theme}
            photos={content.about.floaterPhotos}
            engineRef={engineRef}
            onProgress={setProgress}
            onReady={() => setMode('ready')}
            onFallback={onFallback}
            onShutter={shutter}
          />
        </Suspense>
      )}
      {mode === 'ready' && <Annotations engineRef={engineRef} ready skills={content.about.skills} />}
      {is3d && <Scrubber flowRef={flowRef} rootRef={root} />}
      {debug && <DebugTools engineRef={engineRef} ready={mode === 'ready'} />}
      <div className={`pf-shutterflash ${flash ? 'is-on' : ''}`} aria-hidden="true" />

      <main className="pf-flow">
        <Hero name={content.site.name} tagline={content.site.tagline} role={content.site.role} location={content.site.location} fallback={!is3d} />

        {/* Scroll space for the camera sequence; the 3D scene does the work. */}
        <section id="tilt" className="pf-spacer pf-spacer--tilt" aria-hidden="true" />
        <section id="break" className="pf-spacer pf-spacer--break" aria-hidden="true">
          <p className="pf-phase pf-mono pf-reveal">01 · DISASSEMBLY</p>
        </section>
        <section id="explode" className="pf-spacer pf-spacer--explode" aria-hidden="true">
          <p className="pf-phase pf-mono pf-reveal">02 · OPTICAL AXIS, EXPLODED</p>
        </section>
        <section id="annotate" className="pf-spacer pf-spacer--annotate" aria-hidden="true">
          <p className="pf-phase pf-mono pf-reveal">03 · WHAT I DO</p>
        </section>

        <Journey about={content.about} />

        <section id="pullback" className="pf-pullback" aria-labelledby="works-title">
          <div className="pf-pullback__text">
            <p className="pf-mono pf-reveal">SELECTED WORK</p>
            <h2 id="works-title" className="pf-pullback__title"><span className="pf-reveal pf-mask"><span>Works</span></span></h2>
          </div>
        </section>

        <div id="works" className="pf-works">
          <section id="gallery" className="pf-section pf-section--gallery" aria-labelledby="gallery-title">
            <div className="pf-wrap">
              <SectionHead n={1} title="Gallery" kicker="DRAG TO ROTATE" />
              <span id="gallery-title" className="pf-sr">Gallery</span>
            </div>
            {/* Existing gallery, unchanged. Mounted when near the viewport. */}
            <div ref={galleryBox} className="pf-gallery">
              {nearGallery && <GalleryPage preloadedImages={galleryImages} />}
            </div>
          </section>
          <FilmStrip frame={3} />
          <Albums albums={albums} />
          <FilmStrip frame={4} />
          <Videos videos={videos} />
          <FilmStrip frame={5} />
          <Blog posts={sanity.posts} loaded={sanity.loaded} />
        </div>

        <Contact contact={content.contact} />
      </main>

      <footer className="pf-footer pf-mono">
        <span>© {new Date().getFullYear()} {content.site.name}</span>
        <span>{content.site.location}</span>
      </footer>
    </div>
  );
}

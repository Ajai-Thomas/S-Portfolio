// New single-page portfolio mounted at "/".
// The gallery section renders the existing GalleryPage untouched.
import { useEffect, useRef, useState } from 'react';
import content from './content.json';
import './portfolio.css';
import { resolveAlbum, useNear, useReveal } from './util';
import { ApertureLoader, Cursor, FilmStrip, Nav, SectionHead } from './Chrome';
import Hero from './Hero';
import About from './About';
import Albums from './Albums';
import Videos from './Videos';
import Contact from './Contact';
import GalleryPage from '../components/GalleryPage';

const getInitialTheme = () => {
  try { return localStorage.getItem('pf-theme') || 'dark'; } catch { return 'dark'; }
};

export default function Home({ galleryImages }) {
  const root = useRef(null);
  const galleryBox = useRef(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const nearGallery = useNear(galleryBox);
  const albums = content.albums.map(resolveAlbum);

  useReveal(root);
  useEffect(() => {
    document.documentElement.classList.add('pf-smooth');
    return () => document.documentElement.classList.remove('pf-smooth');
  }, []);
  useEffect(() => {
    document.title = `${content.site.name} — Photography`;
    try { localStorage.setItem('pf-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  return (
    <div ref={root} className="pf-root" data-theme={theme}>
      <a className="pf-skip" href="#about">Skip to content</a>
      <ApertureLoader />
      <Cursor />
      <Nav initials={content.site.initials} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

      <main>
        <Hero name={content.site.name} tagline={content.site.tagline} />
        <FilmStrip frame={1} />
        <About about={content.about} />
        <FilmStrip frame={2} />

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
        <Videos videos={content.videos} />
        <FilmStrip frame={5} />
        <Contact contact={content.contact} />
      </main>

      <footer className="pf-footer pf-mono">
        <span>© {new Date().getFullYear()} {content.site.name}</span>
        <span>{content.site.location}</span>
      </footer>
    </div>
  );
}

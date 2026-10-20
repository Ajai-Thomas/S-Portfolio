// Shared helpers for the portfolio page.
import { useEffect, useState } from 'react';

export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'pullback', label: 'Works' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'albums', label: 'Albums' },
  { id: 'video', label: 'Video' },
  { id: 'blog', label: 'Diary' },
  { id: 'contact', label: 'Contact' },
];

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Clearly-labelled placeholder image (inline SVG, no network request).
export function placeholder(seed = 1, label = 'PLACEHOLDER', w = 1200, h = 800) {
  const hue = (seed * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 18% 26%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 22% 12%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><g stroke="rgba(255,255,255,.14)" fill="none" stroke-width="3"><path d="M0 0L${w} ${h}M${w} 0L0 ${h}"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 6}"/></g><text x="50%" y="50%" fill="rgba(255,255,255,.7)" font-family="monospace" font-size="${Math.round(w / 32)}" text-anchor="middle" dy=".35em" letter-spacing="4">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Normalise an album so every one has a photos array (generated placeholders if empty).
export function resolveAlbum(album, index) {
  const count = album.photos?.length || album.placeholders || 0;
  const photos = album.photos?.length
    ? album.photos
    : Array.from({ length: count }, (_, i) => ({
        src: null,
        alt: `${album.title} placeholder photo ${i + 1}`,
        caption: `PLACEHOLDER ${String(i + 1).padStart(2, '0')}`,
      }));
  return { ...album, photos, seed: index + 1 };
}

// Reveals `.pf-reveal` elements inside root when they scroll into view.
export function useReveal(rootRef) {
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.pf-reveal');
    if (!els) return;
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

// True once an element has come within `margin` of the viewport.
export function useNear(ref, margin = '600px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!('IntersectionObserver' in window)) { setNear(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near, margin]);
  return near;
}

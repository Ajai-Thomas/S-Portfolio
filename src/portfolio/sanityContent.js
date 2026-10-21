// Loads albums (Sanity "project" docs), videos (their YouTube items) and blog posts
// (Sanity "blogPost" docs) for the portfolio page. Falls back to content.json when empty.
import { useEffect, useState } from 'react';
import { client } from '../sanity';

const driveDirect = (url) => {
  const id = url.includes('drive.google.com') && url.match(/[-\w]{25,}/);
  return id ? `https://drive.google.com/uc?export=view&id=${id[0]}` : url;
};

function toPhoto(m, fallbackAlt) {
  const url = driveDirect(m.url);
  const alt = m.alt || fallbackAlt;
  if (url.includes('cdn.sanity.io')) {
    const w = (n) => `${url}?w=${n}&auto=format&q=80`;
    return { src: w(900), srcset: `${w(500)} 500w, ${w(900)} 900w, ${w(1400)} 1400w`, full: `${url}?w=2400&auto=format&q=90`, alt };
  }
  return { src: url, full: url, alt };
}

const youtubeId = (url) => {
  const m = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([\w-]{11})/);
  return m ? m[1] : null;
};

function mapProjects(data) {
  const albums = [];
  const videos = [];
  data.forEach((p) => {
    const media = (p.media || []).filter((m) => m?.url);
    const photos = media.filter((m) => m.type !== 'youtube').map((m) => toPhoto(m, p.title));
    if (photos.length) {
      albums.push({
        id: p._id,
        title: p.title || 'Untitled',
        year: p.date ? p.date.slice(0, 4) : '',
        description: p.excerpt || p.category || '',
        cover: photos[0],
        photos,
      });
    }
    media.filter((m) => m.type === 'youtube').forEach((m, i) => {
      const id = youtubeId(m.url);
      if (id) {
        videos.push({
          id: `${p._id}-${i}`, vid: id, title: m.alt || p.title || 'Video', duration: '',
          type: 'youtube', thumb: { src: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, alt: m.alt || p.title || 'Video thumbnail', w: 480, h: 360 },
        });
      }
    });
  });
  return { albums, videos };
}

const vimeoId = (url) => (url.match(/vimeo\.com\/(?:video\/)?(\d+)/) || [])[1] || null;

function mapVideoEdit(v) {
  const url = v.videoUrl || '';
  const yt = youtubeId(url);
  const vm = vimeoId(url);
  const type = yt ? 'youtube' : vm ? 'vimeo' : url ? 'mp4' : 'placeholder';
  let thumbSrc = null;
  if (v.thumbUploaded) thumbSrc = `${v.thumbUploaded}?w=1280&auto=format&q=80`;
  else if (v.thumbnailUrl) thumbSrc = driveDirect(v.thumbnailUrl);
  else if (yt) thumbSrc = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  return {
    id: v._id, vid: yt || vm || undefined, src: type === 'mp4' ? url : undefined, type,
    title: v.title || 'Untitled', duration: v.duration || '',
    thumb: thumbSrc ? { src: thumbSrc, alt: v.title || 'Video thumbnail', w: 1280, h: 720 } : null,
  };
}

function mapSelected(w) {
  const url = w.uploaded || w.imageUrl;
  if (!url) return null;
  return {
    id: w._id, title: w.title || 'Untitled', category: w.category || '', year: w.date ? w.date.slice(0, 4) : '',
    description: w.description || '', link: w.link || '',
    photo: toPhoto({ url, alt: w.alt }, w.title || ''),
  };
}

export function useSanityPortfolio() {
  const [state, setState] = useState({ albums: [], videos: [], selected: [], posts: [], loaded: false });
  useEffect(() => {
    let alive = true;
    Promise.all([
      client.fetch(`*[_type == "project"] | order(date desc) {
        _id, title, category, date, excerpt,
        "media": mediaItems[]{ "url": coalesce(url, asset->url), "type": coalesce(type, "image"), alt }
      }`),
      client.fetch(`*[_type == "blogPost"] | order(date desc) { _id, title, date, author, excerpt, content }`),
      client.fetch(`*[_type == "selectedWork"] | order(coalesce(order, 9999) asc, date desc) { _id, title, category, date, description, link, alt, imageUrl, "uploaded": image.asset->url }`),
      client.fetch(`*[_type == "videoEdit"] | order(coalesce(order, 9999) asc, date desc) { _id, title, videoUrl, duration, thumbnailUrl, "thumbUploaded": thumbnail.asset->url }`),
    ])
      .then(([projects, posts, selected, videoEdits]) => {
        if (!alive) return;
        const fromProjects = mapProjects(projects || []);
        setState({
          albums: fromProjects.albums,
          // dedicated video edits first, then any YouTube links added to albums
          videos: [...(videoEdits || []).map(mapVideoEdit), ...fromProjects.videos],
          selected: (selected || []).map(mapSelected).filter(Boolean),
          posts: posts || [],
          loaded: true,
        });
      })
      .catch((err) => {
        console.error('Sanity load failed:', err);
        if (alive) setState((s) => ({ ...s, loaded: true }));
      });
    return () => { alive = false; };
  }, []);
  return state;
}

// src/App.jsx
import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './portfolio/Home';
import { client } from './sanity';

// The admin area is only needed by the owner: keep it out of the public bundle.
const AdminPage = lazy(() => import('./admin/AdminPage'));

const processMediaUrls = (url) => {
  if (!url) return null;

  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) {
      const direct = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
      return { thumb: direct, full: direct };
    }
  }

  if (url.includes('cdn.sanity.io')) {
    return {
      thumb: `${url}?w=400&h=400&fit=crop&auto=format&q=75`,
      full: `${url}?w=2400&auto=format&q=100`,
    };
  }

  return { thumb: url, full: url };
};

// Old standalone pages now live inside the single portfolio page as sections.
const toSection = (hash) => <Navigate to={{ pathname: '/', hash }} replace />;

function App() {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // Fetch project media for the gallery background preloading
    const query = `*[_type == "project"] {
        "allMedia": mediaItems[]{
            "url": coalesce(url, asset->url)
        }
    }`;

    client.fetch(query)
      .then((data) => {
        if (!data) return;
        const images = data
          .flatMap((p) => p.allMedia || [])
          .map((m) => (m?.url ? processMediaUrls(m.url) : null))
          .filter(Boolean);
        setGalleryImages(images);
      })
      .catch((err) => console.error('Gallery preload failed:', err));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home galleryImages={galleryImages} />} />
      <Route
        path="/admin"
        element={(
          <Suspense fallback={null}>
            <AdminPage />
          </Suspense>
        )}
      />
      {/* Legacy URLs keep working and land on the matching section */}
      <Route path="/gallery" element={toSection('#gallery')} />
      <Route path="/about" element={toSection('#about')} />
      <Route path="/contact" element={toSection('#contact')} />
      <Route path="/blog/*" element={toSection('#blog')} />
      <Route path="/project/*" element={toSection('#albums')} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

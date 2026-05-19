// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PortfolioPage from './components/PortfolioPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import AboutPage from './components/AboutPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import ContactPage from './components/ContactPage';
import GalleryPage from './components/GalleryPage';
import AdminPage from './components/AdminPage';
import { client } from './sanity'; 

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
        full: `${url}?w=2400&auto=format&q=100` 
      };
  }

  return { thumb: url, full: url };
};

function App() {
  const location = useLocation();
  const isGallery = location.pathname === '/gallery';
  const isAdmin = location.pathname === '/admin';
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
            .flatMap(p => p.allMedia || [])
            .map(m => m?.url ? processMediaUrls(m.url) : null)
            .filter(Boolean);
        setGalleryImages(images);
      })
      .catch(err => console.error("Gallery preload failed:", err));
  }, []);

  if (isAdmin) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <div className="font-sans text-black bg-ivory min-h-screen flex flex-col">
      <Navbar />

      <div className={`grow w-full ${isGallery ? '' : 'max-w-7xl mx-auto px-6 md:px-12'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/project/:projectId" element={<ProjectDetailPage />} />
            <Route path="/gallery" element={<GalleryPage preloadedImages={galleryImages} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:postId" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </AnimatePresence>
      </div>

      {!isGallery && <Footer />}
    </div>
  );
}

export default App;
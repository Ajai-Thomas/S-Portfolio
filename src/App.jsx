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
import { client } from './sanity'; 

// Helper to process links and generate both Thumb and Full versions
const processMediaUrls = (url) => {
  if (!url) return null;
  
  // 1. Handle Google Drive Links (No resize support, use same link for both)
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) {
      const direct = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
      return { thumb: direct, full: direct };
    }
  }
  
  // 2. Handle Sanity Images - THE IMPORTANT PART
  if (url.includes('cdn.sanity.io')) {
      return {
        // SPHERE: Tiny 400px texture, medium quality (Fast FPS)
        thumb: `${url}?w=400&h=400&fit=crop&auto=format&q=75`,
        
        // OVERLAY: Large 2400px image, Max quality (Crystal Clear)
        full: `${url}?w=2400&auto=format&q=100` 
      };
  }

  // Fallback for other URLs
  return { thumb: url, full: url };
};

function App() {
  const location = useLocation();
  const isGallery = location.pathname === '/gallery';

  // --- PRELOAD GALLERY DATA ---
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // Fetch gallery images silently in the background
    const query = `*[_type == "project"] {
        "allMedia": mediaItems[]{
            "url": coalesce(url, asset->url)
        }
    }`;

    client.fetch(query)
      .then((data) => {
        const images = data
            .flatMap(p => p.allMedia || [])
            .map(m => processMediaUrls(m.url)) // Returns objects {thumb, full}
            .filter(Boolean);
        setGalleryImages(images);
      })
      .catch(console.error);
  }, []);
  // -----------------------------

  return (
    <div className="font-sans text-black bg-ivory min-h-screen flex flex-col">
      <Navbar />

      <div className={`flex-grow w-full ${isGallery ? '' : 'max-w-7xl mx-auto px-6 md:px-12'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/project/:projectId" element={<ProjectDetailPage />} />
            
            {/* Pass preloaded images to GalleryPage for instant load */}
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
// src/App.jsx
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

function App() {
  const location = useLocation();

  // Check if we are on the Gallery page
  const isGallery = location.pathname === '/gallery';

  return (
    <div className="font-sans text-black bg-ivory min-h-screen flex flex-col">
      <Navbar />

      {/* LAYOUT FIX:
          - If on Gallery Page: Remove all width/padding constraints so it can be full-screen.
          - If on other pages: Apply max-width and padding to center content properly.
      */}
      <div className={`flex-grow w-full ${isGallery ? '' : 'max-w-7xl mx-auto px-6 md:px-12'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/project/:projectId" element={<ProjectDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:postId" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      {/* Hide footer on Gallery page for full immersion */}
      {!isGallery && <Footer />}
    </div>
  );
}

export default App;
// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import all the page components
import PortfolioPage from './components/PortfolioPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import BlogPage from './components/BlogPage';           // <-- Import BlogPage
import BlogPostPage from './components/BlogPostPage';   // <-- Import BlogPostPage

function App() {
  const location = useLocation();

  return (
    <div className="bg-tan min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-ivory max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PortfolioPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/project/:projectId" element={<ProjectDetailPage />} />
              {/* --- ADDED: NEW BLOG ROUTES --- */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
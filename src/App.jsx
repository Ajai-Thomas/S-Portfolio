// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition'; // <-- Import the new component

// Import all the page components
import PortfolioPage from './components/PortfolioPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';

function App() {
  const location = useLocation();

  return (
    <div className="bg-tan min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-ivory max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Wrap each route's element in PageTransition */}
              <Route path="/" element={<PageTransition><PortfolioPage /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
              <Route path="/project/:projectId" element={<PageTransition><ProjectDetailPage /></PageTransition>} />
              <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
              <Route path="/blog/:postId" element={<PageTransition><BlogPostPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PortfolioPage from './components/PortfolioPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ProjectDetailPage from './components/ProjectDetailPage';

// This component defines the SVG filter. It must be rendered once.
const SvgGooFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          result="goo"
        />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
  </svg>
);

function App() {
  const location = useLocation();

  return (
    <div className="bg-tan min-h-screen p-4 md:p-8 font-sans text-black">
      <SvgGooFilter /> {/* This renders the filter so it can be used */}
      <div className="bg-ivory max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PortfolioPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/project/:projectId" element={<ProjectDetailPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PortfolioPage from './components/PortfolioPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AnimatedPage from './components/AnimatedPage'; // Import our new component

function App() {
  const location = useLocation();

  return (
    <div className="bg-beige min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-antique-white max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          {/* AnimatePresence handles the exit animations */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route 
                path="/" 
                element={
                  <AnimatedPage>
                    <PortfolioPage />
                  </AnimatedPage>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <AnimatedPage>
                    <AboutPage />
                  </AnimatedPage>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <AnimatedPage>
                    <ContactPage />
                  </AnimatedPage>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
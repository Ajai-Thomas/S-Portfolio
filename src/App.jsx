// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ProjectSection from './components/ProjectSection';
import About from './components/About';
import ContactForm from './components/ContactForm';
import { projects } from './data/projects';
import ProjectDetailPage from './components/ProjectDetailPage'; // Import the new page

// A simple component for the main portfolio view
const PortfolioHome = () => (
  <>
    <Hero />
    <section id="portfolio">
      {projects.map((project, index) => (
        <ProjectSection
          key={project.id}
          project={project}
          projectNumber={index + 1}
        />
      ))}
    </section>
    <section id="about">
      <About />
    </section>
    <section id="contact" className="py-24 border-t border-black/10">
      <h2 className="text-center text-4xl font-black tracking-tighter mb-16">GET IN TOUCH</h2>
      <ContactForm />
    </section>
  </>
);

function App() {
  return (
    <div className="bg-tan min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-ivory max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<PortfolioHome />} />
            <Route path="/project/:projectId" element={<ProjectDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
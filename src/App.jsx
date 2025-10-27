// src/App.jsx
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectSection from './components/ProjectSection';
import About from './components/About';
import Footer from './components/Footer';
import { projects } from './data/projects'; // Your project data

function App() {
  return (
    // Outer container with the lighter beige background
    <div className="bg-beige min-h-screen p-4 md:p-8 font-sans text-black">
      {/* Main content area with the off-white background */}
      <div className="bg-antique-white max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
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
        </main>
        
        <section id="contact">
          <Footer />
        </section>
      </div>
    </div>
  );
}

export default App;
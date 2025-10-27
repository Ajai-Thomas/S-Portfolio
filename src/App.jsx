// src/App.jsx
import { motion } from 'framer-motion'; // Import motion
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectSection from './components/ProjectSection';
import About from './components/About';
import Footer from './components/Footer';
import ContactForm from './components/ContactForm';
import { projects } from './data/projects';

// 1. Define the animation for the container and its children
const portfolioVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3, // Each child will animate 0.3s after the previous one
    },
  },
};

const projectVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.6, 0.01, 0.05, 0.95], // A more refined easing curve
    },
  },
};

function App() {
  return (
    <div className="bg-tan min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-ivory max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <Hero />
          
          {/* 2. Apply the animations to the portfolio section */}
          <motion.section
            id="portfolio"
            variants={portfolioVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} // Start animation when 10% of the section is visible
          >
            {projects.map((project, index) => (
              <ProjectSection
                key={project.id}
                project={project}
                projectNumber={index + 1}
                variants={projectVariants} // Pass the child animation variant
              />
            ))}
          </motion.section>

          <motion.section 
            id="about"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <About />
          </motion.section>

          <motion.section 
            id="contact" 
            className="py-24 border-t border-black/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-center text-4xl font-black tracking-tighter mb-16">GET IN TOUCH</h2>
            <ContactForm />
          </motion.section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
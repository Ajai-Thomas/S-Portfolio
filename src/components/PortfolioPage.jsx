// src/components/PortfolioPage.jsx
import { motion } from 'framer-motion';
import Hero from './Hero';
import ProjectSection from './ProjectSection';
import { projects } from '../data/projects';

const portfolioVariants = { /* ... as before ... */ };
const projectVariants = { /* ... as before ... */ };

const PortfolioPage = () => (
  <>
    <Hero />
    <motion.section
      id="portfolio"
      variants={portfolioVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {projects.map((project, index) => (
        <ProjectSection
          key={project.id}
          project={project}
          projectNumber={index + 1}
          variants={projectVariants}
        />
      ))}
    </motion.section>
  </>
);
export default PortfolioPage;
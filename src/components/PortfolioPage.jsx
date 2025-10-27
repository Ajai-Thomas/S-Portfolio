// src/components/PortfolioPage.jsx
import { motion } from 'framer-motion';
import Hero from './Hero';
import ProjectSection from './ProjectSection';
import { projects } from '../data/projects';

const portfolioVariants = {
  visible: { transition: { staggerChildren: 0.3 } },
};

const projectVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const PortfolioPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
  </motion.div>
);

export default PortfolioPage;
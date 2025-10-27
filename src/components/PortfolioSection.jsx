// src/components/PortfolioSection.jsx
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';

// A simple, clean card for each project image
const ProjectCard = ({ project, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    // CHANGE: Reduced the height from h-[80vh] to h-[45vh] to make the images less "chunky"
    <div
      className="h-[45vh] w-full rounded-lg overflow-hidden shadow-xl relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(project)}
    >
      <img
        src={project.images[0]}
        alt={project.title}
        className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
      />
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/60 to-transparent"
          >
            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="p-6 text-white text-xl font-bold tracking-wider uppercase"
            >
              {project.title}
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// The Modal that appears on click
const TitleModal = ({ project, onClose }) => (
  <AnimatePresence>
    {project && (
      <>
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-40 cursor-pointer"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase text-center p-4">
            {project.title}
          </h2>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// The main component that orchestrates the parallax effect
const PortfolioSection = () => {
  const [activeProject, setActiveProject] = useState(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const midPoint = Math.ceil(projects.length / 2);
  const leftProjects = projects.slice(0, midPoint);
  const rightProjects = projects.slice(midPoint);

  const yLeft = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const yRight = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);

  return (
    <>
      <div ref={containerRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen flex items-center gap-8 px-8 overflow-hidden">
          <motion.div className="relative w-1/3 flex flex-col gap-8" style={{ y: yLeft }}>
            {leftProjects.map((p) => <ProjectCard key={p.id} project={p} onClick={setActiveProject} />)}
          </motion.div>
          
          <div className="relative w-1/3 flex justify-center items-center">
            <p className="text-8xl font-black text-tan">A</p>
          </div>

          <motion.div className="relative w-1/3 flex flex-col gap-8" style={{ y: yRight }}>
            {rightProjects.map((p) => <ProjectCard key={p.id} project={p} onClick={setActiveProject} />)}
          </motion.div>
        </div>
      </div>
      
      <TitleModal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  );
};

export default PortfolioSection;
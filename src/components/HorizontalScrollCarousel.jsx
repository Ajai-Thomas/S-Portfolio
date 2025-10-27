// src/components/HorizontalScrollCarousel.jsx
import { motion, useTransform, useScroll } from 'framer-motion';
import { useRef } from 'react';
import ProjectCard from './ProjectCard'; // We'll create this next

const HorizontalScrollCarousel = ({ projects }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map scroll progress to horizontal movement
  // The '-200%' value depends on the number of cards. Adjust if you add more.
  const x = useTransform(scrollYProgress, [0, 1], ['1%', '-85%']);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-antique-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* The moving "filmstrip" of projects */}
        <motion.div style={{ x }} className="flex gap-8">
          {projects.map((project) => {
            return <ProjectCard project={project} key={project.id} />;
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollCarousel;
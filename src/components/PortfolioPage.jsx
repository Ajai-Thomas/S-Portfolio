// src/components/PortfolioPage.jsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import { projects } from '../data/projects';

// This component handles the VERTICAL "snap" animation for the text.
const ProjectDetails = ({ project, index, progress }) => {
    const start = index / projects.length;
    const end = (index + 1) / projects.length;

    // Fast fade-in/fade-out for a clean transition.
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    // Animate Y position to slide in from the bottom and exit to the top.
    const y = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
        <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-center justify-center">
            <div className="w-full text-center md:text-left">
                <div className="inline-flex items-center gap-4 mb-3">
                    <p className="font-bold text-lg text-tan">{String(index + 1).padStart(2, '0')}</p>
                    <p className="text-xs tracking-widest text-black/60">{project.category}</p>
                </div>
                <Link to={`/project/${project.id}`}>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 hover:text-tan transition-colors duration-300">{project.title}</h2>
                </Link>
                <p className="text-sm tracking-widest text-black/70">{project.date}</p>
            </div>
        </motion.div>
    );
};

// NEW: This component handles the HORIZONTAL "snap" animation for the images.
const ProjectImage = ({ project, index, progress }) => {
    const start = index / projects.length;
    const end = (index + 1) / projects.length;

    // Uses the exact same opacity logic as the text for perfect synchronization.
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    // Animate X position to slide in from the right and exit to the left.
    const x = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
         <motion.div style={{ opacity, x }} className="absolute inset-0 flex items-center justify-center">
             <Link to={`/project/${project.id}`} className="block w-full h-full">
                <img
                    src={project.images[0]}
                    alt={`${project.title} cover`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                />
            </Link>
        </motion.div>
    )
}

const PortfolioPage = () => {
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ['start start', 'end end'],
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hero />
            
            <section ref={scrollRef} className="relative h-[600vh]">
                <div className="sticky top-0 h-screen grid grid-cols-1 md:grid-cols-2 gap-x-12 items-center overflow-hidden">
                    
                    {/* Left Column: Renders all text animations, layered on top of each other. */}
                    <div className="relative h-full flex items-center justify-center overflow-hidden">
                        {projects.map((project, index) => (
                            <ProjectDetails key={project.id} project={project} index={index} progress={scrollYProgress} />
                        ))}
                    </div>

                    {/* Right Column: Renders all image animations, layered on top of each other. */}
                    <div className="relative w-full h-1/2 md:h-2/3 px-8 overflow-hidden">
                         {projects.map((project, index) => (
                            <ProjectImage key={project.id} project={project} index={index} progress={scrollYProgress} />
                        ))}
                    </div>

                </div>
            </section>
        </motion.div>
    );
};

export default PortfolioPage;
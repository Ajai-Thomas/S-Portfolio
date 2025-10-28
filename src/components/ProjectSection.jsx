// src/components/ProjectSection.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProjectSection = ({ project, projectNumber, variants }) => {
  return (
    // We removed the whileHover from the main container
    <motion.div className="py-16 group" variants={variants}>
      <Link to={`/project/${project.id}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {project.images.map((image, index) => (
            // The animation is now on the image container
            <div key={index} className="overflow-hidden rounded-md h-96">
              <motion.img
                src={image}
                alt={`${project.title} ${index + 1}`}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }} // Subtle zoom on hover
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-medium group-hover:text-tan transition-colors">{project.title} &rarr;</h2>
            <p className="text-xs tracking-widest text-black/60">{project.date}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{String(projectNumber).padStart(2, '0')}</p>
            <p className="text-xs tracking-widest">{project.category}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectSection;
// src/components/ProjectSection.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link

const ProjectSection = ({ project, projectNumber, variants }) => {
  return (
    <motion.div className="py-16 group" variants={variants}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {project.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${project.title} ${index + 1}`}
            className="h-96 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div>
          {/* This now links to the detail page */}
          <Link to={`/project/${project.id}`}>
            <h2 className="text-2xl font-medium hover:text-tan transition-colors">{project.title} &rarr;</h2>
          </Link>
          <p className="text-xs tracking-widest text-black/60">{project.date}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{String(projectNumber).padStart(2, '0')}</p>
          <p className="text-xs tracking-widest">{project.category}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectSection;
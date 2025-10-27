// src/components/ProjectDetailPage.jsx
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { motion } from 'framer-motion';

const ProjectDetailPage = () => {
  const { projectId } = useParams(); // Gets the project ID from the URL
  const project = projects.find((p) => p.id === parseInt(projectId));

  if (!project) {
    return <div className="py-24 text-center">Project not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-16"
    >
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter">{project.title}</h1>
        <p className="text-sm tracking-widest text-black/60 mt-2">
          {project.category} ・ {project.date}
        </p>
      </div>

      <div className="space-y-8">
        {project.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${project.title} ${index + 1}`}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        ))}
      </div>

      <div className="text-center mt-16">
        <Link to="/" className="text-sm font-bold uppercase tracking-widest hover:text-tan transition-colors">
          &larr; Back to Portfolio
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectDetailPage;
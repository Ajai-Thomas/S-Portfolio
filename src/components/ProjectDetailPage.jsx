// src/components/ProjectDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectIndex = projects.findIndex((p) => p.id === parseInt(projectId));
  const project = projects[projectIndex];

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (project && project.images.length > 0) {
      setSelectedImage(project.images[0]);
    }
  }, [project]);

  if (!project) {
    return <div className="py-24 text-center">Project not found.</div>;
  }

  const goToNextProject = () => {
    const nextProject = projects[projectIndex + 1];
    if (nextProject) {
      navigate(`/project/${nextProject.id}`);
    }
  };

  const goToPreviousProject = () => {
    const previousProject = projects[projectIndex - 1];
    if (previousProject) {
      navigate(`/project/${previousProject.id}`);
    }
  };


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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Main Image Viewer */}
        <div className="md:col-span-3 h-[80vh] relative rounded-lg overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt="Enlarged view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
          </AnimatePresence>
        </div>

        {/* Vertical Thumbnail Gallery */}
        <div className="h-[80vh] overflow-y-auto space-y-4 pr-2">
          {project.images.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                selectedImage === image ? 'border-tan' : 'border-transparent'
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image}
                alt={`${project.title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <div>
          {projects[projectIndex - 1] && (
             <button onClick={goToPreviousProject} className="text-sm font-bold uppercase tracking-widest hover:text-tan transition-colors">
               &larr; Previous Project
             </button>
          )}
        </div>

        <Link to="/" className="text-sm font-bold uppercase tracking-widest hover:text-tan transition-colors">
          Back to Portfolio
        </Link>

        <div>
          {projects[projectIndex + 1] && (
            <button onClick={goToNextProject} className="text-sm font-bold uppercase tracking-widest hover:text-tan transition-colors">
              Next Project &rarr;
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetailPage;
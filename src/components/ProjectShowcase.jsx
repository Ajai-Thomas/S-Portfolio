// src/components/ProjectShowcase.jsx
import { motion } from 'framer-motion';
import { projects } from '../data/projects'; // Your project data

const ProjectShowcase = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
      {/* Left Column: Sticky Project Titles */}
      <div className="md:sticky top-24 self-start">
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-4">
          VISUAL STORYTELLING
        </h1>
        <p className="mb-8 max-w-md">
          I Don't Take Shots Anymore. I Take My Time To Observe And Then Capture.
        </p>
        <ul className="space-y-4">
          {projects.map((project, index) => (
            <li key={project.id} className="text-xl font-medium text-black/50">
              <span className="text-black">{String(index + 1).padStart(2, '0')}</span> {project.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Scrolling Image Galleries */}
      <div className="space-y-24">
        {projects.map((project) => (
          <div key={project.id}>
            {project.images.map((image, imgIndex) => (
              <motion.img
                key={imgIndex}
                src={image}
                alt={`${project.title} ${imgIndex + 1}`}
                className="w-full h-auto mb-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: imgIndex * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectShowcase;
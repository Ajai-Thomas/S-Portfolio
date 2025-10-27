// src/components/ProjectCard.jsx
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
  return (
    <div
      key={project.id}
      className="group relative h-[450px] w-[450px] overflow-hidden bg-neutral-200"
    >
      <div
        style={{
          backgroundImage: `url(${project.images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
      ></div>
      <div className="absolute inset-0 z-10 grid place-content-center bg-black/60">
        <p className="bg-gradient-to-br from-white/20 to-white/0 p-8 text-4xl font-black uppercase text-white backdrop-blur-lg">
          {project.title}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
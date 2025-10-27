// src/components/ProjectSection.jsx
const ProjectSection = ({ project, projectNumber }) => {
  return (
    <div className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <img src={project.images[0]} alt={`${project.title} 1`} className="h-96 w-full object-cover" />
        <img src={project.images[1]} alt={`${project.title} 2`} className="h-96 w-full object-cover" />
        <img src={project.images[2]} alt={`${project.title} 3`} className="h-96 w-full object-cover" />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium">{project.title} &rarr;</h2>
          <p className="text-xs tracking-widest text-black/60">{project.date}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{String(projectNumber).padStart(2, '0')}</p>
          <p className="text-xs tracking-widest">{project.category}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectSection;
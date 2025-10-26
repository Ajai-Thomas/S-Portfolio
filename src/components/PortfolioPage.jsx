import ProjectSection from './ProjectSection';
import Hero from './Hero';
import { projects } from '../data/projects'; // Import your project data

const PortfolioPage = () => {
  return (
    <>
      <Hero />
      {projects.map((project, index) => (
        <ProjectSection
          key={project.id}
          title={project.title}
          date={project.date}
          category={project.category}
          projectNumber={index + 1}
          images={project.images}
        />
      ))}
    </>
  );
};

export default PortfolioPage;
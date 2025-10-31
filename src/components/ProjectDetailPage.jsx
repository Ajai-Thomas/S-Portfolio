// src/components/ProjectDetailPage.jsx
import { useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxImage = ({ src, alt }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

    return (
        <div ref={ref} className="overflow-hidden rounded-lg shadow-lg">
            <motion.img
                src={src}
                alt={alt}
                style={{ y }}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const projectIndex = projects.findIndex((p) => p.id === parseInt(projectId));
    const project = projects[projectIndex];

    if (!project) {
        return <div className="py-24 text-center">Project not found.</div>;
    }

    const goToNextProject = () => {
        const nextProject = projects[projectIndex + 1];
        if (nextProject) navigate(`/project/${nextProject.id}`);
    };

    const goToPreviousProject = () => {
        const previousProject = projects[projectIndex - 1];
        if (previousProject) navigate(`/project/${previousProject.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="py-16"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                
                {/* --- Left Column (Sticky & Cleaned Up) --- */}
                <div className="md:sticky md:top-24 h-fit">
                    {/* Reordered for better hierarchy */}
                    <p className="text-sm tracking-widest text-black/60 mb-2">
                        {project.category} ・ {project.date}
                    </p>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-6">{project.title}</h1>
                    
                    <p className="text-black/70 max-w-md mb-16">
                        A brief showcase of the '{project.title}' project, highlighting the key visual elements and the story behind the shots. Each image is carefully selected to represent the collection's core theme.
                    </p>

                    {/* Neatly grouped navigation links */}
                    <div className="flex flex-col items-start space-y-4 text-sm font-bold uppercase tracking-widest">
                        <Link to="/" className="hover:text-tan transition-colors">
                            Back to Portfolio
                        </Link>
                        
                        <div className="flex gap-8 pt-2">
                             {projects[projectIndex - 1] && (
                                <button onClick={goToPreviousProject} className="hover:text-tan transition-colors">
                                    &larr; Previous
                                </button>
                            )}
                            {projects[projectIndex + 1] && (
                                <button onClick={goToNextProject} className="hover:text-tan transition-colors">
                                    Next &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Right Column (Scrollable Image Gallery) --- */}
                <div className="space-y-8">
                    {project.images.map((image, index) => (
                        <ParallaxImage
                            key={index}
                            src={image}
                            alt={`${project.title} shot ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetailPage;
// src/components/PortfolioPage.jsx
import { useRef, useState, useEffect } from 'react'; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from './Hero';
// import ParallaxShowcase from './ParallaxShowcase'; // Removed
import { client } from '../sanity'; 

// -------------------------------------------------------------------
// Helper: Convert Drive Share Link -> Direct Image Link
// -------------------------------------------------------------------
const getDirectLink = (url) => {
    if (!url) return '';
    // Check if it is a Google Drive Link
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/[-\w]{25,}/);
        if (idMatch) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }
    }
    return url;
};

// -----------------------------------------------------------
// 1. Scrolling Components (Project List)
// -----------------------------------------------------------
const ProjectDetails = ({ project, index, progress, totalProjects }) => {
    const start = index / totalProjects;
    const end = (index + 1) / totalProjects;
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    const y = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
        <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-center justify-center">
            <div className="w-full text-left"> 
                <div className="inline-flex items-center gap-4 mb-3">
                    <p className="font-bold text-lg text-tan">{String(index + 1).padStart(2, '0')}</p>
                    <p className="text-xs tracking-widest text-black/60">{project.category}</p>
                </div>
                <Link to={`/project/${project._id}`}>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 hover:text-tan transition-colors duration-300">{project.title}</h2>
                </Link>
                <p className="text-sm tracking-widest text-black/70">{project.date}</p>
            </div>
        </motion.div>
    );
};

const ProjectImage = ({ project, index, progress, totalProjects }) => {
    const start = index / totalProjects;
    const end = (index + 1) / totalProjects;
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    const x = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
         <motion.div style={{ opacity, x }} className="absolute inset-0 flex items-center justify-center">
             <Link to={`/project/${project._id}`} className="block w-full h-full">
                <img
                    src={getDirectLink(project.coverImageUrl)} 
                    alt={`${project.title} cover`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                />
            </Link>
        </motion.div>
    )
}

const ScrollShowcase = ({ projects }) => {
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ['start start', 'end end'],
    });

    const totalProjects = projects.length;
    const sectionHeight = Math.max(1, totalProjects) * 600; 
    
    return (
        <section 
            ref={scrollRef} 
            className="relative"
            style={{ height: `${sectionHeight}vh` }} 
        >
            <div className="sticky top-0 h-screen grid grid-cols-1 md:grid-cols-2 gap-x-16 items-center overflow-hidden px-6">
                <div className="relative h-full flex items-center justify-center overflow-hidden">
                    {projects.map((project, index) => (
                        <ProjectDetails 
                            key={project._id} 
                            project={project} 
                            index={index} 
                            progress={scrollYProgress} 
                            totalProjects={totalProjects} 
                        />
                    ))}
                </div>
                <div className="relative w-full h-1/2 md:h-2/3 px-8 overflow-hidden">
                     {projects.map((project, index) => (
                        <ProjectImage 
                            key={project._id} 
                            project={project} 
                            index={index} 
                            progress={scrollYProgress} 
                            totalProjects={totalProjects}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// -----------------------------------------------------------
// 2. Main PortfolioPage Component
// -----------------------------------------------------------
const PortfolioPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = `*[_type == "project"] | order(date desc) {
            _id,
            title,
            category,
            date,
            "coverImageUrl": coalesce(mediaItems[0].url, mediaItems[0].asset->url)
        }`;

        client.fetch(query)
            .then((data) => {
                const validProjects = data.filter(p => p.coverImageUrl);
                setProjects(validProjects);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) {
        return <div className="text-center py-24">Loading Portfolio...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* 1. Top Hero Section */}
            <Hero />

            {/* REMOVED: ParallaxShowcase (Floating Images) */}
            
            {/* 2. Project List Section */}
            <ScrollShowcase projects={projects} />
            
        </motion.div>
    );
};

export default PortfolioPage;
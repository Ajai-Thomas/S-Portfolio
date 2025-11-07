// src/components/PortfolioPage.jsx
import { useRef, useState, useEffect } from 'react'; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import { client } from '../sanity'; // Client for Sanity API calls

// -----------------------------------------------------------
// 1. Helper Components (Scrolling Logic)
// -----------------------------------------------------------

// This component handles the VERTICAL "snap" animation for the text.
const ProjectDetails = ({ project, index, progress, totalProjects }) => {
    // Determine the scroll window for this project
    const start = index / totalProjects;
    const end = (index + 1) / totalProjects;

    // Animation logic
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    const y = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
        // Renders the project details text overlay
        <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-center justify-center">
            
            {/* FIX APPLIED: Changed alignment to consistently left-aligned */}
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

// This component handles the HORIZONTAL "snap" animation for the images.
const ProjectImage = ({ project, index, progress, totalProjects }) => {
    // Determine the scroll window for this project
    const start = index / totalProjects;
    const end = (index + 1) / totalProjects;

    // Animation logic
    const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    const x = useTransform(progress, [start, end], ['50%', '-50%']);

    return (
         <motion.div style={{ opacity, x }} className="absolute inset-0 flex items-center justify-center">
             <Link to={`/project/${project._id}`} className="block w-full h-full">
                <img
                    // Uses the fetched coverImageUrl from the query
                    src={project.coverImageUrl} 
                    alt={`${project.title} cover`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                />
            </Link>
        </motion.div>
    )
}

// -----------------------------------------------------------
// 2. Component to Isolate Scrolling Logic (Handles Dynamic Height)
// -----------------------------------------------------------

const ScrollShowcase = ({ projects }) => {
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ['start start', 'end end'],
    });

    const totalProjects = projects.length;
    
    // Calculates height dynamically and applies via inline style (Tailwind safe)
    const sectionHeight = Math.max(1, totalProjects) * 600; 
    
    return (
        <section 
            ref={scrollRef} 
            className="relative"
            // Apply the calculated height via React's style attribute
            style={{ height: `${sectionHeight}vh` }} 
        >
            <div className="sticky top-0 h-screen grid grid-cols-1 md:grid-cols-2 gap-x-12 items-center overflow-hidden">
                
                {/* Left Column: Text Overlays */}
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

                {/* Right Column: Image Overlays */}
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
// 3. Main PortfolioPage Component
// -----------------------------------------------------------

const PortfolioPage = () => {
    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetches all projects, orders by date, and gets the URL of the first media item for the cover
        const query = `*[_type == "project"] | order(date desc) {
            _id,
            title,
            category,
            date,
            "coverImageUrl": mediaItems[0].url, // Correctly retrieves the URL from the mediaItems array
        }`;

        client.fetch(query)
            .then((data) => {
                // Only keep projects that actually have a cover image URL
                setProjects(data.filter(p => p.coverImageUrl)); 
                setLoading(false);
            })
            .catch(console.error);
    }, []);


    if (loading) {
        return <div className="text-center py-24">Loading Portfolio...</div>;
    }

    if (projects.length === 0) {
        return <div className="text-center py-24">No published projects found.</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hero />
            
            {/* Renders the scrolling section only when data is loaded */}
            <ScrollShowcase projects={projects} />
            
        </motion.div>
    );
};

export default PortfolioPage;
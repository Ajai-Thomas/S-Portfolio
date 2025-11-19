// src/components/ProjectDetailPage.jsx
import { useRef, useState, useEffect } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { client } from '../sanity'; 
import { motion, useScroll, useTransform } from 'framer-motion';

// -------------------------------------------------------------------
// Helper: Convert Drive Share Link -> Direct Image Link
// -------------------------------------------------------------------
const getDirectLink = (url) => {
  if (!url) return '';
  
  // Check if it is a Google Drive Link
  if (url.includes('drive.google.com')) {
    // Extract the ID
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) {
      // Return the export=view format which acts as a direct image source
      return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
    }
  }
  
  // Return original URL if it's not Google Drive (e.g. Unsplash, standard image)
  return url;
};

// -------------------------------------------------------------------
// Helper component to convert YouTube URL to Embed URL
// -------------------------------------------------------------------
const extractYouTubeEmbed = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0`;
    }
    return url; // Fallback to original URL if not recognized
};

// Component to render an embedded video
const VideoEmbed = ({ src, title }) => {
    const embedSrc = extractYouTubeEmbed(src);

    return (
        <div className="relative pt-[56.25%] overflow-hidden rounded-lg shadow-lg">
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedSrc}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

// -------------------------------------------------------------------
// Parallax Image Component
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// ProjectDetailPage: Main Component
// -------------------------------------------------------------------

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the list of all project IDs (for navigation)
        const listQuery = `*[_type == "project"] | order(date desc) {
            _id,
        }`;
        
        // Fetch the current project details, including all media items
        // NOTE: We use coalesce() here. It checks 'url' (external link). 
        // If that is null, it fetches 'asset->url' (sanity upload).
        const detailQuery = `*[_type == "project" && _id == $projectId][0] {
            _id,
            title,
            category,
            date,
            excerpt,
            "mediaItems": mediaItems[]{
                ...,
                "url": coalesce(url, asset->url), 
                "alt": alt
            }
        }`;

        Promise.all([
            client.fetch(listQuery),
            client.fetch(detailQuery, { projectId })
        ]).then(([listData, detailData]) => {
            setProjectsList(listData);
            setProject(detailData);
            setLoading(false);
        }).catch(console.error);
    }, [projectId]);

    const currentProjectIndex = projectsList.findIndex(p => p._id === projectId);
    const previousProject = projectsList[currentProjectIndex - 1];
    const nextProject = projectsList[currentProjectIndex + 1];

    const goToNextProject = () => {
        if (nextProject) navigate(`/project/${nextProject._id}`);
    };

    const goToPreviousProject = () => {
        if (previousProject) navigate(`/project/${previousProject._id}`);
    };

    if (loading) {
        return <div className="py-24 text-center">Loading Project...</div>;
    }

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                
                {/* --- Left Column --- */}
                <div className="md:sticky md:top-24 h-fit">
                    <p className="text-sm tracking-widest text-black/60 mb-2">
                        {project.category} ・ {project.date}
                    </p>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-6">{project.title}</h1>
                    
                    <p className="text-black/70 max-w-md mb-16">
                        {project.excerpt}
                    </p>

                    {/* Navigation links */}
                    <div className="flex flex-col items-start space-y-4 text-sm font-bold uppercase tracking-widest">
                        <Link to="/" className="hover:text-tan transition-colors">
                            Back to Portfolio
                        </Link>
                        
                        <div className="flex gap-8 pt-2">
                             {previousProject && (
                                <button onClick={goToPreviousProject} className="hover:text-tan transition-colors">
                                    &larr; Previous
                                </button>
                            )}
                            {nextProject && (
                                <button onClick={goToNextProject} className="hover:text-tan transition-colors">
                                    Next &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Right Column (Scrollable Image/Video Gallery) --- */}
                <div className="space-y-8">
                    {project.mediaItems && project.mediaItems.map((item, index) => {
                        
                        // Convert URL if it's a Google Drive link
                        const directUrl = getDirectLink(item.url);

                        return (
                            <div key={index}>
                                {/* Renders VideoEmbed for YouTube, or ParallaxImage for all others */}
                                {item.type === 'youtube' ? (
                                    <VideoEmbed src={item.url} title={item.alt || project.title} />
                                ) : (
                                    <ParallaxImage
                                        src={directUrl}
                                        alt={item.alt || `${project.title} shot ${index + 1}`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetailPage;
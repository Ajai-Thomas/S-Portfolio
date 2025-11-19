// src/components/GalleryPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { client } from '../sanity';
import DomeGallery from './DomeGallery';

const getDirectLink = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
  }
  return url;
};

// Accept preloadedImages prop to avoid re-fetching
const GalleryPage = ({ preloadedImages = [] }) => {
    // Initialize state with preloaded images if available
    const [allImages, setAllImages] = useState(preloadedImages);
    // Only show loading if we don't have images yet
    const [loading, setLoading] = useState(!preloadedImages || preloadedImages.length === 0);

    useEffect(() => {
        // If we already have images passed from App.jsx, use them and stop loading
        if (preloadedImages && preloadedImages.length > 0) {
            setAllImages(preloadedImages);
            setLoading(false);
            return;
        }

        // Fallback: Fetch data if user goes directly to /gallery (refresh)
        const query = `*[_type == "project"] {
            "allMedia": mediaItems[]{
                "url": coalesce(url, asset->url)
            }
        }`;

        client.fetch(query)
            .then((data) => {
                const images = data
                    .flatMap(p => p.allMedia || [])
                    .map(m => getDirectLink(m.url))
                    .filter(Boolean);
                
                setAllImages(images);
                setLoading(false);
            })
            .catch(console.error);
    }, [preloadedImages]);

    if (loading) {
        return <div className="w-full h-screen bg-black text-white flex items-center justify-center">Loading Gallery...</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="w-full h-screen bg-black overflow-hidden relative z-0"
        >
            <div className="w-full h-full">
                <DomeGallery images={allImages} />
            </div>
        </motion.div>
    );
};

export default GalleryPage;
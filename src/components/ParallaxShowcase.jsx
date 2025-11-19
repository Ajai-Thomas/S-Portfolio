// src/components/ParallaxShowcase.jsx
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { client } from '../sanity';

const staticShowcaseProps = [
  { y: [-100, 200], className: "w-[30%] h-[40%] top-[10%] left-[10%]" },
  { y: [50, -150], className: "w-[25%] h-[30%] top-[20%] right-[12%]" },
  { y: [-200, 100], className: "w-[20%] h-[25%] bottom-[15%] left-[25%]" },
  { y: [150, -50], className: "w-[35%] h-[45%] bottom-[10%] right-[8%]" },
];

const ParallaxShowcase = () => {
  const containerRef = useRef(null);
  
  const [showcaseImages, setShowcaseImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use coalesce to support both Links and Uploads here as well
    const query = `*[_type == "project"][0...4] | order(date desc) {
        _id,
        "src": coalesce(mediaItems[0].url, mediaItems[0].asset->url)
    }`;

    client.fetch(query)
      .then((data) => {
        const combinedImages = data
          .filter(item => item.src) 
          .map((item, i) => ({
            src: item.src,
            ...staticShowcaseProps[i], 
            key: item._id,
          }));
          
        setShowcaseImages(combinedImages);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  if (loading) {
      return <div className="text-center py-24">Loading Visual Showcase...</div>;
  }
  
  if (showcaseImages.length === 0) {
      return (
        <section ref={containerRef} className="relative h-[100vh] mb-24 -mx-6 md:-mx-16">
             <div className="sticky top-0 h-screen flex items-center justify-center z-10 pointer-events-none">
                 <h1 className="text-8xl md:text-9xl font-black text-ivory mix-blend-difference">A.T.</h1>
             </div>
        </section>
      );
  }

  return (
    <section ref={containerRef} className="relative h-[200vh] mb-24 -mx-6 md:-mx-16">
      <div className="sticky top-0 h-screen flex items-center justify-center z-10 pointer-events-none">
         <h1 className="text-8xl md:text-9xl font-black text-ivory mix-blend-difference">
           A.T.
         </h1>
      </div>

      {showcaseImages.map((image, i) => {
          const y = useTransform(scrollYProgress, [0, 1], image.y);
          return (
              <motion.div key={image.key} style={{ y }} className={`absolute ${image.className}`}>
                  <img src={image.src} alt="Showcase" className="w-full h-full object-cover rounded-lg" />
              </motion.div>
          )
      })}
    </section>
  );
};

export default ParallaxShowcase;
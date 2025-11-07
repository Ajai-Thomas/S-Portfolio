// src/components/ParallaxShowcase.jsx
import { useRef, useState, useEffect } from 'react'; // ADDED useState, useEffect
import { motion, useScroll, useTransform } from 'framer-motion';
// import { projects } from '../data/projects'; // REMOVED old import
import { client } from '../sanity'; // ADDED client import

// NOTE: Showcase Images array is now dynamically generated in the component,
// but we define the static animation properties here.
const staticShowcaseProps = [
  { y: [-100, 200], className: "w-[30%] h-[40%] top-[10%] left-[10%]" },
  { y: [50, -150], className: "w-[25%] h-[30%] top-[20%] right-[12%]" },
  { y: [-200, 100], className: "w-[20%] h-[25%] bottom-[15%] left-[25%]" },
  { y: [150, -50], className: "w-[35%] h-[45%] bottom-[10%] right-[8%]" },
];

const ParallaxShowcase = () => {
  const containerRef = useRef(null);
  
  // ADDED: State for data fetching
  const [showcaseImages, setShowcaseImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch up to 4 projects, ordered by date, and get the cover image URL
    // We fetch a list of objects containing the URL and the static CSS properties
    const query = `*[_type == "project"][0...4] | order(date desc) {
        _id,
        "src": mediaItems[0].url, // Use the cover image URL from mediaItems
    }`;

    client.fetch(query)
      .then((data) => {
        // Map the fetched data (src) with the static animation properties (y, className)
        const combinedImages = data
          .filter(item => item.src) // Ensure we only use items with a valid URL
          .map((item, i) => ({
            src: item.src,
            ...staticShowcaseProps[i], // Assign animation/layout properties
            key: item._id, // Use Sanity ID as key
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

  // Display a loading message or nothing while data loads
  if (loading) {
      return <div className="text-center py-24">Loading Visual Showcase...</div>;
  }
  
  // If no projects are published, render nothing but the fixed text
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
         {/* REVERTED: Text color is now ivory with a mix-blend-difference to work on your background */}
         <h1 className="text-8xl md:text-9xl font-black text-ivory mix-blend-difference">
           A.T.
         </h1>
      </div>

      {/* Use the dynamically created showcaseImages array */}
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
// src/components/ParallaxShowcase.jsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { projects } from '../data/projects';

const showcaseImages = [
  { src: projects[3].images[1], y: [-100, 200], className: "w-[30%] h-[40%] top-[10%] left-[10%]" },
  { src: projects[2].images[2], y: [50, -150], className: "w-[25%] h-[30%] top-[20%] right-[12%]" },
  { src: projects[4].images[0], y: [-200, 100], className: "w-[20%] h-[25%] bottom-[15%] left-[25%]" },
  { src: projects[0].images[2], y: [150, -50], className: "w-[35%] h-[45%] bottom-[10%] right-[8%]" },
];

const ParallaxShowcase = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={containerRef} className="relative h-[200vh] mb-24 -mx-6 md:-mx-16">
      <div className="sticky top-0 h-screen flex items-center justify-center z-10 pointer-events-none">
         {/* REVERTED: Text color is now ivory with a mix-blend-difference to work on your background */}
         <h1 className="text-8xl md:text-9xl font-black text-ivory mix-blend-difference">
           A.T.
         </h1>
      </div>

      {showcaseImages.map((image, i) => {
          const y = useTransform(scrollYProgress, [0, 1], image.y);
          return (
              <motion.div key={i} style={{ y }} className={`absolute ${image.className}`}>
                  <img src={image.src} alt="Showcase" className="w-full h-full object-cover rounded-lg" />
              </motion.div>
          )
      })}
    </section>
  );
};

export default ParallaxShowcase;
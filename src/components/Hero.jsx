// src/components/Hero.jsx
import BrushStrokeAnimation from './BrushStrokeAnimation';
import { motion } from 'framer-motion';

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Hero = () => {
  const title = "VISUAL STORYTELLING";

  return (
    // The container must be relative and hide overflow
    <div className="relative text-center py-24 md:py-32 overflow-hidden">
      
      {/* The Brush Stroke Animation Component */}
      <BrushStrokeAnimation />

      {/* Your text content needs a higher z-index to stay on top */}
      <div className="relative z-10">
        <motion.h1
          className="text-6xl lg:text-8xl font-black tracking-tighter"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          {title.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants}>
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <p className="mt-4 text-sm max-w-md mx-auto">
          I Don't Take Shots Anymore. I Take My Time To Observe And Then Capture.
        </p>
      </div>

    </div>
  );
};

export default Hero;
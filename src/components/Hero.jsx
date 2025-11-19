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
    // CHANGED: 'min-h-[60vh]' to 'h-screen' to make it full height.
    // This ensures 'justify-center' puts the text exactly in the middle of the user's screen.
    <div className="relative flex flex-col items-center justify-center h-screen text-center overflow-hidden -mt-20 md:-mt-24">
      
      {/* The Brush Stroke Animation Component */}
      <BrushStrokeAnimation />

      {/* Content Container */}
      <div className="relative z-10 px-4">
        <motion.h1
          className="text-6xl lg:text-8xl font-black tracking-tighter mx-auto" 
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          {title.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants} className="inline-block">
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>
        
        <p className="mt-6 text-sm max-w-md mx-auto">
          I Don't Take Shots Anymore. I Take My Time To Observe And Then Capture.
        </p>
      </div>

    </div>
  );
};

export default Hero;
// src/components/BrushStrokeAnimation.jsx
import { motion } from 'framer-motion';

const BrushStrokeAnimation = () => {
  const blobTransition = {
    repeat: Infinity,
    repeatType: 'mirror',
    ease: 'easeInOut',
  };

  return (
    // CHANGE: Removed opacity-50 to make the animation fully opaque
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ filter: 'url(#gooey)' }}>
      {/* Blob 1 */}
      <motion.div
        // CHANGE: Changed color to your darker 'tan'
        className="absolute top-[10%] left-[10%] w-48 h-48 bg-tan rounded-full"
        animate={{ x: [0, 60, 0, -40, 0], y: [0, -30, 50, -10, 0] }}
        transition={{ ...blobTransition, duration: 18 }}
      />
      {/* Blob 2 */}
      <motion.div
        // CHANGE: Changed color to your lighter 'beige'
        className="absolute top-[50%] left-[60%] w-64 h-64 bg-beige rounded-full"
        animate={{ x: [0, -40, 30, 0], y: [0, 60, -20, 0] }}
        transition={{ ...blobTransition, duration: 22, delay: 2 }}
      />
      {/* Blob 3 */}
      <motion.div
        className="absolute bottom-[5%] right-[5%] w-40 h-40 bg-tan rounded-full"
        animate={{ x: [0, 20, -30, 0], y: [0, -50, 40, 0] }}
        transition={{ ...blobTransition, duration: 16, delay: 4 }}
      />
       {/* Blob 4 */}
      <motion.div
        className="absolute bottom-[20%] left-[30%] w-32 h-32 bg-beige rounded-full"
        animate={{ x: [0, -20, 40, 0], y: [0, 30, -40, 0] }}
        transition={{ ...blobTransition, duration: 19, delay: 6 }}
      />
    </div>
  );
};

export default BrushStrokeAnimation;
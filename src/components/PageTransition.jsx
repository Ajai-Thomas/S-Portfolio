// src/components/PageTransition.jsx
import { motion } from 'framer-motion';

const pageVariants = {
  // A page starts slightly scaled down and faded out
  initial: {
    opacity: 0,
    scale: 0.99,
  },
  // The page animates to full scale and opacity
  in: {
    opacity: 1,
    scale: 1,
  },
  // The page fades out and scales down slightly on exit
  out: {
    opacity: 0,
    scale: 0.99,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate', // A smooth, gentle easing
  duration: 0.6,
};

const PageTransition = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

export default PageTransition;
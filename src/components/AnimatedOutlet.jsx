// src/components/AnimatedOutlet.jsx
import { useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const AnimatedOutlet = () => {
  const o = useOutlet();

  return (
    <AnimatePresence mode="wait">
      {o && (
        <motion.div
          key={o.props.children.props.match.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {o}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
// src/components/AboutPage.jsx
import About from './About';
import { motion } from 'framer-motion';

const AboutPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <About />
  </motion.div>
);

export default AboutPage;
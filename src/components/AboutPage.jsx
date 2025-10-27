// src/components/AboutPage.jsx
import About from './About';
import { motion } from 'framer-motion';
const AboutPage = () => (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <About />
    </motion.div>
);
export default AboutPage;
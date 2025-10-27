// src/components/ContactPage.jsx
import ContactForm from './ContactForm';
import { motion } from 'framer-motion';

const ContactPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
    <h2 className="text-center text-4xl font-black tracking-tighter mb-16">GET IN TOUCH</h2>
    <ContactForm />
  </motion.div>
);

export default ContactPage;
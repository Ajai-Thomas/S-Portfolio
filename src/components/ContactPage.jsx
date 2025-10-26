// src/components/ContactPage.jsx
import { useState } from 'react';
import Banner from './Banner';

// You can replace this URL with any image from the web
const bannerImageUrl = "https://images.unsplash.com/photo-1501862700949-c86198e6424b?w=1600&q=80";

const ContactPage = () => {
  // State and handlers remain the same
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');
    setTimeout(() => {
      console.log('Form Submitted:', formData);
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div>
      <Banner title="GET IN TOUCH" image={bannerImageUrl} />
      
      <div className="max-w-xl mx-auto py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium tracking-wider uppercase">Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium tracking-wider uppercase">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium tracking-wider uppercase">Message</label>
            <textarea name="message" id="message" rows="6" value={formData.message} onChange={handleChange} required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan"></textarea>
          </div>
          <div>
            <button type="submit" className="w-full bg-tan text-ivory font-bold py-4 px-6 hover:bg-opacity-90 transition-colors">
              Send Message
            </button>
          </div>
        </form>
        {status && <p className="text-center mt-6">{status}</p>}
      </div>
    </div>
  );
};

export default ContactPage;
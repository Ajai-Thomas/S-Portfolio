// src/components/ContactForm.jsx
import { useState } from 'react';

const ContactForm = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');
    // Simulate a network request
    setTimeout(() => {
      setStatus('Message sent successfully!');
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium tracking-wider uppercase">Name</label>
          <input type="text" name="name" id="name" required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan"/>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium tracking-wider uppercase">Email</label>
          <input type="email" name="email" id="email" required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan"/>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium tracking-wider uppercase">Message</label>
          <textarea name="message" id="message" rows="6" required className="mt-1 block w-full bg-white/20 border-black/20 p-3 focus:ring-tan focus:border-tan"></textarea>
        </div>
        <div>
          <button type="submit" className="w-full bg-tan text-ivory font-bold py-4 px-6 hover:bg-opacity-90 transition-colors">Send Message</button>
        </div>
      </form>
      {status && <p className="text-center mt-6">{status}</p>}
    </div>
  );
};

export default ContactForm;
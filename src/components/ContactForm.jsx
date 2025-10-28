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
          <input
            type="text"
            name="name"
            id="name"
            required
            // CHANGE: Added a visible background and border
            className="mt-1 block w-full border border-beige bg-antique-white p-3 transition-colors focus:border-tan focus:ring-tan"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium tracking-wider uppercase">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            // CHANGE: Added a visible background and border
            className="mt-1 block w-full border border-beige bg-antique-white p-3 transition-colors focus:border-tan focus:ring-tan"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium tracking-wider uppercase">Message</label>
          <textarea
            name="message"
            id="message"
            rows="6"
            required
            // CHANGE: Added a visible background and border
            className="mt-1 block w-full border border-beige bg-antique-white p-3 transition-colors focus:border-tan focus:ring-tan"
          ></textarea>
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
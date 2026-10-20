import { useState } from 'react';
import { SectionHead } from './Chrome';

export default function Contact({ contact }) {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // No backend: the form opens the visitor's mail client with the message filled in.
  const submit = (e) => {
    e.preventDefault();
    const body = `${f.message}\n\n— ${f.name} (${f.email})`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('Shoot enquiry from ' + f.name)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className="pf-section pf-contact" aria-labelledby="contact-title">
      <div className="pf-wrap">
        <SectionHead n={5} title="Contact" kicker="BOOK" />
        <h2 id="contact-title" className="pf-contact__big pf-reveal">
          {contact.heading}<br /><em>{contact.subheading}</em>
        </h2>

        <div className="pf-contact__grid">
          <div className="pf-reveal">
            <a className="pf-contact__mail" href={`mailto:${contact.email}`}>{contact.email}</a>
            <ul className="pf-socials">
              {contact.socials.map((s) => (
                <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label} <span aria-hidden="true">↗</span></a></li>
              ))}
            </ul>
          </div>

          <form className="pf-form pf-reveal" onSubmit={submit}>
            <label>Name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label>Email<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
            <label>Tell me about the shoot<textarea required rows="4" value={f.message} onChange={set('message')} /></label>
            <button type="submit" className="pf-shutter">
              <span className="pf-shutter__btn" aria-hidden="true"><i /></span>
              <span className="pf-mono">Book a shoot</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

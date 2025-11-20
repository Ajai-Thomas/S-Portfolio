// src/components/About.jsx

const About = () => {
  return (
    // CHANGED: Reduced top padding from pt-48 to pt-32 based on user feedback
    <div className="pt-32 pb-24 grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12 items-start">
      <div className="font-sans">
        <h3 className="text-xs font-bold tracking-[0.2em] mb-6 uppercase text-black/40">Introduce Yourself</h3>
        <p className="text-2xl font-bold mb-4 font-display">Agnieszka Trefler</p>
        <p className="text-base leading-relaxed text-black/70 max-w-sm">
          My work is known from community festivals like Audioriver or Up To Date Festival. I professionally deal with photography and creating creative videos.
        </p>
      </div>
      
      {/* Cleaner look: Removed background spans, using bold Syne font for impact */}
      <div className="text-4xl lg:text-5xl leading-tight font-bold font-display uppercase text-black">
        Fascination with photography and capturing the moment gave me much joy so I began to collect photos as a specific kind of time travel.
      </div>
    </div>
  );
};

export default About;
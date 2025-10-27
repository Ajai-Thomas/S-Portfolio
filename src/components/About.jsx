// src/components/About.jsx

const About = () => {
  return (
    <div className="py-24 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 items-start">
      <div>
        <h3 className="text-sm tracking-widest mb-4">INTRODUCE YOURSELF</h3>
        <p className="text-xl font-medium">Agnieszka Trefler</p>
        <p className="text-sm mt-2 text-black/70">
          My work is known from community festivals like Audioriver or Up To Date Festival. I professionally deal with photography and creating creative videos.
        </p>
      </div>
      
      {/* CHANGE: The large text is now broken into spans with background colors */}
      <div className="text-4xl leading-snug font-medium">
        <span className="bg-beige px-2">FASCINATION WITH</span>{" "}
        <span className="bg-tan px-2 text-ivory">PHOTOGRAPHY AND</span>{" "}
        <span className="bg-beige px-2">CAPTURING THE MOMENT</span>{" "}
        <span className="bg-tan px-2 text-ivory">GAVE ME MUCH JOY SO I BEGAN TO</span>{" "}
        <span className="bg-beige px-2">COLLECT PHOTOS AS A SPECIFIC</span>{" "}
        <span className="bg-tan px-2 text-ivory">KIND OF TIME TRAVEL.</span>
      </div>
    </div>
  );
};

export default About;
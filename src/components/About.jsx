// src/components/About.jsx
const About = () => {
  return (
    <div className="py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
      <div>
        <h3 className="text-sm tracking-widest mb-4">INTRODUCE YOURSELF</h3>
        <p className="text-xl font-medium">Agnieszka Trefler</p>
        <p className="text-sm mt-2 text-black/70">
          My work is known from community festivals like Audioriver or Up To Date Festival. I professionally deal with photography and creating creative videos.
        </p>
      </div>
      <div>
        <p className="text-4xl leading-tight font-medium">
          FASCINATION WITH PHOTOGRAPHY AND CAPTURING THE MOMENT GAVE ME MUCH JOY SO I BEGAN TO COLLECT PHOTOS AS A SPECIFIC KIND OF TIME TRAVEL.
        </p>
      </div>
    </div>
  );
};

export default About;
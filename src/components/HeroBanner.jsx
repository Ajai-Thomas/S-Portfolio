// src/components/HeroBanner.jsx
const HeroBanner = () => {
    // Replace this with your desired banner image URL
    const bannerImageUrl = "https://images.unsplash.com/photo-1598188338920-1a2212d210f4?w=1600&q=80";
  
    return (
      <div
        className="h-[70vh] w-full bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
      >
        <div className="bg-black/30 w-full h-full flex flex-col justify-center items-center">
          <h1 className="text-7xl md:text-9xl font-serif">Portfolio</h1>
          <p className="mt-4 text-lg tracking-widest">Editorial ・ Campaigns ・ Portraiture</p>
        </div>
      </div>
    );
  };
  
  export default HeroBanner;
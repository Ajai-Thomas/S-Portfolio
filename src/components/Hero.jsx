// src/components/Hero.jsx
const Hero = () => {
    return (
      <div className="text-center py-16 md:py-24">
        {/* Make text smaller on mobile, larger on bigger screens */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter">
          VISUAL STORYTELLING
        </h1>
        <p className="mt-4 text-sm max-w-md mx-auto">
          I Don't Take Shots Anymore. I Take My Time To Observe And Then Capture.
        </p>
      </div>
    );
  };
  
  export default Hero;
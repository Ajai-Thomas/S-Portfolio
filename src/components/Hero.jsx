// src/components/Hero.jsx
import BrushStrokeAnimation from './BrushStrokeAnimation';

const Hero = () => {
  return (
    // The container must be relative and hide overflow
    <div className="relative text-center py-24 md:py-32 overflow-hidden">
      
      {/* The Brush Stroke Animation Component */}
      <BrushStrokeAnimation />

      {/* Your text content needs a higher z-index to stay on top */}
      <div className="relative z-10">
        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter">
          VISUAL STORYTELLING
        </h1>
        <p className="mt-4 text-sm max-w-md mx-auto">
          I Don't Take Shots Anymore. I Take My Time To Observe And Then Capture.
        </p>
      </div>

    </div>
  );
};

export default Hero;
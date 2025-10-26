// src/components/Banner.jsx
const Banner = ({ title, image }) => {
    return (
      <div
        className="h-64 md:h-80 bg-cover bg-center flex items-center justify-center my-16"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white">
            {title}
          </h1>
        </div>
      </div>
    );
  };
  
  export default Banner;
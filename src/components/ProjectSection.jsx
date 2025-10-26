// src/components/ProjectSection.jsx
const ProjectSection = ({ title, date, category, images, projectNumber }) => {
    return (
      <div className="py-16 group cursor-pointer"> {/* Add group and cursor-pointer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Add transition and group-hover effects to images */}
          <img src={images[0]} alt={`${title} 1`} className="object-cover w-full h-96 transition-transform duration-300 group-hover:scale-105" />
          <img src={images[1]} alt={`${title} 2`} className="object-cover w-full h-96 transition-transform duration-300 delay-75 group-hover:scale-105" />
          <img src={images[2]} alt={`${title} 3`} className="object-cover w-full h-96 transition-transform duration-300 delay-150 group-hover:scale-105" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            {/* Add transition and group-hover effect to title */}
            <h2 className="text-2xl font-medium transition-colors group-hover:text-tan">{title} &rarr;</h2>
            <p className="text-xs tracking-widest text-black/60">{date}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{projectNumber.toString().padStart(2, '0')}</p>
            <p className="text-xs tracking-widest">{category}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProjectSection;
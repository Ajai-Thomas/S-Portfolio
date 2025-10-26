const ProjectSection = ({ title, date, category, images, projectNumber }) => {
    return (
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <img src={images[0]} alt={`${title} 1`} className="object-cover w-full h-96" />
          <img src={images[1]} alt={`${title} 2`} className="object-cover w-full h-96" />
          <img src={images[2]} alt={`${title} 3`} className="object-cover w-full h-96" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-medium">{title} &rarr;</h2>
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
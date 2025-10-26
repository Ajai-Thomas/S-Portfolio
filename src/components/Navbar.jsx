const Navbar = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center gap-4 py-8 text-xs font-medium tracking-widest uppercase border-b border-black/10">
      <div>Agnieszka Trefler</div>
      <div className="flex gap-8">
        <a href="#" className="hover:opacity-70 transition-opacity">About</a>
        <a href="#" className="hover:opacity-70 transition-opacity">Portfolio</a>
        <a href="#" className="hover:opacity-70 transition-opacity">Blog</a>
      </div>
      <div className="flex gap-8">
        <span>Visual Storytelling Portfolio</span>
        <a href="#" className="hover:opacity-70 transition-opacity">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;
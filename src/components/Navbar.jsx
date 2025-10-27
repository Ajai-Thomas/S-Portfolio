// src/components/Navbar.jsx
import { Link } from 'react-scroll';

const Navbar = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center gap-4 py-8 text-xs font-medium tracking-widest uppercase border-b border-black/10">
      <div>Agnieszka Trefler</div>
      <div className="flex gap-8">
        <Link to="about" smooth={true} duration={500} offset={-50} className="cursor-pointer hover:opacity-70 transition-opacity">About</Link>
        <Link to="portfolio" smooth={true} duration={500} className="cursor-pointer hover:opacity-70 transition-opacity">Portfolio</Link>
        <a href="#" className="hover:opacity-70 transition-opacity">Blog</a>
      </div>
      {/* The extra text has been removed from this section */}
      <div className="flex gap-8">
        <Link to="contact" smooth={true} duration={500} className="cursor-pointer hover:opacity-70 transition-opacity">Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;
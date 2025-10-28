// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeStyle = {
    color: '#DEC19B', // Your 'tan' color
  };

  return (
    <nav className="flex flex-wrap justify-between items-center gap-4 py-8 text-xs font-medium tracking-widest uppercase border-b border-black/10">
      <div>
        <NavLink to="/" className="hover:opacity-70 transition-opacity">Agnieszka Trefler</NavLink>
      </div>
      <div className="flex gap-8">
        <NavLink to="/about" style={({ isActive }) => (isActive ? activeStyle : undefined)} className="hover:opacity-70 transition-opacity">About</NavLink>
        <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : undefined)} className="hover:opacity-70 transition-opacity" end>Portfolio</NavLink>
        {/* CHANGE: Updated this link */}
        <NavLink to="/blog" style={({ isActive }) => (isActive ? activeStyle : undefined)} className="hover:opacity-70 transition-opacity">Blog</NavLink>
      </div>
      <div className="flex gap-8">
        <NavLink to="/contact" style={({ isActive }) => (isActive ? activeStyle : undefined)} className="hover:opacity-70 transition-opacity">Contact</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // This function will apply a style to the active link
  const activeLinkStyle = ({ isActive }) => {
    return {
      color: isActive ? '#DEC19B' : '', // Your 'tan' color
    };
  };

  return (
    <nav className="flex flex-wrap justify-between items-center gap-y-4 gap-x-8 py-8 text-xs font-medium tracking-widest uppercase border-b border-black/10">
      <div className="flex-shrink-0">
        <NavLink to="/" className="hover:text-tan transition-colors">
          Agnieszka Trefler
        </NavLink>
      </div>
      <div className="flex gap-8">
        <NavLink to="/about" style={activeLinkStyle} className="hover:text-tan transition-colors">
          About
        </NavLink>
        <NavLink to="/" style={activeLinkStyle} className="hover:text-tan transition-colors" end>
          Portfolio
        </NavLink>
      </div>
      <div>
        <NavLink to="/contact" style={activeLinkStyle} className="hover:text-tan transition-colors">
          Contact
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
// src/components/Navbar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavItem = ({ to, children, end = false }) => {
  const activeStyle = {
    color: '#DEC19B', 
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
      <NavLink
        to={to}
        style={({ isActive }) => (isActive ? activeStyle : undefined)}
        className="hover:opacity-70 transition-opacity uppercase tracking-widest text-xs font-bold"
        end={end}
      >
        {children}
      </NavLink>
    </motion.div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isGallery = location.pathname === '/gallery';

  return (
    // If on Gallery, use white text. Otherwise use mix-blend-difference (inverse).
    <nav 
      className={`fixed top-0 left-0 w-full px-8 md:px-16 py-8 flex justify-between items-center z-50 
      ${isGallery ? 'text-white mix-blend-normal' : 'text-ivory mix-blend-difference'}`}
    >
      <NavLink to="/" className="text-xl font-black tracking-tighter">
        A.T.
      </NavLink>
      
      <div className="flex gap-8 md:gap-12">
        <NavItem to="/" end={true}>Work</NavItem>
        <NavItem to="/gallery">Gallery</NavItem>
        <NavItem to="/about">About</NavItem>
        <NavItem to="/blog">Blog</NavItem>
        <NavItem to="/contact">Contact</NavItem>
      </div>
    </nav>
  );
};

export default Navbar;
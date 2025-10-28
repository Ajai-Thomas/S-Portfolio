// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavItem = ({ to, children, end = false }) => {
  const activeStyle = {
    color: '#DEC19B', // Your 'tan' color
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
      <NavLink
        to={to}
        style={({ isActive }) => (isActive ? activeStyle : undefined)}
        className="hover:opacity-70 transition-opacity"
        end={end}
      >
        {children}
      </NavLink>
    </motion.div>
  );
};

const Navbar = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center gap-4 py-8 text-xs font-medium tracking-widest uppercase border-b border-black/10">
      <NavItem to="/">Agnieszka Trefler</NavItem>
      
      <div className="flex gap-8">
        <NavItem to="/about">About</NavItem>
        <NavItem to="/" end={true}>Portfolio</NavItem>
        <NavItem to="/blog">Blog</NavItem>
      </div>
      
      <div className="flex gap-8">
        <NavItem to="/contact">Contact</NavItem>
      </div>
    </nav>
  );
};

export default Navbar;
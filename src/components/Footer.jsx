// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="border-t border-black/10 mt-16 pt-8 pb-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs tracking-wider">
      <div>
        <p className="font-bold mb-2">Web</p>
        <a href="#" className="hover:opacity-70">GETINTOUCH@STORYTELLING.COM</a>
      </div>
      <div>
        <p className="font-bold mb-2">Socials</p>
        <a href="#" className="hover:opacity-70">@STORYTELLINGPHOTOGRAPHY</a>
      </div>
      <div>
        <p className="font-bold mb-2">Office</p>
        <p>WARSZAWA UL. ZŁOTA, WARSAW, POLAND</p>
      </div>
      <div className="text-left md:text-right mt-8 md:mt-0 col-span-2 md:col-span-1">
        <p>&copy; 2025 AGNIESZKA TREFLER</p>
      </div>
    </footer>
  );
};

export default Footer;
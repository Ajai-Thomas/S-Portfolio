// src/components/AboutPage.jsx
import About from './About';
import Banner from './Banner';

// You can replace this URL with any image from the web
const bannerImageUrl = "https://images.unsplash.com/photo-1501862700949-c86198e6424b?w=1600&q=80";

const AboutPage = () => {
  return (
    <div>
      <Banner title="ABOUT ME" image={bannerImageUrl} />
      <div className="py-12">
        <About />
      </div>
    </div>
  );
};

export default AboutPage;
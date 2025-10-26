import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectSection from './components/ProjectSection';
import About from './components/About';
import Footer from './components/Footer';

// --- Placeholder Images (replace these with your own) ---
const botanicImages = [
  "https://images.unsplash.com/photo-1542489241-831350284379?w=800&q=80",
  "https://images.unsplash.com/photo-1599940822984-b559b13a1727?w=800&q=80",
  "https://images.unsplash.com/photo-1557852643-552b202402a5?w=800&q=80",
];

const foodImages = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
];
// ---

function App() {
  return (
    <div className="bg-beige min-h-screen p-4 md:p-8 font-sans text-black">
      <div className="bg-antique-white max-w-7xl mx-auto px-6 md:px-16">
        <Navbar />
        <main>
          <Hero />
          <ProjectSection 
            title="Botanic Rapsody"
            date="22/08/2025"
            category="PRODUCT PHOTOGRAPHY"
            projectNumber={1}
            images={botanicImages}
          />
          <ProjectSection 
            title="Culinary Canvas"
            date="15/09/2025"
            category="FOOD PHOTOGRAPHY"
            projectNumber={2}
            images={foodImages}
          />
          <About />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
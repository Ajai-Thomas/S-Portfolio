// src/components/BlogPage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { blogPosts } from '../data/blogPosts'; // REMOVE old import
import { useState, useEffect } from 'react'; // ADD useState, useEffect
import { client } from '../sanity'; // ADD new import

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all blog posts, selecting only fields needed for the listing
    const query = `*[_type == "blogPost"] | order(date desc) {
      _id,
      title,
      date,
      excerpt,
    }`;

    client.fetch(query)
      .then((data) => {
        setBlogPosts(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
      return <div className="text-center py-24">Loading Diary...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-16"
    >
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black tracking-tighter">DIARY</h1>
        <p className="mt-2 text-sm text-black/60">Writings, thoughts, and stories.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {blogPosts.map((post) => (
          // Use post._id for the key and for the link
          <div key={post._id}>
            <p className="text-xs tracking-widest text-black/50 mb-2">{post.date}</p>
            <Link to={`/blog/${post._id}`}>
              <h2 className="text-3xl font-bold hover:text-tan transition-colors">{post.title}</h2>
            </Link>
            <p className="mt-3 text-black/70">{post.excerpt}</p>
            <Link to={`/blog/${post._id}`} className="text-sm font-bold mt-4 inline-block hover:text-tan transition-colors">
              Read More &rarr;
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BlogPage;
// src/components/BlogPostPage.jsx
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { blogPosts } from '../data/blogPosts'; // REMOVE old import
import { useState, useEffect } from 'react'; // ADD useState, useEffect
import { client } from '../sanity'; // ADD new import
import { PortableText } from '@portabletext/react'; // ADD PortableText

const BlogPostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a single blog post by its ID
    const query = `*[_type == "blogPost" && _id == $postId][0]`;

    client.fetch(query, { postId })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [postId]);

  if (loading) {
      return <div className="py-24 text-center">Loading Post...</div>;
  }
  if (!post) {
    return <div className="py-24 text-center">Post not found.</div>;
  }

  return (
    <motion.div
      // ... motion props
      className="py-24 max-w-3xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter">{post.title}</h1>
        <p className="text-sm tracking-widest text-black/60 mt-4">
          By {post.author} on {post.date}
        </p>
      </div>

      {/* NEW: Use PortableText to render the rich content array */}
      <div className="prose lg:prose-lg mx-auto text-black/80 space-y-6">
        <PortableText value={post.content} />
      </div>

      <div className="text-center mt-16">
        <Link to="/blog" className="text-sm font-bold uppercase tracking-widest hover:text-tan transition-colors">
          &larr; Back to Diary
        </Link>
      </div>
    </motion.div>
  );
};

export default BlogPostPage;
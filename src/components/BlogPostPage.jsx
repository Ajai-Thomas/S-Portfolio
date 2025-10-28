// src/components/BlogPostPage.jsx
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts } from '../data/blogPosts';

const BlogPostPage = () => {
  const { postId } = useParams();
  const post = blogPosts.find((p) => p.id === parseInt(postId));

  if (!post) {
    return <div className="py-24 text-center">Post not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-24 max-w-3xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter">{post.title}</h1>
        <p className="text-sm tracking-widest text-black/60 mt-4">
          By {post.author} on {post.date}
        </p>
      </div>

      {/* Renders the post content with paragraph breaks */}
      <div className="prose lg:prose-lg mx-auto text-black/80 space-y-6">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
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
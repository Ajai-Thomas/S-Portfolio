import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { client as readClient, getWriteClient } from '../sanity';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';
const HAS_WRITE_TOKEN = !!import.meta.env.VITE_SANITY_WRITE_TOKEN;

const generateKey = () => Math.random().toString(36).slice(2, 9);

// Convert PortableText blocks → plain text (paragraphs separated by double newline)
const portableTextToPlain = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text || '').join(''))
    .join('\n\n');
};

// Convert plain text paragraphs → minimal PortableText block array
const plainToPortableText = (text) =>
  text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({
      _key: generateKey(),
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: generateKey(), text: p, marks: [] }],
    }));

// ─── Login Screen ─────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      setError('VITE_ADMIN_PASSWORD not set in .env.local');
      return;
    }
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f0db]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm px-8"
      >
        <h1 className="text-4xl font-black tracking-tighter mb-2">Admin</h1>
        <p className="text-xs tracking-widest text-black/50 uppercase mb-10">Site Management</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Password"
            autoFocus
            className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm tracking-wide outline-none focus:border-black transition-colors"
          />
          {error && (
            <p className="text-red-600 text-xs tracking-wide">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-[#f4f0db] py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Media Item Row ────────────────────────────────────────────────────────────

const MediaItemRow = ({ item, index, onDelete, onAltChange }) => {
  const isFile = !!item.file;
  const isYoutube = item.type === 'youtube';
  const preview = isFile ? item.preview : (item.url || item.existingUrl);

  return (
    <div className="flex items-center gap-3 p-3 bg-white/60 border border-black/10">
      <div className="w-14 h-14 shrink-0 bg-black/5 overflow-hidden">
        {isYoutube ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-black/40 font-bold">YT</div>
        ) : preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-black/40">IMG</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-black/50 truncate mb-1">
          {isFile ? item.file.name : (item.url || 'Existing upload')}
        </p>
        <input
          type="text"
          value={item.alt || ''}
          onChange={(e) => onAltChange(index, e.target.value)}
          placeholder="Alt text / caption"
          className="w-full text-xs border border-black/10 px-2 py-1 bg-white outline-none focus:border-black transition-colors"
        />
      </div>

      <button
        onClick={() => onDelete(index)}
        className="text-red-500 hover:text-red-700 text-xs font-bold px-2 shrink-0"
      >
        ✕
      </button>
    </div>
  );
};

// ─── Project Form ──────────────────────────────────────────────────────────────

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: project?.title || '',
    category: project?.category || '',
    date: project?.date || '',
    excerpt: project?.excerpt || '',
  });
  const [mediaItems, setMediaItems] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!project) return;

    const fetchMedia = async () => {
      const query = `*[_type == "project" && _id == $id][0]{
        "mediaItems": mediaItems[]{
          ...,
          "existingUrl": coalesce(url, asset->url),
          "isYoutube": type == "youtube"
        }
      }`;
      try {
        const data = await readClient.fetch(query, { id: project._id });
        if (data?.mediaItems) {
          setMediaItems(
            data.mediaItems.map((m) => ({
              _key: m._key || generateKey(),
              _type: m._type,
              url: m.url,
              type: m.type,
              alt: m.alt || '',
              asset: m.asset,
              existingUrl: m.existingUrl,
              isExisting: true,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load media:', err);
      }
    };
    fetchMedia();
  }, [project]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      _key: generateKey(),
      file,
      preview: URL.createObjectURL(file),
      alt: '',
      isNew: true,
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;
    setMediaItems((prev) => [
      ...prev,
      { _key: generateKey(), url: videoUrl.trim(), type: 'youtube', alt: '', isNew: true },
    ]);
    setVideoUrl('');
    setShowVideoInput(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    setMediaItems((prev) => [
      ...prev,
      { _key: generateKey(), url: imageUrl.trim(), alt: '', isNew: true },
    ]);
    setImageUrl('');
    setShowImageUrlInput(false);
  };

  const handleDeleteMedia = (index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAltChange = (index, value) => {
    setMediaItems((prev) => prev.map((item, i) => (i === index ? { ...item, alt: value } : item)));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!HAS_WRITE_TOKEN) {
      setError('VITE_SANITY_WRITE_TOKEN not set in .env.local — cannot write to Sanity');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const writeClient = getWriteClient();

      const resolvedMedia = await Promise.all(
        mediaItems.map(async (item) => {
          if (item.isExisting) {
            const clean = { _key: item._key };
            if (item._type) clean._type = item._type;
            if (item.url) clean.url = item.url;
            if (item.type) clean.type = item.type;
            if (item.alt) clean.alt = item.alt;
            if (item.asset) clean.asset = item.asset;
            return clean;
          }

          if (item.file) {
            const asset = await writeClient.assets.upload('image', item.file, {
              filename: item.file.name,
            });
            return {
              _key: item._key,
              asset: { _type: 'reference', _ref: asset._id },
              alt: item.alt || '',
            };
          }

          return {
            _key: item._key,
            url: item.url,
            ...(item.type ? { type: item.type } : {}),
            alt: item.alt || '',
          };
        })
      );

      const doc = {
        title: form.title.trim(),
        category: form.category.trim(),
        date: form.date.trim(),
        excerpt: form.excerpt.trim(),
        mediaItems: resolvedMedia,
      };

      if (project?._id) {
        await writeClient.patch(project._id).set(doc).commit();
      } else {
        await writeClient.create({ _type: 'project', ...doc });
      }

      onSave();
    } catch (err) {
      console.error(err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0db] py-16 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onCancel}
          className="text-xs tracking-widest uppercase font-bold hover:text-[#dec19b] transition-colors mb-8 block"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-black tracking-tighter mb-10">
          {project ? 'Edit Project' : 'New Project'}
        </h1>

        <div className="space-y-4 mb-10">
          {[
            { label: 'Title', field: 'title', placeholder: 'Project name' },
            { label: 'Category', field: 'category', placeholder: 'e.g. Photography, Film' },
            { label: 'Date', field: 'date', placeholder: 'e.g. 2024' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs tracking-widest uppercase text-black/50 mb-1">{label}</label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs tracking-widest uppercase text-black/50 mb-1">Description</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              placeholder="Short description of the project..."
              rows={4}
              className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-none"
            />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xs tracking-widest uppercase font-bold mb-4">Media</h2>

          {mediaItems.length > 0 && (
            <div className="space-y-2 mb-4">
              {mediaItems.map((item, index) => (
                <MediaItemRow
                  key={item._key}
                  item={item}
                  index={index}
                  onDelete={handleDeleteMedia}
                  onAltChange={handleAltChange}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-black/30 px-4 py-2 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-[#f4f0db] transition-colors"
            >
              + Upload Image
            </button>
            <button
              onClick={() => { setShowVideoInput(!showVideoInput); setShowImageUrlInput(false); }}
              className="border border-black/30 px-4 py-2 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-[#f4f0db] transition-colors"
            >
              + YouTube URL
            </button>
            <button
              onClick={() => { setShowImageUrlInput(!showImageUrlInput); setShowVideoInput(false); }}
              className="border border-black/30 px-4 py-2 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-[#f4f0db] transition-colors"
            >
              + Image URL
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <AnimatePresence>
            {showVideoInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 border border-black/20 bg-white/60 px-4 py-2 text-sm outline-none focus:border-black transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddVideoUrl()}
                  />
                  <button
                    onClick={handleAddVideoUrl}
                    className="bg-black text-[#f4f0db] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showImageUrlInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (Google Drive share link or direct URL)"
                    className="flex-1 border border-black/20 bg-white/60 px-4 py-2 text-sm outline-none focus:border-black transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                  />
                  <button
                    onClick={handleAddImageUrl}
                    className="bg-black text-[#f4f0db] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-[#f4f0db] px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
          <button
            onClick={onCancel}
            className="border border-black/30 px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-[#f4f0db] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Blog Post Form ────────────────────────────────────────────────────────────

const BlogPostForm = ({ post, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: post?.title || '',
    author: post?.author || '',
    date: post?.date || '',
    excerpt: post?.excerpt || '',
    content: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!post?._id) return;
    const query = `*[_type == "blogPost" && _id == $id][0]{ content }`;
    readClient.fetch(query, { id: post._id }).then((data) => {
      if (data?.content) {
        setForm((prev) => ({ ...prev, content: portableTextToPlain(data.content) }));
      }
    }).catch(console.error);
  }, [post]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!HAS_WRITE_TOKEN) {
      setError('VITE_SANITY_WRITE_TOKEN not set in .env.local — cannot write to Sanity');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const writeClient = getWriteClient();

      const doc = {
        title: form.title.trim(),
        author: form.author.trim(),
        date: form.date.trim(),
        excerpt: form.excerpt.trim(),
        content: plainToPortableText(form.content),
      };

      if (post?._id) {
        await writeClient.patch(post._id).set(doc).commit();
      } else {
        await writeClient.create({ _type: 'blogPost', ...doc });
      }

      onSave();
    } catch (err) {
      console.error(err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0db] py-16 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onCancel}
          className="text-xs tracking-widest uppercase font-bold hover:text-[#dec19b] transition-colors mb-8 block"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-black tracking-tighter mb-10">
          {post ? 'Edit Post' : 'New Post'}
        </h1>

        <div className="space-y-4 mb-10">
          {[
            { label: 'Title', field: 'title', placeholder: 'Post title' },
            { label: 'Author', field: 'author', placeholder: 'e.g. Panchara' },
            { label: 'Date', field: 'date', placeholder: 'e.g. 2024-06-01' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs tracking-widest uppercase text-black/50 mb-1">{label}</label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs tracking-widest uppercase text-black/50 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              placeholder="Short preview shown on the Diary listing..."
              rows={3}
              className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-black/50 mb-1">Content</label>
            <p className="text-xs text-black/40 mb-2">
              Separate paragraphs with a blank line. Each paragraph becomes a block of text.
            </p>
            <textarea
              value={form.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder={"Write the full post here...\n\nStart a new paragraph by leaving a blank line."}
              rows={16}
              className="w-full border border-black/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-y font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-[#f4f0db] px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Post'}
          </button>
          <button
            onClick={onCancel}
            className="border border-black/30 px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-[#f4f0db] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

const DeleteDialog = ({ item, label, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#f4f0db] p-8 max-w-sm w-full"
    >
      <h3 className="text-xl font-black tracking-tighter mb-2">Delete {label}?</h3>
      <p className="text-sm text-black/60 mb-6">
        "{item.title}" will be permanently removed from Sanity. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="bg-red-600 text-white px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-40"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          onClick={onCancel}
          className="border border-black/30 px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-[#f4f0db] transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = ({ onEdit, onCreate, onEditBlog, onCreateBlog, onLogout }) => {
  const [section, setSection] = useState('projects'); // 'projects' | 'blog'

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogDeleteTarget, setBlogDeleteTarget] = useState(null);
  const [blogDeleting, setBlogDeleting] = useState(false);
  const [blogDeleteError, setBlogDeleteError] = useState('');

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const query = `*[_type == "project"] | order(date desc) {
        _id, title, category, date,
        "coverUrl": coalesce(mediaItems[0].url, mediaItems[0].asset->url),
        "mediaCount": count(mediaItems)
      }`;
      const data = await readClient.fetch(query);
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    }
    setProjectsLoading(false);
  };

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const query = `*[_type == "blogPost"] | order(date desc) { _id, title, author, date, excerpt }`;
      const data = await readClient.fetch(query);
      setBlogPosts(data || []);
    } catch (err) {
      console.error(err);
    }
    setBlogLoading(false);
  };

  useEffect(() => { fetchProjects(); fetchBlogPosts(); }, []);

  const handleDeleteProject = async () => {
    if (!HAS_WRITE_TOKEN) { setDeleteError('VITE_SANITY_WRITE_TOKEN not set — cannot delete'); return; }
    setDeleting(true);
    try {
      await getWriteClient().delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setDeleteError(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteBlogPost = async () => {
    if (!HAS_WRITE_TOKEN) { setBlogDeleteError('VITE_SANITY_WRITE_TOKEN not set — cannot delete'); return; }
    setBlogDeleting(true);
    try {
      await getWriteClient().delete(blogDeleteTarget._id);
      setBlogDeleteTarget(null);
      fetchBlogPosts();
    } catch (err) {
      setBlogDeleteError(`Delete failed: ${err.message}`);
    } finally {
      setBlogDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0db] py-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
            <p className="text-xs tracking-widest text-black/50 uppercase mt-1">Site Management</p>
          </div>
          <div className="flex items-center gap-6">
            {!HAS_WRITE_TOKEN && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 max-w-xs">
                Set VITE_SANITY_WRITE_TOKEN in .env.local to enable editing
              </p>
            )}
            <button
              onClick={onLogout}
              className="text-xs tracking-widest uppercase font-bold text-black/40 hover:text-black transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-0 mb-10 border-b border-black/20">
          {[
            { id: 'projects', label: 'Works' },
            { id: 'blog', label: 'Diary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                section === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-black/40 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Works Section */}
        {section === 'projects' && (
          <>
            <button
              onClick={onCreate}
              className="mb-10 bg-black text-[#f4f0db] px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors"
            >
              + New Project
            </button>

            {projectsLoading ? (
              <p className="text-sm text-black/50 tracking-wide">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-black/50 tracking-wide">No projects yet. Add your first one above.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 bg-white/50 border border-black/10 p-4 hover:border-black/30 transition-colors"
                  >
                    <div className="w-16 h-16 shrink-0 bg-black/5 overflow-hidden">
                      {project.coverUrl ? (
                        <img
                          src={project.coverUrl.includes('cdn.sanity.io')
                            ? `${project.coverUrl}?w=128&h=128&fit=crop&auto=format&q=60`
                            : project.coverUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-black/30">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold tracking-tight truncate">{project.title}</p>
                      <p className="text-xs text-black/50 mt-0.5">
                        {project.category} ・ {project.date} ・ {project.mediaCount ?? 0} media items
                      </p>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => onEdit(project)}
                        className="text-xs font-bold tracking-widest uppercase border border-black/30 px-4 py-2 hover:bg-black hover:text-[#f4f0db] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(project); setDeleteError(''); }}
                        className="text-xs font-bold tracking-widest uppercase border border-red-200 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {deleteError && <p className="mt-4 text-sm text-red-600">{deleteError}</p>}
          </>
        )}

        {/* Diary Section */}
        {section === 'blog' && (
          <>
            <button
              onClick={onCreateBlog}
              className="mb-10 bg-black text-[#f4f0db] px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dec19b] hover:text-black transition-colors"
            >
              + New Post
            </button>

            {blogLoading ? (
              <p className="text-sm text-black/50 tracking-wide">Loading posts...</p>
            ) : blogPosts.length === 0 ? (
              <p className="text-sm text-black/50 tracking-wide">No posts yet. Add your first one above.</p>
            ) : (
              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 bg-white/50 border border-black/10 p-4 hover:border-black/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold tracking-tight truncate">{post.title}</p>
                      <p className="text-xs text-black/50 mt-0.5">
                        {post.author && <>{post.author} ・ </>}{post.date}
                      </p>
                      {post.excerpt && (
                        <p className="text-xs text-black/40 mt-1 truncate">{post.excerpt}</p>
                      )}
                    </div>

                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => onEditBlog(post)}
                        className="text-xs font-bold tracking-widest uppercase border border-black/30 px-4 py-2 hover:bg-black hover:text-[#f4f0db] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setBlogDeleteTarget(post); setBlogDeleteError(''); }}
                        className="text-xs font-bold tracking-widest uppercase border border-red-200 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {blogDeleteError && <p className="mt-4 text-sm text-red-600">{blogDeleteError}</p>}
          </>
        )}
      </div>

      {/* Project delete dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            item={deleteTarget}
            label="Project"
            onConfirm={handleDeleteProject}
            onCancel={() => setDeleteTarget(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>

      {/* Blog post delete dialog */}
      <AnimatePresence>
        {blogDeleteTarget && (
          <DeleteDialog
            item={blogDeleteTarget}
            label="Post"
            onConfirm={handleDeleteBlogPost}
            onCancel={() => setBlogDeleteTarget(null)}
            deleting={blogDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── AdminPage (root) ──────────────────────────────────────────────────────────

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('adminLoggedIn') === 'true'
  );
  // view: 'dashboard' | 'project-form' | 'blog-form'
  const [view, setView] = useState('dashboard');
  const [editingProject, setEditingProject] = useState(null);
  const [editingBlogPost, setEditingBlogPost] = useState(null);

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  const openCreateProject = () => { setEditingProject(null); setView('project-form'); };
  const openEditProject = (project) => { setEditingProject(project); setView('project-form'); };
  const openCreateBlog = () => { setEditingBlogPost(null); setView('blog-form'); };
  const openEditBlog = (post) => { setEditingBlogPost(post); setView('blog-form'); };
  const closeForm = () => { setEditingProject(null); setEditingBlogPost(null); setView('dashboard'); };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'dashboard' && (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Dashboard
            onEdit={openEditProject}
            onCreate={openCreateProject}
            onEditBlog={openEditBlog}
            onCreateBlog={openCreateBlog}
            onLogout={handleLogout}
          />
        </motion.div>
      )}

      {view === 'project-form' && (
        <motion.div key="project-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ProjectForm
            project={editingProject}
            onSave={closeForm}
            onCancel={closeForm}
          />
        </motion.div>
      )}

      {view === 'blog-form' && (
        <motion.div key="blog-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BlogPostForm
            post={editingBlogPost}
            onSave={closeForm}
            onCancel={closeForm}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPage;

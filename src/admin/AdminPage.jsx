import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import { clearSession, getSession, ping } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import ProjectEditor from './ProjectEditor';
import PostEditor from './PostEditor';
import SelectedWorkEditor from './SelectedWorkEditor';
import VideoEditor from './VideoEditor';
import { ToastProvider } from './ui';

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!getSession());
  const [notice, setNotice] = useState('');
  // dashboard, or an editor: { tab: 'projects' | 'selected' | 'videos' | 'posts', doc }
  const [view, setView] = useState(null);
  const [tab, setTab] = useState('projects'); // remembered so saving returns you to the same list

  const logout = useCallback((msg = '') => { clearSession(); setNotice(msg); setAuthed(false); setView(null); }, []);

  useEffect(() => { document.title = 'Admin'; }, []);

  // a stored session may have been invalidated (password changed): verify it once
  useEffect(() => {
    if (authed) ping().catch(() => {});
  }, [authed]);

  useEffect(() => {
    const expired = () => logout('Your session expired. Please log in again.');
    window.addEventListener('pf-admin-expired', expired);
    return () => window.removeEventListener('pf-admin-expired', expired);
  }, [logout]);

  const close = () => setView(null);
  const editors = { projects: ProjectEditor, selected: SelectedWorkEditor, videos: VideoEditor, posts: PostEditor };
  const Editor = view && editors[view.tab];

  return (
    <ToastProvider>
      <div className="ad-root">
        {!authed ? (
          <Login notice={notice} onLogin={() => { setNotice(''); setAuthed(true); }} />
        ) : Editor ? (
          <Editor key={`${view.tab}-${view.doc?._id || 'new'}`} {...(view.tab === 'projects' ? { project: view.doc } : view.tab === 'posts' ? { post: view.doc } : { doc: view.doc })} onDone={close} />
        ) : (
          <Dashboard
            tab={tab}
            setTab={setTab}
            onLogout={() => logout()}
            onNew={(t) => setView({ tab: t, doc: null })}
            onEdit={(t, doc) => setView({ tab: t, doc })}
          />
        )}
      </div>
    </ToastProvider>
  );
}

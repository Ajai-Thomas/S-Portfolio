import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import { clearSession, getSession, ping } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import ProjectEditor from './ProjectEditor';
import PostEditor from './PostEditor';
import { ToastProvider } from './ui';

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!getSession());
  const [notice, setNotice] = useState('');
  const [view, setView] = useState({ name: 'dashboard' }); // dashboard | project | post

  const logout = useCallback((msg = '') => { clearSession(); setNotice(msg); setAuthed(false); setView({ name: 'dashboard' }); }, []);

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

  const toDashboard = () => setView({ name: 'dashboard' });

  return (
    <ToastProvider>
      <div className="ad-root">
        {!authed ? (
          <Login notice={notice} onLogin={() => { setNotice(''); setAuthed(true); }} />
        ) : view.name === 'project' ? (
          <ProjectEditor key={view.doc?._id || 'new'} project={view.doc} onDone={toDashboard} />
        ) : view.name === 'post' ? (
          <PostEditor key={view.doc?._id || 'new'} post={view.doc} onDone={toDashboard} />
        ) : (
          <Dashboard
            onLogout={() => logout()}
            onNewProject={() => setView({ name: 'project', doc: null })}
            onEditProject={(doc) => setView({ name: 'project', doc })}
            onNewPost={() => setView({ name: 'post', doc: null })}
            onEditPost={(doc) => setView({ name: 'post', doc })}
          />
        )}
      </div>
    </ToastProvider>
  );
}

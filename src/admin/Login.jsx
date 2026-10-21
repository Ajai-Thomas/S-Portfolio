import { useState } from 'react';
import { login } from './api';

export default function Login({ onLogin, notice }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(notice || '');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      await login(password);
      onLogin();
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="ad-login">
      <form className="ad-login__card" onSubmit={submit}>
        <p className="ad-eyebrow">Site management</p>
        <h1>Admin</h1>
        <label htmlFor="ad-pw" className="ad-sr">Password</label>
        <input
          id="ad-pw"
          className="ad-input"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Password"
          autoComplete="current-password"
          autoFocus
        />
        {error && <p className="ad-error" role="alert">{error}</p>}
        <button className="ad-btn ad-btn--primary" type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Enter'}</button>
        <a className="ad-link" href="/">← Back to the site</a>
      </form>
    </main>
  );
}

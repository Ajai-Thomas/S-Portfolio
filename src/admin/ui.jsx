// Small shared UI pieces for the admin: toasts, confirm dialog, field wrapper.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(() => {});
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = 'ok') => {
    const id = Math.random();
    setItems((s) => [...s, { id, message, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), kind === 'error' ? 6000 : 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="ad-toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`ad-toast ad-toast--${t.kind}`}>{t.message}</div>)}
      </div>
    </ToastContext.Provider>
  );
}

export function ConfirmDialog({ title, body, confirmLabel = 'Delete', busy, error, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('[data-cancel]')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') {
        const f = ref.current.querySelectorAll('button:not([disabled])');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onCancel]);
  return (
    <div className="ad-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={ref} className="ad-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ad-dlg-title" aria-describedby="ad-dlg-body">
        <h3 id="ad-dlg-title">{title}</h3>
        <p id="ad-dlg-body">{body}</p>
        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn ad-btn--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
          <button className="ad-btn" data-cancel onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="ad-field">
      <label htmlFor={htmlFor}>{label}</label>
      {hint && <p className="ad-hint">{hint}</p>}
      {children}
    </div>
  );
}

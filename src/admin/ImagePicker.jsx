// Single-image field: upload a file (resized first) or paste a link. Used by selected works
// and video thumbnails. `pic` is controlled by the parent:
//   { kind: 'none' | 'existing' | 'file' | 'url', src, file?, url? }
import { useRef, useState } from 'react';
import { imageSrc } from './api';
import { emptyPic } from './pic';

export default function ImagePicker({ id, pic, onChange, onError, hint }) {
  const fileRef = useRef(null);
  const [over, setOver] = useState(false);
  const [link, setLink] = useState('');

  const takeFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { onError?.('Please choose an image file.'); return; }
    onError?.('');
    onChange({ kind: 'file', file, src: URL.createObjectURL(file) });
  };
  const takeLink = () => {
    const u = link.trim();
    if (!u) return;
    try { new URL(u); } catch { onError?.('That does not look like a valid link.'); return; }
    onError?.('');
    onChange({ kind: 'url', url: u, src: imageSrc(u, 800) });
    setLink('');
  };

  return (
    <div>
      {pic.src ? (
        <div className="ad-pic">
          <img src={pic.src} alt="" />
          <div className="ad-row">
            <button type="button" className="ad-btn ad-btn--sm" onClick={() => fileRef.current?.click()}>Replace</button>
            <button type="button" className="ad-btn ad-btn--sm ad-btn--danger-ghost" onClick={() => onChange(emptyPic)}>Remove</button>
          </div>
        </div>
      ) : (
        <div
          className={`ad-drop ${over ? 'is-over' : ''}`}
          onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); takeFile(e.dataTransfer.files?.[0]); }}
        >
          <p>Drop an image here, or</p>
          <button type="button" className="ad-btn" onClick={() => fileRef.current?.click()}>Choose file</button>
          {hint && <p className="ad-hint">{hint}</p>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { takeFile(e.target.files?.[0]); e.target.value = ''; }} />
      {!pic.src && (
        <div className="ad-row ad-urlrow">
          <label className="ad-sr" htmlFor={id}>Image link</label>
          <input id={id} className="ad-input" type="url" placeholder="…or paste an image or Google Drive link" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); takeLink(); } }} />
          <button type="button" className="ad-btn" onClick={takeLink}>Add</button>
        </div>
      )}
    </div>
  );
}

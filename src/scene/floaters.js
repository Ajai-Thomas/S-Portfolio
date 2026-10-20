// Floating photography props that drift around the camera model at different depths.
import * as THREE from 'three';

function canvasTex(draw, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Clearly-labelled placeholder print face.
const photoFace = (hue, label = 'PLACEHOLDER') => canvasTex((g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, `hsl(${hue} 22% 38%)`);
  gr.addColorStop(1, `hsl(${(hue + 50) % 360} 26% 16%)`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 20px monospace'; g.textAlign = 'center';
  g.fillText(label, w / 2, h / 2 + 7);
});

const leakTex = () => canvasTex((g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, 'rgba(255,170,90,.9)');
  gr.addColorStop(0.5, 'rgba(255,90,60,.35)');
  gr.addColorStop(1, 'rgba(255,60,60,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

const frameTex = () => canvasTex((g, w, h) => {
  g.fillStyle = '#17120e'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e9c98a';
  for (let x = 12; x < w; x += 34) { g.fillRect(x, 8, 16, 12); g.fillRect(x, h - 20, 16, 12); }
  g.fillStyle = '#3b4658'; g.fillRect(14, 30, w - 28, h - 60);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '14px monospace'; g.fillText('PLACEHOLDER 12A', 22, h - 34);
});

// photos: optional array of image URLs shown on the polaroids (otherwise placeholders).
export function buildFloaters({ count, photos = [], loader }) {
  const group = new THREE.Group();
  const items = [];
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };

  const geos = {
    card: keep(new THREE.BoxGeometry(1, 1.2, 0.03)),
    face: keep(new THREE.PlaneGeometry(0.88, 0.88)),
    frame: keep(new THREE.PlaneGeometry(1.5, 1)),
    roll: keep(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 28)),
    spool: keep(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 14)),
    cap: keep(new THREE.CylinderGeometry(0.5, 0.5, 0.09, 40)),
    ring: keep(new THREE.TorusGeometry(0.5, 0.03, 10, 40)),
    blade: keep(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.55, 0.15); s.lineTo(0.3, 0.7); s.closePath(); return s; })())),
    leak: keep(new THREE.PlaneGeometry(2.2, 2.2)),
  };
  const white = keep(new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: 0.8 }));
  const dark = keep(new THREE.MeshStandardMaterial({ color: 0x1a1613, roughness: 0.5, metalness: 0.3 }));
  const metal = keep(new THREE.MeshStandardMaterial({ color: 0xcfcfd4, roughness: 0.25, metalness: 1 }));
  const bladeMat = keep(new THREE.MeshStandardMaterial({ color: 0x25252a, roughness: 0.4, metalness: 0.8, side: THREE.DoubleSide }));
  const leakMap = keep(leakTex());
  const frameMap = keep(frameTex());

  const types = ['polaroid', 'polaroid', 'frame', 'roll', 'cap', 'blade', 'leak', 'polaroid'];
  const photoTex = photos.map((src) => {
    const t = loader.load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    return keep(t);
  });

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const era = i % 5;
    const mesh = new THREE.Group();
    const fadeMats = []; // materials whose opacity follows visibility
    const makeFade = (mat) => { const m = mat.clone(); m.transparent = true; fadeMats.push(m); disposables.push(m); return m; };

    if (type === 'polaroid') {
      const body = new THREE.Mesh(geos.card, makeFade(white));
      const map = photoTex.length ? photoTex[i % photoTex.length] : keep(photoFace((i * 37) % 360));
      const fm = new THREE.MeshStandardMaterial({ map, roughness: 0.6 });
      fm.transparent = true; fadeMats.push(fm); disposables.push(fm);
      const face = new THREE.Mesh(geos.face, fm);
      face.position.set(0, 0.1, 0.017);
      mesh.add(body, face);
    } else if (type === 'frame') {
      const m = new THREE.MeshBasicMaterial({ map: frameMap, side: THREE.DoubleSide, transparent: true });
      fadeMats.push(m); disposables.push(m);
      mesh.add(new THREE.Mesh(geos.frame, m));
    } else if (type === 'roll') {
      const a = new THREE.Mesh(geos.roll, makeFade(dark));
      const b = new THREE.Mesh(geos.spool, makeFade(metal));
      mesh.add(a, b);
    } else if (type === 'cap') {
      const a = new THREE.Mesh(geos.cap, makeFade(dark));
      const b = new THREE.Mesh(geos.ring, makeFade(metal));
      b.position.y = 0.05; b.rotation.x = Math.PI / 2;
      mesh.add(a, b);
    } else if (type === 'blade') {
      mesh.add(new THREE.Mesh(geos.blade, makeFade(bladeMat)));
    } else {
      const m = new THREE.MeshBasicMaterial({ map: leakMap, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      fadeMats.push(m); disposables.push(m);
      mesh.add(new THREE.Mesh(geos.leak, m));
    }

    const s = type === 'leak' ? 1.2 + Math.random() : 0.45 + Math.random() * 0.45;
    mesh.scale.setScalar(s);
    group.add(mesh);
    items.push({
      mesh, fadeMats, type, era,
      angle: (i / count) * Math.PI * 2 + Math.random(),
      radius: 2.2 + Math.random() * 2.4,
      speed: (0.04 + Math.random() * 0.08) * (i % 2 ? 1 : -1),
      y: (Math.random() - 0.5) * 3.2,
      z: (Math.random() - 0.62) * 3.4,
      spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.5),
      bob: Math.random() * 6,
      alpha: type === 'leak' ? 0.5 : 1,
    });
  }

  // visibility: 0–1 from keyframes; era: 0–4 (which about-entry we're on)
  function update(t, visibility, era, flash = 0) {
    const n = items.length;
    items.forEach((it, i) => {
      const gate = Math.max(0, 1 - Math.abs(era - it.era) * 0.55);
      const thin = Math.min(1, Math.max(0, (visibility * 1.1 - i / n) * 6)); // fewer objects at low visibility
      const show = Math.min(1, visibility * 1.5) * (0.25 + 0.75 * gate) * thin;
      it.angle += it.speed * 0.016;
      const a = it.angle;
      it.mesh.position.set(Math.cos(a) * it.radius, it.y + Math.sin(t * 0.6 + it.bob) * 0.12, it.z + Math.sin(a) * 1.2);
      it.mesh.rotation.x += it.spin.x * 0.004;
      it.mesh.rotation.y += it.spin.y * 0.006;
      it.mesh.rotation.z += it.spin.z * 0.004;
      it.mesh.visible = show > 0.01;
      for (const m of it.fadeMats) m.opacity = show * it.alpha * (1 + flash * 0.2);
    });
  }

  return {
    group,
    update,
    dispose() { disposables.forEach((d) => d.dispose?.()); },
  };
}

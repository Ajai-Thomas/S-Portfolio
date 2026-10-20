// Procedural multi-part rangefinder-style camera. Every component is its own named
// group (names match explodeConfig.js PARTS) built around its own local origin, so the
// engine can move, tumble and fade each one independently. Faces +Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PARTS } from './explodeConfig';

function leatherTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2200; i++) {
    const v = 90 + Math.random() * 90;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export function buildCameraModel({ lite = false } = {}) {
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };

  const bump = keep(leatherTexture());
  const M = {
    chrome: new THREE.MeshStandardMaterial({ color: 0xd9d9de, metalness: 1, roughness: 0.16 }),
    brushed: new THREE.MeshStandardMaterial({ color: 0xb9b9c0, metalness: 1, roughness: 0.38 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.1, roughness: 0.7, bumpMap: bump, bumpScale: 1.4 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0d0d0e, metalness: 0.5, roughness: 0.35 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x141416, metalness: 0.2, roughness: 0.7, side: THREE.DoubleSide }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8301f, metalness: 0.3, roughness: 0.35, emissive: 0x300800 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x0b1a33, metalness: 0.2, roughness: 0.15, emissive: 0x0a2a55, emissiveIntensity: 0.9 }),
    sensor: new THREE.MeshStandardMaterial({ color: 0x3b5a4a, metalness: 0.9, roughness: 0.25, emissive: 0x08140e }),
    glass: lite
      ? new THREE.MeshStandardMaterial({ color: 0x03050a, metalness: 0.6, roughness: 0.08, envMapIntensity: 2.2, emissive: 0x0a1a33, emissiveIntensity: 0.5 })
      : new THREE.MeshPhysicalMaterial({ color: 0x010206, metalness: 0.2, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.5, iridescenceIOR: 1.5, envMapIntensity: 3.2, emissive: 0x0a1a33, emissiveIntensity: 0.6 }),
  };
  Object.values(M).forEach(keep);
  const coat = (hex, op) => new THREE.MeshStandardMaterial({ color: hex, metalness: 0.2, roughness: 0.05, transparent: true, opacity: op, envMapIntensity: 3, depthWrite: false });

  const mesh = (g, mat, x = 0, y = 0, z = 0) => { keep(g); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); return m; };
  const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);
  const cyl = (r, h, seg = 48) => new THREE.CylinderGeometry(r, r, h, seg);
  // hollow ring/tube whose axis runs along Z
  const ring = (rIn, rOut, len) => {
    const h = len / 2;
    const geo = new THREE.LatheGeometry([[rIn, -h], [rOut, -h], [rOut, h], [rIn, h], [rIn, -h]].map(([x, y]) => new THREE.Vector2(x, y)), 64);
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  const knurl = (radius, length, count, mat, w = 0.018) => {
    const inst = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(w, length, w * 1.4)), mat, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      d.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      d.rotation.set(0, -a, 0);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    }
    return inst;
  };
  const lensGlass = (g, r, thick, extra = []) => {
    const glass = mesh(new THREE.SphereGeometry(r, 40, 20), M.glass);
    glass.scale.z = thick;
    g.add(glass, ...extra);
  };

  // ── part builders (each fills a group centred on its own origin) ──
  const B = {
    lens_hood: (g) => g.add(mesh(ring(0.56, 0.68, 0.4), M.matte)),
    strap_lugs: (g) => [-1, 1].forEach((s) => { const t = mesh(new THREE.TorusGeometry(0.07, 0.025, 12, 24), M.chrome, s * 1.3, 0, 0); t.rotation.y = Math.PI / 2; g.add(t); }),
    shutter_button: (g) => g.add(mesh(cyl(0.12, 0.12), M.chrome), mesh(cyl(0.065, 0.12), M.red, 0, 0.08, 0)),
    mode_dial: (g) => { g.add(mesh(cyl(0.3, 0.14), M.chrome), mesh(cyl(0.25, 0.02), M.black, 0, 0.08, 0), knurl(0.3, 0.14, 48, M.brushed)); },
    hot_shoe: (g) => g.add(mesh(rbox(0.34, 0.07, 0.3, 0.02), M.brushed), mesh(rbox(0.3, 0.03, 0.04, 0.01), M.black, 0, 0.045, 0.1)),
    viewfinder_hump: (g) => g.add(mesh(rbox(0.9, 0.22, 0.5, 0.06), M.chrome), mesh(rbox(0.42, 0.14, 0.04, 0.02), M.glass, -0.17, 0, 0.25), mesh(rbox(0.2, 0.14, 0.04, 0.02), M.glass, 0.3, 0, 0.25)),
    grip: (g) => g.add(mesh(rbox(0.45, 0.95, 0.3, 0.1), M.leather), mesh(new THREE.CircleGeometry(0.035, 24), M.red, 0, 0.3, 0.151)),
    rear_screen: (g) => { g.add(mesh(rbox(1.5, 0.85, 0.05, 0.03), M.black)); const s = mesh(new THREE.PlaneGeometry(1.34, 0.7), M.screen, 0, 0, -0.027); s.rotation.y = Math.PI; g.add(s); },
    top_cover: (g) => { g.add(mesh(rbox(2.55, 0.3, 1.02, 0.08), M.chrome)); const lv = mesh(rbox(0.5, 0.05, 0.1, 0.02), M.brushed, 1.0, 0.19, -0.42); lv.rotation.y = 0.35; g.add(lv); },
    bottom_plate: (g) => g.add(mesh(rbox(2.55, 0.14, 1.02, 0.06), M.chrome)),
    body_shell_L: (g) => g.add(mesh(rbox(1.25, 1.0, 1.0, 0.07), M.leather)),
    body_shell_R: (g) => g.add(mesh(rbox(1.25, 1.0, 1.0, 0.07), M.leather), mesh(new THREE.CircleGeometry(0.035, 24), M.red, 0.475, 0.4, 0.501)),
    sensor: (g) => g.add(mesh(rbox(0.9, 0.6, 0.04, 0.01), M.sensor), mesh(rbox(1.0, 0.7, 0.03, 0.02), M.black, 0, 0, -0.03)),
    mirror_box: (g) => { g.add(mesh(rbox(1.1, 0.7, 0.5, 0.04), M.black)); const m = mesh(new THREE.PlaneGeometry(0.8, 0.5), M.chrome, 0, 0, 0.05); m.rotation.x = -0.7; g.add(m); },
    lens_mount: (g) => { g.add(mesh(ring(0.5, 0.74, 0.12), M.chrome)); [0, 2.1, 4.2].forEach((a) => g.add(mesh(rbox(0.1, 0.06, 0.04, 0.01), M.brushed, Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.07))); },
    lens_barrel_outer: (g) => g.add(mesh(ring(0.54, 0.6, 0.48), M.black)),
    focus_ring: (g) => { g.add(mesh(ring(0.6, 0.67, 0.3), M.black)); const k = knurl(0.67, 0.3, 96, M.brushed, 0.02); k.rotation.x = Math.PI / 2; g.add(k); },
    zoom_ring: (g) => g.add(mesh(ring(0.5, 0.64, 0.16), M.chrome)),
    lens_element_4: (g) => lensGlass(g, 0.4, 0.28),
    lens_element_3: (g) => lensGlass(g, 0.44, 0.28),
    lens_element_2: (g) => lensGlass(g, 0.46, 0.3),
    lens_element_1: (g) => {
      const discs = [[0.46, 0x6a3cff, 0.05, 0.1], [0.34, 0x1fe0a0, 0.05, 0.07], [0.22, 0xffa020, 0.05, 0.04], [0.11, 0x2a5cff, 0.12, 0.02]].map(([r, c, o, z]) => mesh(new THREE.CircleGeometry(r, 48), coat(c, o), 0, 0, z));
      lensGlass(g, 0.52, 0.3, discs);
    },
    aperture_blades: (g) => {
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Shape();
        s.moveTo(0, 0.07); s.lineTo(0.3, 0.3); s.lineTo(0.38, 0.1); s.closePath();
        const m = mesh(new THREE.ShapeGeometry(s), M.matte);
        m.rotation.z = (i / 6) * Math.PI * 2;
        m.position.z = 0.008 * i - 0.02;
        g.add(m);
      }
    },
  };

  const root = new THREE.Group();
  const parts = new Map();
  PARTS.forEach((def) => {
    const g = new THREE.Group();
    g.name = def.name;
    B[def.name](g);
    // every part owns its materials so it can fade / highlight on its own
    const mats = [];
    g.traverse((o) => {
      if (!o.material) return;
      o.material = o.material.clone();
      o.material.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
      o.material.userData.baseOpacity = o.material.opacity;
      o.material.userData.baseTransparent = o.material.transparent;
      mats.push(o.material);
      disposables.push(o.material);
    });
    g.position.set(...def.pos);
    g.rotation.set(...def.rot);
    root.add(g);
    // projected-anchor probes for the leader lines
    const rim = def.rim || 0.5;
    const probes = {};
    [['c', 0, 0], ['u', 0, rim], ['d', 0, -rim], ['l', -rim, 0], ['r', rim, 0]].forEach(([k, x, y]) => {
      const o = new THREE.Object3D();
      o.position.set(x, y, 0);
      g.add(o);
      probes[k] = o;
    });
    parts.set(def.name, { def, group: g, mats, probes });
  });

  return {
    root,
    parts,
    dispose() { disposables.forEach((d) => d.dispose?.()); },
  };
}

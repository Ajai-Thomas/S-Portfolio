// Procedural rangefinder-style camera built from Three.js primitives.
// Faces +Z. Roughly 2.5 wide, 1.3 tall, lens extends to z ≈ 1.5.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

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
  t.repeat.set(5, 3);
  return t;
}

export function buildCameraModel({ lite = false } = {}) {
  const root = new THREE.Group();
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };

  const bump = keep(leatherTexture());
  const chrome = keep(new THREE.MeshStandardMaterial({ color: 0xd9d9de, metalness: 1, roughness: 0.16 }));
  const brushed = keep(new THREE.MeshStandardMaterial({ color: 0xb9b9c0, metalness: 1, roughness: 0.38 }));
  const leather = keep(new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.1, roughness: 0.7, bumpMap: bump, bumpScale: 1.4 }));
  const black = keep(new THREE.MeshStandardMaterial({ color: 0x0d0d0e, metalness: 0.5, roughness: 0.35 }));
  const red = keep(new THREE.MeshStandardMaterial({ color: 0xc8301f, metalness: 0.3, roughness: 0.35, emissive: 0x300800 }));
  // Physical glass (clearcoat + iridescence) is costly on phones: use a plain metal-rough material there.
  const glassMat = keep(lite ? new THREE.MeshStandardMaterial({ color: 0x03050a, metalness: 0.6, roughness: 0.08, envMapIntensity: 2.2 }) : new THREE.MeshPhysicalMaterial({
    color: 0x010206, metalness: 0.2, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02,
    iridescence: 0.35, iridescenceIOR: 1.5, envMapIntensity: 2.2,
  }));
  const coat = (hex, op) => keep(new THREE.MeshStandardMaterial({
    color: hex, metalness: 0.2, roughness: 0.05, transparent: true, opacity: op, envMapIntensity: 3, depthWrite: false,
  }));
  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    keep(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  const cyl = (r1, r2, h, seg = 64) => new THREE.CylinderGeometry(r1, r2, h, seg);
  // cylinders point along Y by default; turn them to point along Z
  const alongZ = (m) => { m.rotation.x = Math.PI / 2; return m; };
  const knurl = (radius, length, count, mat, w = 0.018) => {
    const geo = keep(new THREE.BoxGeometry(w, length, w * 1.4));
    const inst = new THREE.InstancedMesh(geo, mat, count);
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

  // Body
  add(new RoundedBoxGeometry(2.5, 1.0, 1.0, 5, 0.07), leather, 0, -0.08, 0);
  add(new RoundedBoxGeometry(2.55, 0.3, 1.02, 5, 0.08), chrome, 0, 0.58, 0);
  add(new RoundedBoxGeometry(2.55, 0.14, 1.02, 5, 0.06), chrome, 0, -0.65, 0);

  // Front: viewfinder windows + rangefinder patch + selftimer lever
  add(new RoundedBoxGeometry(0.42, 0.2, 0.06, 3, 0.02), glassMat, -0.78, 0.58, 0.5);
  add(new RoundedBoxGeometry(0.2, 0.2, 0.06, 3, 0.02), glassMat, -0.3, 0.58, 0.5);
  add(new RoundedBoxGeometry(0.16, 0.16, 0.05, 3, 0.02), black, 0.95, 0.58, 0.5);
  add(new THREE.CircleGeometry(0.035, 24), red, 1.1, 0.32, 0.52);

  // Top plate: shutter-speed dial, shutter release, wind lever, hot-shoe
  const dial = add(cyl(0.3, 0.3, 0.14), chrome, -0.85, 0.82, -0.1);
  const dialKnurl = knurl(0.3, 0.14, 48, brushed);
  dialKnurl.position.copy(dial.position);
  root.add(dialKnurl);
  add(cyl(0.25, 0.25, 0.02), black, -0.85, 0.9, -0.1);
  add(cyl(0.12, 0.12, 0.12), chrome, 0.85, 0.8, -0.1);
  add(cyl(0.065, 0.065, 0.12), red, 0.85, 0.88, -0.1);
  const lever = add(new RoundedBoxGeometry(0.5, 0.05, 0.1, 3, 0.02), brushed, 1.0, 0.77, -0.42);
  lever.rotation.y = 0.35;
  add(new RoundedBoxGeometry(0.34, 0.07, 0.3, 3, 0.02), brushed, 0.1, 0.78, 0);
  add(cyl(0.22, 0.22, 0.12), chrome, 0.2, 0.86, 0.15); // rewind knob

  // Strap lugs
  [-1, 1].forEach((s) => {
    const lug = add(new THREE.TorusGeometry(0.07, 0.025, 12, 24), chrome, s * 1.3, 0.35, 0);
    lug.rotation.y = Math.PI / 2;
  });

  // Lens: mount → barrel → focus ring → aperture ring → front element
  alongZ(add(cyl(0.74, 0.74, 0.12), chrome, 0, 0, 0.55));
  alongZ(add(cyl(0.62, 0.62, 0.34), black, 0, 0, 0.75));
  const focus = alongZ(add(cyl(0.67, 0.67, 0.3), black, 0, 0, 0.98));
  const focusKnurl = knurl(0.67, 0.3, 96, brushed, 0.02);
  focusKnurl.rotation.x = Math.PI / 2;
  focusKnurl.position.copy(focus.position);
  root.add(focusKnurl);
  alongZ(add(cyl(0.64, 0.64, 0.16), chrome, 0, 0, 1.2));
  alongZ(add(cyl(0.58, 0.58, 0.22), black, 0, 0, 1.36));
  const filter = add(new THREE.TorusGeometry(0.55, 0.035, 16, 64), chrome, 0, 0, 1.48);
  filter.name = 'filterRing';

  // Front glass + coating discs so the dive-in has layers to fly through
  const glass = add(new THREE.SphereGeometry(0.52, 48, 24), glassMat, 0, 0, 1.2);
  glass.scale.z = 0.3;
  glass.name = 'lensGlass';
  [[0.48, 0x6a3cff, 0.05, 1.5], [0.36, 0x1fe0a0, 0.05, 1.46], [0.24, 0xffa020, 0.05, 1.43], [0.12, 0x2a5cff, 0.12, 1.4]].forEach(([r, c, o, z]) => {
    add(new THREE.CircleGeometry(r, 48), coat(c, o), 0, 0, z);
  });

  // Soft contact shadow-ish plate for the aperture detail inside the lens
  const blades = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.07); shape.lineTo(0.3, 0.3); shape.lineTo(0.38, 0.1); shape.closePath();
    const geo = keep(new THREE.ShapeGeometry(shape));
    const m = new THREE.Mesh(geo, black);
    m.rotation.z = (i / 6) * Math.PI * 2;
    m.position.z = 0.01 * i;
    blades.add(m);
  }
  blades.position.z = 1.08;
  blades.scale.setScalar(0.9);
  root.add(blades);

  return {
    root,
    glass,
    dispose() { disposables.forEach((d) => d.dispose?.()); },
  };
}

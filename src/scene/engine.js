// Scroll-driven WebGL scene engine. No React in here: see Scene.jsx for the wrapper.
// Every visual is a pure function of the master scroll progress, so scrolling back
// up reverses the whole sequence exactly.
import * as THREE from 'three';
import gsap from 'gsap';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect, DepthOfFieldEffect, NoiseEffect,
  VignetteEffect, ChromaticAberrationEffect, ToneMappingEffect, ToneMappingMode, BlendFunction,
} from 'postprocessing';
import { KEYFRAMES, FLOATER_COUNT, MODEL_URL } from './config';
import { at, SECTION_WEIGHTS as W, TIMING as T, EASE, ANNOTATE, EVENTS, BREAKPOINTS as BP, PARTS, PARTICLES } from './explodeConfig';
import { buildCameraModel } from './cameraModel';
import { buildFloaters } from './floaters';

const lerp = (a, b, t) => a + (b - a) * t;
const lerpArr = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const smooth01 = (t) => smooth(clamp01(t));
const bump = (p, a, b) => Math.sin(Math.PI * clamp01((p - a) / (b - a || 1)));
const ease = (t) => lerp(t, smooth(t), 0.65); // keyframe interpolation: mostly smooth, never fully stops

const E = {
  peel: gsap.parseEase(EASE.peel),
  tumble: gsap.parseEase(EASE.tumble),
  explode: gsap.parseEase(EASE.explode),
  re: gsap.parseEase(EASE.reassemble),
};

const SCALARS = ['fov', 'scale', 'split', 'bokeh', 'range', 'bloom', 'fog', 'floaters', 'follow', 'shift'];
const VECTORS = ['pos', 'rot'];

function sample(p) {
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].p) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = ease(clamp01((p - a.p) / (b.p - a.p || 1)));
  const out = { a, b, t };
  SCALARS.forEach((k) => { out[k] = lerp(a[k] ?? 0, b[k] ?? 0, t); });
  VECTORS.forEach((k) => { out[k] = lerpArr(a[k], b[k], t); });
  return out;
}

const BG_VERT = 'void main(){ gl_Position = vec4(position.xy, 1.0, 1.0); }';
const BG_FRAG = `
uniform vec3 colA; uniform vec3 colB; uniform float split; uniform vec2 res; uniform float time;
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  float d = dot(p, normalize(vec2(1.0, -0.62))) + (0.5 - split) * 1.1;
  float t = smoothstep(-0.012, 0.012, d);
  vec3 c = mix(colA, colB, t);
  c += (uv.y - 0.5) * 0.05;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const DUST_VERT = `
attribute float alpha; varying float vA; uniform float size; uniform float scale;
void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const DUST_FRAG = `
varying float vA;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; gl_FragColor = vec4(vec3(1.0, 0.82, 0.6) * 2.0, vA * (1.0 - d * 1.6)); }`;

export async function createScene({ canvas, lite = false, reduced = false, theme = 'dark', photos = [], onProgress = () => {}, onShutter = () => {} }) {
  const tick = (v) => { onProgress(v); return new Promise((r) => setTimeout(r, 0)); };
  const maxDpr = lite ? 1 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  // 1 · renderer ───────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: lite, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (lite) renderer.toneMapping = THREE.NeutralToneMapping; // phones skip post-processing
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x222222, 0.03);
  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 80);
  await tick(0.1);

  // 2 · lighting / reflections ─────────────────────────────────────────────
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.9;
  const key = new THREE.DirectionalLight(0xfff1de, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x8fb4ff, 1.4);
  rim.position.set(-4, 2, -3);
  const cursorLight = new THREE.PointLight(0xffe2c0, 18, 12, 1.6);
  scene.add(key, rim);
  if (!lite) scene.add(cursorLight);
  await tick(0.3);

  // 3 · background split + camera model ────────────────────────────────────
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthTest: false, depthWrite: false, fog: false,
    uniforms: { colA: { value: new THREE.Color() }, colB: { value: new THREE.Color() }, split: { value: 0.5 }, res: { value: new THREE.Vector2(1, 1) }, time: { value: 0 } },
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  const orient = new THREE.Group(); // rolls the exploded axis upright on portrait screens
  const model = new THREE.Group(); // keyframed position / rotation / scale
  const tilt = new THREE.Group(); // pointer follow
  orient.add(model);
  model.add(tilt);
  scene.add(orient);

  let built = buildCameraModel({ lite });
  if (MODEL_URL) {
    try {
      const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ]);
      const loader = new GLTFLoader();
      const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(MODEL_URL, (e) => e.total && onProgress(0.3 + (e.loaded / e.total) * 0.25));
      const nodes = PARTS.map((d) => gltf.scene.getObjectByName(d.name));
      if (nodes.every(Boolean)) {
        // GLB nodes are positioned at their assembled pose: reuse that as the assembled transform
        const root = new THREE.Group();
        const parts = new Map();
        PARTS.forEach((def, i) => {
          const g = nodes[i];
          g.removeFromParent();
          root.add(g);
          const d2 = { ...def, pos: g.position.toArray(), rot: [g.rotation.x, g.rotation.y, g.rotation.z] };
          const mats = [];
          g.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.userData.baseEmissive = o.material.emissive?.clone() ?? null; o.material.userData.baseOpacity = o.material.opacity; o.material.userData.baseTransparent = o.material.transparent; mats.push(o.material); } });
          const probes = {};
          [['c', 0, 0], ['u', 0, def.rim || 0.5], ['d', 0, -(def.rim || 0.5)], ['l', -(def.rim || 0.5), 0], ['r', def.rim || 0.5, 0]].forEach(([k, x, y]) => { const o = new THREE.Object3D(); o.position.set(x, y, 0); g.add(o); probes[k] = o; });
          parts.set(def.name, { def: d2, group: g, mats, probes });
        });
        built.dispose();
        built = { root, parts, dispose() { draco.dispose(); } };
      } else {
        console.warn('GLB is missing named parts; using the procedural camera. Expected nodes:', PARTS.map((p) => p.name).join(', '));
      }
    } catch (err) {
      console.warn('GLB failed to load; using the procedural camera.', err);
    }
  }
  tilt.add(built.root);
  const parts = built.parts;
  parts.forEach((part) => {
    part.hl = 0; // per-part highlight amount (0–1)
    // Permanently transparent: three bakes an OPAQUE flag into the shader, so toggling it at
    // runtime would not take effect. Opacity 1 + depth writes looks identical to opaque.
    part.mats.forEach((m) => { m.transparent = true; m.userData.baseTransparent = true; m.needsUpdate = true; });
  });
  await tick(0.55);

  // 4 · floating props ─────────────────────────────────────────────────────
  const texLoader = new THREE.TextureLoader();
  const floaters = buildFloaters({ count: lite ? FLOATER_COUNT.lite : FLOATER_COUNT.full, photos, loader: texLoader });
  scene.add(floaters.group);
  await tick(0.7);

  // 5 · separation dust + exposed-part flare (desktop only) ────────────────
  const outers = PARTS.filter((d) => d.kind === 'outer');
  const inners = PARTS.filter((d) => d.kind === 'inner');
  let dust = null;
  let flare = null;
  if (!lite && !reduced) {
    const n = outers.length * PARTICLES.perPart;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1));
    const seeds = Array.from({ length: n }, () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(0.4 + Math.random() * 0.9));
    const mat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { size: { value: PARTICLES.size }, scale: { value: 12 } },
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);
    dust = { points, geo, mat, seeds };
    flare = new THREE.PointLight(0xffb27a, 0, 9, 1.4);
    flare.position.set(0, 0.4, 2.4);
    tilt.add(flare);
  }

  // 6 · post-processing (desktop only) ─────────────────────────────────────
  let composer = null, dof = null, dofPass = null, bloom = null, chroma = null;
  if (!lite) {
    composer = new EffectComposer(renderer, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    dof = new DepthOfFieldEffect(camera, { focusDistance: 7, focusRange: 5, bokehScale: 1, resolutionScale: 0.5 });
    bloom = new BloomEffect({ intensity: 0.4, luminanceThreshold: 0.78, luminanceSmoothing: 0.3, mipmapBlur: true });
    chroma = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.0006, 0.0006), radialModulation: true, modulationOffset: 0.3 });
    const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
    grain.blendMode.opacity.value = 0.22;
    const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.55 });
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
    dofPass = new EffectPass(camera, dof);
    composer.addPass(dofPass);
    composer.addPass(new EffectPass(camera, bloom));
    composer.addPass(new EffectPass(camera, chroma, tone, grain, vignette));
  }
  await tick(0.9);

  // ── part schedule (all absolute master-progress numbers, from explodeConfig) ──
  const sched = new Map();
  PARTS.forEach((def) => {
    if (def.kind === 'outer') {
      sched.set(def.name, {
        start: at('break', T.peelStart + def.order * T.peelStagger),
        dur: T.peelDur * W.break,
        reStart: at('pullback', T.outerReStart + (outers.length - 1 - def.order) * T.outerReStagger),
        reDur: T.reDur * W.pullback,
      });
    } else {
      sched.set(def.name, {
        start: at('explode', T.explodeStart + def.order * T.explodeStagger),
        dur: T.explodeDur * W.explode,
        reStart: at('pullback', T.innerReStart + (inners.length - 1 - def.order) * T.innerReStagger),
        reDur: T.reDur * W.pullback,
      });
    }
  });
  const fadeA = at('explode', T.fadeStart);
  const fadeB = fadeA + T.fadeDur * W.explode;
  const exA = at('explode', 0);
  const exB = at('explode', 1);
  const reA = at('pullback', 0.2);
  const reB = at('pullback', 0.8);

  // ── state ────────────────────────────────────────────────────────────────
  const state = { progress: 0, shown: 0, prevShown: 0, era: 0, px: 0, py: 0, sx: 0, sy: 0, flash: 0, theme, running: false, last: 0, slow: 0, frames: 0, covered: false, highlight: null, hlG: 0, anno: 0 };
  const colA = new THREE.Color(), colB = new THREE.Color();
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();
  const camPos = new THREE.Vector3(), tgt = new THREE.Vector3(), tA = new THREE.Vector3(), tB = new THREE.Vector3(), cA = new THREE.Vector3(), cB = new THREE.Vector3();
  const vtmp = new THREE.Vector3(), vtmp2 = new THREE.Vector3();
  const accent = new THREE.Color(0xff5a3a);
  const anchors = {};
  const listeners = new Set();

  const peelState = new Map(); // raw peel progress per outer part (dust uses it)

  function updateParts(p, time, dt, peelK = 1) {
    const exW = smooth01((p - exA) / (exB - exA)) * (1 - smooth01((p - reA) / (reB - reA)));
    const fadeOut = smooth01((p - fadeA) / (fadeB - fadeA));
    state.hlG += ((state.highlight ? 1 : 0) - state.hlG) * Math.min(1, dt * 8);
    for (const part of parts.values()) {
      const { def, group } = part;
      const s = sched.get(def.name);
      let opacity = 1;
      let amount = 0; // 0 assembled … 1 fully separated
      let tumbleAmt = 0;
      let extra = 0;
      if (reduced) {
        // reduced motion: no flying parts, just crossfades between the three states
        if (def.kind === 'outer') {
          const gone = smooth01((p - at('break', 0.5)) / 0.02) * (1 - smooth01((p - at('pullback', 0.5)) / 0.02));
          opacity = 1 - gone;
        } else {
          amount = smooth01((p - at('explode', 0.5)) / 0.02) * (1 - smooth01((p - at('pullback', 0.3)) / 0.02));
        }
      } else {
        const tp = clamp01((p - s.start) / s.dur);
        const tr = clamp01((p - s.reStart) / s.reDur);
        const back = E.re(tr); // overshoots slightly past 1
        if (def.kind === 'outer') {
          peelState.set(def.name, tp);
          const out = E.peel(tp);
          amount = out * (1 - back);
          tumbleAmt = E.tumble(tp) * (1 - back);
          extra = fadeOut * T.driftExtra * (1 - back);
          opacity = 1 - fadeOut * (1 - clamp01(tr * 3));
        } else {
          amount = E.explode(tp) * (1 - back);
        }
      }
      if (def.kind === 'outer') {
        const d = def.peel;
        const dist = d.dist * peelK * amount * (1 + extra);
        vtmp.set(...d.dir).normalize().multiplyScalar(dist);
        group.position.set(def.pos[0] + vtmp.x, def.pos[1] + vtmp.y, def.pos[2] + vtmp.z);
        group.rotation.set(def.rot[0] + d.tumble[0] * tumbleAmt, def.rot[1] + d.tumble[1] * tumbleAmt, def.rot[2] + d.tumble[2] * tumbleAmt);
      } else {
        const drift = reduced ? 0 : Math.sin(time * 0.7 + def.order) * 0.05 * exW;
        group.position.set(def.pos[0], def.pos[1] + drift, def.pos[2] + (def.z - def.pos[2]) * amount);
      }
      // highlight: dim everything but the hovered part
      const isHl = state.highlight === def.name;
      part.hl += ((isHl ? 1 : 0) - part.hl) * Math.min(1, dt * 10);
      const dim = 1 - (isHl ? 0 : 0.78) * state.hlG;
      const o = opacity * dim;
      group.visible = o > 0.015;
      for (const m of part.mats) {
        m.opacity = m.userData.baseOpacity * o;
        if (m.emissive && m.userData.baseEmissive) { const e = m.userData.baseEmissive, h = part.hl * 0.5; m.emissive.setRGB(e.r + accent.r * h, e.g + accent.g * h, e.b + accent.b * h); }
      }
    }
    return exW;
  }

  function updateDust(p) {
    if (!dust) return;
    const pos = dust.geo.attributes.position;
    const alpha = dust.geo.attributes.alpha;
    let k = 0;
    outers.forEach((def) => {
      const tp = peelState.get(def.name) ?? 0;
      const w = tp > 0 && tp < 0.8 ? Math.sin(Math.PI * (tp / 0.8)) : 0;
      built.root.localToWorld(vtmp2.set(...def.pos));
      for (let i = 0; i < PARTICLES.perPart; i++, k++) {
        const sd = dust.seeds[k];
        pos.setXYZ(k, vtmp2.x + sd.x * PARTICLES.spread * tp, vtmp2.y + sd.y * PARTICLES.spread * tp - tp * tp * 0.4, vtmp2.z + sd.z * PARTICLES.spread * tp);
        alpha.setX(k, w * 0.8);
      }
    });
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    dust.mat.uniforms.scale.value = 12 * renderer.getPixelRatio(); // size is in px at ~12 units away
    flare.intensity = 9 * bump(p, EVENTS.flare[0], EVENTS.flare[1]);
  }

  function resolveFrame(k, outT, outC) {
    if (Array.isArray(k.target)) outT.set(...k.target);
    else {
      const part = parts.get(k.target.part);
      if (part) part.group.getWorldPosition(outT); else outT.set(0, 0, 0);
      if (k.target.off) outT.add(vtmp.set(...k.target.off));
    }
    if (Array.isArray(k.cam)) outC.set(...k.cam); else outC.copy(outT).add(vtmp.set(...k.cam.rel));
  }

  let sizeW = 0, sizeH = 0;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (lite && sizeW === w && Math.abs(sizeH - h) < 160 && sizeH) return; // phone address bar
    sizeW = w; sizeH = h;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer?.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bgMat.uniforms.res.value.set(w * dpr, h * dpr);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  function frame(now) {
    if (state.covered) { state.last = now; return; } // hidden behind the gallery: skip all work
    const dt = Math.min(0.05, (now - state.last) / 1000 || 0.016);
    state.last = now;
    const time = now / 1000;

    state.shown += (state.progress - state.shown) * Math.min(1, dt * 9);
    state.sx += (state.px - state.sx) * Math.min(1, dt * 4);
    state.sy += (state.py - state.sy) * Math.min(1, dt * 4);
    state.flash *= Math.pow(0.02, dt);
    if (typeof window.__pfProgress === 'number') state.shown = state.progress; // debug slider: no easing
    const p = state.shown;

    // events tied to progress
    if (!reduced && state.prevShown < EVENTS.shutter && p >= EVENTS.shutter) { state.flash = 1; onShutter(); }
    state.prevShown = p;

    const k = sample(p);
    const aspect = camera.aspect;
    const portrait = aspect < BP.portraitBelow;
    const narrow = aspect < 1.2 ? 1 + (1.2 - aspect) * 0.95 : 1;
    const sideScale = Math.min(1, Math.max(0.3, aspect / 1.6));

    // model transform (keyframed) then the parts' own motion
    const follow = reduced ? 0 : k.follow;
    model.position.set(k.pos[0] * sideScale, k.pos[1] + (reduced ? 0 : Math.sin(time * 0.8) * 0.06), k.pos[2]);
    model.rotation.set(k.rot[0], k.rot[1], k.rot[2]);
    model.scale.setScalar(k.scale * (1 - state.flash * 0.03));
    tilt.rotation.set(state.sy * 0.35 * follow + (reduced ? 0 : Math.sin(time * 0.5) * 0.02), state.sx * 0.55 * follow, 0);
    const exW = updateParts(p, time, dt, portrait ? BP.portrait.peelScale ?? 1 : 1);
    orient.rotation.z = portrait && BP.portrait.rollAxis ? (Math.PI / 2) * exW : 0;
    orient.updateMatrixWorld(true);

    // camera: keyframes may follow a part, so resolve after the parts have moved
    resolveFrame(k.a, tA, cA);
    resolveFrame(k.b, tB, cB);
    tgt.lerpVectors(tA, tB, k.t);
    camPos.lerpVectors(cA, cB, k.t);
    const explFit = portrait ? BP.portrait.fit : aspect < BP.squareBelow ? BP.landscape.fitSquareish : BP.landscape.fit;
    const fit = lerp(narrow, explFit, exW);
    camPos.sub(tgt).multiplyScalar(fit).add(tgt);
    camPos.x += state.sx * 0.35 * follow;
    camPos.y += state.sy * 0.2 * follow;
    if (!reduced) {
      const sh = bump(p, EVENTS.shutter - 0.004, EVENTS.shutter + 0.02) * 0.06;
      if (sh > 0.0005) { camPos.x += Math.sin(time * 71) * sh; camPos.y += Math.cos(time * 83) * sh; }
    }
    camera.position.copy(camPos);
    camera.lookAt(tgt);
    camera.fov = k.fov;
    // shift the image: left on landscape (text on the right), up on portrait (text below)
    const Wp = window.innerWidth, Hp = window.innerHeight;
    const sx = portrait ? 0 : k.shift * Wp;
    const sy = portrait ? k.shift * 0.9 * Hp : 0;
    if (sx > 0.5 || sy > 0.5) camera.setViewOffset(Wp, Hp, sx, sy, Wp, Hp); else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    cursorLight.position.set(state.sx * 4, -state.sy * 2.5 + 0.5, 3.2).add(model.position);
    key.intensity = 2.2 + state.flash * 3;

    const pair = state.theme === 'light' ? 'light' : 'dark';
    colA.set(k.a.bg[pair][0]).lerp(tmpA.set(k.b.bg[pair][0]), k.t);
    colB.set(k.a.bg[pair][1]).lerp(tmpB.set(k.b.bg[pair][1]), k.t);
    bgMat.uniforms.colA.value.copy(colA);
    bgMat.uniforms.colB.value.copy(colB);
    bgMat.uniforms.split.value = k.split;
    scene.fog.color.copy(colA).lerp(colB, 0.5);
    scene.fog.density = k.fog;

    floaters.update(time, k.floaters, state.era, state.flash);
    updateDust(p);

    if (dofPass) {
      dof.cocMaterial.focusDistance = camera.position.distanceTo(tgt);
      dof.cocMaterial.focusRange = k.range;
      dof.bokehScale = k.bokeh;
    }
    if (bloom) {
      bloom.intensity = k.bloom + state.flash * 1.2 + (flare ? 0.12 * bump(p, EVENTS.flare[0], EVENTS.flare[1]) : 0);
      chroma.offset.set(0.0005 + state.flash * 0.004, 0.0005 + state.flash * 0.004);
    }

    if (composer) composer.render(dt); else renderer.render(scene, camera);

    // annotation weight + projected anchors for the leader lines (this frame's final camera)
    state.anno = smooth01((p - ANNOTATE.in[0]) / (ANNOTATE.in[1] - ANNOTATE.in[0])) * (1 - smooth01((p - ANNOTATE.out[0]) / (ANNOTATE.out[1] - ANNOTATE.out[0])));
    if (state.anno > 0.001 || listeners.size) {
      camera.updateMatrixWorld();
      for (const part of parts.values()) {
        if (!part.def.label && !listeners.size) continue;
        const a = anchors[part.def.name] || (anchors[part.def.name] = {});
        for (const key2 of ['c', 'u', 'd', 'l', 'r']) {
          part.probes[key2].getWorldPosition(vtmp);
          vtmp.project(camera);
          a[key2] = [(vtmp.x * 0.5 + 0.5) * Wp, (-vtmp.y * 0.5 + 0.5) * Hp];
        }
      }
    }
    listeners.forEach((fn) => fn(state));

    state.frames++;
    state.slow = state.slow * 0.95 + dt * 0.05;
    if (state.frames % 90 === 0 && state.slow > 0.026 && dpr > (lite ? 0.7 : 1)) {
      dpr = Math.max(lite ? 0.7 : 1, dpr - 0.25);
      resize();
    }
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.last = performance.now();
    renderer.setAnimationLoop(frame);
  }
  function stop() {
    state.running = false;
    renderer.setAnimationLoop(null);
  }
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  frame(performance.now());
  await tick(1);

  return {
    start,
    stop,
    anchors,
    state,
    internals: { scene, composer, renderer, camera, dust, flare, bgMat, model, parts },
    debugInfo: () => ({ cam: camera.position.toArray(), fov: camera.fov, aspect: camera.aspect, colA: colA.getHexString(), colB: colB.getHexString(), split: bgMat.uniforms.split.value, visible: [...parts.values()].filter((q) => q.group.visible).length, res: bgMat.uniforms.res.value.toArray(), nan: Number.isNaN(camera.position.x) }),
    partNames: PARTS.map((d) => d.name),
    setProgress: (p) => { state.progress = p; },
    setEra: (e) => { state.era = e; },
    setPointer: (x, y) => { if (!reduced) { state.px = x; state.py = y; } },
    setTheme: (t) => { state.theme = t; },
    setCovered: (c) => { state.covered = c; },
    setHighlight: (name) => { state.highlight = name; },
    pulse: () => { if (!reduced) state.flash = 1; },
    onFrame: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    dispose() {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      document.removeEventListener('visibilitychange', onVis);
      listeners.clear();
      floaters.dispose();
      built.dispose();
      dust?.geo.dispose(); dust?.mat.dispose();
      bg.geometry.dispose(); bgMat.dispose();
      envRT.dispose(); pmrem.dispose();
      composer?.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

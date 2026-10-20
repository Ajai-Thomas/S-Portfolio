// Scroll-driven WebGL scene engine. No React in here: see Scene.jsx for the wrapper.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect, DepthOfFieldEffect, NoiseEffect,
  VignetteEffect, ChromaticAberrationEffect, ToneMappingEffect, ToneMappingMode, BlendFunction,
} from 'postprocessing';
import { KEYFRAMES, FLOATER_COUNT, MODEL_URL } from './config';
import { buildCameraModel } from './cameraModel';
import { buildFloaters } from './floaters';

const lerp = (a, b, t) => a + (b - a) * t;
const lerpArr = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (t) => lerp(t, smooth(t), 0.65); // mostly smooth, never fully stops

const SCALARS = ['fov', 'scale', 'split', 'bokeh', 'range', 'bloom', 'fog', 'floaters', 'follow', 'shift'];
const VECTORS = ['cam', 'target', 'pos', 'rot'];

function sample(p) {
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].p) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = ease(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p || 1))));
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
  c += (uv.y - 0.5) * 0.05;            // soft vertical falloff
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export async function createScene({ canvas, lite = false, theme = 'dark', photos = [], onProgress = () => {} }) {
  const tick = (v) => { onProgress(v); return new Promise((r) => setTimeout(r, 0)); };
  const maxDpr = lite ? 1 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  // 1 · renderer ───────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: lite, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  // Phones skip the post-processing chain entirely: tone-map straight to the screen.
  if (lite) renderer.toneMapping = THREE.NeutralToneMapping;
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
  const cursorLight = new THREE.PointLight(0xffe2c0, 18, 12, 1.6); // the lens "looks" at the cursor
  scene.add(key, rim);
  if (!lite) scene.add(cursorLight); // per-pixel light: desktop only
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

  const model = new THREE.Group();
  const tilt = new THREE.Group(); // pointer-follow lives here so it never fights keyframe rotation
  model.add(tilt);
  scene.add(model);
  let built = null;
  if (MODEL_URL) {
    const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]);
    const loader = new GLTFLoader();
    const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(MODEL_URL, (e) => e.total && onProgress(0.3 + (e.loaded / e.total) * 0.4));
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(c);
    const holder = new THREE.Group();
    holder.add(gltf.scene);
    holder.scale.setScalar(2.5 / Math.max(size.x, size.z, 0.001));
    built = { root: holder, glass: null, dispose() { gltf.scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose()); }); draco.dispose(); } };
  } else {
    built = buildCameraModel({ lite });
  }
  tilt.add(built.root);
  await tick(0.55);

  // 4 · floating props ─────────────────────────────────────────────────────
  const texLoader = new THREE.TextureLoader();
  const floaters = buildFloaters({ count: lite ? FLOATER_COUNT.lite : FLOATER_COUNT.full, photos, loader: texLoader });
  scene.add(floaters.group);
  await tick(0.7);

  // 5 · post-processing (desktop only) ─────────────────────────────────────
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

  // ── state ────────────────────────────────────────────────────────────────
  const state = { progress: 0, shown: 0, era: 0, px: 0, py: 0, sx: 0, sy: 0, flash: 0, theme, running: false, last: 0, slow: 0, frames: 0 };
  const colA = new THREE.Color(), colB = new THREE.Color();
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();
  const camPos = new THREE.Vector3(), tgt = new THREE.Vector3();

  let sizeW = 0, sizeH = 0;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    // phones fire resize when the address bar hides/shows: ignore small height-only changes
    if (lite && sizeW === w && Math.abs(sizeH - h) < 160 && sizeH) return;
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

    // ease scroll + pointer so nothing is ever abrupt
    state.shown += (state.progress - state.shown) * Math.min(1, dt * 7);
    state.sx += (state.px - state.sx) * Math.min(1, dt * 4);
    state.sy += (state.py - state.sy) * Math.min(1, dt * 4);
    state.flash *= Math.pow(0.02, dt);

    const k = sample(state.shown);
    const aspect = camera.aspect;
    const narrow = aspect < 1.2 ? 1 + (1.2 - aspect) * 0.95 : 1; // pull back on portrait screens
    const sideScale = Math.min(1, Math.max(0.3, aspect / 1.6));

    // camera
    tgt.set(...k.target);
    camPos.set(...k.cam).sub(tgt).multiplyScalar(narrow).add(tgt);
    camPos.x += state.sx * 0.35 * k.follow;
    camPos.y += state.sy * 0.2 * k.follow;
    camera.position.copy(camPos);
    camera.lookAt(tgt);
    camera.fov = k.fov;
    // shift the whole image left by a fraction of the width so text can own the right half
    const W = window.innerWidth, H = window.innerHeight;
    // landscape: subject slides left (text on the right). portrait: subject slides up (text below).
    const portrait = aspect < 0.9;
    const sx = portrait ? 0 : k.shift * W;
    const sy = portrait ? k.shift * 0.9 * H : 0;
    if (sx > 0.5 || sy > 0.5) camera.setViewOffset(W, H, sx, sy, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // model: keyframed transform + idle float + pointer follow
    model.position.set(k.pos[0] * sideScale, k.pos[1] + Math.sin(time * 0.8) * 0.06, k.pos[2]);
    model.rotation.set(k.rot[0], k.rot[1], k.rot[2]);
    model.scale.setScalar(k.scale * (1 - state.flash * 0.03));
    tilt.rotation.set(state.sy * 0.35 * k.follow + Math.sin(time * 0.5) * 0.02, state.sx * 0.55 * k.follow, 0);

    // light that tracks the cursor in front of the lens
    cursorLight.position.set(state.sx * 4, -state.sy * 2.5 + 0.5, 3.2).add(model.position);
    key.intensity = 2.2 + state.flash * 3;

    // background + fog
    const pair = state.theme === 'light' ? 'light' : 'dark';
    colA.set(k.a.bg[pair][0]).lerp(tmpA.set(k.b.bg[pair][0]), k.t);
    colB.set(k.a.bg[pair][1]).lerp(tmpB.set(k.b.bg[pair][1]), k.t);
    bgMat.uniforms.colA.value.copy(colA);
    bgMat.uniforms.colB.value.copy(colB);
    bgMat.uniforms.split.value = k.split;
    scene.fog.color.copy(colA).lerp(colB, 0.5);
    scene.fog.density = k.fog;

    // props
    floaters.update(time, k.floaters, state.era, state.flash);

    // depth of field: focus on whatever the camera is looking at
    if (dofPass) {
      // focus on whatever the camera is looking at; props nearer/further blur
      dof.cocMaterial.focusDistance = camera.position.distanceTo(tgt);
      dof.cocMaterial.focusRange = k.range;
      dof.bokehScale = k.bokeh;
    }
    if (bloom) {
      bloom.intensity = k.bloom + state.flash * 1.2;
      chroma.offset.set(0.0005 + state.flash * 0.004, 0.0005 + state.flash * 0.004);
    }

    if (composer) composer.render(dt); else renderer.render(scene, camera);

    // adaptive quality: if we're consistently slow, drop resolution
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

  frame(performance.now()); // first frame so the loader can reveal a finished image
  await tick(1);

  return {
    start,
    stop,
    setProgress: (p) => { state.progress = p; },
    setEra: (e) => { state.era = e; },
    setCovered: (c) => { state.covered = c; },
    setPointer: (x, y) => { state.px = x; state.py = y; }, // both −1 … 1
    setTheme: (t) => { state.theme = t; },
    pulse: () => { state.flash = 1; },
    dispose() {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      document.removeEventListener('visibilitychange', onVis);
      floaters.dispose();
      built.dispose();
      bg.geometry.dispose(); bgMat.dispose();
      envRT.dispose(); pmrem.dispose();
      composer?.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

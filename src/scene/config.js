// ─────────────────────────────────────────────────────────────────────────────
// Scroll flow configuration. Edit this file to tune the whole 3D journey.
//
// The page is split into sections (see SECTION_WEIGHTS). Each section owns a
// slice of the master progress value (0 → 1), regardless of how tall it is on
// screen, so keyframes stay correct on phones and desktops alike.
//
// Keyframe fields
//   p       master progress (0–1) this keyframe is reached at
//   cam     camera position  [x, y, z]
//   target  camera look-at   [x, y, z]  (put it to the right of the subject to
//                                          push the subject to the left of the screen)
//   fov     vertical field of view, degrees
//   pos     model position [x, y, z]
//   rot     model rotation, radians [x, y, z]   (y = π/2 → side profile)
//   scale   model scale
//   bg      { dark: [colourA, colourB], light: [colourA, colourB] } background split
//   split   0–1 where the diagonal colour split sits (0.5 = centre)
//   bokeh   depth-of-field blur strength        range  depth-of-field focus range (world units)
//   bloom   glow intensity                      fog    fog density
//   floaters 0–1 how many floating objects are visible
//   follow  0–1 how strongly the model follows the mouse / touch
//   shift   0–0.5 slides the whole image left by that fraction of the screen width (optional)
// Interpolation between keyframes is eased, so nothing ever jumps.
// ─────────────────────────────────────────────────────────────────────────────

// Share of the master progress each page section gets. Must sum to 1.
export const SECTION_WEIGHTS = {
  hero: 0.07,
  dive: 0.1,
  about: 0.43,
  pullback: 0.08,
  works: 0.2,
  contact: 0.12,
};

// Where the camera model lives on the lens, in model space (used by the dive-in).
export const LENS = [0, 0, 1.5];

// Optional: path to a .glb in /public to use instead of the procedural camera,
// e.g. '/models/camera.glb'. See README → "Swap the camera model".
export const MODEL_URL = null;

const hero = { dark: ['#3a2d33', '#243044'], light: ['#f4d8cf', '#cbd8ea'] };
const dive = { dark: ['#2b2a3d', '#16303a'], light: ['#e8d3e6', '#bfe0e3'] };
const eraA = { dark: ['#332a22', '#1d2b31'], light: ['#f3e0c6', '#c9dcd4'] };
const eraB = { dark: ['#2a2f3b', '#2c2230'], light: ['#d9e0f0', '#ecd2dc'] };
const eraC = { dark: ['#2f2a20', '#263029'], light: ['#f0e4bd', '#cde3c9'] };
const works = { dark: ['#100f0e', '#17140f'], light: ['#cfc5b3', '#bdb2a0'] };
const outro = { dark: ['#3a2622', '#1f2431'], light: ['#f6d9c8', '#d3dff2'] };

const REST_ROT = [0.1, -0.32, 0.05];

export const KEYFRAMES = [
  // 1 · HERO ────────────────────────────────────────────────────────────────
  { p: 0.0, cam: [0, 0.25, 7.6], target: [0, 0, 0], fov: 34, pos: [0, 0, 0], rot: REST_ROT, scale: 1, bg: hero, split: 0.5, bokeh: 1.2, range: 5, bloom: 0.35, fog: 0.03, floaters: 0.8, follow: 1 },
  { p: 0.07, cam: [0, 0.2, 6.9], target: [0, 0, 0.2], fov: 34, pos: [0, 0, 0], rot: [0.08, -0.2, 0.03], scale: 1, bg: hero, split: 0.52, bokeh: 1.6, range: 4.5, bloom: 0.35, fog: 0.03, floaters: 1, follow: 1 },

  // 2 · DIVE-IN: fly into the lens glass ────────────────────────────────────
  { p: 0.12, cam: [0, 0.05, 4.1], target: [0, 0, 1.4], fov: 40, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: dive, split: 0.45, bokeh: 3, range: 1.6, bloom: 0.6, fog: 0.05, floaters: 1, follow: 0.4 },
  { p: 0.17, cam: [0, 0.02, 2.75], target: [0, 0, 1.5], fov: 46, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: dive, split: 0.4, bokeh: 4, range: 0.9, bloom: 0.8, fog: 0.06, floaters: 1, follow: 0.2 },

  // 3 · ABOUT / JOURNEY: slow macro moves over the camera, one per entry.
  //     shift 0.23 pushes the camera to the left so the timeline owns the right half.
  { p: 0.22, cam: [-0.7, 1.5, 3.3], target: [-0.7, 0.8, 0], fov: 38, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: eraA, split: 0.55, bokeh: 1.6, range: 2.2, bloom: 0.5, fog: 0.04, floaters: 0.9, follow: 0.15, shift: 0.23 },
  { p: 0.3, cam: [-1.3, 0.25, 3.7], target: [0, 0, 1.1], fov: 38, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: eraB, split: 0.45, bokeh: 1.6, range: 2.2, bloom: 0.55, fog: 0.04, floaters: 0.9, follow: 0.15, shift: 0.23 },
  { p: 0.39, cam: [2.4, 0.3, 3.2], target: [0.9, 0.1, 0.3], fov: 38, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: eraC, split: 0.58, bokeh: 1.6, range: 2.2, bloom: 0.5, fog: 0.04, floaters: 0.9, follow: 0.15, shift: 0.23 },
  { p: 0.48, cam: [-1.9, -1.0, 3.3], target: [-0.7, -0.5, 0.3], fov: 38, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: eraB, split: 0.42, bokeh: 1.6, range: 2.2, bloom: 0.5, fog: 0.04, floaters: 0.9, follow: 0.15, shift: 0.23 },
  { p: 0.57, cam: [1.5, 1.5, 2.8], target: [0.85, 0.8, -0.1], fov: 40, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, bg: eraA, split: 0.5, bokeh: 1.4, range: 2.4, bloom: 0.45, fog: 0.04, floaters: 0.8, follow: 0.2, shift: 0.23 },

  // 4 · PULL-BACK: swing round to a side profile, park on the left ──────────
  { p: 0.62, cam: [1.5, 0.4, 7.5], target: [0.3, 0, 0], fov: 36, pos: [-0.8, 0, 0], rot: [0.05, 0.9, 0], scale: 0.9, bg: works, split: 0.5, bokeh: 2, range: 3, bloom: 0.35, fog: 0.04, floaters: 0.4, follow: 0.1 },
  { p: 0.68, cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, pos: [-3.5, 0.3, 0], rot: [0.04, Math.PI / 2, 0], scale: 0.85, bg: works, split: 0.5, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.12, follow: 0.1 },

  // 5 · WORKS: model parked at the side, slow rotation per section ──────────
  { p: 0.76, cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, pos: [-3.5, 0.3, 0], rot: [0.04, Math.PI / 2 + 0.35, 0], scale: 0.85, bg: works, split: 0.5, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1, follow: 0.1 },
  { p: 0.84, cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, pos: [-3.5, 0.3, 0], rot: [0.04, Math.PI / 2 - 0.25, 0], scale: 0.85, bg: works, split: 0.5, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1, follow: 0.1 },
  { p: 0.88, cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, pos: [-3.5, 0.3, 0], rot: [0.04, Math.PI / 2, 0], scale: 0.85, bg: works, split: 0.5, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1, follow: 0.1 },

  // 6 · CONTACT: turn back to face the viewer ───────────────────────────────
  { p: 1.0, cam: [0, 0.2, 8.2], target: [0, 0, 0], fov: 34, pos: [0, -0.2, 0], rot: REST_ROT, scale: 1, bg: outro, split: 0.5, bokeh: 1.4, range: 4.5, bloom: 0.5, fog: 0.03, floaters: 0.35, follow: 0.8 },
];

// How many floating objects at each quality level.
export const FLOATER_COUNT = { full: 30, lite: 6 };

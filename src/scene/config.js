// ─────────────────────────────────────────────────────────────────────────────
// Scroll flow configuration: camera, model and background keyed to master progress.
// The break-apart timing (which part moves when, how far) is in explodeConfig.js.
//
// Keyframe fields
//   p       master progress (0–1). Use at('section', 0–1) so it follows section weights.
//   cam     camera position [x, y, z]  — or { rel: [x, y, z] } = offset from the target
//   target  look-at [x, y, z]          — or { part: 'sensor', off: [x, y, z] } = follow a part
//   fov     vertical field of view, degrees
//   pos     model position [x, y, z]     rot  model rotation, radians (y = π/2 → side profile)
//   scale   model scale
//   bg      { dark: [colourA, colourB], light: [colourA, colourB] } background split
//   split   0–1 where the diagonal colour split sits
//   bokeh   depth-of-field blur strength   range  depth-of-field focus range (world units)
//   bloom   glow intensity                 fog    fog density
//   floaters 0–1 amount of floating props  follow 0–1 mouse/touch follow strength
//   shift   0–0.5 slides the image left (landscape) / up (portrait) by that fraction of the screen
// Interpolation between keyframes is eased, so nothing ever jumps.
// ─────────────────────────────────────────────────────────────────────────────
import { at, SECTION_WEIGHTS } from './explodeConfig';

export { SECTION_WEIGHTS };

// Optional: path to a .glb in /public with nodes named exactly like the parts in
// explodeConfig.js. If any node is missing the procedural camera is used instead.
export const MODEL_URL = null;

const hero = { dark: ['#3a2d33', '#243044'], light: ['#f4d8cf', '#cbd8ea'] };
const tilt = { dark: ['#2b2a3d', '#16303a'], light: ['#e8d3e6', '#bfe0e3'] };
const eraA = { dark: ['#332a22', '#1d2b31'], light: ['#f3e0c6', '#c9dcd4'] };
const eraB = { dark: ['#2a2f3b', '#2c2230'], light: ['#d9e0f0', '#ecd2dc'] };
const eraC = { dark: ['#2f2a20', '#263029'], light: ['#f0e4bd', '#cde3c9'] };
const works = { dark: ['#100f0e', '#17140f'], light: ['#cfc5b3', '#bdb2a0'] };
const outro = { dark: ['#3a2622', '#1f2431'], light: ['#f6d9c8', '#d3dff2'] };

const REST_ROT = [0.1, -0.32, 0.05];
const THREE_QUARTER = [0.25, -0.78, 0.05]; // ~45° diagonal, like the lens in the reference
const AXIS_ROT = [0.12, 1.3, 0]; // lens axis (+Z) now points along screen X
const base = { pos: [0, 0, 0], scale: 1, split: 0.5, fog: 0.03, follow: 0.1 };

// Journey entries: the camera parks on a different exploded part for each one.
const ABOUT_FOCUS = ['sensor', 'lens_mount', 'lens_barrel_outer', 'lens_element_4', 'aperture_blades', 'lens_element_1'];
const aboutFrames = ABOUT_FOCUS.map((part, i) => ({
  ...base,
  p: at('about', (i + 0.5) / ABOUT_FOCUS.length),
  target: { part, off: [0, 0, 0] },
  cam: { rel: [i % 2 ? -0.9 : 0.9, 0.55, 3.4] },
  fov: 38, rot: AXIS_ROT, bg: [eraA, eraB, eraC][i % 3], split: 0.45 + (i % 3) * 0.06,
  bokeh: 3.2, range: 1.4, bloom: 0.45, floaters: 0.15, follow: 0.1, shift: 0.23,
}));

export const KEYFRAMES = [
  // HERO: assembled, front-on
  { ...base, p: 0, cam: [0, 0.25, 7.6], target: [0, 0, 0], fov: 34, rot: REST_ROT, bg: hero, bokeh: 1.2, range: 5, bloom: 0.35, floaters: 0.8, follow: 1 },
  { ...base, p: at('hero', 1), cam: [0, 0.2, 6.9], target: [0, 0, 0.2], fov: 34, rot: [0.08, -0.2, 0.03], bg: hero, split: 0.52, bokeh: 1.6, range: 4.5, bloom: 0.35, floaters: 1, follow: 1 },

  // TILT & SETTLE: turn to a 3/4 view and ease back so the whole object is visible
  { ...base, p: at('tilt', 1), cam: [0, 0.45, 10.5], target: [0, 0, 0.3], fov: 34, rot: THREE_QUARTER, bg: tilt, split: 0.46, bokeh: 1.2, range: 8, bloom: 0.4, floaters: 0.5, follow: 0.35 },

  // BREAK-OFF: outer parts peel; camera backs off to keep them in frame
  { ...base, p: at('break', 1), cam: [0, 0.6, 12.8], target: [0, 0, 0.4], fov: 34, rot: THREE_QUARTER, bg: tilt, split: 0.42, bokeh: 0.9, range: 9, bloom: 0.5, floaters: 0.3, follow: 0.2 },

  // EXPLODE: axis becomes horizontal and centred
  { ...base, p: at('explode', 1), cam: [0, 0.4, 14.2], target: [0, 0, 0], fov: 34, rot: AXIS_ROT, bg: eraB, split: 0.4, bokeh: 0.7, range: 10, bloom: 0.35, floaters: 0, follow: 0.1 },

  // ANNOTATE: hold while labels draw in
  { ...base, p: at('annotate', 1), cam: [0, 0.3, 13.8], target: [0, 0, 0], fov: 34, rot: AXIS_ROT, bg: eraB, split: 0.42, bokeh: 0.7, range: 10, bloom: 0.35, floaters: 0, follow: 0.1 },

  // ABOUT: macro glide along the exploded axis
  ...aboutFrames,

  // PULL-BACK: reassemble, swing to side profile, park on the left
  { ...base, p: at('pullback', 0.35), cam: [0, 0.35, 12], target: [0, 0, 0], fov: 34, rot: [0.08, 1.45, 0], pos: [-1, 0, 0], scale: 0.95, bg: works, bokeh: 1.4, range: 6, bloom: 0.4, floaters: 0.1, follow: 0.1 },
  { ...base, p: at('pullback', 1), cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, rot: [0.04, Math.PI / 2, 0], pos: [-3.5, 0.3, 0], scale: 0.85, bg: works, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1 },

  // WORKS: parked, slow rotation per section
  { ...base, p: at('works', 0.25), cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, rot: [0.04, Math.PI / 2 + 0.35, 0], pos: [-3.5, 0.3, 0], scale: 0.85, bg: works, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1 },
  { ...base, p: at('works', 0.75), cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, rot: [0.04, Math.PI / 2 - 0.25, 0], pos: [-3.5, 0.3, 0], scale: 0.85, bg: works, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1 },
  { ...base, p: at('works', 1), cam: [0, 0.3, 9.4], target: [0, 0, 0], fov: 34, rot: [0.04, Math.PI / 2, 0], pos: [-3.5, 0.3, 0], scale: 0.85, bg: works, bokeh: 0.8, range: 6, bloom: 0.25, fog: 0.02, floaters: 0.1 },

  // CONTACT: face the viewer again
  { ...base, p: 1, cam: [0, 0.2, 8.2], target: [0, 0, 0], fov: 34, pos: [0, -0.2, 0], rot: REST_ROT, bg: outro, bokeh: 1.4, range: 4.5, bloom: 0.5, floaters: 0.35, follow: 0.8 },
];

// How many floating objects at each quality level.
export const FLOATER_COUNT = { full: 24, lite: 6 };

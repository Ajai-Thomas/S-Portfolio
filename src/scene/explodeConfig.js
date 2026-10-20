// ─────────────────────────────────────────────────────────────────────────────
// "Camera breaks apart" sequence: every number that times or spaces it lives here.
//
// Master scroll progress runs 0 → 1 over the whole page. Each page section owns a
// slice of it (SECTION_WEIGHTS). Everything below is expressed with at(section, 0–1),
// i.e. "this far through that section", so if you change a weight, every part's
// timing moves with it. Edit numbers only; no engine code needs touching.
//
//   hero      assembled camera, title in front
//   tilt      title fades, camera turns to a 3/4 angle and eases back
//   break     OUTER parts peel off in a staggered cascade (outside → in)
//   explode   INNER parts slide apart along the optical axis
//   annotate  leader lines + skill labels draw in
//   about     timeline over the right half, camera glides along the exploded axis
//   pullback  parts fly back together, camera pulls back to a side profile and parks
//   works     gallery / albums / video / diary
//   contact   camera faces the viewer again
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_WEIGHTS = {
  hero: 0.06,
  tilt: 0.06,
  break: 0.09,
  explode: 0.09,
  annotate: 0.06,
  about: 0.26,
  pullback: 0.1,
  works: 0.16,
  contact: 0.12,
};

const ORDER = Object.keys(SECTION_WEIGHTS);
/** Absolute master progress `f` (0–1) of the way through `section`. */
export function at(section, f = 0) {
  let cum = 0;
  for (const k of ORDER) {
    if (k === section) return cum + SECTION_WEIGHTS[k] * f;
    cum += SECTION_WEIGHTS[k];
  }
  throw new Error(`explodeConfig: unknown section "${section}"`);
}

// Easings (GSAP names). Nothing is linear.
export const EASE = {
  peel: 'power3.out',
  tumble: 'sine.inOut',
  explode: 'expo.inOut',
  reassemble: 'back.out(1.2)',
};

// How long each part's own move takes, as a fraction of its section.
export const TIMING = {
  peelStart: 0.04, // first outer part starts this far into `break`
  peelStagger: 0.07, // each following outer part starts this much later (fraction of `break`)
  peelDur: 0.34, // duration of one part's peel (fraction of `break`)
  fadeStart: 0.35, // outer parts fade away while drifting (fraction of `explode`)
  fadeDur: 0.5,
  explodeStart: 0.02, // first inner part starts this far into `explode`
  explodeStagger: 0.035,
  explodeDur: 0.5,
  innerReStart: 0.0, // reassemble: inner parts go first (fraction of `pullback`)
  innerReStagger: 0.03,
  outerReStart: 0.18, // …then outer parts, in reverse order of peeling
  outerReStagger: 0.03,
  reDur: 0.4,
  driftExtra: 0.35, // outer parts keep drifting this much further while they fade
};

// Annotation window (labels draw in, hold, draw out as the timeline arrives).
export const ANNOTATE = {
  in: [at('explode', 0.85), at('annotate', 0.3)],
  out: [at('annotate', 0.85), at('about', 0.04)],
};

// Moments tied to the progress timeline.
export const EVENTS = {
  shutter: at('pullback', 0.78), // shutter-click flash + camera shake when fully reassembled
  dust: [at('break', 0), at('explode', 0.3)],
  flare: [at('break', 0.1), at('explode', 0.25)],
};

// Per-breakpoint adaptation of the exploded view (camera distance multiplier).
// `landscape` = wide screens, axis horizontal. `portrait` = tall screens, axis turns vertical.
export const BREAKPOINTS = {
  landscape: { fit: 1, fitSquareish: 1.35, rollAxis: false },
  portrait: { fit: 1.3, rollAxis: true, peelScale: 0.62 }, // peelScale shrinks how far outer parts fly on tall screens
  portraitBelow: 0.9, // aspect ratio under which the portrait settings apply
  squareBelow: 1.3, // aspect ratio under which fitSquareish applies
};

// Particles (dust / metal shavings) at the moment of separation. Desktop only.
export const PARTICLES = { perPart: 10, size: 5, spread: 1.6 };

// Default service labels. Override any of them from content.json → about.skills.
// ── PART TABLE ───────────────────────────────────────────────────────────────
// kind       'outer' peels off first and fades; 'inner' slides along the optical axis
// order      stagger index within its kind (0 goes first when peeling, last when reassembling)
// pos / rot  assembled transform (model space; +Z is the lens axis)
// peel       { dir: outward direction, dist: how far, tumble: rotation in radians }
// z          exploded position along the optical axis (inner parts)
// label      default service text, side 'L' | 'R', rim = radius used to attach the leader line
export const PARTS = [
  // ── outer parts (peel order: outside → in) ──
  { name: 'lens_hood', kind: 'outer', order: 0, pos: [0, 0, 1.5], rot: [0, 0, 0], peel: { dir: [0.05, 0.3, 1], dist: 4.4, tumble: [0.5, 0.3, 0.9] } },
  { name: 'strap_lugs', kind: 'outer', order: 1, pos: [0, 0.35, 0], rot: [0, 0, 0], peel: { dir: [0, 0.8, -0.7], dist: 3.8, tumble: [-0.7, 0.4, 0.3] } },
  { name: 'shutter_button', kind: 'outer', order: 2, pos: [0.85, 0.84, -0.1], rot: [0, 0, 0], peel: { dir: [0.4, 1, -0.5], dist: 4, tumble: [1.1, 0.2, -0.6] } },
  { name: 'mode_dial', kind: 'outer', order: 3, pos: [-0.85, 0.82, -0.1], rot: [0, 0, 0], peel: { dir: [-0.5, 1, -0.4], dist: 3.8, tumble: [0.6, -1.0, 0.4] } },
  { name: 'hot_shoe', kind: 'outer', order: 4, pos: [0.1, 0.78, 0], rot: [0, 0, 0], peel: { dir: [0.1, 1, -0.2], dist: 3.4, tumble: [-0.4, 0.8, 0.5] } },
  { name: 'viewfinder_hump', kind: 'outer', order: 5, pos: [-0.55, 0.84, 0.2], rot: [0, 0, 0], peel: { dir: [-0.3, 1, 0.6], dist: 4, tumble: [0.3, 0.5, -0.4] } },
  { name: 'grip', kind: 'outer', order: 6, pos: [1.08, -0.08, 0.64], rot: [0, 0, 0], peel: { dir: [1, -0.2, 0.7], dist: 4, tumble: [0.2, -0.6, 0.5] } },
  { name: 'rear_screen', kind: 'outer', order: 7, pos: [0, 0, -0.54], rot: [0, 0, 0], peel: { dir: [0, 0.1, -1], dist: 4.4, tumble: [0.25, 0.7, -0.15] } },
  { name: 'top_cover', kind: 'outer', order: 8, pos: [0, 0.58, 0], rot: [0, 0, 0], peel: { dir: [0, 1, 0.1], dist: 3.6, tumble: [0.35, 0.3, 0.12] } },
  { name: 'bottom_plate', kind: 'outer', order: 9, pos: [0, -0.65, 0], rot: [0, 0, 0], peel: { dir: [0, -1, 0.1], dist: 3.4, tumble: [-0.3, 0.2, -0.1] } },
  { name: 'body_shell_L', kind: 'outer', order: 10, pos: [-0.625, -0.08, 0], rot: [0, 0, 0], peel: { dir: [-1, 0.2, 0.1], dist: 4, tumble: [0.1, -0.45, 0.2] } },
  { name: 'body_shell_R', kind: 'outer', order: 11, pos: [0.625, -0.08, 0], rot: [0, 0, 0], peel: { dir: [1, 0.2, -0.1], dist: 4, tumble: [-0.1, 0.45, -0.2] } },

  // ── inner parts (exploded back → front along +Z, evenly spaced) ──
  { name: 'sensor', kind: 'inner', order: 0, pos: [0, 0, -0.3], rot: [0, 0, 0], z: -3.7, rim: 0.5, label: { text: 'Retouching', side: 'L' } },
  { name: 'mirror_box', kind: 'inner', order: 1, pos: [0, 0, 0.02], rot: [0, 0, 0], z: -2.96, rim: 0.4, label: { text: 'Prints', side: 'L' } },
  { name: 'lens_mount', kind: 'inner', order: 2, pos: [0, 0, 0.55], rot: [0, 0, 0], z: -2.22, rim: 0.74, label: { text: 'Color Grading', side: 'L' } },
  { name: 'lens_barrel_outer', kind: 'inner', order: 3, pos: [0, 0, 0.86], rot: [0, 0, 0], z: -1.48, rim: 0.6, label: { text: 'Street', side: 'L' } },
  { name: 'focus_ring', kind: 'inner', order: 4, pos: [0, 0, 0.86], rot: [0, 0, 0], z: -0.74, rim: 0.68, label: { text: 'Travel', side: 'L' } },
  { name: 'lens_element_4', kind: 'inner', order: 5, pos: [0, 0, 0.78], rot: [0, 0, 0], z: 0, rim: 0.4, label: { text: 'Landscape', side: 'L' } },
  { name: 'lens_element_3', kind: 'inner', order: 6, pos: [0, 0, 0.92], rot: [0, 0, 0], z: 0.74, rim: 0.44, label: { text: 'Weddings', side: 'R' } },
  { name: 'aperture_blades', kind: 'inner', order: 7, pos: [0, 0, 0.99], rot: [0, 0, 0], z: 1.48, rim: 0.42, label: { text: 'Video Editing', side: 'R' } },
  { name: 'lens_element_2', kind: 'inner', order: 8, pos: [0, 0, 1.05], rot: [0, 0, 0], z: 2.22, rim: 0.46, label: { text: 'Events', side: 'R' } },
  { name: 'zoom_ring', kind: 'inner', order: 9, pos: [0, 0, 1.2], rot: [0, 0, 0], z: 2.96, rim: 0.66, label: { text: 'Editorial', side: 'R' } },
  { name: 'lens_element_1', kind: 'inner', order: 10, pos: [0, 0, 1.28], rot: [0, 0, 0], z: 3.7, rim: 0.52, label: { text: 'Portraits', side: 'R' } },
];

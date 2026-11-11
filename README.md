📸 Visual Storytelling Portfolio

A dynamic, high-performance photography and videography portfolio built with React, Vite, and Tailwind CSS, powered by a Headless CMS (Sanity.io) for real-time content management.
Includes seamless navigation, advanced animations, and an immersive 3D Dome Gallery.

🚀 Key Features

Headless CMS Integration
All projects and blog posts managed via Sanity.io
Project ID: 84ksnydx

Zero-Lag Navigation
Gallery data is prefetched inside App.jsx for instant transitions.

Interactive 3D Dome Gallery
A custom CSS-powered 3D sphere with inertia dragging and touch controls.
Built using CSS 3D transforms + @use-gesture/react.

Dynamic Media Handling
Supports:

Unsplash images

Google Drive direct links

YouTube videos

Aesthetic UI
Custom palette (Tan, Beige, Ivory) + Inter font via tailwind.config.js.

Smooth Animations
Framer Motion scroll interactions, page transitions, media animations.

🔧 Project Setup
✅ Prerequisites

Node.js (LTS)

Sanity CLI

npm install -g @sanity/cli

1. Frontend (React) Setup
# Install dependencies
npm install

# Start development server
npm run dev


Your frontend reads data from Sanity via the configuration in src/sanity.js.

2. Backend (Sanity Studio) Setup

The Studio lives inside the /studio directory.

cd studio
npm install
sanity dev


Runs on: http://localhost:3333

⚠️ Required CORS Settings in Sanity

Add these origins under Sanity Manage → API → CORS Origins:

http://localhost:5173

http://127.0.0.1:5173

📖 Content Structure (Sanity Schemas)

Schemas are located in: studio/schemaTypes

Schema	Purpose	Key Fields
project	Stores portfolio projects & media	mediaItems – images, Google Drive URLs, YouTube embeds, Unsplash links
blogPost	Blog/diary entries	content – Portable Text rich text
📦 Component Overview
Component	Purpose
App.jsx	App routing + prefetches gallery data to eliminate load times
PortfolioPage.jsx	Hero section + Sticky Scroll Showcase
GalleryPage.jsx	Displays full archive with preloaded or fetched images
DomeGallery.jsx	Core 3D dome component (gesture logic, inertia, CSS 3D)
ProjectDetailPage.jsx	Individual project view with conditional media rendering
BlogPage.jsx	Fetches and displays blog post list
BlogPostPage.jsx	Renders rich text using @portabletext/react
## Portfolio page (`/`)

A single scroll-driven page. One fixed WebGL canvas (`src/scene/`) is the background for the whole page: a 3D camera that you dive into, tour in macro, then watch pull back to a side profile while the work sections scroll past. The HTML (`src/portfolio/`) is laid over it.

**Stack:** three.js, `postprocessing` (bloom, depth of field, grain, vignette, chromatic aberration), GSAP + ScrollTrigger, Lenis (smooth scroll). Without WebGL or with `prefers-reduced-motion`, the page falls back to a static hero and normal stacked sections (the gallery still works).

### Edit content: `src/portfolio/content.json`
Everything text/media lives here; anything with `"src": null` shows a labelled PLACEHOLDER.

- **Name / role / location / tagline:** `site`.
- **About bio:** `about.bio` (shown as you dive into the lens).
- **Timeline entries:** `about.timeline`, in order: `{ "range", "kind", "title", "place", "bullets": [] }`. Add or remove entries freely (5–7 reads best); the scroll length and the camera "era" adapt. Gear is just an entry (the last one by default).
- **Floating prints:** `about.floaterPhotos`: an array of image URLs (e.g. `"/photos/a.jpg"`) shown as small polaroids drifting around the camera. Leave empty for placeholders.
- **Albums:** add to `albums`: `id`, `title`, `year`, `description`, `cover`, `photos`. Photo shape: `{ "src": "/photos/a.webp", "srcset": "/photos/a-800.webp 800w, /photos/a-1600.webp 1600w", "full": "/photos/a-2400.webp", "alt": "...", "caption": "...", "w": 1600, "h": 1067 }`. Put files in `public/`. `w`/`h` prevent layout shift. The card's photo count is computed.
- **Videos:** add to `videos`: `{ "id", "title", "duration": "01:24", "thumb": { "src", "alt" }, "type" }`. `type` is `youtube` (`id` = YouTube id), `vimeo` (`id` = Vimeo id), `mp4` (add `"src": "/videos/clip.mp4"`) or `placeholder`. Each `id` must be unique.
- **Contact:** `contact.email`, `contact.heading`, `contact.subheading`, `contact.socials`. The form opens the visitor's mail client (no backend).
- **Gallery:** the "01 Gallery" section is the original `GalleryPage` / `DomeGallery`, fed by Sanity as before. It is not driven by `content.json` and its code is untouched.

### The camera that breaks apart
The camera is a **multi-part model**: 23 named parts (`top_cover`, `bottom_plate`, `body_shell_L/R`, `grip`, `viewfinder_hump`, `hot_shoe`, `shutter_button`, `mode_dial`, `rear_screen`, `sensor`, `mirror_box`, `lens_mount`, `lens_barrel_outer`, `focus_ring`, `zoom_ring`, `lens_element_1`–`4`, `aperture_blades`, `lens_hood`, `strap_lugs`), each built around its own origin so it can move independently. The scroll sequence is:

1. **Hero:** assembled, idle float, mouse-follow tilt.
2. **Tilt & settle:** title fades; the camera turns to a 3/4 angle and eases back.
3. **Break-off:** outer parts peel away outside → in (each starts a few percent after the last), ease out, tumble, and fade while dust specks and a warm flare mark the separation.
4. **Explode:** the inner parts slide apart along the optical axis, evenly spaced, and the axis turns horizontal (vertical on portrait screens).
5. **Annotate:** leader lines draw out from each part to a service label (two columns). Lines stay attached because each part's anchor is projected to screen space every frame. Hover or focus a label to highlight its part and dim the rest.
6. **About:** the timeline sits on the right while the camera glides along the exploded axis, parking on a different part (with depth-of-field) for each entry.
7. **Reassemble & pull-back:** parts return in reverse order with a small overshoot, a shutter flash and camera shake fire, then the camera swings to a side profile and parks as "Works" appears.

Everything is a pure function of the master scroll progress, so scrolling back up reverses it exactly. A ruler-style **scrubber** at the bottom tracks the sequence (click or drag to jump, arrow keys also work) and fades out in the Works sections.

### Retime or re-space the animation: `src/scene/explodeConfig.js`
Edit numbers only:
- `SECTION_WEIGHTS`: share of the 0–1 master progress each page section owns (hero, tilt, break, explode, annotate, about, pullback, works, contact). Everything else is expressed with `at('section', 0–1)`, so changing a weight moves every part's timing with it. Scroll length of the spacer sections is in `portfolio.css` (`.pf-spacer--*`, `.pf-journey`).
- `TIMING`: when each part starts and how long it takes (start offset, stagger, duration, fade, reassemble order).
- `EASE`: GSAP ease names for peel, tumble, explode and reassemble.
- `PARTS`: one row per part: assembled `pos` / `rot`, `peel` (`dir`, `dist`, `tumble`), exploded `z` along the optical axis, and (for the lens parts) the label `text`, `side` (`L`/`R`) and `rim` radius the leader line attaches to.
- `ANNOTATE`, `EVENTS`, `BREAKPOINTS`, `PARTICLES`: when labels show, when the shutter/flare/dust fire, per-breakpoint camera distance, and dust settings.
- Service labels can also be changed without touching code: add `"skills": { "sensor": "Retouching", … }` under `about` in `content.json`.

### Tune the camera moves: `src/scene/config.js`
`KEYFRAMES` set the camera position/target, FOV, model rotation/position/scale, background colours, depth-of-field, bloom, fog, floating props and mouse-follow for each moment. A keyframe `target` can be `{ part: 'sensor' }` to follow a part, and `cam` can be `{ rel: [x, y, z] }` (an offset from the target); the About keyframes use this to park on a different part per timeline entry. Field list is documented at the top of the file.

### Debug mode: `?debug=1`
Open the site with `?debug=1` for a lil-gui panel with a **progress slider** (scrub by hand; untick "follow scroll" to go back to normal), a toggle that shows every **part name and anchor** on screen, and a live readout of **FPS, draw calls, triangles, resolution (current/ceiling), whether depth of field is on, the render mode (scrolling / active / idle) and CPU and GPU frame time** (GPU time needs a browser that exposes `EXT_disjoint_timer_query`).

### Swap the camera model
The default camera is built from primitives in `src/scene/cameraModel.js` (no external asset, so no licence to credit). To use a GLB instead, put it in `public/models/` (Draco or meshopt compression is supported) and set `MODEL_URL = '/models/camera.glb'` in `src/scene/config.js`. **The GLB must be a multi-part model with one node per part, named exactly like the parts in `explodeConfig.js`** (a single fused mesh will not work). Each node's own position/rotation is used as its assembled pose, with +Z as the lens axis. If any node is missing the procedural camera is used and a console warning lists the expected names. Then retune `peel` and `z` values in `explodeConfig.js` for the new proportions. Free multi-part sources: Sketchfab and Poly Pizza (filter to CC0 / CC-BY). **If you use a CC-BY model, credit it here:**

> Model credits: _none: procedural camera._

### Reduced motion
With `prefers-reduced-motion`, the tumbling, drifting, dust, shake and flash are skipped: outer parts crossfade out, the inner assembly switches between assembled and exploded, and labels fade in. The camera still follows your scroll. Without WebGL the page falls back to a static hero and stacked sections.

### Performance notes
Rendering cost and memory are kept down without lowering the look:
- **GPU memory:** pixel ratio is capped at 1.5 on desktop (1 on phones); the 4x multisampling on the high-precision buffer (the largest allocation, ~150 MB at retina size) is replaced by FXAA; depth of field and bloom use smaller buffers.
- **Work only when it shows:** depth of field runs only when its blur is visible; the scene renders at 30 fps when idle or parked behind the Works sections, and stops entirely while a modal covers the page; label positions are only calculated while labels are visible; the cursor and hero parallax loops stop when nothing is moving.
- **The 3D gallery** is mounted only while it is near the viewport and unmounted when far away, which frees its GPU layers and image textures.
- **No live blur over the canvas:** the nav and text panels use solid translucent backgrounds instead of `backdrop-filter`, and the CSS film grain is static (the 3D scene has its own animated grain).
- **Weak devices:** software renderers (SwiftShader, llvmpipe) and devices reporting 4 GB of memory or less start on the light render path automatically (`?quality=full` or `?quality=lite` forces either).
- **If the browser kills the GL context** (out of memory), the page falls back to the static layout instead of leaving a dead canvas.
- The cursor light and separation flare are switched on only in their moments, with shader variants precompiled so toggling never hitches.

Pixel ratio is capped at 2 (1.25 on phones/touch), phones drop depth of field and chromatic aberration and use fewer floating props, rendering pauses when the tab is hidden, resources are disposed on unmount, and the 3D chunk loads after first paint. If frames run slow the engine lowers resolution automatically. On phones, tilt follows touch-drag (and the gyroscope on Android; iOS needs a permission prompt that isn't wired up).

## Admin (`/admin`)

Manage everything on the site without opening Sanity Studio. Four lists, each with search, edit, delete and (where order matters) up/down arrows:

- **Albums:** drag-and-drop photo upload (big camera files are resized to 3200px automatically), reorder by dragging or with the arrows, "Cover" to choose the album cover (first photo), captions, and links for YouTube, Google Drive or plain image URLs. YouTube links added here also appear in Video Edits.
- **Selected works:** highlighted pieces (title, category, date, description, one image by upload or link, optional "View project" link). They appear in a **Selected Works** section at the start of Works; the section only exists once you add one, and the frame numbers adjust. Use the arrows to set the order.
- **Video edits:** title, video link (YouTube, Vimeo, or a direct `.mp4` link), duration, date, description and thumbnail. The link type is detected as you paste it; YouTube uses its own thumbnail unless you upload one (Vimeo needs one). These fill the **Video Edits** section, in the order you set.
- **Diary:** title, author, date, excerpt and a text editor with Heading / Subheading / Quote buttons and a live preview.

Unsaved changes trigger a warning before leaving, and saving returns you to the list you came from. If you host Sanity Studio, redeploy it (`npm run deploy` in `studio/`) so it also shows the two new document types (`selectedWork`, `videoEdit`); the site and admin work without that.

### Setup (important)
Anything named `VITE_*` is copied into the public JavaScript, so a password or write token stored that way is visible to every visitor. The admin now keeps both on the server (`api/admin.js`, a Vercel function): the browser logs in with the password and receives a short-lived signed session; all writes go through the function, which only allows creating, editing and deleting projects and blog posts.

Set these environment variables (Vercel → Project Settings → Environment Variables, and `.env.local` for local dev):

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | the admin login password |
| `SANITY_WRITE_TOKEN` | a Sanity API token with **Editor** permission (sanity.io/manage → API → Tokens) |

The old `VITE_ADMIN_PASSWORD` / `VITE_SANITY_WRITE_TOKEN` names are still read by the server function, so nothing breaks, but rename them and **rotate the Sanity token**, because the previous setup exposed it. `npm run dev` serves the same API locally. Uploads are limited to about 4.4 MB per image by Vercel, which is why large files are compressed in the browser first.

### Old pages
`/about`, `/contact`, `/blog`, `/gallery` and `/project/…` no longer have their own pages; they redirect to the matching section of `/`.

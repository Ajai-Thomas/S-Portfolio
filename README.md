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

### Tune the scroll flow: `src/scene/config.js`
- `SECTION_WEIGHTS`: how much of the 0–1 master progress each page section owns (hero, dive, about, pullback, works, contact). Must sum to 1. Because progress is mapped per section, keyframes stay correct whatever the page height.
- `KEYFRAMES`: each entry is a moment on that 0–1 timeline with camera position/target/FOV, model position/rotation/scale, background colours (dark + light), diagonal split, depth-of-field, bloom, fog, floating-object amount, mouse-follow strength and an optional `shift` that slides the image left so text can sit on the right. Everything between keyframes is eased. The field list is documented at the top of the file.
- Section heights (how long each part takes to scroll) are in `src/portfolio/portfolio.css` (`.pf-dive`, `.pf-journey`, `.pf-pullback`).
- Tip: open DevTools and watch `--about` / `--hero` on the page root while scrolling to see the values driving the scene.

### Swap the camera model
The default camera is built from primitives in `src/scene/cameraModel.js` (no external asset, so no licence to credit). To use a GLB instead, put it in `public/models/` (Draco or meshopt compressed is supported), then set `MODEL_URL = '/models/camera.glb'` in `src/scene/config.js`. It is centred and scaled to fit automatically, and should face +Z (lens toward the viewer). Retune the keyframes (`target`, `cam`) to the new geometry. Good free sources: Sketchfab and Poly Pizza (filter to CC0 / CC-BY). **If you use a CC-BY model, credit it here:**

> Model credits: _none: procedural camera._

### Performance notes
Pixel ratio is capped at 2 (1.25 on phones/touch), phones drop depth of field and chromatic aberration and use fewer floating props, rendering pauses when the tab is hidden, resources are disposed on unmount, and the 3D chunk loads after first paint. If frames run slow the engine lowers resolution automatically. On phones, tilt follows touch-drag (and the gyroscope on Android; iOS needs a permission prompt that isn't wired up).

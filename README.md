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

The home page is a single scrolling photography portfolio in `src/portfolio/`. Everything you'd normally edit lives in **`src/portfolio/content.json`** — no component changes needed. Anything with `"src": null` shows a labelled PLACEHOLDER image.

- **Name / tagline / initials:** `site`.
- **About:** `about.bio` (array of paragraphs), `about.portrait`, `about.timeline` (`year`, `type`, `title`, `place`), `about.gear` (categories of `{ name, spec }`).
- **Albums:** add an object to `albums`: `id`, `title`, `year`, `description`, `cover`, and `photos`. Photo shape: `{ "src": "/photos/a.webp", "srcset": "/photos/a-800.webp 800w, /photos/a-1600.webp 1600w", "full": "/photos/a-2400.webp", "alt": "...", "caption": "...", "w": 1600, "h": 1067 }`. The photo count on the card is computed. Put image files in `public/` (e.g. `public/photos/`). `w`/`h` prevent layout shift.
- **Videos:** add to `videos`: `{ "id", "title", "duration": "01:24", "thumb": {src, alt}, "type": "youtube", "id2" }` where type is one of
  - `youtube` → add `"id": "VIDEO_ID"` (rename the card key, see below)
  - `vimeo` → `"id": "VIDEO_ID"`
  - `mp4` → `"src": "/videos/clip.mp4"`
  - `placeholder` → shows a placeholder message.

  Note: each video needs a unique card key, so use `"id"` for the YouTube/Vimeo video id and keep titles unique.
- **Contact:** `contact.email`, `contact.heading`, `contact.subheading`, `contact.socials` (`label`, `url`). The form opens the visitor's mail client (no backend).
- **Gallery:** the "01 Gallery" section is the original `GalleryPage` / `DomeGallery`, fed by Sanity exactly as before. It is not driven by `content.json`.
- Other routes (`/about`, `/blog`, `/gallery`, `/admin`, …) are unchanged.

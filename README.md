# 📸 Visual Storytelling Portfolio

This project is a dynamic, high-performance photography and videography portfolio built with React, Vite, and Tailwind CSS. It is designed to be fully scalable by utilizing a Headless CMS (Sanity.io) for content and supporting direct links to external media services (Unsplash, YouTube).

The portfolio features smooth transitions, parallax scrolling showcase, and a unique scrolling portfolio section powered by Framer Motion.

## 🚀 Key Features

- **Headless CMS Integration**: All portfolio projects and blog posts are managed via Sanity.io (Project ID: 84ksnydx).
- **Dynamic Media Handling**: Supports embedding of Unsplash image links and YouTube video links via a custom content schema.
- **Performance**: Media is served directly from the source (Unsplash/YouTube), ensuring fast loading times.
- **Aesthetic Design**: Uses a custom color palette (Tan, Beige, Ivory) and the Inter font, defined in `tailwind.config.js`.
- **Animations**: Smooth page transitions, hero title animation, and complex sticky scroll interactions using Framer Motion.

## 🔧 Project Setup

### Prerequisites

- Node.js (LTS version)
- Sanity CLI (`npm install -g @sanity/cli`)

### 1. Frontend (React) Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will attempt to connect to the Sanity API defined in `src/sanity.js`.

### 2. Backend (Sanity Studio) Setup

The Studio is located in the `studio` directory.

```bash
# Navigate to the Studio folder
cd studio

# Install dependencies for the Studio (if not already done via sanity init)
npm install

# Start the Sanity Studio in development mode
sanity dev
```

The Studio runs on `http://localhost:3333` and must be running when editing content.

## ⚠️ CORS Configuration

To allow your local frontend (`http://localhost:5173`) to fetch data, you must add the following origins to your Sanity project's CORS settings in the Sanity Manage dashboard:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## 📖 Content Structure (Sanity Schemas)

The content models are defined in `studio/schemaTypes`.

| Schema | Purpose | Key Dynamic Fields |
|--------|---------|-------------------|
| `project` | Portfolio items and media | `images`: Array of image objects with alt text. Supports hotspot for responsive images. |
| `blogPost` | Diary entries | `content`: Uses Sanity's Portable Text (rich text) for structured articles. |

## 📦 Component Overview

| Component | Functionality | Data Source |
|-----------|--------------|-------------|
| `PortfolioPage.jsx` | Renders the Hero and the main Sticky Scroll Showcase. | Fetches all projects (`*[_type == "project"]`). |
| `ProjectDetailPage.jsx` | Displays individual project galleries. Handles navigation and renders media items conditionally (Image or YouTube embed). | Fetches project details and `images` array. |
| `BlogPage.jsx` | Lists all blog posts dynamically. | Fetches all `blogPost` documents. |
| `BlogPostPage.jsx` | Renders rich text content using the `@portabletext/react` library. | Fetches single `blogPost` document. |
| `ParallaxShowcase.jsx` | Hidden section (for now) that uses Framer Motion for a sticky, multi-layered visual effect. | Should be updated to fetch featured projects from Sanity (currently needs implementation). |

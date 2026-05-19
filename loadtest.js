/**
 * k6 Load Test — Panchara Portfolio Site
 * Run: k6 run loadtest.js
 * Override base URL: k6 run -e BASE_URL=https://your-domain.com loadtest.js
 *
 * WHAT IS TESTED
 * ──────────────
 * This script simulates 10 concurrent users each walking through the full site.
 * Every "page visit" tests TWO layers:
 *
 *   1. Frontend server  — GET the HTML shell from Vite / your host.
 *      (All routes return the same index.html for a React SPA, but we still
 *      verify the server is alive and responding under load.)
 *
 *   2. Sanity CDN API   — The exact GROQ queries the React components fire,
 *      hitting https://84ksnydx.apicdn.sanity.io (the same CDN your users hit).
 *
 * Pages & queries tested per iteration:
 *
 *   [Home /]
 *     • Sanity: portfolio projects list (title, category, cover image URL)
 *     • Sanity: gallery media preload that App.jsx fires on every page
 *
 *   [Project Detail /project/:id]
 *     • Sanity: all project IDs list (for prev/next navigation)
 *     • Sanity: single project detail (title, date, excerpt, all media items) — batched
 *
 *   [Gallery /gallery]
 *     • Sanity: all project media URLs (full media dump for the dome gallery)
 *
 *   [Blog /blog]
 *     • Sanity: all blog posts ordered by date (id, title, date, excerpt)
 *
 *   [Blog Post /blog/:id]
 *     • Sanity: single blog post with full PortableText content
 *
 *   [About /about]        — frontend only, no Sanity queries
 *   [Contact /contact]    — frontend only, no Sanity queries
 *
 * THRESHOLDS (what counts as a pass/fail)
 *   • 95th-percentile response time < 2 000 ms  (all requests)
 *   • 95th-percentile response time < 1 500 ms  (Sanity CDN queries)
 *   • Error rate < 5 %
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';

// ─── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const SANITY_PROJECT_ID = '84ksnydx';
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = '2024-05-14';
const SANITY_CDN        = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}`;

// ─── k6 Options ────────────────────────────────────────────────────────────────

export const options = {
  vus: 10,
  duration: '1m',

  thresholds: {
    // All HTTP requests
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.05'],

    // Sanity CDN queries specifically (tagged below)
    'http_req_duration{type:sanity}': ['p(95)<1500'],

    // Per-page breakdown
    'http_req_duration{page:portfolio}':     ['p(95)<1500'],
    'http_req_duration{page:project-detail}':['p(95)<1500'],
    'http_req_duration{page:gallery}':       ['p(95)<2000'],
    'http_req_duration{page:blog}':          ['p(95)<1500'],
    'http_req_duration{page:blog-post}':     ['p(95)<1500'],
  },
};

// ─── GROQ Queries (copied exactly from the codebase) ───────────────────────────

const Q = {
  // App.jsx — fires on every page visit (gallery background preload)
  appGalleryPreload: `*[_type == "project"] {
    "allMedia": mediaItems[]{
      "url": coalesce(url, asset->url)
    }
  }`,

  // PortfolioPage.jsx
  portfolioProjects: `*[_type == "project"] | order(date desc) {
    _id,
    title,
    category,
    date,
    "coverImageUrl": coalesce(mediaItems[0].url, mediaItems[0].asset->url)
  }`,

  // ProjectDetailPage.jsx — query 1 (navigation list)
  projectIdsList: `*[_type == "project"] | order(date desc) { _id }`,

  // ProjectDetailPage.jsx — query 2 (detail, uses $projectId param)
  projectDetail: `*[_type == "project" && _id == $projectId][0] {
    _id,
    title,
    category,
    date,
    excerpt,
    "mediaItems": mediaItems[]{
      ...,
      "resolvedUrl": coalesce(url, asset->url)
    }
  }`,

  // GalleryPage.jsx
  galleryMedia: `*[_type == "project"] {
    "allMedia": mediaItems[]{
      "url": coalesce(url, asset->url)
    }
  }`,

  // BlogPage.jsx
  blogList: `*[_type == "blogPost"] | order(date desc) {
    _id,
    title,
    date,
    excerpt
  }`,

  // BlogPostPage.jsx (uses $postId param)
  blogPost: `*[_type == "blogPost" && _id == $postId][0]`,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a Sanity CDN GET URL with optional GROQ parameters.
 * params = { projectId: 'abc' }  →  appends &%24projectId=%22abc%22
 */
function sanityUrl(groq, params = {}) {
  let url = `${SANITY_CDN}?query=${encodeURIComponent(groq)}`;
  for (const [key, val] of Object.entries(params)) {
    url += `&${encodeURIComponent('$' + key)}=${encodeURIComponent(JSON.stringify(val))}`;
  }
  return url;
}

// ─── Setup — runs ONCE before VUs start ────────────────────────────────────────
// Fetches real document IDs from Sanity so the detail-page tests use valid IDs.

export function setup() {
  const projectsRes = http.get(sanityUrl(Q.projectIdsList));
  let projectIds = [];
  if (projectsRes.status === 200) {
    const body = JSON.parse(projectsRes.body);
    projectIds = (body.result || []).map((p) => p._id).slice(0, 10);
  }

  const blogRes = http.get(sanityUrl(Q.blogList));
  let blogPostIds = [];
  if (blogRes.status === 200) {
    const body = JSON.parse(blogRes.body);
    blogPostIds = (body.result || []).map((p) => p._id).slice(0, 10);
  }

  console.log(`Setup: found ${projectIds.length} projects, ${blogPostIds.length} blog posts`);
  return { projectIds, blogPostIds };
}

// ─── Default function — runs once per VU per iteration ─────────────────────────

export default function (data) {
  const { projectIds, blogPostIds } = data;

  // Each VU picks a random project / blog post so requests spread across IDs
  const projectId  = projectIds.length  ? projectIds[Math.floor(Math.random() * projectIds.length)]   : null;
  const blogPostId = blogPostIds.length ? blogPostIds[Math.floor(Math.random() * blogPostIds.length)] : null;

  const sanityOpts = (page) => ({ tags: { type: 'sanity', page } });

  // ── 1. Home / Portfolio ──────────────────────────────────────────────────────
  group('Home Page (/)', () => {
    // Tests: frontend serves the React shell
    const htmlRes = http.get(`${BASE_URL}/`);
    check(htmlRes, {
      '[home] HTML 200':        (r) => r.status === 200,
      '[home] body not empty':  (r) => r.body != null && r.body.length > 0,
    });

    // Tests: project cards listing (title, category, cover image)
    const projectsRes = http.get(sanityUrl(Q.portfolioProjects), sanityOpts('portfolio'));
    check(projectsRes, {
      '[home] projects query 200':    (r) => r.status === 200,
      '[home] projects is array':     (r) => { try { return Array.isArray(JSON.parse(r.body).result); } catch { return false; } },
    });

    // Tests: gallery background preload (runs on every page in App.jsx)
    const preloadRes = http.get(sanityUrl(Q.appGalleryPreload), sanityOpts('portfolio'));
    check(preloadRes, {
      '[home] gallery preload 200':   (r) => r.status === 200,
    });
  });

  sleep(1);

  // ── 2. Project Detail ────────────────────────────────────────────────────────
  if (projectId) {
    group(`Project Detail (/project/:id)`, () => {
      // Tests: frontend shell (same HTML, different URL)
      const htmlRes = http.get(`${BASE_URL}/project/${projectId}`);
      check(htmlRes, {
        '[project] HTML 200': (r) => r.status === 200,
      });

      // Tests: two queries fired concurrently by ProjectDetailPage.jsx
      //   - all project IDs (for prev/next navigation arrows)
      //   - full detail for this specific project (media, excerpt, etc.)
      const batchRes = http.batch([
        ['GET', sanityUrl(Q.projectIdsList),                       null, sanityOpts('project-detail')],
        ['GET', sanityUrl(Q.projectDetail, { projectId }),         null, sanityOpts('project-detail')],
        ['GET', sanityUrl(Q.appGalleryPreload),                    null, sanityOpts('project-detail')],
      ]);
      check(batchRes[0], { '[project] IDs list 200':      (r) => r.status === 200 });
      check(batchRes[1], {
        '[project] detail 200':         (r) => r.status === 200,
        '[project] detail result exists':(r) => { try { return JSON.parse(r.body).result !== null; } catch { return false; } },
      });
      check(batchRes[2], { '[project] gallery preload 200': (r) => r.status === 200 });
    });

    sleep(2);
  }

  // ── 3. Gallery ───────────────────────────────────────────────────────────────
  group('Gallery (/gallery)', () => {
    // Tests: frontend shell
    const htmlRes = http.get(`${BASE_URL}/gallery`);
    check(htmlRes, { '[gallery] HTML 200': (r) => r.status === 200 });

    // Tests: full media dump — all projects, all media items (the heaviest query)
    const galleryRes = http.get(sanityUrl(Q.galleryMedia), sanityOpts('gallery'));
    check(galleryRes, {
      '[gallery] query 200':     (r) => r.status === 200,
      '[gallery] result is array':(r) => { try { return Array.isArray(JSON.parse(r.body).result); } catch { return false; } },
    });
  });

  sleep(1);

  // ── 4. Blog Listing ──────────────────────────────────────────────────────────
  group('Blog Listing (/blog)', () => {
    // Tests: frontend shell
    const htmlRes = http.get(`${BASE_URL}/blog`);
    check(htmlRes, { '[blog] HTML 200': (r) => r.status === 200 });

    // Tests: blog posts listing ordered by date (title, excerpt shown on listing)
    const blogRes = http.get(sanityUrl(Q.blogList), sanityOpts('blog'));
    check(blogRes, {
      '[blog] list 200':          (r) => r.status === 200,
      '[blog] result is array':   (r) => { try { return Array.isArray(JSON.parse(r.body).result); } catch { return false; } },
    });

    // Tests: App.jsx gallery preload
    const preloadRes = http.get(sanityUrl(Q.appGalleryPreload), sanityOpts('blog'));
    check(preloadRes, { '[blog] gallery preload 200': (r) => r.status === 200 });
  });

  sleep(1);

  // ── 5. Blog Post ─────────────────────────────────────────────────────────────
  if (blogPostId) {
    group('Blog Post (/blog/:id)', () => {
      // Tests: frontend shell
      const htmlRes = http.get(`${BASE_URL}/blog/${blogPostId}`);
      check(htmlRes, { '[blog-post] HTML 200': (r) => r.status === 200 });

      // Tests: full post document including PortableText content blocks
      const postRes = http.get(sanityUrl(Q.blogPost, { postId: blogPostId }), sanityOpts('blog-post'));
      check(postRes, {
        '[blog-post] post 200':          (r) => r.status === 200,
        '[blog-post] post result exists':(r) => { try { return JSON.parse(r.body).result !== null; } catch { return false; } },
      });

      // Tests: App.jsx gallery preload
      const preloadRes = http.get(sanityUrl(Q.appGalleryPreload), sanityOpts('blog-post'));
      check(preloadRes, { '[blog-post] gallery preload 200': (r) => r.status === 200 });
    });

    sleep(1);
  }

  // ── 6. About ─────────────────────────────────────────────────────────────────
  group('About (/about)', () => {
    // Tests: frontend shell only — About page has no Sanity queries
    const htmlRes = http.get(`${BASE_URL}/about`);
    check(htmlRes, { '[about] HTML 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  // ── 7. Contact ───────────────────────────────────────────────────────────────
  group('Contact (/contact)', () => {
    // Tests: frontend shell only — Contact page has no Sanity queries
    const htmlRes = http.get(`${BASE_URL}/contact`);
    check(htmlRes, { '[contact] HTML 200': (r) => r.status === 200 });
  });

  // Random think time between full iterations (simulates reading / browsing)
  sleep(Math.random() * 2 + 1);
}

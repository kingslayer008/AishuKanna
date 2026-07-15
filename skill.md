# Skill: Gemini-invite (Digital Wedding Invitation)

## Project Overview
A static, animated digital wedding invitation website. Features a 3D envelope opening animation, countdown timer, event details, and a serverless guest wishes system with pagination. Deployed on Netlify free tier.

## Tech Stack
- **HTML5** – Single `index.html` entry point
- **CSS3** – `index.css`, CSS variables, animations, `@media` queries, 5 Google Fonts
- **Vanilla JS (ES6+)** – `index.js`, IIFE module, Canvas 2D particles, Web Audio API, IntersectionObserver
- **Netlify Functions** – Serverless backend for wishes API (`netlify/functions/wishes.js`)
- **Netlify Blobs** – Serverless key-value storage for wish persistence

## Directory Structure
```
├── index.html              # Main HTML document
├── index.js                # All JavaScript logic (IIFE)
├── index.css               # All styles
├── netlify.toml            # Netlify configuration (functions, redirects)
├── netlify/functions/
│   └── wishes.js           # Serverless function (GET/POST wishes)
├── skill.md                # This file
└── images/                 # 8 image assets
```

## Key Conventions
- **Netlify free tier** – uses Netlify Functions + Blobs (no external DB)
- **Single-page app** – everything in one HTML file
- **Dark theme** – CSS variables define gold/burgundy/rose/cream color palette
- **JS pattern** – IIFE wrapping all code, class-based modules, `'use strict'`
- **API pattern** – Frontend fetches `/api/wishes` which redirects to Netlify Function
- **Pagination** – 6 wishes per page, prev/next controls, smooth scroll on page change
- **Font stack** – Cormorant Garamond, Great Vibes, Playfair Display, Poppins, Dancing Script (via Google Fonts)

## Wishes System
- **Storage**: Netlify Blobs (serverless, free tier compatible)
- **API**: `/api/wishes` → Netlify Function handles GET (paginated) and POST
- **Pagination**: 6 wishes/page, controls appear when >6 wishes exist
- **Flow**: Submit form → POST to API → fetch page 1 → render with animation

## Working With This Project
- Edit `index.html`, `index.css`, or `index.js` directly
- For Netlify Functions: edit `netlify/functions/wishes.js`
- Run `netlify dev` locally to test functions (requires Netlify CLI)
- Open `index.html` in a browser for basic preview (wishes will fail without functions)
- Images go in the `images/` directory
- Responsive breakpoint: `768px` (mobile-first design)
- No transpilation needed — modern browser features used (ES6, CSS custom properties, Canvas API)

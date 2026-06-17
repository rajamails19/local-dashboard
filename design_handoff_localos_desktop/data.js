/* ============================================================
   Framework / stack icons — simple stylized glyphs, brand-tinted.
   Returned as raw SVG inner markup strings (set via dangerouslySetInnerHTML
   in React, or used directly).
   ============================================================ */
window.GLYPH = {
  next:    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="1.5"/><path d="M8 8v8M8 8l8 9M16 8v6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
  vite:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3-6.5 14L12 3z" fill="#a06bff"/><path d="M12 3L4 6l6.5 14L12 3z" fill="#41d1ff"/><path d="M13.5 7l-3 1 .4 2.4-1.6.2 2.2 4.2.5-3.1-1.5-.2L13.5 7z" fill="#ffd83d"/></svg>',
  node:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l8 4.6v9.8L12 21.5 4 16.9V7.1L12 2.5z" stroke="#56d364" stroke-width="1.4" fill="rgba(86,211,100,.12)"/><path d="M12 9.5c-1.6 0-2.5.7-2.5 1.7 0 2.3 4.2 1.2 4.2 2.6 0 .5-.5.8-1.4.8-1 0-1.5-.4-1.6-1" stroke="#56d364" stroke-width="1.3" stroke-linecap="round"/></svg>',
  react:   '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1.1" fill="none"><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/></g></svg>',
  express: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6l5.5 6L3 18M8.5 12H21M21 6l-5.5 6 5.5 6" stroke="#cbd2dc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  supabase:'<svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 13.5c-.5.6-.1 1.5.7 1.5H12v6.6c0 .9 1.2 1.3 1.7.5L21 10.5c.5-.6.1-1.5-.7-1.5H13V2z" fill="#3ecf8e"/></svg>',
  sqlite:  '<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="7" ry="2.6" stroke="#4d9fe6" stroke-width="1.4"/><path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" stroke="#4d9fe6" stroke-width="1.4"/><path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" stroke="#4d9fe6" stroke-width="1.4"/></svg>',
  postgres:'<svg viewBox="0 0 24 24" fill="none"><path d="M17 3.5c-2.5-.7-7-.6-9 1C5 6.7 5 13 6.5 18c.6 2 2.6 2.7 3.6 1l1-1.7" stroke="#7aa7d8" stroke-width="1.4" stroke-linecap="round"/><path d="M14 4c2.5 0 4.5 1.4 4.5 6.5 0 3-1 5-2.6 5-1.2 0-1.4-1.3-1.4-3.3 0-1.4.3-3.2.3-4.4" stroke="#7aa7d8" stroke-width="1.4" stroke-linecap="round"/></svg>',
  tanstack:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#ff8a3d" stroke-width="1.4"/><path d="M7 14c2-3 8-3 10 0" stroke="#ff8a3d" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9.5" r="1.1" fill="#ff8a3d"/><circle cx="15" cy="9.5" r="1.1" fill="#ff8a3d"/></svg>',
  bun:     '<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="13" rx="9" ry="7.5" fill="#f6e7c9" stroke="#e3c98f" stroke-width="1"/><circle cx="9" cy="12" r="1.1" fill="#3a3325"/><circle cx="15" cy="12" r="1.1" fill="#3a3325"/><path d="M10.5 15c1 .8 2 .8 3 0" stroke="#3a3325" stroke-width="1.2" stroke-linecap="round"/></svg>',
};

/* framework brand accents (drive --fw glow per card) */
window.FW = {
  "Next.js":        { glyph: "next",     color: "#e8edf2" },
  "Vite":           { glyph: "vite",     color: "#a06bff" },
  "Node.js":        { glyph: "node",     color: "#56d364" },
  "Node (nodemon)": { glyph: "node",     color: "#56d364" },
  "React":          { glyph: "react",    color: "#61dafb" },
  "TanStack Start": { glyph: "tanstack", color: "#ff8a3d" },
  "Express":        { glyph: "express",  color: "#cbd2dc" },
  "Bun":            { glyph: "bun",      color: "#f6e7c9" },
};

window.DBINFO = {
  "Supabase": { glyph: "supabase", color: "#3ecf8e" },
  "SQLite":   { glyph: "sqlite",   color: "#4d9fe6" },
  "Postgres": { glyph: "postgres", color: "#7aa7d8" },
};

/* ============================================================
   Projects
   ============================================================ */
window.PROJECTS = [
  {
    id: "apple-notes-clone",
    name: "apple-notes-clone",
    path: "~/Documents/Coding/Claude-help/apple-notes-clone",
    framework: "Next.js",
    folder: "Claude-help",
    branch: "main", dirty: false, commit: "feat: rich-text toolbar",
    uptime: 8160, // seconds
    frontend: { port: 3000, up: true },
    backend:  { type: "Supabase", port: 54321, up: true },
    database: "Supabase",
    about: "A pixel-faithful clone of Apple Notes built with the Next.js App Router. Real-time sync, folders, and rich-text editing backed by Supabase.",
    features: ["Rich-text editor with slash commands", "Folder & tag organization", "Real-time sync via Supabase channels", "Full-text search across notes", "Dark / light theme"],
  },
  {
    id: "forma-fitness",
    name: "forma-fitness",
    path: "~/Documents/Coding/Claude-help/forma-fitness",
    framework: "Next.js",
    folder: "Claude-help",
    branch: "main", dirty: false, commit: "wip: workout planner",
    uptime: 3720,
    frontend: { port: 3001, up: true },
    backend:  null,
    database: null,
    about: "A workout-tracking PWA with guided routines and progress charts. Front-end only for now — persistence lives in local storage until the API lands.",
    features: ["Guided workout routines", "Progress charts & streaks", "Offline-first PWA", "Custom routine builder"],
  },
  {
    id: "local-dashboard",
    name: "local-dashboard",
    path: "~/Documents/Coding/Claude-help/local-dashboard",
    framework: "Node.js",
    folder: "Claude-help",
    branch: "main", dirty: false, commit: "init dashboard server",
    uptime: 21540,
    frontend: { port: 9999, up: true },
    backend:  { type: "Express", port: 9999, up: true },
    database: null,
    about: "This dashboard's own server. A lightweight Node process that scans active ports on the machine and serves the LocalView UI you're looking at right now.",
    features: ["Live port & process scanning", "Framework auto-detection", "Stop / restart any dev server", "Reads project READMEs for details"],
  },
  {
    id: "quiz-kids-app",
    name: "quiz-kids-app",
    path: "~/quiz-kids-app",
    framework: "Vite",
    folder: "root",
    branch: "main", dirty: false, commit: "add scoreboard",
    uptime: 1260,
    frontend: { port: 5180, up: true },
    backend:  { type: "Express", port: 4000, up: false },
    database: "SQLite",
    about: "A colourful quiz game for kids built with Vite + React. Animated question cards, sound effects, and a local scoreboard.",
    features: ["Animated question cards", "Sound effects & confetti", "Local high-score board", "Grade-level question packs"],
  },
  {
    id: "tanstack_start_ts",
    name: "tanstack_start_ts",
    path: "~/Documents/Coding/CGPT-help/gpt-tanstack/tanstack_start_ts",
    framework: "TanStack Start",
    folder: "CGPT-help",
    branch: "main", dirty: true, commit: "ssr loaders",
    uptime: 600,
    frontend: { port: 8080, up: true },
    backend:  { type: "Bun", port: 8080, up: true },
    database: "Supabase",
    about: "A full-stack TanStack Start template with type-safe SSR loaders and server functions, running on the Bun runtime.",
    features: ["Type-safe SSR data loaders", "Server functions", "File-based routing", "Bun-powered dev server"],
  },
  {
    id: "telugu-trace-kids",
    name: "telugu-trace-kids",
    path: "~/Documents/Coding/Claude-help/telugu-trace-kids",
    framework: "Node (nodemon)",
    folder: "Claude-help",
    branch: "main", dirty: true, commit: "letter-tracing canvas",
    uptime: 4980,
    frontend: { port: 3002, up: true },
    backend:  { type: "Express", port: 5179, up: true },
    database: "SQLite",
    about: "An educational app that teaches kids to trace Telugu letters on a touch canvas, with stroke-order guides and gentle audio cues.",
    features: ["Touch / stylus letter tracing", "Stroke-order animations", "Audio pronunciation", "Per-letter progress tracking"],
  },
];

/* a pool of projects that can "appear" live to demo dynamic detection */
window.INCOMING = [
  {
    id: "design-portfolio",
    name: "design-portfolio",
    path: "~/Documents/Coding/Codex-help/design-portfolio",
    framework: "Vite",
    folder: "Codex-help",
    branch: "main", dirty: false, commit: "hero animations",
    uptime: 4,
    frontend: { port: 5174, up: true },
    backend:  null,
    database: null,
    about: "A personal design portfolio with scroll-driven animations and a case-study layout. Just spun up from the Codex workspace.",
    features: ["Scroll-driven hero animations", "Case-study templates", "Image lightbox", "Contact form"],
  },
];

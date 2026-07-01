# LocalOS Dashboard

A macOS-style personal dashboard for managing local dev servers and deployed websites — runs in the browser, auto-detects running processes, and syncs across devices via GitHub Gist.

---

## Running Locally

```bash
node server.js
```

Open → `http://localhost:9999`

No npm install. No build step. Pure Node.js + browser Babel.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Babel Standalone, in-browser transform) |
| Local server | Node.js `http` module (no framework) |
| Cloud sync | GitHub Gist (GET = load, PATCH = save) |
| Deployed at | Vercel (static files + `api/store.js` serverless function) |

---

## Project Structure

```
local-dashboard/
├── server.js                  # Local dev server (port 9999) — run this
├── index.html                 # Entry point, loads all .jsx via Babel script tags
├── desktop_app_live.jsx       # Main app — state, sync, layout, menu bar
├── desktop_components.jsx     # Server cards, MacWindow detail, Dock
├── website_components.jsx     # Website cards, WebWindow detail, image upload
├── add_modal.jsx              # Add new server / website modal
├── desktop.css                # All styles
├── websites.js                # Default website seed data
├── api/
│   └── store.js               # Vercel serverless function — Gist GET/POST
├── vercel.json                # Vercel build config
└── names.json                 # Persisted custom server names (local only, gitignored)
```

---

## Sync Architecture

```
localhost:9999  ──read──▶  GitHub Gist  ◀──read+write──  Vercel
                           (lv_store.json)
```

- **Vercel** reads and writes the Gist on every change (full sync)
- **Localhost** only reads from the Gist (pulls cloud state every 30s + on tab focus)
- **Local changes** (renames, reordering) stay in `localStorage` and are NOT pushed to the Gist
- **Card/collection changes** made on Vercel appear on localhost within 30 seconds

### What syncs (Gist)
- Website cards and their fields (name, URL, tags, custom image, etc.)
- Collections and their items

### What stays local only (localStorage)
- Tab label renames (e.g. "Servers" → "Mac-Local")
- Menu bar order and hidden items

---

## Gist Setup (for Vercel sync)

1. Create a GitHub Gist at https://gist.github.com
2. Note the Gist ID from the URL
3. Create a Personal Access Token with `gist` scope at GitHub → Settings → Developer Settings → Tokens
4. In Vercel project → Settings → Environment Variables, add:
   - `GIST_ID` = your gist ID
   - `GH_TOKEN` = your token

No token needed to run locally — the Gist is public, reads work without auth.

---

## Vercel Deployment

```bash
git add .
git commit -m "your message"
git push
```

Vercel auto-deploys on every push to `main`.

Live URLs:
- https://local-dashboard-pi.vercel.app
- https://raja-portfolio-apps-dashboard.vercel.app

---

## Features

- **Auto-detects** running dev servers (Next.js, Vite, Node, Express, FastAPI, Django, Rails, etc.) — including servers started by Claude Code / Codex
- **One card per port** — same project folder running on two ports = two separate cards
- **Website collections** — custom tabs with drag-to-reorder cards
- **Inline editing** — rename any card, label, or menu item by clicking on it
- **Custom thumbnails** — upload an image per card (compressed to base64)
- **Quick Links sidebars** — left and right panels with direct links, drag-to-resize
- **Cross-browser sync** — changes on Vercel appear everywhere within 30 seconds
- **Menu bar** — drag to reorder, delete static labels, rename all items
- **Server detail window** — shows all ports, VS Code button, stop toggle

---

## Common Commands

```bash
# Start local server
node server.js

# Kill whatever is on port 9999 and restart
lsof -ti:9999 | xargs kill -9 && node server.js

# Push changes to Vercel
git add .
git commit -m "description"
git push
```

---

## Notes

- `names.json` stores custom server names locally — gitignored, safe to delete (resets names)
- `.env` is gitignored — never commit tokens
- Frontend files are served as static assets by both `server.js` (local) and Vercel
- In-browser Babel means no build step, but also no TypeScript or JSX tooling in the editor

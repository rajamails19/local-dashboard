# Handoff: localOS — Servers Desktop

## Overview
**localOS** is a local development dashboard that reimagines "a table of which apps are running on which ports" as a **macOS desktop**. Every dev server on the machine is a glossy **app icon / tile** living inside a frosted **Control-Center-style panel**, with a working **Dock** along the bottom (magnifies on hover, shows a live port badge per running app), a **menu bar** at top with live stats and a search field, a **macOS-style detail window** when you click a server, and **"App launched" notification banners** when a new server is detected.

This bundle is the **visual + interaction reference** for that dashboard. The backend that actually scans ports/processes is expected to already exist (or be built separately); **this handoff is about building the localOS UI and wiring it to that real data + the stop/start actions.**

---

## About the Design Files
The files in this bundle (`localOS.html`, `desktop.css`, `desktop_components.jsx`, `desktop_app.jsx`, `data.js`) are **design references created in HTML/React-via-Babel**. They are a **working prototype showing the intended look and behavior** — **not production code to ship as-is.**

Your task is to **recreate this design inside the target codebase's environment**, using its established patterns and libraries:
- The prototype runs **React 18 through an in-browser Babel transform** (`<script type="text/babel">`). That's correct for a mockup, wrong for production — use a normal build pipeline (Vite / Next / CRA / plain TS, whatever the project uses). If the existing dashboard is plain HTML/JS or a different framework, port the markup + CSS to that stack — **the CSS (`desktop.css`) is framework-agnostic and can be reused almost verbatim.**
- Replace the **mock `data.js`** (`window.PROJECTS`, `window.INCOMING`) with the real port/process scan feed.
- Wire the **toggle (Stop/Start)**, **Open in browser**, and **VS Code** actions to real endpoints (see *Interactions* + *State Management*).

A football-themed variant (`LocalView FC.html`) and a more conventional dark-glass variant (`LocalView Dashboard.html`) also exist in the project. **localOS (this bundle) is the desktop-metaphor direction shown in the reference screenshot.**

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interaction timings are all specified below and present in `desktop.css`. Recreate the UI pixel-faithfully using the codebase's libraries, then swap mock data for live data. Exact values are in *Design Tokens*; the CSS file is the source of truth.

---

## Screens / Views

### 1. Desktop (the whole screen)
A full-viewport (`100vh`, `overflow: hidden`) vertical flex column with three stacked regions over an animated wallpaper:

```
┌──────────────────────────────────────────────┐  menu bar (30px tall)
├──────────────────────────────────────────────┤
│                                                │
│        Control-Center panel (the "stage")      │  stage (flex: 1)
│        — Running Servers grid of tiles          │
│                                                │
├──────────────────────────────────────────────┤
│                  ▢ ▢ ▢ ▢ ▢  |  ▢ ▢            │  dock (centered, floats)
└──────────────────────────────────────────────┘
```

**Wallpaper** (`.wallpaper`, `z-index:-2`): layered radial gradients (orange top-left, pink top-right, teal bottom-right, purple bottom-left) over a `160deg` purple linear gradient `#3b1d6e → #25184f → #161335`. Three large blurred color **blobs** (`.wp-blob`, `filter: blur(80px)`) drift slowly (34s/40s/46s `ease-in-out infinite`). A faint SVG **grain** layer (`.wp-grain`, `opacity:.05`) sits above at `z-index:-1`.

### 2. Menu bar (`.menubar`)
- 30px tall, `rgba(20,18,40,0.28)` + `backdrop-filter: blur(20px) saturate(150%)`, `0.5px` bottom hairline `rgba(255,255,255,0.10)`, font-size 13px.
- **Left:** a 16×16 rounded-square logo with an amber gradient (`#ffd27a → #ff9a3d`) holding a bolt glyph, then bold **localhost**, then plain menu items **View · Servers · Window** (decorative, `cursor: default`).
- **Right:** pulse icon + `{running}/{total}` · wifi icon + `{open ports}` · refresh icon (click to spin) · a pill **search field** (`⌘K` / `/` focuses it) · a live **clock** (`Tue, Jun 16 09:45 PM` format, `font-variant-numeric: tabular-nums`).

### 3. Control-Center panel — "Running Servers" (`.cc-panel`)
The hero. A large frosted panel: `max-width: 1180px`, `flex: 1`, `background: rgba(40,44,60,0.42)` + `backdrop-filter: blur(40px) saturate(160%)`, `border-radius: 26px`, `0.5px` hairline border, inset top highlight + big soft drop shadow.
- **Header (`.cc-head`):** title `Running Servers` with a faint count chip beside it; right side has a **segmented control** (`.seg`) with **All / Framework / Folder** grouping options (active segment = white bg, dark text).
- **Grid (`.cc-grid`):** `display:grid; grid-template-columns: repeat(auto-fill, minmax(264px, 1fr)); gap:16px;` scrolls internally. Renders a **server tile** per project. When grouping is on, a full-width uppercase **group row** (`.group-row`) with a hairline rule separates clusters. Empty state: centered `No servers match "…"`.

### 4. Server tile (`.tile`) — the core card
Glassy rounded card (`border-radius:18px`, `background: rgba(255,255,255,0.10)`, `0.5px` hairline). Hover: lifts `translateY(-3px)`, brightens, gains a shadow. Stopped servers get `.off` (`opacity:0.72`). Entrance animation `tilein` (scale .96 + fade, 0.45s). Clicking the tile opens the detail window.
- **Top row:** a 46×46 **app icon** (`border-radius:13px`, framework-tinted gradient via `iconBg(color)`, glossy top highlight via `::after`, drop shadow) holding the framework glyph · the **name** (14.5px/700, truncates) + **framework** sublabel · a **toggle switch** (`.toggle`, 42×25, green `#28c840` when on, knob slides 17px). Toggle `stopPropagation`s so it doesn't open the window.
- **Port hero:** `:` in amber (`--amber #ffcf6b`) + the port number, big in **mono** (27px/600), with a `PORT` label and a `localhost` mono pill pushed to the right.
- **Services row (`.tile-svc`):** chips. Backend chip shows a status **dot** (green glowing `up` / faint `down`), the backend type, and `:port` in mono — or a dashed **No API** chip if none. Optional **database** chip (Supabase / SQLite / Postgres) with its brand glyph + name.
- **Footer (`.tile-foot`):** git branch (`{branch}` + `*` if dirty) · uptime (mono, `Xh Ym` / `Xm` / `Xs`) only when running · an **Open ↗** link that fades in on hover.

### 5. Dock (`.dock`)
Floating, centered, frosted pill (`rgba(60,58,90,0.34)` + `blur(30px)`, `border-radius:22px`). One 52×52 glossy icon per project (framework-tinted), a separator, then **system buttons** (Group-by-framework grid icon, Refresh icon).
- **Magnification:** on `mousemove` the dock computes each icon's scale from cursor distance via a Gaussian: `scale = 1 + 0.5 * exp(-(d²)/(2·62²))`, and lifts it `translateY(-(s-1)*26px)`. Resets on mouse-leave.
- **Running indicator:** a small dot (`.di-run`) under running apps.
- **Port badge:** running apps show a red `:port` badge (`.di-badge`) top-right; it's counter-scaled (`--badge-s: 1/s`) so it stays a constant size while the icon magnifies.
- **Tooltip:** name + `:port` in amber appears above on hover.
- **Bounce:** when a new app launches, its dock icon plays a 2× `bounce` keyframe (`translateY(-26px)`).

### 6. Mac detail window (`.macwin`) — opens on tile/dock click
Centered modal over a dim scrim (`.win-scrim rgba(0,0,0,0.32)`). 560px wide, `rgba(34,32,52,0.72)` + `blur(50px)`, `border-radius:16px`. Opens with a `scale(0.94)→1` + fade transition. **Esc** or scrim/red-light closes it.
- **Title bar:** three **traffic lights** (red=close, yellow=close, green=decorative) that reveal ✕ / − / + glyphs on hover; centered title `{name} — localhost:{port}`.
- **Hero:** 60×60 app icon + name (21px/700) + framework.
- **Tag row:** Running/Stopped pill (green when live) · amber `:port` pill · folder pill · uptime pill (when running).
- **Sections:** **About** (paragraph) · **Location** (mono path in a dark inset with a **copy** button → check icon for 1.4s) · **Services** (rows for Frontend / Backend / Database, each an icon + title + subtitle + `:port` with status dot) · **Features** (checklist, amber checks) · **Git** (branch · commit, `(uncommitted)` if dirty).
- **Footer:** primary amber-gradient button — **Open :port** (opens `http://localhost:port`) when running, or **Start** when stopped · a **VS Code** button · a **Stop** danger button when running.

### 7. Notification banner (`.notif`)
Top-right stack. 340px frosted card sliding in (`notifin`, translateX+scale). Shows the new app's framework icon, `App launched` / `now`, and `{name} is live on :{port}` (port in amber mono). Auto-dismisses (~5.2s → `out` animation → removed). Clicking it opens that app's detail window. Fired ~7s after load from the `window.INCOMING` pool to demo dynamic detection.

---

## Interactions & Behavior
- **Toggle server (tile or detail window):** flips `frontend.up` (and `backend.up` if present), resets uptime to 1 on start. → **wire to real stop/start endpoint.**
- **Open tile / dock icon:** opens the detail window and sets a deep-link hash `#p={id}` (so a reload re-opens it). `hashchange` is also listened to.
- **Search:** filters projects by name, framework, folder, backend type/port, database, branch, or frontend port. `⌘K` (or `/` when not already in an input) focuses the field.
- **Grouping segmented control / Launchpad dock button:** `none` → flat; `framework` → grouped by framework (normalizes `Node (nodemon)`→`Node.js`); `folder` → grouped by parent folder (`root`→`~ (home)`). Groups sorted alphabetically.
- **Refresh (menu-bar icon or dock button):** spins the icon for 700ms. → **hook to a real re-scan.**
- **Dock magnification:** Gaussian scale on `mousemove` (sigma 62px, peak +50%), described above.
- **Uptime ticks:** every 5s, running projects' `uptime += 5`. Formatted `Xh Ym` / `Xm` / `Xs`. → **replace with real process start-time.**
- **New-app launch demo:** after 7s, shifts one project from `window.INCOMING` into the list, bounces its dock icon, and shows a notification. → **replace with real "new server detected" event (websocket/poll).**
- **Copy path / VS Code / Open:** copy uses `navigator.clipboard`; Open does `window.open('http://localhost:'+port)`; VS Code button is currently a no-op → **wire to `vscode://file/{path}` or your editor-open endpoint.**

### Responsive
- `max-width: 720px`: search field hides, menu-bar gap shrinks.
- Grid auto-fills with `minmax(264px, 1fr)` so tiles reflow naturally.
- `prefers-reduced-motion: reduce`: disables wallpaper-blob, tile, badge, and notification animations.

---

## State Management
All state lives in `OSApp` (`desktop_app.jsx`):
| State | Purpose |
|---|---|
| `projects` | array of server objects (seeded from `window.PROJECTS`) — the live list |
| `query` | search string |
| `group` | `"none" \| "framework" \| "folder"` |
| `active` | currently-open project (detail window), or `null` |
| `notif` | current notification payload, or `null` |
| `bounceId` | id of dock icon currently bouncing |
| `mouseX` | cursor x within dock (for magnification) |
| `clock` | formatted menu-bar time string (ticks every 10s) |
| `spin` | refresh-icon spinning flag |
| `incoming` (ref) | queue of projects that can "appear" live |

**Data fetching to add:** replace `window.PROJECTS`/`window.INCOMING` with a real feed (REST poll or websocket) of `{ id, name, path, framework, folder, branch, dirty, commit, uptime, frontend:{port,up}, backend:{type,port,up}|null, database|null, about, features:[] }`. Toggle/refresh/open/VS-Code should call back to the scanner service.

---

## Design Tokens
**Colors** (from `:root` in `desktop.css`):
| Token | Value | Use |
|---|---|---|
| `--txt` | `#ffffff` | primary text |
| `--txt-dim` | `rgba(255,255,255,0.66)` | secondary text |
| `--txt-faint` | `rgba(255,255,255,0.42)` | labels, captions |
| `--glass` | `rgba(40,44,60,0.42)` | control-center panel |
| `--glass-2` | `rgba(255,255,255,0.10)` | tile bg |
| `--glass-3` | `rgba(255,255,255,0.16)` | tile hover bg |
| `--hair` | `rgba(255,255,255,0.16)` | hairline borders |
| `--hair-soft` | `rgba(255,255,255,0.09)` | softer hairlines |
| `--amber` | `#ffcf6b` | accent (ports, primary button, brand) |
| `--green` | `#34d058` | status dots |
| `--grn-light` | `#28c840` | toggle "on" |
| `--red` | `#ff5f57` | close light / danger |
| `--yellow` / `--febc2e` | `#febc2e` | minimize light |

Wallpaper gradient stops: `#ff8a5c`, `#ff5fa2`, `#2bc6d3`, `#6a4bff` over `#3b1d6e → #25184f → #161335`.

**Framework accent colors** (`window.FW`, drive icon gradients): Next.js `#e8edf2`, Vite `#a06bff`, Node.js `#56d364`, React `#61dafb`, TanStack Start `#ff8a3d`, Express `#cbd2dc`, Bun `#f6e7c9`. Databases (`window.DBINFO`): Supabase `#3ecf8e`, SQLite `#4d9fe6`, Postgres `#7aa7d8`. Icon gradient = `linear-gradient(160deg, {color}, color-mix(in srgb, {color} 62%, #1a1730))`.

**Typography:**
- UI font: `-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif`.
- Mono font: `"SF Mono", "JetBrains Mono", ui-monospace, monospace` (ports, paths, uptime).
- Scale: menu bar 13px · tile name 14.5px/700 · tile framework 11.5px · port hero 27px/600 mono · labels 11px/700 uppercase `letter-spacing:.08–.1em` · window title 21px/700 · body 13–13.5px.
- `letter-spacing: -0.01em` to `-0.02em` on bold headings; `tabular-nums`/`font-variant-numeric` on clock & ports.

**Radii:** tile 18px · app icon 13px (60px hero → 16px) · panel 26px · dock 22px · dock icon 14px · window 16px · chips/pills 7–9px · toggle/badge 999px.

**Shadows:** panel `0 30px 80px -30px rgba(0,0,0,0.7)` + inset top highlight `0 1px 0 rgba(255,255,255,0.18) inset` · tile hover `0 18px 40px -20px rgba(0,0,0,0.7)` · window `0 50px 120px -30px rgba(0,0,0,0.8)` · app icon `0 6px 14px -5px rgba(0,0,0,0.6)`.

**Blur (glass):** menu bar 20px · panel 40px · dock 30px · window 50px · notification 30px — all with `saturate(150–170%)`. Keep the `-webkit-` prefixes.

**Animation timings:** tile-in 0.45s `cubic-bezier(.2,.8,.2,1)` · tile hover 0.22s · toggle knob 0.2s `cubic-bezier(.4,1.3,.5,1)` · window open 0.3s `cubic-bezier(.2,.9,.3,1.1)` · dock bounce 0.6s ×2 · wallpaper blobs 34/40/46s · notification in 0.45s.

## Assets
- **No external image assets.** All app/framework/stack/UI icons are **inline SVG** — UI icons live in the `DI` map (`desktop_components.jsx`); framework & database brand glyphs live in `window.GLYPH` (`data.js`, raw SVG strings set via `dangerouslySetInnerHTML`). The wallpaper grain is an inline SVG data-URI in CSS.
- **Fonts:** Inter + JetBrains Mono are loaded from Google Fonts in `localOS.html` as web fallbacks; SF Pro / SF Mono are used first when available (macOS). Swap to your project's font-loading approach.

## Files
In this bundle (and at `localview/` in the source project):
- **`localOS.html`** — entry point; loads fonts, CSS, React+Babel, then `data.js` → `desktop_components.jsx` → `desktop_app.jsx`. Also contains the `.wallpaper` / `.wp-grain` markup.
- **`desktop.css`** — **all styling** (tokens, wallpaper, menu bar, panel, tiles, dock, window, notification, responsive). Framework-agnostic; reuse directly.
- **`desktop_components.jsx`** — `ServerTile`, `Dock`, `MacWindow`, `WSvc`, `Notification`, the `DI` icon map, and helpers (`dIsRun`, `dFmtUp`, `iconBg`, `dGlyph`).
- **`desktop_app.jsx`** — `OSApp` root: state, search/group logic, clock, keyboard shortcuts, deep-linking, uptime ticks, launch-demo, dock wiring.
- **`data.js`** — `window.GLYPH` (brand SVGs), `window.FW` / `window.DBINFO` (accent maps), `window.PROJECTS` (seed data), `window.INCOMING` (launch-demo pool). **This is the file to replace with real scan data.**

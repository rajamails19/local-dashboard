# Handoff: LocalView FC — Match-Day Dev Dashboard

## Overview
**LocalView FC** is a local development dashboard that reimagines "a table of which apps are running on which ports" as a **football (soccer) match-day squad**. Every dev server on the machine is rendered as a premium **player card** (FUT-style: gold / silver / bronze tiers), arranged in a live **formation on a stadium pitch**. Running servers are "on the pitch," stopped servers sit on the **substitutes bench**, and the user can **stop / start ("sub off / bring on")** any server, inspect a **player profile** (README, stack, port status), search, group by framework ("By Club"), and see new servers appear as a **"NEW SIGNING"** transfer alert.

This bundle is the **visual + interaction reference** for that dashboard. The backend that actually scans ports / processes already exists on the user's side (built earlier in Claude Code); **this handoff is about replacing the existing UI with this design** and wiring it to the real data + stop/start actions.

---

## About the Design Files
The files in this bundle (`LocalView FC.html`, `football.css`, `football_components.jsx`, `football_app.jsx`, `data.js`) are **design references created in HTML/React-via-Babel**. They are a **prototype showing the intended look and behavior** — **not production code to ship as-is**.

The task is to **recreate this design inside the target codebase's existing environment**, using its established patterns and libraries:
- The prototype uses **React 18 through an in-browser Babel transform** (fine for a mockup, wrong for production). In the real app, use a normal build pipeline (Vite/Next/CRA/etc.). If the existing dashboard is plain HTML/JS or a different framework, port the markup + CSS to that stack — the **CSS is framework-agnostic and can be reused almost verbatim**.
- Replace the **mock `data.js`** with the real port/process scan feed from the existing backend.
- Wire the **Stop / Start ("Sub Off / Bring On")** buttons and the **Open / VS Code** actions to real endpoints (see *State Management* and *Interactions*).

A second, more conventional dark-glass version also exists in the project (`LocalView Dashboard.html`) if a less thematic look is ever wanted — but **this football version is the intended direction.**

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, tier logic, and interactions are all specified below and present in `football.css`. Recreate the UI pixel-faithfully using the codebase's libraries, then swap mock data for live data. The exact hex values, fonts, radii, and animation timings are documented in *Design Tokens*.

---

## Screens / Views

### 1. Main Dashboard — "Formation" view (default)
**Purpose:** At a glance, see every running dev server as a player on the pitch, with port/stack/uptime, and stop/inspect any of them.

**Layout (desktop, design width ≈ 1340px, centered, `max-width: 1340px`, side padding 30px):**
1. **Scoreboard bar** (full width, sticky-feeling glass header)
2. **Toolbar** (search input + view toggle)
3. **Pitch** (the formation, a large rounded green panel)
4. **Substitutes bench** (only shown if ≥1 server is stopped)

**Responsive:** below **1180px** the four scoreboard stats wrap to their own full-width row beneath the brand/clock/refresh row (see media query in `football.css`). Cards reflow via `flex-wrap` on each formation line and an `auto-fill minmax(188px, 1fr)` grid in the By-Club view.

---

#### 1a. Scoreboard bar
- Container: `background: linear-gradient(180deg, rgba(8,20,12,.92), rgba(6,16,10,.86))`, `border: 1px solid rgba(255,255,255,.12)`, `border-radius: 16px`, `padding: 14px 20px`, `backdrop-filter: blur(10px)`, shadow `0 20px 50px -24px #000`. Flex row, `gap: 20px`, `align-items: center`.
- **Club crest** (left): 50×56px hexagon via `clip-path: polygon(50% 0,100% 16%,100% 70%,50% 100%,0 70%,0 16%)`, gold gradient `linear-gradient(160deg,#fce79a,#e8b84b 55%,#a9781d)`, a lightning-bolt glyph (color `#1a1205`) centered.
- **Wordmark:** "LOCAL**VIEW** FC" — `font-family: Anton`, `26px`, uppercase, `letter-spacing: .04em`, `white-space: nowrap`; "VIEW" colored `#e8b84b` (gold-2). Subtitle "MATCH DAY · SQUAD STATUS" — `Barlow Condensed`, `13px`, `letter-spacing: .22em`, uppercase, color `#b9c7bd`.
- **Score stats** (center, flex `gap: 26px`, separated by 1px vertical dividers `rgba(255,255,255,.12)`): four stats, each = big number (`Anton`, `34px`) + label (`Barlow Condensed`, `11px`, `.16em`, uppercase, `#b9c7bd`):
  - **On Pitch** — number color `#56f08a` (running count)
  - **On Bench** — number color `#b9c7bd` (stopped count)
  - **Ports Live** — number color `#e8b84b` (count of open ports across frontend+backend)
  - **Formation** — e.g. `4-1` in white (computed `DEF-MID-FWD`, zero-lines omitted)
- **Match clock** (right): pill, `Barlow Condensed`, color `#56f08a`, `background rgba(86,240,138,.1)`, `border 1px solid rgba(86,240,138,.3)`, `border-radius 999px`. Contains a blinking 8px dot (`@keyframes blip`, opacity 1→.25, 1.6s) and text `Live {minute}'` where minute counts 1–90 ticking every 2.5s (purely cosmetic).
- **Refresh button:** `Barlow Condensed`, uppercase, `background rgba(255,255,255,.07)`, `border 1px solid rgba(255,255,255,.14)`, `border-radius 10px`, refresh icon. On click the icon spins once (`@keyframes spin`, .7s). In production this should re-trigger the port scan.

#### 1b. Toolbar
- **Search input:** flex:1, `background rgba(6,16,10,.72)`, `border 1px solid rgba(255,255,255,.12)`, `border-radius 12px`, `padding 11px 16px`, magnifier icon, placeholder "Search squad — player, club, position, port…". Filters across: name, framework, folder, backend type, database, branch, frontend port, backend port (case-insensitive substring).
- **View toggle (segmented):** two buttons "Formation" / "By Club". Active button: text `#15240f` on `linear-gradient(150deg,#fce79a,#e8b84b)`; inactive: `#b9c7bd`. Container `background rgba(6,16,10,.72)`, `border-radius 11px`, `padding 4px`.

#### 1c. Pitch (Formation)
- Container: `border-radius 20px`, `border 2px solid rgba(255,255,255,.16)`, `padding 40px 20px 30px`, background = **mowed stripes** `repeating-linear-gradient(180deg, rgba(255,255,255,.05) 0 70px, transparent 70px 140px)` over `linear-gradient(180deg,#14743a,#0c5026)`, inset shadow `inset 0 0 120px rgba(0,0,0,.5)`.
- **Pitch markings** (absolutely positioned, `border-color rgba(255,255,255,.22)`): center line (2px), center circle (180×180, 50% radius), center spot (8px dot), top & bottom penalty boxes (280px wide, 90px tall, open on the pitch-facing side).
- **Formation rows:** `display:flex; flex-direction:column; gap:26px`. Rows are rendered top→bottom in order **FWD, MID, DEF, GK**; each row is a centered flex row (`justify-content:center; gap:22px; flex-wrap:wrap`) of player cards. Empty role rows are omitted.
- **Role assignment** (drives which line a card sits on) — see *State Management → role()*.

#### 1d. Substitutes bench
- Shown only when `benched.length > 0`.
- Header: "SUBSTITUTES" (`Anton`, 15px, `.12em`) + count chip (`Barlow Condensed`, pill `rgba(255,255,255,.1)`) + a thin rule.
- Strip: `display:flex; gap:16px; flex-wrap:wrap; padding:18px`, `border-radius 16px`, `background linear-gradient(180deg, rgba(8,20,12,.7), rgba(6,14,9,.6))`, **dashed** border `1px dashed rgba(255,255,255,.16)`.
- Benched cards: `filter: grayscale(.85) brightness(.78)`, `transform: scale(.9)`, with a diagonal red **"SUBBED OFF"** stamp (`@font Anton`, color `#ff5757`, `border 3px solid #ff5757`, rotated -13°).

---

### 2. Player Card (the core component)
A vertical FUT-style card, **188px wide, min-height 300px**.

- **Shape:** `border-radius 16px` + `clip-path: polygon(0 0, 100% 0, 100% 91%, 50% 100%, 0 91%)` (gives the pointed-bottom "shield"). `overflow:hidden`, `isolation:isolate`, `padding 14px 15px 40px` (extra bottom padding reserves space for the clipped point + the absolutely-positioned footer).
- **Tier background** (set by class, applied to the element itself — NOT a pseudo-element, so it renders reliably):
  - `.t-gold` → `linear-gradient(160deg,#fce79a 0%,#e8b84b 46%,#a9781d 100%)`, text color `#1c1408` (dark)
  - `.t-silver` → `linear-gradient(160deg,#f3f6fb 0%,#c2ccd8 48%,#7e8b9c 100%)`, text `#1c1408`
  - `.t-bronze` → `linear-gradient(160deg,#f3c79a 0%,#c5803f 48%,#7c4a1e 100%)`, text `#1c1408`
  - `.t-toty` (rating ≥ 92, special) → `linear-gradient(165deg,#3a2f63 0%,#2a2350 40%,#120e2b 100%)`, text `#f6f8ff` (light), plus gold ring `box-shadow: 0 0 0 1px #ffd24a, 0 16px 40px -14px rgba(255,210,74,.5)`.
  - Light-text tiers get class `light`, dark-text tiers get `dark` (drives the status-dot color etc.).
- **Foil shine:** `::after` is a diagonal white gradient `linear-gradient(115deg, transparent 30%, rgba(255,255,255,.5) 47%, transparent 64%)`, `background-size:250% 250%`; on hover it sweeps across (`@keyframes foil`, 1.1s) and the card lifts `transform: translateY(-8px) scale(1.035)`.
- **Entrance:** `@keyframes drop` (from `opacity:0; translateY(-22px) scale(.94)`), .55s. (A `.still` class on `<html>` disables entrance + drawer transitions — used only for screenshots; harmless to keep or drop.)
- **Header row** (`pc-head`, flex space-between):
  - **OVR + position** (left): rating number `Anton` 38px; position label below (`Barlow Condensed` 700, 14px, `.08em`, opacity .85) — one of `GK / CB / CM / ST`.
  - **Club badge** (right): 30×30 framework glyph.
- **Jersey number** (`pc-jersey`, absolutely positioned top-right under the badge): `#{frontendPort}`, `Anton` 13px, opacity .55.
- **Portrait** (`pc-portrait`, 70px tall, centered): a soft white radial **halo** (84px circle, `radial-gradient(circle, rgba(255,255,255,.45), transparent 65%)`) behind the framework glyph (54px, drop-shadow).
- **Name** (`pc-name`): project name with `-`/`_` replaced by spaces, `Anton` 17px, uppercase, centered, `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`.
- **Divider** (`pc-bar`): 2px `currentColor` at opacity .28.
- **Stats grid** (`pc-stats`, 2×2 grid, `gap 5px 10px`): each cell = label + value, `white-space:nowrap`. Labels (`pc-stat .sl`): `Barlow Condensed` 700, 10.5px, opacity .65. Values (`.sv`): `Anton` 15px; long text values (backend/db) use `.sv.sm` = `Barlow Condensed` 700, 11.5px with `overflow:hidden; text-overflow:ellipsis`. Cells:
  - `PRT` = frontend port
  - `UPT` = uptime (e.g. `2h 16m`; `—` if stopped)
  - `BCK` = backend type or `—`
  - `DB` = database name or `—`
- **Footer** (`pc-foot`, absolutely positioned `left:15px; right:15px; bottom:16px`, flex space-between):
  - **Status** (`pc-live`): a 7px dot + "ON PITCH" / "BENCHED". Dot is green w/ glow on light-text cards (`#56f08a`), darker green on gold/bronze.
  - **Sub button** (`subbtn`): "SUB OFF" (running → class `.off`, red `#b3231e`/`#ff8a85`, border `#d14b46`) or "BRING ON" (stopped). Stops click propagation; toggles the server.
- **Whole card is clickable** → opens the Player Profile drawer (see screen 4). The card has an `onMouseMove` only in the glassy version; in FC it's not required.

**Card sizes:** 188px on pitch / in grid; a **150px** variant is embedded read-only in the profile drawer header.

---

### 3. Main Dashboard — "By Club" view
Same data, grouped by framework instead of placed on the pitch.
- For each framework (alphabetical): a header row — framework glyph badge + framework name (`Anton` 18px, `.06em`, uppercase) + count chip + thin rule — followed by a responsive grid `grid-template-columns: repeat(auto-fill, minmax(188px, 1fr)); gap: 22px; justify-items:center` of the same player cards (stopped ones rendered with the benched/grayscale treatment).

---

### 4. Player Profile (slide-over drawer)
**Purpose:** Deep info on one server — README, stack with live port status, actions.

- **Scrim:** `position:fixed; inset:0; background:rgba(2,10,5,.66); backdrop-filter:blur(7px)`, fades in (opacity .32s). Click to close.
- **Panel:** `position:fixed; right:0; top:0; bottom:0; width:520px; max-width:95vw`, `background linear-gradient(180deg,#0c2415,#06160c)`, `border-left 1px solid rgba(255,255,255,.14)`, shadow `-40px 0 90px -30px #000`. Slides in via `transform: translateX(102%) → translateX(0)`, transition `.42s cubic-bezier(.16,.84,.3,1)`. **Important:** open it by a state change after mount (set state on click / in a mount effect), not by rendering it already-open on first paint — the slide transition needs the class change to animate. Flex column: hero / scrollable body / footer.
- **Hero:** a blurred color glow (the framework's brand color) top-right; a **150px read-only player card**; and meta: position+tier line (e.g. "Midfielder · Gold", `Barlow Condensed` 700, `.16em`, gold `#e8b84b`), the name (`Anton` 30px, uppercase), and tag pills (On Pitch/On Bench, `#{port}` with a shirt icon, folder with a flag icon). Close button top-right (34px, rounded, `rgba(255,255,255,.08)`).
- **Body sections** (each: uppercase `Barlow Condensed` 700 12px `.16em` `#b9c7bd` heading):
  - **Scouting report** — the README/about paragraph (`Barlow`, 15px, line-height 1.55, `#d8e4dc`).
  - **Form** — two attribute tiles: **Overall** (the OVR rating, green if running / red if stopped) and **Minutes** (uptime).
  - **Home ground** — full filesystem path in a mono box (`JetBrains Mono` 12px) with a **copy** button (writes path to clipboard, swaps to a check icon for 1.4s).
  - **Squad & contract** — one row per stack layer: framework (Club / frontend), backend (Backend / API), database — each with an icon, name, sublabel, and (for frontend/backend) the **port + a status dot** (green `#56f08a` up / red `#ff7a7a` down).
  - **Honours** — the feature list, each as a star-bulleted line.
  - **Last fixture** — git branch + last commit message (+ "(uncommitted)" if dirty), mono box.
- **Footer** (`profile-foot`, flex `gap:10px`, top border):
  - **Primary** (gold gradient, `#15240f` text): if running → "WATCH :{port}" (opens `http://localhost:{port}`); if stopped → "BRING ON" (starts server).
  - **Training** (neutral) → intended to open the project in the editor / VS Code.
  - **Sub Off** (danger red, only when running) → stops the server.
- **Esc** key closes the drawer.

---

## Interactions & Behavior
- **Open profile:** click anywhere on a card (except the Sub button) → set selected project in state → drawer slides in. URL hash is updated to `#p=<project-id>` (deep-linkable; a `hashchange`/mount listener re-opens it).
- **Close profile:** click scrim, close button, or Esc → clears state, restores URL.
- **Sub Off / Bring On:** toggles a server's running state. In the prototype this flips `frontend.up` (and `backend.up` if present) and resets uptime to 1 when starting. **In production:** call the backend to actually `kill` the process (Sub Off) or spawn the dev script (Bring On), then refresh state. A running card lives on the pitch; a stopped card moves to the bench (and gets the grayscale + "SUBBED OFF" stamp). This re-render is the "substitution."
- **Refresh:** spins the icon (.7s) and re-pulls state. Production: re-run the port scan.
- **New signing (dynamic detection):** when a new server is detected, it's appended to the list, a gold **"NEW SIGNING"** toast appears bottom-center for ~5s ("{name} joins on #{port}", with a "View →" action that opens its profile), and the new card flashes a gold ring (`@keyframes pop`, 1.6s). **Production:** trigger this whenever the scanner reports a port that wasn't present before. (Prototype simulates one arrival ~7.5s after load via `window.INCOMING`.)
- **Live ticks (cosmetic):** uptime increments every 5s for running servers; the match-clock minute advances every 2.5s. Replace with real uptime from the backend.
- **Animations:** card entrance `drop` .55s; hover lift + `foil` shine 1.1s; drawer slide `.42s cubic-bezier(.16,.84,.3,1)`; toast in/out ~.4s; status-dot `blip`/glow. All gated off under `prefers-reduced-motion: reduce` and the `.still` html class.

## State Management
Per-project data shape (replace mock with live scan; see `data.js`):
```
{
  id, name, path, framework, folder,
  branch, dirty (bool), commit,
  uptime (seconds),
  frontend: { port, up (bool) },
  backend:  { type, port, up } | null,
  database: "Supabase" | "SQLite" | "Postgres" | null,
  about (string), features (string[])
}
```
Derived helpers (in `football_components.jsx`, keep these exact rules for identical visuals):
- `isRunning(p)` = `frontend.up || (backend && backend.up)`
- `rating(p)` = `min(99, 72 + min(27, floor(uptimeMinutes/13)) + (backend.up?2:0) + (database?1:0))`
- `role(p)` → `"GK"` if id matches /dashboard|server/ or it's backend-only; else `"FWD"` if no backend & no db; `"MID"` if has both; otherwise `"DEF"`. Position labels: GK→GK, DEF→CB, MID→CM, FWD→ST.
- `tier(p)` from rating: ≥92 `toty`, ≥83 `gold`, ≥77 `silver`, else `bronze`.
- `fmtUp(seconds)` → `"2h 16m"` / `"21m"` / `"1m"`.

App-level state: `projects[]`, `query` (search), `view` ("formation"|"club"), `active` (selected project for drawer), `toast`, `freshId` (for the gold-ring flash), refresh-spin flag, match minute.

## Design Tokens
**Colors**
- Pitch greens: `#0b3b1f`, `#0f5a2c`, `#0a4424`, panel `#14743a`→`#0c5026`, app bg `#06270f`
- Ink: `#f4f7f2` (text), `#b9c7bd` (dim)
- Gold tier: `#fce79a` / `#e8b84b` / `#a9781d`
- Silver tier: `#f3f6fb` / `#c2ccd8` / `#7e8b9c`
- Bronze tier: `#f3c79a` / `#c5803f` / `#7c4a1e`
- TOTY/special: `#3a2f63` / `#2a2350` / `#120e2b`, accent `#ffd24a`
- Live green: `#56f08a`; Danger red: `#ff5757` (dots `#ff7a7a`)
- Pitch line: `rgba(255,255,255,.22)`
- Framework brand colors (badges/glows): Next.js `#e8edf2`, Vite `#a06bff`, Node `#56d364`, React `#61dafb`, TanStack `#ff8a3d`, Express `#cbd2dc`, Bun `#f6e7c9`; DBs: Supabase `#3ecf8e`, SQLite `#4d9fe6`, Postgres `#7aa7d8`
**Typography** (Google Fonts)
- Display / numbers / names: **Anton** (400)
- Labels / UI / condensed: **Barlow Condensed** (500/600/700)
- Body / paragraphs: **Barlow** (400/500/600)
- Code / ports / paths: **JetBrains Mono** (400/500)
**Radii:** cards 16px (+ shield clip-path), panels 16–20px, pills 999px, small chips 7–12px.
**Shadows:** card `0 16px 34px -16px rgba(0,0,0,.7)` + inset highlight `inset 0 1px 0 rgba(255,255,255,.35)`; drawer `-40px 0 90px -30px #000`; scoreboard `0 20px 50px -24px #000`.
**Spacing:** page padding 30px; formation row gap 26px; card gap 22px; card padding `14px 15px 40px`.

## Assets
- **No external image assets.** All framework/database logos are **simple original inline-SVG glyphs** (defined in `data.js` as `window.GLYPH`) — stylized, not exact brand trademarks. In the real app you may swap these for the project's existing icon set or official brand SVGs (respecting each project's brand guidelines). The crest/badge lightning bolt and all UI icons are inline SVG in the components.
- Fonts are loaded from Google Fonts (`Anton`, `Barlow Condensed`, `Barlow`, `JetBrains Mono`).

## Files
All under the project's `localview/` folder; copies are included in this handoff:
- **`LocalView FC.html`** — entry point; loads fonts, React/Babel (prototype only), and the scripts below. Note the `<div class="stadium">`, floodlights, and grain layers in the body.
- **`football.css`** — the entire visual system (stadium, scoreboard, player cards + tiers, pitch markings, bench, By-Club grid, profile drawer, toast, responsive rules). **Reusable nearly as-is.**
- **`football_components.jsx`** — `PlayerCard`, `Profile` (drawer), `Crow`, `Transfer` (toast), icon set `FI`, glyph helper, and all the squad-math helpers (`isRunning`, `rating`, `role`, `tier`, `fmtUp`).
- **`football_app.jsx`** — `FCApp`: state, search, grouping, formation row assignment, live ticks, new-signing simulation, deep-link hash, stop/start.
- **`data.js`** — mock projects (`window.PROJECTS`), the "incoming" demo signing (`window.INCOMING`), framework/db metadata (`window.FW`, `window.DBINFO`), and glyph SVGs (`window.GLYPH`). **Replace `PROJECTS`/`INCOMING` with the live scan; keep `FW`/`DBINFO`/`GLYPH` as the icon + color lookup.**

> Reminder: these are **design references**. Recreate them in the existing dashboard's stack and wire the Stop/Start, Refresh, Open-in-browser, Open-in-editor, and new-server-detection to the real backend that already exists.

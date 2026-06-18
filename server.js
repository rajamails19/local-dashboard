const http = require('http');
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 9999;
const NAMES_FILE = path.join(__dirname, 'names.json');

function loadNames() {
  try { return JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8')); }
  catch { return {}; }
}

function saveName(dir, name) {
  const names = loadNames();
  if (name) names[dir] = name;
  else delete names[dir];
  fs.writeFileSync(NAMES_FILE, JSON.stringify(names, null, 2));
}

const DEV_PATTERNS = [
  { re: /node.*\.bin\/next(\s+dev)?/, framework: 'Next.js', color: '#ffffff', bg: '#000000', icon: '▲' },
  { re: /next-server/, framework: 'Next.js', color: '#ffffff', bg: '#000000', icon: '▲' },
  { re: /\.bin\/vite(\s|$)/, framework: 'Vite', color: '#bd34fe', bg: '#1a1a2e', icon: '⚡' },
  { re: /\.bin\/nuxt/, framework: 'Nuxt', color: '#00c58e', bg: '#002e1a', icon: '▲' },
  { re: /\.bin\/remix/, framework: 'Remix', color: '#e8f2ff', bg: '#1a1a2e', icon: '💿' },
  { re: /\.bin\/astro/, framework: 'Astro', color: '#ff5d01', bg: '#1a0a00', icon: '🚀' },
  { re: /\.bin\/svelte/, framework: 'SvelteKit', color: '#ff3e00', bg: '#1a0a00', icon: '🔥' },
  { re: /uvicorn|fastapi/, framework: 'FastAPI', color: '#06b6d4', bg: '#0a2e1a', icon: '🚀' },
  { re: /manage\.py\s+runserver/, framework: 'Django', color: '#44b78b', bg: '#0a2014', icon: '🎸' },
  { re: /flask/, framework: 'Flask', color: '#94a3b8', bg: '#1a1a2e', icon: '🌶' },
  { re: /rails\s+server|puma/, framework: 'Rails', color: '#cc0000', bg: '#2e0a0a', icon: '💎' },
  { re: /\.bin\/nodemon/, framework: 'Node (nodemon)', color: '#68a063', bg: '#14290a', icon: '⬡' },
  { re: /node\s+server/, framework: 'Node.js', color: '#68a063', bg: '#14290a', icon: '⬡' },
  { re: /\.bin\/expo/, framework: 'Expo', color: '#ffffff', bg: '#1a1a2e', icon: '📱' },
  { re: /concurrently/, framework: 'Concurrent', color: '#94a3b8', bg: '#1a1a2e', icon: '⚙️' },
];

const BACKEND_DEPS = [
  { keys: ['express'], label: 'Express', icon: '⬡', color: '#68a063', bg: '#14290a' },
  { keys: ['fastify'], label: 'Fastify', icon: '⚡', color: '#ffffff', bg: '#1a1a2e' },
  { keys: ['@hono/node-server', 'hono'], label: 'Hono', icon: '🔥', color: '#ff5d01', bg: '#1a0a00' },
  { keys: ['@nestjs/core'], label: 'NestJS', icon: '🐈', color: '#e0234e', bg: '#2e0a1a' },
  { keys: ['koa'], label: 'Koa', icon: '🌿', color: '#33a06f', bg: '#0a2014' },
  { keys: ['@supabase/supabase-js', '@supabase/ssr'], label: 'Supabase', icon: '⚡', color: '#3ecf8e', bg: '#0a2e1a' },
  { keys: ['@prisma/client', 'prisma'], label: 'Prisma', icon: '◈', color: '#5a67d8', bg: '#0a0a2e' },
  { keys: ['drizzle-orm'], label: 'Drizzle', icon: '💧', color: '#c8d8e8', bg: '#0a1a2e' },
  { keys: ['mongoose'], label: 'MongoDB', icon: '🍃', color: '#4db33d', bg: '#0a2e0a' },
  { keys: ['pg', 'postgres', 'postgresql'], label: 'PostgreSQL', icon: '🐘', color: '#336791', bg: '#0a1a2e' },
  { keys: ['mysql2', 'mysql'], label: 'MySQL', icon: '🐬', color: '#4479a1', bg: '#0a1a2e' },
  { keys: ['redis', 'ioredis'], label: 'Redis', icon: '⚡', color: '#dc382d', bg: '#2e0a0a' },
  { keys: ['better-sqlite3', 'sqlite3'], label: 'SQLite', icon: '🗄', color: '#7ecfc0', bg: '#0a1a2e' },
  { keys: ['sequelize'], label: 'Sequelize', icon: '🔷', color: '#52b0e7', bg: '#0a1a2e' },
  { keys: ['typeorm'], label: 'TypeORM', icon: '🔶', color: '#fe0902', bg: '#2e0a00' },
  { keys: ['firebase', '@firebase/app'], label: 'Firebase', icon: '🔥', color: '#ffca28', bg: '#1a1000' },
  { keys: ['@aws-sdk/client-s3', 'aws-sdk'], label: 'AWS', icon: '☁', color: '#ff9900', bg: '#1a0f00' },
  { keys: ['openai'], label: 'OpenAI', icon: '◆', color: '#10a37f', bg: '#0a1a14' },
  { keys: ['@anthropic-ai/sdk', 'anthropic'], label: 'Claude API', icon: '◆', color: '#d97706', bg: '#1a1000' },
];

function detectFramework(cmd) {
  for (const p of DEV_PATTERNS) {
    if (p.re.test(cmd)) return p;
  }
  return null;
}

function getProcessCwd(pid) {
  try {
    // macOS: lsof -p <pid> shows cwd
    const out = execSync(`lsof -p ${pid} 2>/dev/null | grep cwd`, { timeout: 2000 }).toString();
    const match = out.match(/\s+(\/.+)$/m);
    return match ? match[1].trim() : null;
  } catch { return null; }
}

function extractProjectDir(cmd, pid) {
  // Standard: path contains node_modules
  const nodeModulesMatch = cmd.match(/([^\s]+?)\/node_modules\//);
  if (nodeModulesMatch) return nodeModulesMatch[1];

  // Python manage.py
  const manageMatch = cmd.match(/python.*\s(\/[^\s]+)\/manage\.py/);
  if (manageMatch) return manageMatch[1];

  // Plain `node <script>` or `node /full/path/script.js` — fall back to CWD
  const plainNodeMatch = cmd.match(/^node\s+(\S+\.js)/);
  if (plainNodeMatch && pid) {
    const scriptArg = plainNodeMatch[1];
    // If script is an absolute path, use its directory
    if (scriptArg.startsWith('/')) return path.dirname(scriptArg);
    // Otherwise use the process CWD
    const cwd = getProcessCwd(pid);
    if (cwd) return cwd;
  }

  return null;
}

function getGitBranch(dir) {
  try {
    return execSync(`git -C "${dir}" rev-parse --abbrev-ref HEAD 2>/dev/null`, { timeout: 2000 }).toString().trim();
  } catch { return null; }
}

function getGitStatus(dir) {
  try {
    const out = execSync(`git -C "${dir}" status --porcelain 2>/dev/null`, { timeout: 2000 }).toString().trim();
    return out.length > 0;
  } catch { return false; }
}

function getPackageJson(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  } catch { return null; }
}

function detectBackends(pkg) {
  if (!pkg) return [];
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  const found = [];
  for (const backend of BACKEND_DEPS) {
    if (backend.keys.some(k => allDeps[k])) {
      found.push({ label: backend.label, icon: backend.icon, color: backend.color, bg: backend.bg });
    }
  }
  return found;
}

function readReadme(dir) {
  const names = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'readme.txt'];
  for (const name of names) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').slice(0, 3000);
      // strip markdown: remove code blocks, links, images, html tags, extra hashes
      const cleaned = raw
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return cleaned.slice(0, 800);
    }
  }
  return null;
}

function getPortsForPids(pids, cb) {
  exec("lsof -i -P -n | grep LISTEN", (err, stdout) => {
    const pidPortMap = {};
    if (stdout) {
      for (const line of stdout.split('\n')) {
        const parts = line.split(/\s+/);
        const pid = parts[1];
        const portMatch = line.match(/:(\d+) \(LISTEN\)/);
        if (pids.has(pid) && portMatch) {
          if (!pidPortMap[pid]) pidPortMap[pid] = [];
          pidPortMap[pid].push(parseInt(portMatch[1]));
        }
      }
    }
    cb(pidPortMap);
  });
}

function buildChildMap() {
  const map = {};
  try {
    const psTree = execSync('ps -eo pid=,ppid= 2>/dev/null').toString();
    for (const line of psTree.split('\n')) {
      const [pid, ppid] = line.trim().split(/\s+/);
      if (!map[ppid]) map[ppid] = [];
      if (pid) map[ppid].push(pid);
    }
  } catch {}
  return map;
}

function descendantPids(pid, childMap, out = new Set()) {
  out.add(pid);
  for (const child of (childMap[pid] || [])) descendantPids(child, childMap, out);
  return out;
}

// Store pids per dir so we can kill them
const projectPids = {};

function scanProjects(cb) {
  exec('ps aux', (err, stdout) => {
    if (err) return cb([]);

    const lines = stdout.split('\n');
    const projects = {};
    const childMap = buildChildMap();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 11) continue;
      const pid = parts[1];
      const cmd = parts.slice(10).join(' ');

      const framework = detectFramework(cmd);
      if (!framework) continue;

      const dir = extractProjectDir(cmd, pid);
      if (!dir || !fs.existsSync(dir)) continue;

      const key = dir;

      if (!projects[key]) {
        const branch = getGitBranch(dir);
        const dirty = branch ? getGitStatus(dir) : false;
        const pkg = getPackageJson(dir);
        const backends = detectBackends(pkg);
        const readme = readReadme(dir);
        const customNames = loadNames();
        const defaultName = pkg?.name || path.basename(dir);
        projects[key] = {
          dir,
          name: customNames[dir] || defaultName,
          defaultName,
          framework: framework.framework,
          color: framework.color,
          bg: framework.bg,
          icon: framework.icon,
          branch,
          dirty,
          backends,
          readme,
          pids: [],
          ports: [],
        };
      }

      if (!projects[key].pids.includes(pid)) {
        projects[key].pids.push(pid);
      }

      if (framework.framework !== 'Concurrent' && projects[key].framework === 'Concurrent') {
        projects[key].framework = framework.framework;
        projects[key].color = framework.color;
        projects[key].bg = framework.bg;
        projects[key].icon = framework.icon;
      }
    }

    // Collect all descendant pids
    const expandedPids = new Set();
    for (const proj of Object.values(projects)) {
      for (const pid of proj.pids) {
        for (const p of descendantPids(pid, childMap)) expandedPids.add(p);
      }
    }

    getPortsForPids(expandedPids, (pidPortMap) => {
      for (const proj of Object.values(projects)) {
        const portSet = new Set();
        const allPids = new Set();
        for (const pid of proj.pids) {
          for (const p of descendantPids(pid, childMap)) {
            allPids.add(p);
            for (const port of (pidPortMap[p] || [])) portSet.add(port);
          }
        }
        proj.ports = [...portSet].sort((a, b) => a - b);
        // Save pids for killing (root pids only)
        projectPids[proj.dir] = [...proj.pids];
        delete proj.pids;
      }

      const result = Object.values(projects).sort((a, b) => a.name.localeCompare(b.name));
      cb(result);
    });
  });
}

// ── SSE live-push ──────────────────────────────────────────────────────────
const sseClients = new Set();
let lastSnapshot = '';   // JSON string of last known projects list

function projectsSignature(projects) {
  // A lightweight fingerprint: dirs + ports only (ignore readme/branch churn)
  return JSON.stringify(projects.map(p => ({ dir: p.dir, ports: p.ports })));
}

function broadcastToClients(projects) {
  const payload = `data: ${JSON.stringify(projects)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch {}
  }
}

// Poll every 3 seconds; push only when something changed
function startWatcher() {
  setInterval(() => {
    scanProjects((projects) => {
      const sig = projectsSignature(projects);
      if (sig !== lastSnapshot) {
        lastSnapshot = sig;
        broadcastToClients(projects);
        const added = projects.length;
        console.log(`[watcher] change detected → ${added} project(s) — pushed to ${sseClients.size} client(s)`);
      }
    });
  }, 3000);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function handleBody(req, cb) {
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try { cb(JSON.parse(body)); } catch { cb({}); }
  });
}

// ── Gist store (shared with Vercel /api/store) ──────────────────────────────
const GIST_ID  = process.env.GIST_ID  || '660b74fa63764a84664eb6703e92d1ed';
const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_URL   = `https://api.github.com/gists/${GIST_ID}`;
const FILENAME = 'lv_store.json';

function gistHeaders() {
  return {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'local-dashboard',
  };
}

async function handleStore(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (!GH_TOKEN) {
    console.warn('[store] GH_TOKEN not set — set it via: export GH_TOKEN=your_token');
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'GH_TOKEN not configured' }));
    return;
  }

  if (req.method === 'GET') {
    try {
      const r = await fetch(GH_URL, { headers: gistHeaders() });
      const data = await r.json();
      const raw = data.files?.[FILENAME]?.content || '{"collections":[],"websites":[]}';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(raw);
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        await fetch(GH_URL, {
          method: 'PATCH',
          headers: gistHeaders(),
          body: JSON.stringify({ files: { [FILENAME]: { content: body } } }),
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: String(e) }));
      }
    });
    return;
  }

  res.writeHead(405); res.end();
}

// ── HTTP server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Gist store sync ──
  if (req.url === '/api/store') { handleStore(req, res); return; }

  // ── SSE stream ──
  if (req.url === '/api/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');

    // Send current state immediately on connect
    scanProjects((projects) => {
      lastSnapshot = projectsSignature(projects);
      res.write(`data: ${JSON.stringify(projects)}\n\n`);
    });

    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // ── Rename a project ──
  if (req.url === '/api/rename' && req.method === 'POST') {
    handleBody(req, ({ dir, name }) => {
      saveName(dir, name && name.trim());
      // Force a push to all SSE clients with updated names
      lastSnapshot = ''; // invalidate so next watcher tick pushes
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // ── One-shot fetch (used as fallback) ──
  if (req.url === '/api/projects' && req.method === 'GET') {
    scanProjects((data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    });
    return;
  }

  // ── Kill a project ──
  if (req.url === '/api/kill' && req.method === 'POST') {
    handleBody(req, ({ dir }) => {
      const pids = projectPids[dir];
      if (!pids || pids.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No pids found for dir' }));
        return;
      }
      for (const pid of pids) {
        try {
          try { execSync(`kill -TERM -- -$(ps -o pgid= -p ${pid} | tr -d ' ') 2>/dev/null`); }
          catch { execSync(`kill -TERM ${pid} 2>/dev/null`); }
        } catch {}
      }
      delete projectPids[dir];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, killed: pids }));
    });
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Static assets
  const STATIC = {
    '/football.css': { file: __dirname + '/football.css', mime: 'text/css' },
    '/desktop.css':             { file: __dirname + '/desktop.css',             mime: 'text/css' },
    '/desktop_components.jsx':  { file: __dirname + '/desktop_components.jsx',  mime: 'application/javascript' },
    '/website_components.jsx':  { file: __dirname + '/website_components.jsx',  mime: 'application/javascript' },
    '/desktop_app_live.jsx':    { file: __dirname + '/desktop_app_live.jsx',    mime: 'application/javascript' },
    '/websites.js':             { file: __dirname + '/websites.js',             mime: 'application/javascript' },
    '/design_handoff_localview_fc/data.js':   { file: __dirname + '/design_handoff_localview_fc/data.js',   mime: 'application/javascript' },
    '/design_handoff_localos_desktop/data.js':{ file: __dirname + '/design_handoff_localos_desktop/data.js', mime: 'application/javascript' },
    '/index-classic.html': { file: __dirname + '/index-classic.html', mime: 'text/html' },
    '/add_modal.jsx':       { file: __dirname + '/add_modal.jsx',       mime: 'application/javascript' },
  };
  if (STATIC[req.url]) {
    try {
      const { file, mime } = STATIC[req.url];
      const content = fs.readFileSync(file, 'utf8');
      res.writeHead(200, { 'Content-Type': mime });
      res.end(content);
    } catch {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 LocalView running at http://localhost:${PORT}\n`);
  startWatcher();
});

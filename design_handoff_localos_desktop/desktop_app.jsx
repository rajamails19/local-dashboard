/* ============================================================
   localOS — app
   ============================================================ */
const { useState: oS, useEffect: oE, useMemo: oM, useRef: oR } = React;

function OSApp() {
  const [projects, setProjects] = oS(() => window.PROJECTS.map(p => ({ ...p })));
  const [query, setQuery] = oS("");
  const [group, setGroup] = oS("none"); // none | framework | folder
  const [active, setActive] = oS(null);
  const [notif, setNotif] = oS(null);
  const [bounceId, setBounceId] = oS(null);
  const [mouseX, setMouseX] = oS(null);
  const [clock, setClock] = oS("");
  const [spin, setSpin] = oS(false);
  const incoming = oR([...window.INCOMING]);
  const searchRef = oR(null);

  /* menubar clock */
  oE(() => {
    const t = () => setClock(new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + "  " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    t(); const id = setInterval(t, 10000); return () => clearInterval(id);
  }, []);

  /* ⌘K / "/" focus search */
  oE(() => {
    const k = (e) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && document.activeElement.tagName !== "INPUT")) { e.preventDefault(); searchRef.current && searchRef.current.focus(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  /* deep link */
  oE(() => {
    const sync = () => { const m = location.hash.match(/p=([^&]+)/); if (m) { const f = window.PROJECTS.concat(window.INCOMING).find(x => x.id === decodeURIComponent(m[1])); if (f) setActive(f); } };
    sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync);
  }, []);

  /* uptime ticks */
  oE(() => { const id = setInterval(() => setProjects(ps => ps.map(p => dIsRun(p) ? { ...p, uptime: (p.uptime || 0) + 5 } : p)), 5000); return () => clearInterval(id); }, []);

  /* new app launches → dock bounce + notification */
  oE(() => {
    const id = setTimeout(() => {
      if (!incoming.current.length) return;
      const np = incoming.current.shift();
      setProjects(ps => ps.find(x => x.id === np.id) ? ps : [...ps, { ...np }]);
      setBounceId(np.id);
      setNotif({ name: np.name, port: np.frontend.port, id: np.id, framework: np.framework });
      setTimeout(() => setBounceId(null), 1400);
      setTimeout(() => setNotif(n => n ? { ...n, out: true } : n), 5200);
      setTimeout(() => setNotif(null), 5700);
    }, 7000);
    return () => clearTimeout(id);
  }, []);

  const refresh = () => { setSpin(true); setTimeout(() => setSpin(false), 700); };
  const openP = (p) => { setActive(p); try { history.replaceState(null, "", "#p=" + encodeURIComponent(p.id)); } catch (e) {} };
  const closeP = () => { setActive(null); try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} };
  const toggle = (p, on) => setProjects(ps => ps.map(x => x.id === p.id ? { ...x, frontend: { ...x.frontend, up: on }, backend: x.backend ? { ...x.backend, up: on } : x.backend, uptime: on ? 1 : x.uptime } : x));
  const winP = active ? projects.find(x => x.id === active.id) || active : null;

  const filtered = oM(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p => [p.name, p.framework, p.folder, p.backend && p.backend.type, p.backend && p.backend.port, p.database, p.branch, p.frontend.port].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [projects, query]);

  const groups = oM(() => {
    if (group === "none") return [{ key: null, items: filtered }];
    const key = group === "framework" ? "framework" : "folder";
    const map = {};
    filtered.forEach(p => { let g = p[key]; if (group === "framework") g = g.replace(" (nodemon)", "").replace(/^Node$/, "Node.js"); if (group === "folder" && g === "root") g = "~ (home)"; (map[g] = map[g] || []).push(p); });
    return Object.keys(map).sort().map(k => ({ key: k, items: map[k] }));
  }, [filtered, group]);

  const running = projects.filter(dIsRun).length;
  const ports = projects.reduce((n, p) => n + (p.frontend.up ? 1 : 0) + (p.backend && p.backend.up ? 1 : 0), 0);

  const sysButtons = [
    { key: "launchpad", label: "Group by framework", icon: DI.launch, onClick: () => setGroup(g => g === "framework" ? "none" : "framework") },
    { key: "refresh", label: "Refresh scan", icon: DI.refresh, onClick: refresh },
  ];

  return (
    <div className="desktop">
      {/* menu bar */}
      <div className="menubar">
        <div className="mb-left">
          <div className="mb-logo"><span className="dot">{DI.bolt}</span></div>
          <span className="mb-item bold">localhost</span>
          <span className="mb-item">View</span>
          <span className="mb-item">Servers</span>
          <span className="mb-item">Window</span>
        </div>
        <div className="mb-right">
          <span className="mb-ic" title="Servers running">{DI.pulse}<span className="lbl">{running}/{projects.length}</span></span>
          <span className="mb-ic" title="Ports open">{DI.wifi}<span className="lbl">{ports}</span></span>
          <span className={`mb-ic ${spin ? "spin" : ""}`} title="Refresh" onClick={refresh} style={{ cursor: "pointer" }}>{DI.refresh}</span>
          <div className="mb-search">{DI.search}<input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ⌘K" /></div>
          <span className="mb-clock">{clock}</span>
        </div>
      </div>

      {/* stage */}
      <div className="stage">
        <div className="cc-panel">
          <div className="cc-head">
            <div className="t">Running Servers <span>{filtered.length}</span></div>
            <div className="cc-spacer" />
            <div className="seg">
              {[["none", "All"], ["framework", "Framework"], ["folder", "Folder"]].map(([k, l]) => (
                <button key={k} className={group === k ? "on" : ""} onClick={() => setGroup(k)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="cc-grid">
            {filtered.length === 0 ? (
              <div className="empty">No servers match “{query}”.</div>
            ) : groups.map(g => (
              <React.Fragment key={g.key || "all"}>
                {g.key && <div className="group-row">{g.key}<span className="gl" /></div>}
                {g.items.map(p => <ServerTile key={p.id} p={p} onOpen={openP} onToggle={toggle} />)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* dock */}
      <div className="dock-wrap">
        <Dock projects={projects} onOpen={openP} onToggle={toggle} mouseX={mouseX} setMouseX={setMouseX} bounceId={bounceId} sysButtons={sysButtons} />
      </div>

      <MacWindow p={winP} onClose={closeP} onToggle={toggle} />
      <Notification notif={notif} onGo={() => { const np = projects.find(x => x.id === notif.id); if (np) openP(np); setNotif(null); }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OSApp />);

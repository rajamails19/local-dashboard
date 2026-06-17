/* ============================================================
   LocalView FC — app
   ============================================================ */
const { useState: aS, useEffect: aE, useMemo: aM, useRef: aR } = React;

function FCApp() {
  const [projects, setProjects] = aS(() => window.PROJECTS.map(p => ({ ...p })));
  const [query, setQuery] = aS("");
  const [view, setView] = aS("formation"); // formation | club
  const [active, setActive] = aS(null);
  const [toast, setToast] = aS(null);
  const [freshId, setFreshId] = aS(null);
  const [spin, setSpin] = aS(false);
  const [minute, setMinute] = aS(1);
  const incoming = aR([...window.INCOMING]);

  /* match clock */
  aE(() => { const id = setInterval(() => setMinute(m => (m % 90) + 1), 2500); return () => clearInterval(id); }, []);

  /* deep link */
  aE(() => {
    const sync = () => {
      const m = location.hash.match(/p=([^&]+)/);
      if (m) { const f = window.PROJECTS.concat(window.INCOMING).find(x => x.id === decodeURIComponent(m[1])); if (f) setActive(f); }
    };
    sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync);
  }, []);

  /* uptime tick */
  aE(() => {
    const id = setInterval(() => setProjects(ps => ps.map(p => window.isRunning(p) ? { ...p, uptime: (p.uptime || 0) + 5 } : p)), 5000);
    return () => clearInterval(id);
  }, []);

  /* new signing */
  aE(() => {
    const id = setTimeout(() => {
      if (!incoming.current.length) return;
      const np = incoming.current.shift();
      setProjects(ps => ps.find(x => x.id === np.id) ? ps : [...ps, { ...np }]);
      setFreshId(np.id);
      setToast({ name: np.name, port: np.frontend.port, id: np.id });
      setTimeout(() => setToast(t => t ? { ...t, out: true } : t), 5200);
      setTimeout(() => setToast(null), 5700);
      setTimeout(() => setFreshId(null), 2600);
    }, 7500);
    return () => clearTimeout(id);
  }, []);

  const refresh = () => { setSpin(true); setTimeout(() => setSpin(false), 700); };
  const openP = (p) => { setActive(p); try { history.replaceState(null, "", "#p=" + encodeURIComponent(p.id)); } catch (e) {} };
  const closeP = () => { setActive(null); try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} };
  const toggle = (p, on) => {
    setProjects(ps => ps.map(x => x.id === p.id ? {
      ...x, frontend: { ...x.frontend, up: on },
      backend: x.backend ? { ...x.backend, up: on } : x.backend, uptime: on ? 1 : x.uptime,
    } : x));
  };
  const drawerP = active ? projects.find(x => x.id === active.id) || active : null;

  const filtered = aM(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p => [p.name, p.framework, p.folder, p.backend && p.backend.type, p.database, p.branch, p.frontend.port, p.backend && p.backend.port].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [projects, query]);

  const running = filtered.filter(window.isRunning);
  const benched = filtered.filter(p => !window.isRunning(p));
  const lines = { FWD: [], MID: [], DEF: [], GK: [] };
  running.forEach(p => lines[window.role(p)].push(p));

  const fwCount = new Set(projects.map(p => p.framework.replace(" (nodemon)", ""))).size;
  const portsLive = projects.reduce((n, p) => n + (p.frontend.up ? 1 : 0) + (p.backend && p.backend.up ? 1 : 0), 0);
  const playing = projects.filter(window.isRunning).length;
  const onBench = projects.length - playing;
  const formation = [lines.DEF.length, lines.MID.length, lines.FWD.length].filter(n => n > 0).join("-") || "0";

  /* by-club groups */
  const clubs = aM(() => {
    const map = {};
    filtered.forEach(p => { const k = p.framework.replace(" (nodemon)", ""); (map[k] = map[k] || []).push(p); });
    return Object.keys(map).sort().map(k => ({ key: k, items: map[k] }));
  }, [filtered]);

  return (
    <div className="wrap">
      <header className="scorebar">
        <div className="crest">{window.FI.bolt}</div>
        <div className="club-name">
          <h1>Local<b>View</b> FC</h1>
          <p>Match Day · Squad Status</p>
        </div>
        <div className="score-mid">
          <div className="score-stat live"><div className="n">{playing}</div><div className="l">On Pitch</div></div>
          <div className="score-divide" />
          <div className="score-stat bench"><div className="n">{onBench}</div><div className="l">On Bench</div></div>
          <div className="score-divide" />
          <div className="score-stat ports"><div className="n">{portsLive}</div><div className="l">Ports Live</div></div>
          <div className="score-divide" />
          <div className="score-stat"><div className="n" style={{ color: "#fff" }}>{formation}</div><div className="l">Formation</div></div>
        </div>
        <div className="matchclock"><span className="dot" />Live {minute}'</div>
        <button className={`refresh-btn ${spin ? "spin" : ""}`} onClick={refresh}>{window.FI.refresh}Refresh</button>
      </header>

      <div className="fc-tools">
        <div className="fc-search">{window.FI.search}
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search squad — player, club, position, port…" />
        </div>
        <div className="viewseg">
          <button className={view === "formation" ? "on" : ""} onClick={() => setView("formation")}>Formation</button>
          <button className={view === "club" ? "on" : ""} onClick={() => setView("club")}>By Club</button>
        </div>
      </div>

      {filtered.length === 0 ? <div className="empty">No players match “{query}”.</div> : view === "formation" ? (
        <React.Fragment>
          <div className="pitch">
            <div className="mark-mid" /><div className="mark-circle" /><div className="mark-spot" />
            <div className="mark-box top" /><div className="mark-box bot" />
            <div className="formation">
              {["FWD", "MID", "DEF", "GK"].map(rk => lines[rk].length > 0 && (
                <div className="line-row" key={rk}>
                  {lines[rk].map(p => <PlayerCard key={p.id} p={p} onOpen={openP} onToggle={toggle} fresh={freshId === p.id} />)}
                </div>
              ))}
              {running.length === 0 && <div className="empty" style={{ color: "rgba(255,255,255,.7)" }}>No players on the pitch. Bring someone on from the bench.</div>}
            </div>
          </div>

          {benched.length > 0 && (
            <div className="bench-zone">
              <div className="bench-head"><span className="bt">Substitutes</span><span className="bc">{benched.length}</span><span className="bl" /></div>
              <div className="bench-strip">
                {benched.map(p => <PlayerCard key={p.id} p={p} onOpen={openP} onToggle={toggle} benched />)}
              </div>
            </div>
          )}
        </React.Fragment>
      ) : (
        clubs.map(c => {
          const fw = window.FW[c.key] || { glyph: "node" };
          return (
            <div className="club-group" key={c.key}>
              <div className="ch"><span className="badge">{window.fGlyph(fw.glyph)}</span><span className="cn">{c.key}</span><span className="cc">{c.items.length}</span><span className="cl" /></div>
              <div className="squad-grid">
                {c.items.map(p => <PlayerCard key={p.id} p={p} onOpen={openP} onToggle={toggle} benched={!window.isRunning(p)} fresh={freshId === p.id} />)}
              </div>
            </div>
          );
        })
      )}

      <Profile p={drawerP} onClose={closeP} onToggle={toggle} />
      <Transfer toast={toast} onGo={() => { const np = projects.find(x => x.id === toast.id); if (np) openP(np); setToast(null); }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FCApp />);

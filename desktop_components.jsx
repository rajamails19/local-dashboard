/* ============================================================
   localOS — components
   ============================================================ */
const { useState: dS, useEffect: dE, useRef: dR } = React;

const DI = {
  apple:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.1 1.1-.3 2.1-1 2.9-.7.9-1.8 1.5-2.9 1.4-.1-1 .4-2.1 1-2.8.7-.8 1.9-1.4 2.9-1.5zM19 17c-.5 1.2-.8 1.7-1.5 2.7-1 1.5-2.4 3.3-4.1 3.3-1.5 0-1.9-1-4-1-2 0-2.5 1-4 1-1.7 0-3-1.6-4-3.1-2.7-4.2-3-9.2-1.3-11.8 1.2-1.9 3-3 4.8-3 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 1.6 0 3.3.9 4.5 2.4-4 2.2-3.3 7.9.6 9.3z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  wifi:   <svg viewBox="0 0 24 24" fill="none"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8 15.4a5 5 0 0 1 8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></svg>,
  bolt:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
  pulse:  <svg viewBox="0 0 24 24" fill="none"><path d="M2 12h4l2-6 4 14 3-9 2 1h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  refresh:<svg viewBox="0 0 24 24" fill="none"><path d="M4 9a8 8 0 0 1 13.5-3.2L20 8M20 4v4h-4M20 15a8 8 0 0 1-13.5 3.2L4 16M4 20v-4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  launch: <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.6" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.6" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.6" fill="currentColor"/></svg>,
  folder: <svg viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.6"/></svg>,
  clock:  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  git:    <svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.6"/><circle cx="6" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.6"/><circle cx="18" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 8.2v7.6M8.2 6.6c5 .3 7.4 1.4 7.4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  ext:    <svg viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  code:   <svg viewBox="0 0 24 24" fill="none"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  copy:   <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.6"/><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  stop:   <svg viewBox="0 0 24 24" fill="none"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></svg>,
  play:   <svg viewBox="0 0 24 24" fill="none"><path d="M8 5l11 7-11 7V5z" fill="currentColor"/></svg>,
  x:      <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  minus:  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  plus:   <svg viewBox="0 0 24 24" fill="none"><path d="M8 8h8v8M8 8l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

function dGlyph(name) { return <span dangerouslySetInnerHTML={{ __html: window.GLYPH[name] || "" }} style={{ display: "contents" }} />; }
function dIsRun(p) { return p.frontend.up || (p.backend && p.backend.up); }
function dFmtUp(s) { if (s == null) return "—"; const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return h>0?`${h}h ${m}m`:(m>0?`${m}m`:`${s}s`); }
function iconBg(color) { return `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 62%, #1a1730))`; }

/* ---------------- Server tile ---------------- */
function ServerTile({ p, onOpen, onToggle, fresh }) {
  const fw = window.FW[p.framework] || { glyph: "node", color: "#6d7bff" };
  const run = dIsRun(p);
  const dbInfo = p.database ? window.DBINFO[p.database] : null;
  return (
    <div className={`tile ${run ? "" : "off"}`} onClick={() => onOpen(p)}>
      <div className="tile-top">
        <div className="app-icon" style={{ background: iconBg(fw.color) }}>{dGlyph(fw.glyph)}</div>
        <div className="tile-id">
          <div className="nm">{p.name}</div>
          <div className="fw">{p.framework.replace(" (nodemon)", "")}</div>
        </div>
        <div className={`toggle ${run ? "on" : ""}`} title={run ? "Stop server" : "Start server"} onClick={(e) => { e.stopPropagation(); onToggle(p, !run); }}>
          <span className="knob" />
        </div>
      </div>

      <div className="tile-port">
        <span className="big"><span className="c">:</span>{p.frontend.port}</span>
        <span className="lp">port</span>
        <span className="localhost-pill">localhost</span>
      </div>

      <div className="tile-svc">
        {p.backend
          ? <span className="svc-chip"><span className={`nd ${p.backend.up ? "up" : "down"}`} />{p.backend.type}<span className="pt">:{p.backend.port}</span></span>
          : <span className="svc-chip dim">No API</span>}
        {p.database && <span className="svc-chip" style={{ color: dbInfo ? dbInfo.color : "#fff" }}>{dbInfo && dGlyph(dbInfo.glyph)}<span style={{ color: "#fff" }}>{p.database}</span></span>}
      </div>

      <div className="tile-foot">
        <span className="m">{DI.git}{p.branch}{p.dirty ? "*" : ""}</span>
        {run && <span className="m mono">{DI.clock}{dFmtUp(p.uptime)}</span>}
        <span className="grow" />
        <span className="tile-open">Open{DI.ext}</span>
      </div>
    </div>
  );
}

/* ---------------- Dock ---------------- */
function Dock({ projects, onOpen, onToggle, mouseX, setMouseX, bounceId, sysButtons }) {
  const ICON = 52, GAP = 6, PAD = 10;
  const step = ICON + GAP;
  const scaleFor = (centerX) => {
    if (mouseX == null) return 1;
    const d = Math.abs(mouseX - centerX);
    return 1 + 0.5 * Math.exp(-(d * d) / (2 * 62 * 62));
  };
  let cursor = PAD;
  const positioned = projects.map((p, i) => { const center = cursor + ICON / 2; cursor += step; return { p, center }; });
  // separator + system buttons after apps
  const sepX = cursor + 4; cursor += 9;
  const sys = sysButtons.map((b) => { const center = cursor + ICON / 2; cursor += step; return { b, center }; });

  return (
    <div className="dock" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMouseX(e.clientX - r.left); }} onMouseLeave={() => setMouseX(null)}>
      {positioned.map(({ p, center }) => {
        const fw = window.FW[p.framework] || { glyph: "node", color: "#6d7bff" };
        const run = dIsRun(p);
        const s = scaleFor(center);
        return (
          <div key={p.id} className={`dock-item ${run ? "running" : ""} ${bounceId === p.id ? "bounce" : ""}`}
            style={{ transform: `scale(${s}) translateY(${-(s - 1) * 26}px)` }}
            onClick={() => onOpen(p)}>
            <div className="di-tip">{p.name}<span className="tp">:{p.frontend.port}</span></div>
            <div className="di-icon" style={{ background: iconBg(fw.color) }}>
              {dGlyph(fw.glyph)}
            </div>
            {run && <span className="di-badge" style={{ "--badge-s": 1 / s }}>{p.frontend.port}</span>}
            <span className="di-run" />
          </div>
        );
      })}
      <div className="dock-sep" />
      {sys.map(({ b, center }) => {
        const s = scaleFor(center);
        return (
          <div key={b.key} className="dock-item sys" style={{ transform: `scale(${s}) translateY(${-(s - 1) * 26}px)` }} onClick={b.onClick}>
            <div className="di-tip">{b.label}</div>
            <div className="di-icon">{b.icon}</div>
            <span className="di-run" />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Mac window (detail) ---------------- */
function MacWindow({ p, onClose, onToggle }) {
  const [copied, setCopied] = dS(false);
  dE(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const fw = p ? (window.FW[p.framework] || { glyph: "node", color: "#6d7bff" }) : {};
  const run = p && dIsRun(p);
  const dbInfo = p && p.database ? window.DBINFO[p.database] : null;
  const copy = () => { try { navigator.clipboard.writeText(p.path); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <React.Fragment>
      <div className={`win-scrim ${p ? "open" : ""}`} onClick={onClose} />
      <div className={`macwin ${p ? "open" : ""}`}>
        {p && (
          <React.Fragment>
            <div className="win-bar">
              <div className="lights">
                <span className="light r" onClick={onClose}>{DI.x}</span>
                <span className="light y" onClick={onClose}>{DI.minus}</span>
                <span className="light g">{DI.plus}</span>
              </div>
              <div className="win-title">{p.name} — localhost:{p.frontend.port}</div>
            </div>
            <div className="win-body">
              <div className="win-hero">
                <div className="app-icon" style={{ background: iconBg(fw.color) }}>{dGlyph(fw.glyph)}</div>
                <div className="win-hid"><h2>{p.name}</h2><div className="sub">{p.framework}</div></div>
              </div>
              <div className="win-tags">
                <span className={`wtag ${run ? "live" : ""}`}><span style={{ width: 7, height: 7, borderRadius: "50%", background: run ? "var(--green)" : "var(--txt-faint)", boxShadow: run ? "0 0 6px var(--green)" : "none" }} />{run ? "Running" : "Stopped"}</span>
                <span className="wtag port">{DI.bolt}:{p.frontend.port}</span>
                <span className="wtag">{DI.folder}{p.folder}</span>
                {run && <span className="wtag">{DI.clock}{dFmtUp(p.uptime)}</span>}
              </div>
              <div className="wsec"><div className="wsec-h">About</div><p className="wabout">{p.about}</p></div>
              <div className="wsec"><div className="wsec-h">Location</div>
                <div className="wpath"><span>{p.path}</span><button className="wcopy" onClick={copy}>{copied ? DI.check : DI.copy}</button></div>
              </div>
              <div className="wsec"><div className="wsec-h">Services</div>
                <div className="wsvc">
                  <WSvc icon={fw.glyph} color={fw.color} t={p.framework} s="Frontend" port={p.frontend.port} up={p.frontend.up} />
                  {p.backend && <WSvc icon={(window.FW[p.backend.type] || {}).glyph || "express"} color={(window.FW[p.backend.type] || {}).color || "#cbd2dc"} t={p.backend.type} s="Backend / API" port={p.backend.port} up={p.backend.up} />}
                  {p.database && <WSvc icon={dbInfo ? dbInfo.glyph : "sqlite"} color={dbInfo ? dbInfo.color : "#4d9fe6"} t={p.database} s="Database" />}
                </div>
              </div>
              <div className="wsec"><div className="wsec-h">Features</div>
                <ul className="wfeat">{p.features.map((f, i) => <li key={i}>{DI.check}<span>{f}</span></li>)}</ul>
              </div>
              <div className="wsec"><div className="wsec-h">Git</div>
                <div className="wpath"><span>{p.branch} · {p.commit}{p.dirty ? "  (uncommitted)" : ""}</span></div>
              </div>
            </div>
            <div className="win-foot">
              {run
                ? <button className="wbtn primary" onClick={() => window.open(`http://localhost:${p.frontend.port}`, "_blank")}>{DI.ext}Open :{p.frontend.port}</button>
                : <button className="wbtn primary" onClick={() => onToggle(p, true)}>{DI.play}Start</button>}
              <button className="wbtn">{DI.code}VS Code</button>
              {run && <button className="wbtn danger" onClick={() => onToggle(p, false)}>{DI.stop}Stop</button>}
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

function WSvc({ icon, color, t, s, port, up }) {
  return (
    <div className="wsvc-row">
      <div className="ic" style={{ background: iconBg(color) }}>{dGlyph(icon)}</div>
      <div className="mt"><div className="t">{t}</div><div className="s">{s}</div></div>
      {port != null && <div className="pp"><span className={`nd ${up ? "up" : "down"}`} />:{port}</div>}
    </div>
  );
}

/* ---------------- Notification ---------------- */
function Notification({ notif, onGo }) {
  if (!notif) return null;
  const fw = window.FW[notif.framework] || { glyph: "node", color: "#6d7bff" };
  return (
    <div className="notif-wrap">
      <div className={`notif ${notif.out ? "out" : ""}`} onClick={onGo}>
        <div className="ni" style={{ background: iconBg(fw.color) }}>{dGlyph(fw.glyph)}</div>
        <div className="nb">
          <div className="nt">App launched<span className="when">now</span></div>
          <div className="ns">{notif.name} is live on <b>:{notif.port}</b></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ServerTile, Dock, MacWindow, WSvc, Notification, DI, dGlyph, dIsRun, dFmtUp, iconBg });

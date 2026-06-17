/* ============================================================
   LocalView — Website tile + detail window components
   ============================================================ */

/* framework color map re-used from FW, fallback purple */
function wFw(fw) { return (window.FW && window.FW[fw]) || { glyph: "vite", color: "#a06bff" }; }

function SiteIcon({ id, size = 46 }) {
  const info = (window.SITE_ICONS || {})[id];
  const borderRadius = Math.round(size * 0.28);
  if (info) {
    const bg = `linear-gradient(135deg, ${info.bg[0]}, ${info.bg[1]})`;
    return (
      <div style={{ width: size, height: size, borderRadius, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.5), 0 0 0 .5px rgba(255,255,255,.12)" }}>
        <span dangerouslySetInnerHTML={{ __html: info.svg }} style={{ width: size * .72, height: size * .72, display: "flex" }} />
      </div>
    );
  }
  /* fallback to framework icon */
  const fw = wFw("Vite");
  return <div className="app-icon" style={{ background: iconBg(fw.color), width: size, height: size, borderRadius, flexShrink: 0 }}>{dGlyph(fw.glyph)}</div>;
}

function WebTile({ w, onOpen }) {
  const fw   = wFw(w.framework);
  const live = w.deployed && !!w.url;
  const label = w.displayName || w.name;
  return (
    <div className={`tile ${live ? "" : "off"}`} style={{ cursor: "pointer" }} onClick={() => onOpen(w)}>
      <div className="tile-top">
        <SiteIcon id={w.id} size={46} />
        <div className="tile-id">
          <div className="nm">{label}</div>
          <div className="fw">{w.framework}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: ".06em", padding: "3px 8px",
          borderRadius: 999, background: live ? "rgba(52,208,88,.18)" : "rgba(255,255,255,.08)",
          color: live ? "#34d058" : "rgba(255,255,255,.45)", whiteSpace: "nowrap",
          border: `1px solid ${live ? "rgba(52,208,88,.3)" : "rgba(255,255,255,.12)"}`,
        }}>
          {live ? "● LIVE" : "○ NO DEPLOY"}
        </span>
      </div>

      {/* URL hero — same visual weight as port hero */}
      <div className="tile-port" style={{ fontSize: 14 }}>
        {live
          ? <span className="big" style={{ fontSize: 16, letterSpacing: "-.01em", color: "var(--amber)" }}>{w.url.replace("https://","")}</span>
          : <span className="big" style={{ fontSize: 14, color: "rgba(255,255,255,.35)", fontStyle: "italic" }}>No production deployment</span>
        }
      </div>

      {/* tags row */}
      <div className="tile-svc">
        {(w.tags || []).slice(0, 3).map(t => (
          <span key={t} className="svc-chip" style={{ color: fw.color, borderColor: fw.color + "44" }}>#{t}</span>
        ))}
      </div>

      <div className="tile-foot">
        <span className="m">{DI.git}{w.branch}</span>
        <span className="m" style={{ opacity: .55 }}>{DI.clock}{w.lastDeploy}</span>
        <span className="grow" />
        {live && <span className="tile-open">Visit{DI.ext}</span>}
      </div>
    </div>
  );
}

function WebWindow({ w, onClose, onUpdate }) {
  const [copied,   setCopied]   = React.useState(false);
  const [editing,  setEditing]  = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editUrl,  setEditUrl]  = React.useState("");
  const [urlFocus, setUrlFocus] = React.useState(false);

  React.useEffect(() => { setEditing(false); setEditUrl(w ? (w.url || "") : ""); }, [w && w.id]);
  React.useEffect(() => {
    const k = e => { if (e.key === "Escape" && !urlFocus) onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose, urlFocus]);

  if (!w) return (
    <React.Fragment>
      <div className="win-scrim" onClick={onClose} />
      <div className="macwin" />
    </React.Fragment>
  );

  const fw      = wFw(w.framework);
  const currentUrl = editUrl || w.url || "";
  const live    = !!(w.url || editUrl);
  const label   = w.displayName || w.name;
  const copy    = txt => { try { navigator.clipboard.writeText(txt); } catch (_) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const saveEdit= () => { if (editName.trim()) onUpdate(w, { displayName: editName.trim() }); setEditing(false); };
  const saveUrl = v => {
    const url = v.trim();
    const withScheme = url && !url.startsWith("http") ? "https://" + url : url;
    setEditUrl(withScheme);
    onUpdate(w, { url: withScheme || null, deployed: !!withScheme });
    setUrlFocus(false);
  };

  return (
    <React.Fragment>
      <div className="win-scrim open" onClick={onClose} />
      <div className="macwin open">
        <div className="win-bar">
          <div className="lights">
            <span className="light r" onClick={onClose}>{DI.x}</span>
            <span className="light y" onClick={onClose}>{DI.minus}</span>
            <span className="light g">{DI.plus}</span>
          </div>
          <div className="win-title">{label} — {live ? "Live" : "No Deploy"}</div>
        </div>

        <div className="win-body">
          <div className="win-hero">
            <SiteIcon id={w.id} size={60} />
            <div className="win-hid">
              {editing ? (
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                  onBlur={saveEdit}
                  style={{ fontFamily: "inherit", fontSize: 21, fontWeight: 700, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.3)", borderRadius: 8, color: "#fff", padding: "3px 10px", outline: "none", width: "100%" }}
                />
              ) : (
                <h2 style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  onClick={() => { setEditName(label); setEditing(true); }}>
                  {label}<span style={{ opacity: .4, fontSize: 14, display: "inline-flex" }}>{DI.edit}</span>
                </h2>
              )}
              <div className="sub">{w.framework} · {live ? <span style={{ color: "#34d058" }}>Live</span> : <span style={{ color: "rgba(255,255,255,.4)" }}>No production deployment</span>}</div>
            </div>
          </div>

          <div className="win-tags">
            <span className={`wtag ${live ? "live" : ""}`}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:live?"#34d058":"rgba(255,255,255,.3)", boxShadow:live?"0 0 6px #34d058":"none", display:"inline-block" }} />
              {live ? "Live" : "No Deploy"}
            </span>
            {w.lastDeploy && <span className="wtag">{DI.clock}{w.lastDeploy}</span>}
            {(w.tags||[]).map(t => <span key={t} className="wtag" style={{ color: fw.color }}>#{t}</span>)}
          </div>

          {w.about && <div className="wsec"><div className="wsec-h">About</div><p className="wabout">{w.about}</p></div>}

          <div className="wsec">
            <div className="wsec-h">Website URL</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", background:"rgba(255,255,255,.06)", border:`1.5px solid ${urlFocus ? "var(--amber)" : "rgba(255,255,255,.14)"}`, borderRadius:10, padding:"0 10px", transition:"border-color .2s" }}>
                <span style={{ color:"rgba(255,255,255,.3)", fontSize:13, marginRight:6, flexShrink:0 }}>🔗</span>
                <input
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  onFocus={() => setUrlFocus(true)}
                  onBlur={e => saveUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.target.blur(); } if (e.key === "Escape") { setEditUrl(w.url||""); setUrlFocus(false); } }}
                  placeholder="https://your-site.vercel.app"
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color: editUrl ? "var(--amber)" : "rgba(255,255,255,.5)", fontSize:13, fontFamily:"var(--mono,'JetBrains Mono',monospace)", padding:"10px 0" }}
                />
                {editUrl && <button className="wcopy" onClick={() => copy(editUrl)} style={{ flexShrink:0 }}>{copied ? DI.check : DI.copy}</button>}
              </div>
              <button
                onClick={() => currentUrl && window.open(currentUrl, "_blank")}
                style={{ padding:"10px 16px", borderRadius:10, border:"none", cursor: currentUrl ? "pointer" : "default", background: currentUrl ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,.08)", color: currentUrl ? "#000" : "rgba(255,255,255,.3)", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", transition:".2s", flexShrink:0 }}>
                {DI.ext} Open
              </button>
            </div>
          </div>

          <div className="wsec"><div className="wsec-h">Repository</div>
            <div className="wpath">
              <span>github.com/{w.github}</span>
              <button className="wcopy" onClick={() => window.open(`https://github.com/${w.github}`, "_blank")}>{DI.ext}</button>
            </div>
          </div>

          <div className="wsec"><div className="wsec-h">Last commit</div>
            <div className="wpath"><span>{w.branch} · {w.lastCommit}</span></div>
          </div>

          {w.tags && w.tags.length > 0 && (
            <div className="wsec"><div className="wsec-h">Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {w.tags.map(t => (
                  <span key={t} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,.08)", fontSize: 12, color: fw.color }}>#{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="win-foot">
          {live
            ? <button className="wbtn primary" onClick={() => window.open(currentUrl, "_blank")}>{DI.ext}Visit Site</button>
            : <button className="wbtn primary" style={{ opacity: .5, cursor: "default" }}>{DI.play}Add URL above</button>}
          <button className="wbtn" onClick={() => window.open(`https://github.com/${w.github}`, "_blank")}>{DI.code}GitHub</button>
          <button className="wbtn" onClick={() => window.open(`https://vercel.com/rajamails19/${w.vercelProject||w.id}`, "_blank")}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M12 2L2 19.5h20L12 2z"/></svg>
            Vercel
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

window.WebTile = WebTile;
window.WebWindow = WebWindow;

/* ============================================================
   LocalView — Website tile + detail window components
   ============================================================ */

const FRAMEWORKS_LIST = ["Next.js","Vite","React","Node.js","Node (nodemon)","TanStack Start","Express","Bun","Other"];
const TAG_CHIPS = ["ai","kids","education","telugu","fullstack","pwa","game","docs","api","auth","portfolio","tool","fun","mobile"];

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
  const fw = wFw("Vite");
  return <div className="app-icon" style={{ background: iconBg(fw.color), width: size, height: size, borderRadius, flexShrink: 0 }}>{dGlyph(fw.glyph)}</div>;
}

function WebTile({ w, onOpen, draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  const fw   = wFw(w.framework);
  const live = w.deployed && !!w.url;
  const label = w.displayName || w.name;
  return (
    <div className={`tile ${live ? "" : "off"}`}
      style={{ cursor: draggable ? "grab" : "pointer", transition:"transform .15s, box-shadow .15s, opacity .15s",
        opacity: isDragOver === "dragging" ? 0.45 : 1,
        outline: isDragOver === "over" ? "2px solid var(--amber)" : "none",
        outlineOffset: 2,
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(w)}>
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

      <div className="tile-port" style={{ fontSize: 14 }}>
        {live
          ? <span className="big" style={{ fontSize: 16, letterSpacing: "-.01em", color: "var(--amber)" }}>{w.url.replace("https://","")}</span>
          : <span className="big" style={{ fontSize: 14, color: "rgba(255,255,255,.35)", fontStyle: "italic" }}>No production deployment</span>
        }
      </div>

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

/* ── inline editable field ── */
function EditField({ label, value, mono, multiline, onSave }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value || "");
  React.useEffect(() => { setVal(value || ""); }, [value]);

  const commit = () => { onSave(val.trim()); setEditing(false); };
  const inpStyle = {
    background: "rgba(255,255,255,.06)", border: "1.5px solid var(--amber)",
    borderRadius: 8, color: "#fff", padding: "8px 10px", outline: "none",
    width: "100%", fontFamily: mono ? "var(--mono,'JetBrains Mono',monospace)" : "inherit",
    fontSize: 13, resize: multiline ? "vertical" : "none",
  };

  return (
    <div className="wsec">
      <div className="wsec-h" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        {label}
        {!editing && (
          <span onClick={() => setEditing(true)} style={{ cursor:"pointer", opacity:.45, fontSize:12, display:"inline-flex", alignItems:"center", gap:3 }}>
            {DI.edit} edit
          </span>
        )}
      </div>
      {editing ? (
        multiline
          ? <textarea autoFocus value={val} onChange={e=>setVal(e.target.value)} onBlur={commit}
              onKeyDown={e=>{ if(e.key==="Escape") setEditing(false); }}
              style={{ ...inpStyle, minHeight: 72 }} />
          : <input autoFocus value={val} onChange={e=>setVal(e.target.value)} onBlur={commit}
              onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape") setEditing(false); }}
              style={inpStyle} />
      ) : (
        <div className="wpath" style={{ cursor:"pointer" }} onClick={() => setEditing(true)}>
          <span style={{ fontFamily: mono ? "var(--mono,'JetBrains Mono',monospace)" : "inherit", opacity: val ? 1 : .35, fontStyle: val ? "normal" : "italic" }}>
            {val || "Click to add…"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── tags editor ── */
function TagsEditor({ tags, color, onSave }) {
  const [list,   setList]   = React.useState(tags || []);
  const [input,  setInput]  = React.useState("");
  React.useEffect(() => { setList(tags || []); }, [JSON.stringify(tags)]);

  const add = t => {
    const tag = t.trim().replace(/^#/,"").toLowerCase();
    if (!tag || list.includes(tag)) return;
    const next = [...list, tag]; setList(next); onSave(next); setInput("");
  };
  const remove = t => { const next = list.filter(x=>x!==t); setList(next); onSave(next); };

  return (
    <div className="wsec">
      <div className="wsec-h">Tags</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
        {list.map(t => (
          <span key={t} onClick={() => remove(t)} style={{ padding:"3px 10px", borderRadius:999, background:"rgba(255,207,107,.12)", border:"1px solid rgba(255,207,107,.3)", color:"var(--amber)", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            #{t} <span style={{opacity:.6}}>×</span>
          </span>
        ))}
      </div>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type tag + Enter"
        onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){e.preventDefault(); add(input); } }}
        style={{ background:"rgba(255,255,255,.06)", border:"1.5px solid rgba(255,255,255,.14)", borderRadius:8, color:"#fff", padding:"7px 10px", outline:"none", width:"100%", fontSize:12, fontFamily:"inherit" }} />
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
        {TAG_CHIPS.filter(t=>!list.includes(t)).map(t=>(
          <span key={t} onClick={()=>add(t)} style={{ padding:"2px 8px", borderRadius:999, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.45)", fontSize:11, cursor:"pointer" }}>+#{t}</span>
        ))}
      </div>
    </div>
  );
}

function WebWindow({ w, onClose, onUpdate, onDelete }) {
  const [copied,   setCopied]   = React.useState(false);
  const [editUrl,  setEditUrl]  = React.useState("");
  const [urlFocus, setUrlFocus] = React.useState(false);
  const [fwOpen,   setFwOpen]   = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);

  React.useEffect(() => { setEditUrl(w ? (w.url || "") : ""); setConfirmDel(false); }, [w && w.id]);
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

  const fw         = wFw(w.framework);
  const currentUrl = editUrl || w.url || "";
  const live       = !!(w.url || editUrl);
  const label      = w.displayName || w.name;
  const copy       = txt => { try { navigator.clipboard.writeText(txt); } catch (_) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };

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
          {/* hero — name (click to edit) */}
          <div className="win-hero">
            <SiteIcon id={w.id} size={60} />
            <div className="win-hid">
              <EditField label="" value={label} onSave={v => onUpdate(w, { displayName: v })}
              />
              {/* framework dropdown */}
              <div style={{ position:"relative", display:"inline-block", marginTop:4 }}>
                <span onClick={() => setFwOpen(o=>!o)} style={{ cursor:"pointer", color:"rgba(255,255,255,.55)", fontSize:13, display:"flex", alignItems:"center", gap:4 }}>
                  {w.framework} <span style={{opacity:.5,fontSize:11}}>▾</span>
                </span>
                {fwOpen && (
                  <div style={{ position:"absolute", top:"100%", left:0, zIndex:99, background:"#1e1c2e", border:"1px solid rgba(255,255,255,.18)", borderRadius:10, padding:4, minWidth:160, boxShadow:"0 8px 32px rgba(0,0,0,.6)", marginTop:4 }}>
                    {FRAMEWORKS_LIST.map(f => (
                      <div key={f} onClick={() => { onUpdate(w, { framework: f }); setFwOpen(false); }}
                        style={{ padding:"7px 12px", borderRadius:7, cursor:"pointer", fontSize:13,
                          background: w.framework===f ? "rgba(255,207,107,.15)" : "transparent",
                          color: w.framework===f ? "var(--amber)" : "#fff" }}>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="win-tags">
            <span className={`wtag ${live ? "live" : ""}`}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:live?"#34d058":"rgba(255,255,255,.3)", boxShadow:live?"0 0 6px #34d058":"none", display:"inline-block" }} />
              {live ? "Live" : "No Deploy"}
            </span>
            {w.lastDeploy && <span className="wtag">{DI.clock}{w.lastDeploy}</span>}
          </div>

          {/* URL */}
          <div className="wsec">
            <div className="wsec-h">Website URL</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", background:"rgba(255,255,255,.06)", border:`1.5px solid ${urlFocus ? "var(--amber)" : "rgba(255,255,255,.14)"}`, borderRadius:10, padding:"0 10px", transition:"border-color .2s" }}>
                <span style={{ color:"rgba(255,255,255,.3)", fontSize:13, marginRight:6, flexShrink:0 }}>🔗</span>
                <input value={editUrl} onChange={e=>setEditUrl(e.target.value)}
                  onFocus={()=>setUrlFocus(true)}
                  onBlur={e=>saveUrl(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") e.target.blur(); if(e.key==="Escape"){ setEditUrl(w.url||""); setUrlFocus(false); } }}
                  placeholder="https://your-site.vercel.app"
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color: editUrl ? "var(--amber)" : "rgba(255,255,255,.5)", fontSize:13, fontFamily:"var(--mono,'JetBrains Mono',monospace)", padding:"10px 0" }}
                />
                {editUrl && <button className="wcopy" onClick={() => copy(editUrl)} style={{ flexShrink:0 }}>{copied ? DI.check : DI.copy}</button>}
              </div>
              <button onClick={() => currentUrl && window.open(currentUrl, "_blank")}
                style={{ padding:"10px 16px", borderRadius:10, border:"none", cursor: currentUrl ? "pointer" : "default", background: currentUrl ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,.08)", color: currentUrl ? "#000" : "rgba(255,255,255,.3)", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", transition:".2s", flexShrink:0 }}>
                {DI.ext} Open
              </button>
            </div>
          </div>

          {/* editable fields */}
          <EditField label="GitHub Repo" value={w.github} mono
            onSave={v => onUpdate(w, { github: v })} />
          <EditField label="Branch" value={w.branch}
            onSave={v => onUpdate(w, { branch: v })} />
          <EditField label="About" value={w.about} multiline
            onSave={v => onUpdate(w, { about: v })} />
          <TagsEditor tags={w.tags} color={fw.color}
            onSave={tags => onUpdate(w, { tags })} />
        </div>

        <div className="win-foot">
          {live
            ? <button className="wbtn primary" onClick={() => window.open(currentUrl, "_blank")}>{DI.ext}Visit Site</button>
            : <button className="wbtn primary" style={{ opacity:.5, cursor:"default" }}>{DI.play}Add URL above</button>}
          <button className="wbtn" onClick={() => window.open(`https://github.com/${w.github}`, "_blank")}>{DI.code}GitHub</button>
          {onDelete && (
            confirmDel
              ? <button className="wbtn" onClick={() => { onDelete(w); onClose(); }}
                  style={{ background:"rgba(255,60,60,.2)", border:"1px solid rgba(255,60,60,.4)", color:"#ff6060" }}>
                  ✕ Confirm delete
                </button>
              : <button className="wbtn" onClick={() => setConfirmDel(true)}
                  style={{ color:"rgba(255,100,100,.7)" }}>
                  🗑 Delete card
                </button>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

window.WebTile = WebTile;
window.WebWindow = WebWindow;

/* ============================================================
   LocalView — Add Entry Modal (Local Server or Website)
   ============================================================ */

const FRAMEWORKS   = ["Next.js","Vite","Node.js","Node (nodemon)","React","TanStack Start","Express","Bun","Other"];
const BE_TYPES     = ["Express","Fastify","NestJS","Hono","Koa","FastAPI","Flask","Django","None"];
const DB_OPTIONS   = ["Supabase","SQLite","Postgres","MySQL","MongoDB","Redis","None"];
const TAG_SUGGEST  = ["ai","kids","education","telugu","fullstack","pwa","game","docs","api","auth","portfolio","tool","fun","mobile"];

function AddModal({ open, defaultType = "website", onClose, onAddServer, onAddWebsite }) {
  const [type,    setType]    = React.useState(defaultType); // "website" | "server"
  React.useEffect(() => { if (open) setType(defaultType); }, [open, defaultType]);
  const [saving,  setSaving]  = React.useState(false);

  /* website fields */
  const [wName,   setWName]   = React.useState("");
  const [wFw,     setWFw]     = React.useState("Next.js");
  const [wUrl,    setWUrl]    = React.useState("");
  const [wGh,     setWGh]     = React.useState("rajamails19/");
  const [wBranch, setWBranch] = React.useState("main");
  const [wCommit, setWCommit] = React.useState("");
  const [wAbout,  setWAbout]  = React.useState("");
  const [wTags,   setWTags]   = React.useState([]);
  const [wTagIn,  setWTagIn]  = React.useState("");

  /* server fields */
  const [sName,   setSName]   = React.useState("");
  const [sFw,     setSFw]     = React.useState("Vite");
  const [sPort,   setSPort]   = React.useState("");
  const [sPath,   setSPath]   = React.useState("~/Documents/Coding/Claude-help/");
  const [sBe,     setSBe]     = React.useState("None");
  const [sBePort, setSBePort] = React.useState("");
  const [sDb,     setSDb]     = React.useState("None");
  const [sBranch, setSBranch] = React.useState("main");
  const [sAbout,  setSAbout]  = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const k = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  function reset() {
    setWName(""); setWFw("Next.js"); setWUrl(""); setWGh("rajamails19/");
    setWBranch("main"); setWCommit(""); setWAbout(""); setWTags([]); setWTagIn("");
    setSName(""); setSFw("Vite"); setSPort(""); setSPath("~/Documents/Coding/Claude-help/");
    setSBe("None"); setSBePort(""); setSDb("None"); setSBranch("main"); setSAbout("");
  }

  function addTag(t) {
    const tag = t.trim().replace(/^#/, "").toLowerCase();
    if (tag && !wTags.includes(tag)) setWTags(p => [...p, tag]);
    setWTagIn("");
  }

  function submit() {
    setSaving(true);
    setTimeout(() => {
      if (type === "website") {
        const url = wUrl.trim() ? (wUrl.startsWith("http") ? wUrl.trim() : "https://" + wUrl.trim()) : null;
        onAddWebsite({
          id: Date.now().toString(),
          name: wName.trim() || "untitled",
          displayName: wName.trim() || "Untitled",
          framework: wFw,
          deployed: !!url,
          url,
          vercelProject: wName.trim().toLowerCase().replace(/\s+/g,"-"),
          github: wGh.trim(),
          branch: wBranch.trim() || "main",
          lastCommit: wCommit.trim() || "—",
          lastDeploy: "Just now",
          about: wAbout.trim(),
          tags: wTags,
        });
      } else {
        onAddServer({
          id: Date.now().toString(),
          name: sName.trim() || "untitled",
          displayName: sName.trim() || "Untitled",
          framework: sFw,
          path: sPath.trim(),
          folder: sPath.trim().split("/").filter(Boolean).slice(-2,-1)[0] || "root",
          branch: sBranch.trim() || "main",
          dirty: false, commit: null,
          uptime: 0,
          frontend: { port: parseInt(sPort) || null, up: !!sPort },
          backend: sBe !== "None" ? { type: sBe, port: parseInt(sBePort)||null, up: !!sBePort } : null,
          database: sDb !== "None" ? sDb : null,
          about: sAbout.trim(),
          features: [],
        });
      }
      setSaving(false);
      reset();
      onClose();
    }, 300);
  }

  if (!open) return null;

  const inp = {
    background: "rgba(255,255,255,.06)",
    border: "1.5px solid rgba(255,255,255,.14)",
    borderRadius: 10, color: "#fff", padding: "10px 14px",
    fontSize: 13, outline: "none", width: "100%",
    fontFamily: "inherit", transition: "border-color .2s",
  };
  const sel = { ...inp, cursor: "pointer" };
  const lbl = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,.45)", marginBottom: 6, display: "block", textTransform: "uppercase" };
  const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <React.Fragment>
      <div className="win-scrim open" onClick={onClose} />
      <div className="macwin open" style={{ maxWidth: 560, maxHeight: "88vh", overflowY: "auto" }}>
        {/* title bar */}
        <div className="win-bar">
          <div className="lights">
            <span className="light r" onClick={onClose}>{DI.x}</span>
            <span className="light y" onClick={onClose}>{DI.minus}</span>
            <span className="light g" />
          </div>
          <div className="win-title">Add New Entry</div>
        </div>

        <div className="win-body" style={{ paddingBottom: 0 }}>
          {/* type toggle */}
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,.06)", borderRadius:12, padding:4, marginBottom:24 }}>
            {[["website","🌐  Website / Vercel"],["server","⚡  Local Server"]].map(([k,l])=>(
              <button key={k} onClick={()=>setType(k)} style={{
                flex:1, padding:"10px 0", borderRadius:9, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                background: type===k ? "rgba(255,255,255,.16)" : "transparent",
                color: type===k ? "#fff" : "rgba(255,255,255,.45)", transition:".2s"
              }}>{l}</button>
            ))}
          </div>

          {type === "website" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <span style={lbl}>Display Name *</span>
                <input style={inp} value={wName} onChange={e=>setWName(e.target.value)} placeholder="e.g. My Portfolio" autoFocus
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div style={row}>
                <div>
                  <span style={lbl}>Framework</span>
                  <select style={sel} value={wFw} onChange={e=>setWFw(e.target.value)}>
                    {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>Branch</span>
                  <input style={inp} value={wBranch} onChange={e=>setWBranch(e.target.value)} placeholder="main"
                    onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
                </div>
              </div>
              <div>
                <span style={lbl}>Live URL <span style={{opacity:.5,textTransform:"none",fontWeight:400}}>(leave blank if not deployed)</span></span>
                <input style={{ ...inp, color:"var(--amber)" }} value={wUrl} onChange={e=>setWUrl(e.target.value)} placeholder="https://my-site.vercel.app"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div>
                <span style={lbl}>GitHub Repo</span>
                <input style={inp} value={wGh} onChange={e=>setWGh(e.target.value)} placeholder="username/repo-name"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div>
                <span style={lbl}>Last Commit Message</span>
                <input style={inp} value={wCommit} onChange={e=>setWCommit(e.target.value)} placeholder="feat: initial release"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div>
                <span style={lbl}>About</span>
                <textarea style={{ ...inp, resize:"vertical", minHeight:72 }} value={wAbout} onChange={e=>setWAbout(e.target.value)} placeholder="What does this project do?"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div>
                <span style={lbl}>Tags</span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                  {wTags.map(t=>(
                    <span key={t} style={{ padding:"3px 10px", borderRadius:999, background:"rgba(255,207,107,.15)", border:"1px solid rgba(255,207,107,.3)", color:"var(--amber)", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}
                      onClick={()=>setWTags(p=>p.filter(x=>x!==t))}>
                      #{t} <span style={{opacity:.6}}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <input style={{ ...inp, flex:1 }} value={wTagIn} onChange={e=>setWTagIn(e.target.value)} placeholder="Type tag + Enter"
                    onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"}
                    onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); addTag(wTagIn); } }} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                  {TAG_SUGGEST.filter(t=>!wTags.includes(t)).map(t=>(
                    <span key={t} onClick={()=>addTag(t)} style={{ padding:"2px 8px", borderRadius:999, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.45)", fontSize:11, cursor:"pointer" }}>+#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <span style={lbl}>Project Name *</span>
                <input style={inp} value={sName} onChange={e=>setSName(e.target.value)} placeholder="e.g. my-api-server" autoFocus
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div style={row}>
                <div>
                  <span style={lbl}>Framework</span>
                  <select style={sel} value={sFw} onChange={e=>setSFw(e.target.value)}>
                    {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>Frontend Port</span>
                  <input style={inp} value={sPort} onChange={e=>setSPort(e.target.value)} placeholder="3000" type="number"
                    onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
                </div>
              </div>
              <div>
                <span style={lbl}>Project Path</span>
                <input style={{ ...inp, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }} value={sPath} onChange={e=>setSPath(e.target.value)} placeholder="~/Documents/Coding/Claude-help/my-project"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
              <div style={row}>
                <div>
                  <span style={lbl}>Backend</span>
                  <select style={sel} value={sBe} onChange={e=>setSBe(e.target.value)}>
                    {BE_TYPES.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>Backend Port</span>
                  <input style={inp} value={sBePort} onChange={e=>setSBePort(e.target.value)} placeholder="4000" type="number" disabled={sBe==="None"}
                    onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
                </div>
              </div>
              <div style={row}>
                <div>
                  <span style={lbl}>Database</span>
                  <select style={sel} value={sDb} onChange={e=>setSDb(e.target.value)}>
                    {DB_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>Branch</span>
                  <input style={inp} value={sBranch} onChange={e=>setSBranch(e.target.value)} placeholder="main"
                    onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
                </div>
              </div>
              <div>
                <span style={lbl}>About</span>
                <textarea style={{ ...inp, resize:"vertical", minHeight:72 }} value={sAbout} onChange={e=>setSAbout(e.target.value)} placeholder="What does this server do?"
                  onFocus={e=>e.target.style.borderColor="var(--amber)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.14)"} />
              </div>
            </div>
          )}
        </div>

        <div className="win-foot" style={{ position:"sticky", bottom:0, background:"rgba(34,32,52,.95)", backdropFilter:"blur(20px)", paddingTop:16 }}>
          <button className="wbtn" onClick={()=>{ reset(); onClose(); }}>{DI.x}Cancel</button>
          <button className="wbtn primary" onClick={submit} disabled={saving}
            style={{ opacity: saving ? .7 : 1 }}>
            {saving ? "Adding…" : <React.Fragment>{DI.check}Add {type === "website" ? "Website" : "Server"}</React.Fragment>}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

window.AddModal = AddModal;

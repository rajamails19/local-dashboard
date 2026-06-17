/* ============================================================
   LocalView — live app (Servers + Websites + Collections)
   ============================================================ */
const { useState: oS, useEffect: oE, useMemo: oM, useRef: oR, useCallback: oCB } = React;

/* ── cross-file component refs ── */
const AddModal = window.AddModal;

/* ── Remote store (Gist via /api/store) — falls back to localStorage only ── */
const REMOTE = typeof window !== "undefined" && window.location.hostname !== "localhost";
async function remoteLoad() {
  try {
    const r = await fetch("/api/store");
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
async function remoteSave(payload) {
  try {
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}
}

/* ── server data transform ── */
const _BE  = new Set(["Express","Fastify","NestJS","Hono","Koa","FastAPI","Flask","Django","Rails"]);
const _DB  = new Set(["Supabase","SQLite","PostgreSQL","MySQL","MongoDB","Redis","Prisma"]);
const _DBN = { PostgreSQL:"Postgres" };
const _FW  = {"Next.js":"Next.js","Vite":"Vite","Node.js":"Node.js","Node (nodemon)":"Node (nodemon)","React":"React","TanStack Start":"TanStack Start","Express":"Express","Bun":"Bun"};
const _st  = {};

function xform(raw, names) {
  if (!_st[raw.dir]) _st[raw.dir] = Date.now();
  const bk  = (raw.backends||[]).find(b=>_BE.has(b.label));
  const db  = (raw.backends||[]).find(b=>_DB.has(b.label));
  const dbN = db ? (_DBN[db.label]||db.label) : null;
  const pts = raw.ports||[];
  const fw  = _FW[raw.framework]||raw.framework||"Node.js";
  const p2  = (raw.dir||"").replace(/^~\//,"").split("/");
  const fold= p2.length>=2 ? p2[p2.length-2] : "root";
  const name= raw.name||p2[p2.length-1]||"project";
  const abt = raw.readme
    ? raw.readme.split(/\n\n+/)[0].replace(/^#+\s*/mg,"").replace(/[*_`]/g,"").trim().slice(0,280)
    : `A ${fw} project.`;
  const feat= raw.readme
    ? [...raw.readme.matchAll(/^[-*•]\s+(.+)/gm)].map(m=>m[1].replace(/[*_`]/g,"").trim()).filter(Boolean).slice(0,5)
    : [];
  return {
    id:raw.dir, name, displayName:names[raw.dir]||null, path:raw.dir,
    framework:fw, folder:fold, branch:raw.branch||null, dirty:raw.dirty||false,
    commit:null,
    uptime:Math.floor((Date.now()-_st[raw.dir])/1000),
    frontend:{ port:pts[0]||null, up:pts.length>0 },
    backend: bk ? { type:bk.label, port:pts.length>1?pts[1]:null, up:pts.length>0 } : null,
    database:dbN, about:abt, features:feat,
  };
}

/* ── DI.edit icon ── */
DI.edit = <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;

/* ── Single collection tab with hover edit/delete ── */
function CollectionTab({ c, active, onSelect, onRename, onDelete }) {
  const [hover,    setHover]    = oS(false);
  const [editing,  setEditing]  = oS(false);
  const [val,      setVal]      = oS(c.label);
  const inputRef = oR(null);

  oE(()=>{ if(editing && inputRef.current) inputRef.current.focus(); },[editing]);

  const confirm = () => {
    if (val.trim()) onRename(val.trim());
    setEditing(false);
  };

  if (editing) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, marginLeft:4 }}>
      <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") confirm(); if(e.key==="Escape"){ setVal(c.label); setEditing(false); } }}
        onBlur={confirm}
        style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.25)", borderRadius:6,
          color:"#fff", fontSize:12, padding:"3px 8px", outline:"none", width:100, fontFamily:"inherit" }}
      />
    </span>
  );

  return (
    <span
      className="mb-item"
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      onClick={onSelect}
      style={{ cursor:"pointer", color: active ? "var(--amber)" : "rgba(255,255,255,.7)",
        display:"inline-flex", alignItems:"center", gap:5, position:"relative", userSelect:"none" }}>
      {c.label}
      {hover && (
        <span style={{ display:"inline-flex", gap:2, marginLeft:2 }}>
          {/* edit */}
          <span onClick={e=>{ e.stopPropagation(); setVal(c.label); setEditing(true); }}
            title="Rename"
            style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:16, height:16, borderRadius:4, background:"rgba(255,255,255,.15)",
              color:"rgba(255,255,255,.7)", fontSize:10, cursor:"pointer", lineHeight:1 }}>✎</span>
          {/* delete */}
          <span onClick={e=>{ e.stopPropagation(); onDelete(); }}
            title="Delete tab"
            style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:16, height:16, borderRadius:4, background:"rgba(255,80,80,.25)",
              color:"rgba(255,120,120,.9)", fontSize:10, cursor:"pointer", lineHeight:1 }}>✕</span>
        </span>
      )}
    </span>
  );
}

/* ── Collection name input shown inline in the menu bar ── */
function NewCollectionInput({ onConfirm, onCancel }) {
  const [val, setVal] = oS("");
  const ref = oR(null);
  oE(() => { ref.current && ref.current.focus(); }, []);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, marginLeft:4 }}>
      <input ref={ref} value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter"&&val.trim()) onConfirm(val.trim()); if(e.key==="Escape") onCancel(); }}
        placeholder="Tab name…"
        style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.25)", borderRadius:6,
          color:"#fff", fontSize:12, padding:"3px 8px", outline:"none", width:110, fontFamily:"inherit" }}
      />
      <span onClick={()=>val.trim()&&onConfirm(val.trim())}
        style={{ cursor:"pointer", color:"var(--amber)", fontSize:13, fontWeight:700, padding:"0 2px" }}>✓</span>
      <span onClick={onCancel}
        style={{ cursor:"pointer", color:"rgba(255,255,255,.4)", fontSize:13, padding:"0 2px" }}>✕</span>
    </span>
  );
}

function OSApp() {
  /* ── state ── */
  const [projects,     setProjects]     = oS([]);
  const [names,        setNames]        = oS({});
  const [websites,     setWebsites]     = oS(()=>{
    try {
      const saved = JSON.parse(localStorage.getItem("lv_websites")||"null");
      if (saved) return saved;
    } catch{}
    return (window.WEBSITES||[]).map(w=>({...w}));
  });
  /* tab: "servers" | "websites" | collection id */
  const [tab,          setTab]          = oS(()=> localStorage.getItem("lv_tab")||"servers");
  const [query,        setQuery]        = oS("");
  const [group,        setGroup]        = oS("none");
  const [active,       setActive]       = oS(null);
  const [activeWeb,    setActiveWeb]    = oS(null);
  const [showAdd,      setShowAdd]      = oS(false);
  const [addType,      setAddType]      = oS("website");
  const [notif,        setNotif]        = oS(null);
  const [bounceId,     setBounceId]     = oS(null);
  const [mouseX,       setMouseX]       = oS(null);
  const [clock,        setClock]        = oS("");
  const [spin,         setSpin]         = oS(false);
  const [connected,    setConnected]    = oS(false);
  /* collections: array of { id, label, items: [] } — persisted to localStorage */
  const [collections,  setCollections]  = oS(()=>{
    try { return JSON.parse(localStorage.getItem("lv_collections")||"[]"); } catch{ return []; }
  });
  const [addingTab,    setAddingTab]    = oS(false);   // show inline name input

  const knownIds       = oR(new Set());
  const namesRef       = oR({});
  namesRef.current     = names;
  const searchRef      = oR(null);
  const collectionsRef = oR(collections);
  collectionsRef.current = collections;
  const websitesRef    = oR(websites);
  websitesRef.current  = websites;

  /* load from remote on first mount (Vercel only) */
  oE(()=>{
    if (!REMOTE) return;
    remoteLoad().then(data => {
      if (!data) return;
      if (Array.isArray(data.collections) && data.collections.length > 0) {
        setCollections(data.collections);
        try { localStorage.setItem("lv_collections", JSON.stringify(data.collections)); } catch{}
      }
      if (Array.isArray(data.websites) && data.websites.length > 0) {
        setWebsites(data.websites);
        try { localStorage.setItem("lv_websites", JSON.stringify(data.websites)); } catch{}
      }
    });
  }, []);

  /* sync-save helpers — called immediately inside every mutation */
  const saveCollections = cs => {
    try { localStorage.setItem("lv_collections", JSON.stringify(cs)); } catch{}
    if (REMOTE) remoteSave({ collections: cs, websites: websitesRef.current });
    return cs;
  };
  const saveWebsites = ws => {
    try { localStorage.setItem("lv_websites", JSON.stringify(ws)); } catch{}
    if (REMOTE) remoteSave({ collections: collectionsRef.current, websites: ws });
    return ws;
  };

  /* active collection object */
  const activeCollection = oM(() => collections.find(c=>c.id===tab) || null, [collections, tab]);

  /* clock */
  oE(()=>{
    const t=()=>setClock(new Date().toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"})+"  "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
    t(); const id=setInterval(t,10000); return ()=>clearInterval(id);
  },[]);

  /* ⌘K */
  oE(()=>{
    const k=e=>{ if((e.key==="k"&&(e.metaKey||e.ctrlKey))||(e.key==="/"&&document.activeElement.tagName!=="INPUT")){ e.preventDefault(); searchRef.current&&searchRef.current.focus(); } };
    window.addEventListener("keydown",k); return ()=>window.removeEventListener("keydown",k);
  },[]);

  /* uptime tick */
  oE(()=>{ const id=setInterval(()=>setProjects(ps=>ps.map(p=>dIsRun(p)?{...p,uptime:(p.uptime||0)+5}:p)),5000); return ()=>clearInterval(id); },[]);

  /* SSE */
  oE(()=>{
    let es;
    function connect(){
      es=new EventSource("/api/stream");
      es.onopen=()=>setConnected(true);
      es.onmessage=e=>{
        try{
          const raw=JSON.parse(e.data);
          const xf=raw.map(p=>xform(p,namesRef.current));
          xf.forEach(p=>{
            if(!knownIds.current.has(p.id)){
              if(knownIds.current.size>0){
                setBounceId(p.id);
                setNotif({name:p.displayName||p.name, port:p.frontend.port, id:p.id, framework:p.framework});
                setTimeout(()=>setBounceId(null),1400);
                setTimeout(()=>setNotif(n=>n?{...n,out:true}:n),5200);
                setTimeout(()=>setNotif(null),5700);
              }
              knownIds.current.add(p.id);
            }
          });
          setProjects(xf);
          setConnected(true);
        }catch(_){}
      };
      es.onerror=()=>{ setConnected(false); es.close(); setTimeout(connect,4000); };
    }
    connect(); return ()=>es&&es.close();
  },[]);

  const kill = oCB(p=>{
    fetch("/api/kill",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dir:p.id})}).catch(()=>{});
    setProjects(ps=>ps.map(x=>x.id===p.id?{...x,frontend:{...x.frontend,up:false},backend:x.backend?{...x.backend,up:false}:x.backend}:x));
  },[]);

  const rename = oCB((p,v)=>{
    setNames(prev=>({...prev,[p.id]:v}));
    fetch("/api/rename",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dir:p.id,name:v})}).catch(()=>{});
    setProjects(ps=>ps.map(x=>x.id===p.id?{...x,displayName:v}:x));
    setActive(a=>a&&a.id===p.id?{...a,displayName:v}:a);
  },[]);

  const updateWebsite = oCB((w, patch) => {
    setWebsites(ws=>{ const next=ws.map(x=>x.id===w.id?{...x,...patch}:x); saveWebsites(next); return next; });
    setActiveWeb(a=>a&&a.id===w.id?{...a,...patch}:a);
  },[]);

  const updateCollectionWebsite = oCB((colId, w, patch) => {
    setCollections(cs=>{ const next=cs.map(c=>c.id===colId?{...c,items:c.items.map(x=>x.id===w.id?{...x,...patch}:x)}:c); saveCollections(next); return next; });
    setActiveWeb(a=>a&&a.id===w.id?{...a,...patch}:a);
  },[]);

  const addServer = oCB(obj => { setProjects(ps => [...ps, obj]); },[]);

  const addWebsite = oCB(obj => {
    const colId = tab.startsWith("col_") ? tab : null;
    if (colId) {
      setCollections(cs=>{ const next=cs.map(c=>c.id===colId?{...c,items:[...c.items,obj]}:c); saveCollections(next); return next; });
    } else {
      setWebsites(ws=>{ const next=[...ws,obj]; saveWebsites(next); return next; });
    }
  },[tab]);

  const createCollection = name => {
    const id = "col_" + Date.now();
    setCollections(cs=>{ const next=[...cs,{id,label:name,items:[]}]; saveCollections(next); return next; });
    setTab(id); localStorage.setItem("lv_tab", id);
    setAddingTab(false);
    setQuery("");
  };

  const refresh=()=>{ setSpin(true); setTimeout(()=>setSpin(false),700); };
  const openP  =p=>{ setActive(p); setActiveWeb(null); try{history.replaceState(null,"","#p="+encodeURIComponent(p.id));}catch(_){} };
  const closeP =()=>{ setActive(null); try{history.replaceState(null,"",location.pathname+location.search);}catch(_){} };
  const openW  =w=>{ setActiveWeb(w); setActive(null); };
  const closeW =()=>setActiveWeb(null);
  const winP   =active?(projects.find(x=>x.id===active.id)||active):null;
  const winW   =activeWeb?(
    activeCollection
      ? (activeCollection.items.find(x=>x.id===activeWeb.id)||activeWeb)
      : (websites.find(x=>x.id===activeWeb.id)||activeWeb)
  ):null;

  /* filtered servers */
  const filteredServers = oM(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return projects;
    return projects.filter(p=>[p.name,p.displayName,p.framework,p.folder,p.backend&&p.backend.type,p.backend&&p.backend.port,p.database,p.branch,p.frontend.port].filter(Boolean).join(" ").toLowerCase().includes(q));
  },[projects,query]);

  /* filtered websites (built-in tab) */
  const filteredWebs = oM(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return websites;
    return websites.filter(w=>[w.name,w.displayName,w.framework,w.url,...(w.tags||[])].filter(Boolean).join(" ").toLowerCase().includes(q));
  },[websites,query]);

  /* filtered collection items */
  const filteredColItems = oM(()=>{
    if(!activeCollection) return [];
    const q=query.trim().toLowerCase();
    if(!q) return activeCollection.items;
    return activeCollection.items.filter(w=>[w.name,w.displayName,w.framework,w.url,...(w.tags||[])].filter(Boolean).join(" ").toLowerCase().includes(q));
  },[activeCollection, query]);

  const groups=oM(()=>{
    if(group==="none") return [{key:null,items:filteredServers}];
    const map={};
    filteredServers.forEach(p=>{ let g=group==="framework"?p.framework.replace(" (nodemon)",""):p.folder; if(group==="folder"&&g==="root")g="~ (home)"; (map[g]=map[g]||[]).push(p); });
    return Object.keys(map).sort().map(k=>({key:k,items:map[k]}));
  },[filteredServers,group]);

  const running=projects.filter(dIsRun).length;
  const ports  =projects.reduce((n,p)=>n+(p.frontend.up?1:0)+(p.backend&&p.backend.up?1:0),0);
  const liveWeb=websites.filter(w=>w.deployed&&w.url).length;

  const sysButtons=[
    {key:"launchpad",label:"Group by framework",icon:DI.launch,onClick:()=>setGroup(g=>g==="framework"?"none":"framework")},
    {key:"refresh",  label:"Refresh scan",      icon:DI.refresh,onClick:refresh},
  ];

  /* current tab type */
  const isServers = tab==="servers";
  const isWebsites = tab==="websites";
  const isCollection = !!activeCollection;

  /* open-add helper */
  const openAdd = () => {
    setAddType(isServers ? "server" : "website");
    setShowAdd(true);
  };

  /* grid items for websites panel (built-in or collection) */
  const gridItems = isCollection ? filteredColItems : filteredWebs;
  const allItems  = isCollection ? activeCollection.items : websites;
  const liveCount = allItems.filter(w=>w.deployed&&w.url).length;

  return (
    <div className="desktop">
      {/* ── menu bar ── */}
      <div className="menubar">
        <div className="mb-left">
          <div className="mb-logo"><span className="dot">{DI.bolt}</span></div>
          <span className="mb-item bold">localhost</span>
          <span className="mb-item">View</span>
          <span className="mb-item" style={{ cursor:"pointer", color: isServers ? "#fff" : "rgba(255,255,255,.7)" }}
            onClick={()=>{ setTab("servers"); localStorage.setItem("lv_tab","servers"); setQuery(""); }}>Servers</span>
          <span className="mb-item">Window</span>
          <span className="mb-item" style={{ cursor:"pointer", color: isWebsites ? "var(--amber)" : "rgba(255,255,255,.7)" }}
            onClick={()=>{ setTab("websites"); localStorage.setItem("lv_tab","websites"); setQuery(""); }}>Websites</span>

          {/* ── custom collection tabs ── */}
          {collections.map(c=>(
            <CollectionTab key={c.id} c={c} active={tab===c.id}
              onSelect={()=>{ setTab(c.id); localStorage.setItem("lv_tab",c.id); setQuery(""); }}
              onRename={name=>{ setCollections(cs=>{ const next=cs.map(x=>x.id===c.id?{...x,label:name}:x); saveCollections(next); return next; }); }}
              onDelete={()=>{ setCollections(cs=>{ const next=cs.filter(x=>x.id!==c.id); saveCollections(next); return next; }); if(tab===c.id){ setTab("websites"); localStorage.setItem("lv_tab","websites"); } }}
            />
          ))}

          {/* ── new tab button / inline input ── */}
          {addingTab
            ? <NewCollectionInput onConfirm={createCollection} onCancel={()=>setAddingTab(false)}/>
            : <span onClick={()=>setAddingTab(true)}
                style={{ cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center",
                  width:22, height:22, borderRadius:6, background:"rgba(255,255,255,.1)",
                  border:"1px solid rgba(255,255,255,.18)", color:"rgba(255,255,255,.7)",
                  fontSize:16, fontWeight:700, lineHeight:1, marginLeft:6, userSelect:"none", flexShrink:0 }}
                title="New collection tab">+</span>
          }
        </div>
        <div className="mb-right">
          <span className="mb-ic">{DI.pulse}<span className="lbl">{running}/{projects.length}</span></span>
          <span className="mb-ic">{DI.wifi}<span className="lbl">{ports}</span></span>
          <span className={`mb-ic ${spin?"spin":""}`} style={{cursor:"pointer"}} onClick={refresh}>{DI.refresh}</span>
          <div className="mb-search">{DI.search}
            <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)}
              placeholder={isServers?"Search servers ⌘K":"Search websites ⌘K"}/>
          </div>
          <span className="mb-clock">{clock}</span>
          <span style={{fontSize:9,marginLeft:4,color:connected?"#34d058":"#ff5f57"}} title={connected?"Live":"Reconnecting"}>●</span>
        </div>
      </div>

      {/* ── stage ── */}
      <div className="stage">
        <div className="cc-panel">
          <div className="cc-head">
            {isServers ? (
              <React.Fragment>
                <div className="t">Running Servers <span>{filteredServers.length}</span></div>
                <div className="cc-spacer"/>
                <button onClick={openAdd} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,.18)", background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.8)", fontSize:13, fontWeight:700, cursor:"pointer", marginRight:8 }}>+ Add</button>
                <div className="seg">
                  {[["none","All"],["framework","Framework"],["folder","Folder"]].map(([k,l])=>(
                    <button key={k} className={group===k?"on":""} onClick={()=>setGroup(k)}>{l}</button>
                  ))}
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="t">
                  {isCollection ? activeCollection.label : "Deployed Websites"}
                  <span style={{marginLeft:6}}>{gridItems.length}</span>
                </div>
                <div className="cc-spacer"/>
                <button onClick={openAdd} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,.18)", background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.8)", fontSize:13, fontWeight:700, cursor:"pointer", marginRight:8 }}>+ Add</button>
                <div style={{ display:"flex", gap:8, fontSize:12, color:"rgba(255,255,255,.5)" }}>
                  <span style={{color:"#34d058"}}>● {liveCount} live</span>
                  <span>○ {allItems.length - liveCount} not deployed</span>
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="cc-grid">
            {isServers ? (
              !connected && projects.length===0
                ? <div className="empty" style={{color:"rgba(255,255,255,.5)"}}>Connecting…</div>
                : filteredServers.length===0
                ? <div className="empty">No servers match "{query}".</div>
                : groups.map(g=>(
                  <React.Fragment key={g.key||"all"}>
                    {g.key&&<div className="group-row">{g.key}<span className="gl"/></div>}
                    {g.items.map(p=>(
                      <ServerTile key={p.id} p={{...p,name:p.displayName||p.name}} onOpen={openP} onToggle={(proj,on)=>{ if(!on) kill(proj); }}/>
                    ))}
                  </React.Fragment>
                ))
            ) : (
              gridItems.length===0
                ? <div className="empty" style={{color:"rgba(255,255,255,.4)",textAlign:"center",paddingTop:48}}>
                    {query ? `No results for "${query}".` : isCollection ? "No websites yet — click + Add to get started." : `No websites match "${query}".`}
                  </div>
                : gridItems.map(w=><WebTile key={w.id} w={w} onOpen={openW}/>)
            )}
          </div>
        </div>
      </div>

      {/* ── dock (servers only) ── */}
      {isServers && (
        <div className="dock-wrap">
          <Dock projects={projects.map(p=>({...p,name:p.displayName||p.name}))} onOpen={openP} onToggle={(p,on)=>{ if(!on) kill(p); }} mouseX={mouseX} setMouseX={setMouseX} bounceId={bounceId} sysButtons={sysButtons}/>
        </div>
      )}

      {/* ── detail windows ── */}
      <MacWindow p={winP} onClose={closeP} onToggle={(p,on)=>{ if(!on){ kill(p); closeP(); } }}/>
      <WebWindow w={winW} onClose={closeW} onUpdate={(w,patch)=>{
        if(isCollection) updateCollectionWebsite(activeCollection.id, w, patch);
        else updateWebsite(w, patch);
      }}/>
      <AddModal open={showAdd} defaultType={addType} onClose={()=>setShowAdd(false)} onAddServer={addServer} onAddWebsite={addWebsite}/>
      <Notification notif={notif} onGo={()=>{ const np=projects.find(x=>x.id===notif.id); if(np)openP(np); setNotif(null); }}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OSApp/>);

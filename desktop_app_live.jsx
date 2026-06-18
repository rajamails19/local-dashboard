/* ============================================================
   LocalView — live app (Servers + Websites + Collections)
   ============================================================ */
const { useState: oS, useEffect: oE, useMemo: oM, useRef: oR, useCallback: oCB } = React;

/* ── cross-file component refs ── */
const AddModal = window.AddModal;

/* ── Remote store (Gist via /api/store) ──
   REMOTE_READ  = true on both localhost + Vercel  → always pull latest from Gist
   REMOTE_WRITE = true only on Vercel              → local changes stay local until you push
── */
const REMOTE_READ  = true;
const REMOTE_WRITE = typeof window !== "undefined" && window.location.hostname !== "localhost";
async function remoteLoad() {
  try {
    const r = await fetch("/api/store");
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
async function remoteSave(payload) {
  try {
    const r = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) console.error("[remoteSave] HTTP", r.status, await r.text().catch(()=>""));
  } catch(e) { console.error("[remoteSave] fetch error:", e); }
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

/* ── simple click-to-edit inline text ── */
function InlineRename({ value, onSave }) {
  const [editing, setEditing] = oS(false);
  const [val,     setVal]     = oS(value);
  oE(()=>setVal(value),[value]);
  const commit = () => { if(val.trim()) onSave(val.trim()); setEditing(false); };
  if (editing) return (
    <input autoFocus value={val} onChange={e=>setVal(e.target.value)}
      onBlur={commit} onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape") setEditing(false); }}
      style={{ background:"transparent", border:"none", borderBottom:"1.5px solid var(--amber)", outline:"none",
        color:"inherit", fontSize:"inherit", fontWeight:"inherit", fontFamily:"inherit", width: Math.max(80, val.length*10) }} />
  );
  return (
    <span onClick={()=>setEditing(true)} title="Click to rename"
      style={{ cursor:"text", borderBottom:"1px dashed rgba(255,255,255,.2)", paddingBottom:1 }}>
      {value}
    </span>
  );
}

/* ── Quick-link sidebar item ── */
function QuickItem({ num, name, url, onEditName, onEditUrl, onDelete }) {
  const [editingName, setEditingName] = oS(false);
  const [editingUrl,  setEditingUrl]  = oS(false);
  const [nameVal,     setNameVal]     = oS(name);
  const [urlVal,      setUrlVal]      = oS(url);
  oE(()=>setNameVal(name),[name]);
  oE(()=>setUrlVal(url),[url]);

  const commitName = () => { setEditingName(false); if(nameVal.trim() && nameVal!==name) onEditName(nameVal.trim()); };
  const commitUrl  = () => { setEditingUrl(false);  if(urlVal.trim()  && urlVal!==url)   onEditUrl(urlVal.trim()); };

  const href = url && (url.startsWith("http")?url:"https://"+url);

  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:5, padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
      <span style={{ fontSize:10, color:"rgba(255,255,255,.3)", minWidth:16, paddingTop:2, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{num}</span>
      <div style={{ flex:1, minWidth:0 }}>
        {/* name row */}
        {editingName
          ? <input autoFocus value={nameVal} onChange={e=>setNameVal(e.target.value)}
              onBlur={commitName} onKeyDown={e=>{ if(e.key==="Enter") commitName(); if(e.key==="Escape") setEditingName(false); }}
              style={{ width:"100%", background:"rgba(255,255,255,.1)", border:"none", borderBottom:"1px solid var(--amber)", outline:"none", color:"#fff", fontSize:11, fontFamily:"inherit", borderRadius:2 }}/>
          : <span onClick={()=>href&&window.open(href,"_blank")} title={href||"no URL"}
              style={{ fontSize:11, fontWeight:600, color: href?"rgba(255,255,255,.9)":"rgba(255,255,255,.4)", cursor:href?"pointer":"default",
                display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                textDecoration: href?"underline":"none", textUnderlineOffset:2 }}>
              {name||"(unnamed)"}
            </span>
        }
        {/* url row */}
        {editingUrl
          ? <input autoFocus value={urlVal} onChange={e=>setUrlVal(e.target.value)}
              onBlur={commitUrl} onKeyDown={e=>{ if(e.key==="Enter") commitUrl(); if(e.key==="Escape") setEditingUrl(false); }}
              style={{ width:"100%", background:"rgba(255,255,255,.1)", border:"none", borderBottom:"1px solid rgba(255,255,255,.3)", outline:"none", color:"rgba(255,255,255,.6)", fontSize:9, fontFamily:"inherit", borderRadius:2, marginTop:1 }}/>
          : url
            ? <span onClick={()=>onEditUrl&&setEditingUrl(true)}
                style={{ fontSize:9, color:"rgba(255,255,255,.35)", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"text", marginTop:1 }}>
                {url}
              </span>
            : <span onClick={()=>onEditUrl&&setEditingUrl(true)}
                style={{ fontSize:9, color:"rgba(255,255,255,.2)", cursor:"text", marginTop:1, display:"block" }}>+ add url</span>
        }
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2, flexShrink:0 }}>
        <span onClick={()=>setEditingName(true)} title="Edit name"
          style={{ cursor:"pointer", fontSize:9, color:"rgba(255,255,255,.3)", lineHeight:1, padding:"1px 2px" }}>✎</span>
        <span onClick={onDelete} title="Remove"
          style={{ cursor:"pointer", fontSize:9, color:"rgba(255,80,80,.5)", lineHeight:1, padding:"1px 2px" }}>✕</span>
      </div>
    </div>
  );
}

/* ── Quick-link sidebar column ── */
function QuickList({ items, onEditName, onEditUrl, onDelete, startNum=1 }) {
  if (!items || items.length === 0) return (
    <div style={{ padding:"12px 8px", color:"rgba(255,255,255,.2)", fontSize:10, textAlign:"center" }}>—</div>
  );
  return (
    <div style={{ padding:"0 4px" }}>
      {items.map((item, i) => (
        <QuickItem key={item.id} num={startNum+i}
          name={item.name} url={item.url}
          onEditName={v=>onEditName(item, v)}
          onEditUrl={v=>onEditUrl(item, v)}
          onDelete={()=>onDelete(item)}
        />
      ))}
    </div>
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
  const [addingTab,    setAddingTab]    = oS(false);
  /* custom labels for built-in tabs — persisted */
  const [tabLabels,    setTabLabels]    = oS(()=>{
    try { return JSON.parse(localStorage.getItem("lv_tab_labels")||"{}"); } catch{ return {}; }
  });
  /* menu order: array of item IDs — persisted */
  const [menuOrder,    setMenuOrder]    = oS(()=>{
    try { return JSON.parse(localStorage.getItem("lv_menu_order")||"null"); } catch{ return null; }
  });
  /* hidden menu items (deleted static ones) */
  const [menuHidden,   setMenuHidden]   = oS(()=>{
    try { return JSON.parse(localStorage.getItem("lv_menu_hidden")||"[]"); } catch{ return []; }
  });
  const [menuDragIdx,  setMenuDragIdx]  = oS(null);
  const [menuDragOver, setMenuDragOver] = oS(null);
  const [syncStatus,   setSyncStatus]   = oS("idle"); // "idle" | "saving" | "ok" | "error"
  const [leftWidth,    setLeftWidth]     = oS(148);
  const [rightWidth,   setRightWidth]   = oS(148);
  const MIN_SIDEBAR = 28;
  const MAX_SIDEBAR = 320;

  const dragIdx        = oR(null);
  const [dragOver,     setDragOver]     = oS(null);   // index being hovered
  const knownIds       = oR(new Set());
  const namesRef       = oR({});
  namesRef.current     = names;
  const searchRef      = oR(null);
  const collectionsRef = oR(collections);
  collectionsRef.current = collections;
  const websitesRef    = oR(websites);
  websitesRef.current  = websites;
  const tabLabelsRef2  = oR(tabLabels);
  tabLabelsRef2.current = tabLabels;
  const menuOrderRef   = oR(menuOrder);
  menuOrderRef.current = menuOrder;
  const menuHiddenRef  = oR(menuHidden);
  menuHiddenRef.current = menuHidden;

  /* tracked remote save — only fires on Vercel, not localhost */
  const doSave = payload => {
    if (!REMOTE_WRITE) return;
    setSyncStatus("saving");
    remoteSave(payload).then(()=>{
      setSyncStatus("ok");
      setTimeout(()=>setSyncStatus("idle"), 2000);
    }).catch(()=>{
      setSyncStatus("error");
    });
  };

  /* full payload for remote save */
  const fullPayload = () => ({
    collections: collectionsRef.current,
    websites:    websitesRef.current,
    tabLabels:   tabLabelsRef2.current,
    menuOrder:   menuOrderRef.current,
    menuHidden:  menuHiddenRef.current,
  });

  /* apply remote data to state + localStorage */
  const applyRemoteData = oCB(data => {
    if (!data) return;
    if (Array.isArray(data.collections)) {
      setCollections(data.collections);
      try { localStorage.setItem("lv_collections", JSON.stringify(data.collections)); } catch{}
    }
    if (Array.isArray(data.websites)) {
      setWebsites(data.websites);
      try { localStorage.setItem("lv_websites", JSON.stringify(data.websites)); } catch{}
    }
    if (data.tabLabels && typeof data.tabLabels === "object") {
      setTabLabels(data.tabLabels);
      try { localStorage.setItem("lv_tab_labels", JSON.stringify(data.tabLabels)); } catch{}
    }
    if (Array.isArray(data.menuOrder)) {
      setMenuOrder(data.menuOrder);
      try { localStorage.setItem("lv_menu_order", JSON.stringify(data.menuOrder)); } catch{}
    }
    if (Array.isArray(data.menuHidden)) {
      setMenuHidden(data.menuHidden);
      try { localStorage.setItem("lv_menu_hidden", JSON.stringify(data.menuHidden)); } catch{}
    }
  }, []);

  /* load from remote on first mount — always, on both localhost + Vercel */
  oE(()=>{
    if (!REMOTE_READ) return;
    remoteLoad().then(applyRemoteData);
  }, []);

  /* poll every 30s + re-sync when tab becomes visible — always */
  oE(()=>{
    if (!REMOTE_READ) return;
    const poll = () => remoteLoad().then(applyRemoteData);
    const interval = setInterval(poll, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") poll(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [applyRemoteData]);

  const tabLabelsRef = oR(tabLabels);
  tabLabelsRef.current = tabLabels;

  /* compute ordered menu items */
  const orderedMenuItems = oM(() => {
    const builtins = [
      { id:"label_localhost", type:"label",  deletable:false, label: tabLabels["label_localhost"]||"localhost", bold:true },
      { id:"label_view",      type:"label",  deletable:true,  label: tabLabels["label_view"]||"View" },
      { id:"servers",         type:"tab",    deletable:false, label: tabLabels["servers"]||"Servers" },
      { id:"label_window",    type:"label",  deletable:true,  label: tabLabels["label_window"]||"Window" },
      { id:"websites",        type:"tab",    deletable:false, label: tabLabels["websites"]||"Websites" },
    ];
    const colItems = collections.map(c=>({ id:c.id, type:"collection", deletable:true, label:c.label }));
    const allItems = [...builtins, ...colItems];
    const defaultOrder = allItems.map(x=>x.id);
    const order = menuOrder || defaultOrder;
    // merge: keep saved order, append any new items not in order yet
    const seen = new Set(order);
    const full = [...order, ...defaultOrder.filter(id=>!seen.has(id))];
    return full
      .filter(id => !menuHidden.includes(id))
      .map(id => allItems.find(x=>x.id===id))
      .filter(Boolean);
  }, [menuOrder, menuHidden, collections, tabLabels]);

  const reorderMenu = (fromIdx, toIdx) => {
    if (fromIdx === toIdx || fromIdx == null) return;
    const ids = orderedMenuItems.map(x=>x.id);
    const [item] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, item);
    setMenuOrder(ids);
    try { localStorage.setItem("lv_menu_order", JSON.stringify(ids)); } catch{}
    doSave({...fullPayload(), menuOrder: ids});
    setMenuDragIdx(null); setMenuDragOver(null);
  };

  const hideMenuItem = id => {
    setMenuHidden(prev=>{
      const next=[...prev,id];
      try{localStorage.setItem("lv_menu_hidden",JSON.stringify(next));}catch{}
      doSave({...fullPayload(), menuHidden: next});
      return next;
    });
  };

  /* sync-save helpers — called immediately inside every mutation */
  const saveTabLabels = tl => {
    try { localStorage.setItem("lv_tab_labels", JSON.stringify(tl)); } catch{}
    doSave({...fullPayload(), tabLabels: tl});
    return tl;
  };
  const renameBuiltinTab = (key, label) => {
    setTabLabels(tl=>{ const next={...tl,[key]:label}; saveTabLabels(next); return next; });
  };
  const saveCollections = cs => {
    try { localStorage.setItem("lv_collections", JSON.stringify(cs)); } catch{}
    doSave({...fullPayload(), collections: cs});
    return cs;
  };
  const saveWebsites = ws => {
    try { localStorage.setItem("lv_websites", JSON.stringify(ws)); } catch{}
    doSave({...fullPayload(), websites: ws});
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

  const reorderGrid = oCB((fromIdx, toIdx) => {
    if (fromIdx === toIdx || fromIdx == null) return;
    const reorder = arr => {
      const next = [...arr];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    };
    const colId = tab.startsWith("col_") ? tab : null;
    if (colId) {
      setCollections(cs => { const next = cs.map(c => c.id===colId ? {...c, items: reorder(c.items)} : c); saveCollections(next); return next; });
    } else {
      setWebsites(ws => { const next = reorder(ws); saveWebsites(next); return next; });
    }
    setDragOver(null);
    dragIdx.current = null;
  }, [tab]);

  const deleteWebsite = oCB(w => {
    setWebsites(ws=>{ const next=ws.filter(x=>x.id!==w.id); saveWebsites(next); return next; });
    setActiveWeb(null);
  },[]);

  const deleteCollectionItem = oCB((colId, w) => {
    setCollections(cs=>{ const next=cs.map(c=>c.id===colId?{...c,items:c.items.filter(x=>x.id!==w.id)}:c); saveCollections(next); return next; });
    setActiveWeb(null);
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
        <div className="mb-left" style={{ display:"flex", alignItems:"center" }}>
          <div className="mb-logo"><span className="dot">{DI.bolt}</span></div>

          {/* ── ordered, draggable menu items ── */}
          {orderedMenuItems.map((item, i) => {
            const dragProps = {
              draggable: true,
              onDragStart: e=>{ e.dataTransfer.effectAllowed="move"; setMenuDragIdx(i); },
              onDragOver:  e=>{ e.preventDefault(); setMenuDragOver(i); },
              onDrop:      e=>{ e.preventDefault(); reorderMenu(menuDragIdx, i); },
              onDragEnd:   ()=>{ setMenuDragIdx(null); setMenuDragOver(null); },
              style: {
                opacity:    menuDragIdx===i ? 0.4 : 1,
                outline:    menuDragOver===i && menuDragIdx!==i ? "2px solid var(--amber)" : "none",
                outlineOffset: 2, borderRadius:4, transition:"opacity .15s",
              }
            };

            if (item.type === "label") return (
              <span key={item.id} className={`mb-item${item.bold?" bold":""}`} {...dragProps}>
                <CollectionTab
                  c={{ id:item.id, label:item.label }}
                  active={false}
                  onSelect={null}
                  onRename={name=>renameBuiltinTab(item.id, name)}
                  onDelete={item.deletable ? ()=>hideMenuItem(item.id) : null}
                />
              </span>
            );

            if (item.type === "tab") return (
              <span key={item.id} {...dragProps}>
                <CollectionTab
                  c={{ id:item.id, label:item.label }}
                  active={tab===item.id}
                  onSelect={()=>{ setTab(item.id); localStorage.setItem("lv_tab",item.id); setQuery(""); }}
                  onRename={name=>renameBuiltinTab(item.id, name)}
                  onDelete={null}
                />
              </span>
            );

            if (item.type === "collection") {
              const col = collections.find(c=>c.id===item.id);
              if (!col) return null;
              return (
                <span key={item.id} {...dragProps}>
                  <CollectionTab c={col} active={tab===col.id}
                    onSelect={()=>{ setTab(col.id); localStorage.setItem("lv_tab",col.id); setQuery(""); }}
                    onRename={name=>{ setCollections(cs=>{ const next=cs.map(x=>x.id===col.id?{...x,label:name}:x); saveCollections(next); return next; }); }}
                    onDelete={()=>{ setCollections(cs=>{ const next=cs.filter(x=>x.id!==col.id); saveCollections(next); return next; }); if(tab===col.id){ setTab("websites"); localStorage.setItem("lv_tab","websites"); } }}
                  />
                </span>
              );
            }
            return null;
          })}

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
          {REMOTE_WRITE && <span style={{fontSize:9,marginLeft:3,color:syncStatus==="ok"?"#34d058":syncStatus==="error"?"#ff5f57":syncStatus==="saving"?"#f5a623":"rgba(255,255,255,.3)"}} title={syncStatus==="ok"?"Synced":syncStatus==="error"?"Sync failed":syncStatus==="saving"?"Saving…":"Cloud sync"}>⟳</span>}
        </div>
      </div>

      {/* ── stage ── */}
      <div className="stage" style={{ flexDirection:"row", alignItems:"flex-start", padding:"26px 12px 8px" }}>
        {/* sidebar data */}
        {(()=>{
          const quickItems = isServers
            ? filteredServers.map(p=>({ id:p.id, name:p.displayName||p.name, url: p.frontend.port?`http://localhost:${p.frontend.port}`:null, _type:"server", _p:p }))
            : gridItems.map(w=>({ id:w.id, name:w.displayName||w.name, url:w.url, _type:"web", _w:w }));

          const half = Math.ceil(quickItems.length / 2);
          const leftItems  = quickItems.slice(0, half);
          const rightItems = quickItems.slice(half);

          const handleEditName = (item, v) => {
            if(item._type==="server") rename(item._p, v);
            else if(isCollection) updateCollectionWebsite(activeCollection.id, item._w, { displayName:v });
            else updateWebsite(item._w, { displayName:v });
          };
          const handleEditUrl = (item, v) => {
            if(item._type==="web") {
              if(isCollection) updateCollectionWebsite(activeCollection.id, item._w, { url:v });
              else updateWebsite(item._w, { url:v });
            }
          };
          const handleDelete = (item) => {
            if(item._type==="server") return;
            if(isCollection) deleteCollectionItem(activeCollection.id, item._w);
            else deleteWebsite(item._w);
          };

          const startDrag = (e, setter, direction) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = direction === "left" ? leftWidth : rightWidth;
            const onMove = mv => {
              const delta = direction === "left" ? (mv.clientX - startX) : (startX - mv.clientX);
              setter(Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, startW + delta)));
            };
            const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          };

          const sidebarBase = {
            flexShrink:0, alignSelf:"stretch", background:"rgba(0,0,0,.18)",
            borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", position:"relative",
          };
          const sidebarHead = {
            fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase",
            color:"rgba(255,255,255,.3)", padding:"6px 8px 4px",
            borderBottom:"1px solid rgba(255,255,255,.07)",
            display:"flex", alignItems:"center", gap:4,
          };
          const addBtn = (
            <span onClick={openAdd} title="Add new"
              style={{ cursor:"pointer", fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)",
                lineHeight:1, background:"rgba(255,255,255,.08)", borderRadius:4, padding:"1px 5px",
                userSelect:"none", flexShrink:0 }}>+</span>
          );
          const gripIcon = (setter, direction) => (
            <span onMouseDown={e=>startDrag(e, setter, direction)} title="Drag to resize"
              style={{ cursor:"col-resize", fontSize:11, color:"rgba(255,255,255,.3)", userSelect:"none",
                flexShrink:0, letterSpacing:-1, padding:"0 2px" }}>⠿</span>
          );

          const leftCollapsed  = leftWidth  <= MIN_SIDEBAR + 10;
          const rightCollapsed = rightWidth <= MIN_SIDEBAR + 10;

          return (
            <React.Fragment>
              {/* LEFT sidebar */}
              <div style={{...sidebarBase, width:leftWidth, marginRight:8}}>
                <div style={sidebarHead}>
                  {!leftCollapsed && addBtn}
                  {!leftCollapsed && <span style={{flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>Quick Links</span>}
                  {gripIcon(setLeftWidth, "left")}
                </div>
                {!leftCollapsed && (
                  <div style={{ overflowY:"auto", flex:1, padding:"4px 6px" }}>
                    <QuickList items={leftItems} startNum={1}
                      onEditName={handleEditName} onEditUrl={handleEditUrl} onDelete={handleDelete}/>
                  </div>
                )}
              </div>

              {/* CENTER panel */}
              <div className="cc-panel" style={{ flex:1, minWidth:0, width:"auto" }}>
          <div className="cc-head">
            {isServers ? (
              <React.Fragment>
                <div className="t">
                  <InlineRename value={tabLabels["servers_panel"] || "Running Servers"} onSave={v=>renameBuiltinTab("servers_panel",v)}/>
                  <span>{filteredServers.length}</span>
                </div>
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
                  <InlineRename
                    value={isCollection ? activeCollection.label : (tabLabels["websites_panel"] || "Deployed Websites")}
                    onSave={v => isCollection
                      ? setCollections(cs=>{ const next=cs.map(c=>c.id===activeCollection.id?{...c,label:v}:c); saveCollections(next); return next; })
                      : renameBuiltinTab("websites_panel", v)}
                  />
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
                : gridItems.map((w,i)=>(
                    <WebTile key={w.id} w={w} onOpen={openW}
                      draggable={!query}
                      isDragOver={dragIdx.current===i ? "dragging" : dragOver===i ? "over" : null}
                      onDragStart={()=>{ dragIdx.current=i; }}
                      onDragOver={e=>{ e.preventDefault(); setDragOver(i); }}
                      onDrop={()=>reorderGrid(dragIdx.current, i)}
                      onDragEnd={()=>{ setDragOver(null); dragIdx.current=null; }}
                    />
                  ))
            )}
          </div>
              </div>{/* end cc-panel */}

              {/* RIGHT sidebar */}
              <div style={{...sidebarBase, width:rightWidth, marginLeft:8}}>
                <div style={sidebarHead}>
                  {gripIcon(setRightWidth, "right")}
                  {!rightCollapsed && addBtn}
                  {!rightCollapsed && <span style={{flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>Quick Links</span>}
                </div>
                {!rightCollapsed && (
                  <div style={{ overflowY:"auto", flex:1, padding:"4px 6px" }}>
                    <QuickList items={rightItems} startNum={half+1}
                      onEditName={handleEditName} onEditUrl={handleEditUrl} onDelete={handleDelete}/>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })()}
      </div>

      {/* ── dock (servers only) ── */}
      {isServers && (
        <div className="dock-wrap">
          <Dock projects={projects.map(p=>({...p,name:p.displayName||p.name}))} onOpen={openP} onToggle={(p,on)=>{ if(!on) kill(p); }} mouseX={mouseX} setMouseX={setMouseX} bounceId={bounceId} sysButtons={sysButtons}/>
        </div>
      )}

      {/* ── detail windows ── */}
      <MacWindow p={winP} onClose={closeP} onToggle={(p,on)=>{ if(!on){ kill(p); closeP(); } }}/>
      <WebWindow w={winW} onClose={closeW}
        onUpdate={(w,patch)=>{
          if(isCollection) updateCollectionWebsite(activeCollection.id, w, patch);
          else updateWebsite(w, patch);
        }}
        onDelete={isCollection
          ? (w=>deleteCollectionItem(activeCollection.id, w))
          : deleteWebsite}
      />
      <AddModal open={showAdd} defaultType={addType} onClose={()=>setShowAdd(false)} onAddServer={addServer} onAddWebsite={addWebsite}/>
      <Notification notif={notif} onGo={()=>{ const np=projects.find(x=>x.id===notif.id); if(np)openP(np); setNotif(null); }}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OSApp/>);

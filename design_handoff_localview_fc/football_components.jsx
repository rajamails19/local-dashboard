/* ============================================================
   LocalView FC — components
   ============================================================ */
const { useState: fS, useEffect: fE } = React;

const FI = {
  search:  <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none"><path d="M4 9a8 8 0 0 1 13.5-3.2L20 8M20 4v4h-4M20 15a8 8 0 0 1-13.5 3.2L4 16M4 20v-4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  whistle: <svg viewBox="0 0 24 24" fill="none"><path d="M3 11a5 5 0 0 0 5 5h3l6 3V8l-6 3H8a5 5 0 0 0-5 0z" fill="currentColor"/><circle cx="6" cy="13" r="1.4" fill="#15240f"/></svg>,
  bolt:    <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>,
  x:       <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  ext:     <svg viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  code:    <svg viewBox="0 0 24 24" fill="none"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  copy:    <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.6"/><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check:   <svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star:    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8L12 3z" fill="currentColor"/></svg>,
  shirt:   <svg viewBox="0 0 24 24" fill="none"><path d="M8 3l4 2 4-2 5 4-3 3-1-1v10H7V9L6 10 3 7l5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  flag:    <svg viewBox="0 0 24 24" fill="none"><path d="M5 21V4M5 5h11l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function fGlyph(name) { return <span dangerouslySetInnerHTML={{ __html: window.GLYPH[name] || "" }} style={{ display: "contents" }} />; }

/* ---- squad math ---- */
function isRunning(p) { return p.frontend.up || (p.backend && p.backend.up); }
function rating(p) {
  const mins = (p.uptime || 0) / 60;
  let r = 72 + Math.min(27, Math.floor(mins / 13));
  if (p.backend && p.backend.up) r += 2;
  if (p.database) r += 1;
  return Math.min(99, r);
}
function role(p) {
  if (/dashboard|server/i.test(p.id) || (p.backend && !p.frontend.port)) return "GK";
  const hasBack = !!p.backend, hasDb = !!p.database;
  if (!hasBack && !hasDb) return "FWD";
  if (hasBack && hasDb) return "MID";
  return "DEF";
}
const POSLABEL = { GK: "GK", DEF: "CB", MID: "CM", FWD: "ST" };
const ROLE_NAME = { GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" };
function tier(p) {
  const r = rating(p);
  if (r >= 92) return "toty";
  if (r >= 83) return "gold";
  if (r >= 77) return "silver";
  return "bronze";
}
function tierName(t) { return { toty: "Icon", gold: "Gold", silver: "Silver", bronze: "Bronze" }[t]; }
function fmtUp(s) { if (s == null) return "—"; const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return h>0?`${h}h${m>0?" "+m+"m":""}`:`${m||1}m`; }

/* ---- player card ---- */
function PlayerCard({ p, onOpen, onToggle, benched, fresh }) {
  const fw = window.FW[p.framework] || { glyph: "node", color: "#3ddc97" };
  const t = tier(p);
  const r = rating(p);
  const running = isRunning(p);
  const dark = t === "gold" || t === "bronze";
  return (
    <div className={`pcard t-${t} ${dark ? "dark" : "light"} ${benched ? "benched" : ""}`}
      onClick={() => onOpen(p)}
      style={fresh ? { animation: "drop .55s cubic-bezier(.2,.8,.2,1), pop 1.6s" } : null}>
      {benched && <span className="stamp">Subbed Off</span>}
      <div className="pc-head">
        <div className="pc-ovr">
          <div className="r">{r}</div>
          <div className="p">{POSLABEL[role(p)]}</div>
        </div>
        <div className="pc-badge" title={p.framework}>{fGlyph(fw.glyph)}</div>
      </div>
      <div className="pc-jersey">#{p.frontend.port}</div>

      <div className="pc-portrait">
        <span className="halo" />
        {fGlyph(fw.glyph)}
      </div>

      <div className="pc-name" title={p.name}>{p.name.replace(/[-_]/g, " ")}</div>
      <div className="pc-bar" />

      <div className="pc-stats">
        <div className="pc-stat"><span className="sl">PRT</span><span className="sv">{p.frontend.port}</span></div>
        <div className="pc-stat"><span className="sl">UPT</span><span className="sv">{running ? fmtUp(p.uptime) : "—"}</span></div>
        <div className="pc-stat"><span className="sl">BCK</span><span className="sv sm">{p.backend ? p.backend.type : "—"}</span></div>
        <div className="pc-stat"><span className="sl">DB</span><span className="sv sm">{p.database || "—"}</span></div>
      </div>

      <div className="pc-foot">
        <span className="pc-live"><span className="d" />{running ? "On Pitch" : "Benched"}</span>
        <button className={`subbtn ${running ? "off" : ""}`} onClick={(e) => { e.stopPropagation(); onToggle(p, !running); }}>
          {running ? "Sub Off" : "Bring On"}
        </button>
      </div>
    </div>
  );
}

/* ---- profile drawer ---- */
function Profile({ p, onClose, onToggle }) {
  const [copied, setCopied] = fS(false);
  fE(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const fw = p ? (window.FW[p.framework] || { glyph: "node", color: "#3ddc97" }) : {};
  const running = p && isRunning(p);
  const t = p ? tier(p) : "gold";
  const dbInfo = p && p.database ? window.DBINFO[p.database] : null;
  const copy = () => { try { navigator.clipboard.writeText(p.path); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };

  return (
    <React.Fragment>
      <div className={`scrim ${p ? "open" : ""}`} onClick={onClose} />
      <aside className={`profile ${p ? "open" : ""}`}>
        {p && (
          <React.Fragment>
            <div className="profile-hero">
              <div className="hglow" style={{ background: fw.color }} />
              <button className="prof-close" onClick={onClose}>{FI.x}</button>
              <div className={`pcard t-${t} ${t === "gold" || t === "bronze" ? "dark" : "light"}`} style={{ width: 150, cursor: "default", flexShrink: 0 }}>
                <div className="pc-head">
                  <div className="pc-ovr"><div className="r">{rating(p)}</div><div className="p">{POSLABEL[role(p)]}</div></div>
                  <div className="pc-badge">{fGlyph(fw.glyph)}</div>
                </div>
                <div className="pc-portrait"><span className="halo" />{fGlyph(fw.glyph)}</div>
                <div className="pc-name">{p.name.replace(/[-_]/g, " ")}</div>
                <div className="pc-bar" />
                <div className="pc-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="pc-stat"><span className="sl">PRT</span><span className="sv">{p.frontend.port}</span></div>
                  <div className="pc-stat"><span className="sl">UPT</span><span className="sv">{running ? fmtUp(p.uptime) : "—"}</span></div>
                </div>
              </div>
              <div className="prof-meta">
                <div className="pos">{ROLE_NAME[role(p)]} · {tierName(t)}</div>
                <h2>{p.name.replace(/[-_]/g, " ")}</h2>
                <div className="prof-tags">
                  <span className={`ptag ${running ? "live" : ""}`}>{running ? "On Pitch" : "On Bench"}</span>
                  <span className="ptag">{FI.shirt}#{p.frontend.port}</span>
                  <span className="ptag">{FI.flag}{p.folder}</span>
                </div>
              </div>
            </div>

            <div className="profile-body">
              <div className="psec"><div className="psec-h">Scouting report</div><p className="bio">{p.about}</p></div>

              <div className="psec">
                <div className="psec-h">Form</div>
                <div className="attr-grid">
                  <div className="attr"><span className={`av ${running ? "up" : "down"}`}>{rating(p)}</span><div className="ad"><div className="t">Overall</div><div className="s">live rating</div></div></div>
                  <div className="attr"><span className="av">{running ? fmtUp(p.uptime) : "0m"}</span><div className="ad"><div className="t">Minutes</div><div className="s">on the pitch</div></div></div>
                </div>
              </div>

              <div className="psec"><div className="psec-h">Home ground</div>
                <div className="path-box"><span>{p.path}</span><button className="copy-btn" onClick={copy}>{copied ? FI.check : FI.copy}</button></div>
              </div>

              <div className="psec">
                <div className="psec-h">Squad & contract</div>
                <div className="contract">
                  <Crow icon={fw.glyph} t={p.framework} s="Club (frontend)" port={p.frontend.port} up={p.frontend.up} />
                  {p.backend && <Crow icon={(window.FW[p.backend.type] || {}).glyph || "express"} t={p.backend.type} s="Backend / API" port={p.backend.port} up={p.backend.up} />}
                  {p.database && <Crow icon={dbInfo ? dbInfo.glyph : "sqlite"} t={p.database} s="Database" />}
                </div>
              </div>

              <div className="psec">
                <div className="psec-h">Honours</div>
                <ul className="achv">{p.features.map((f, i) => <li key={i}>{FI.star}<span>{f}</span></li>)}</ul>
              </div>

              <div className="psec"><div className="psec-h">Last fixture</div>
                <div className="path-box"><span>{p.branch} · {p.commit}{p.dirty ? "  (uncommitted)" : ""}</span></div>
              </div>
            </div>

            <div className="profile-foot">
              {running
                ? <button className="pbtn primary" onClick={() => window.open(`http://localhost:${p.frontend.port}`, "_blank")}>{FI.ext}Watch :{p.frontend.port}</button>
                : <button className="pbtn primary" onClick={() => onToggle(p, true)}>{FI.whistle}Bring On</button>}
              <button className="pbtn">{FI.code}Training</button>
              {running && <button className="pbtn danger" onClick={() => onToggle(p, false)}>{FI.x}Sub Off</button>}
            </div>
          </React.Fragment>
        )}
      </aside>
    </React.Fragment>
  );
}

function Crow({ icon, t, s, port, up }) {
  return (
    <div className="crow">
      <div className="ci">{fGlyph(icon)}</div>
      <div className="cm"><div className="t">{t}</div><div className="s">{s}</div></div>
      {port != null && <div className="cp"><span className={`d ${up ? "up" : "down"}`} />:{port}</div>}
    </div>
  );
}

/* ---- transfer toast ---- */
function Transfer({ toast, onGo }) {
  if (!toast) return null;
  return (
    <div className="toast-wrap">
      <div className={`toast ${toast.out ? "out" : ""}`}>
        <div className="tbadge">{FI.bolt}</div>
        <div>
          <div className="tt">New Signing</div>
          <div className="ts">{toast.name.replace(/[-_]/g, " ")} joins on #{toast.port}</div>
        </div>
        <span className="tgo" onClick={onGo}>View →</span>
      </div>
    </div>
  );
}

Object.assign(window, { PlayerCard, Profile, Crow, Transfer, FI, fGlyph, isRunning, rating, role, tier, tierName, POSLABEL, ROLE_NAME, fmtUp });

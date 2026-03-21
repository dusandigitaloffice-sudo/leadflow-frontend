import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Copy, Check, LogOut, GripVertical, Eye, EyeOff, ChevronDown, Settings, Code, Palette, LayoutGrid, Zap, ExternalLink, X, FileText, BarChart3, ArrowLeft, Save, Type, Mail, Phone, Hash, AlignLeft, ChevronRight, Calendar, Link2, CheckSquare, GitBranch, Globe, Send, Play, Pencil, Star, ThumbsUp, Image, ToggleLeft, Sliders, Bell, Webhook } from "lucide-react";

const API_URL = "https://leadflow-api-production-a68b.up.railway.app/api";

// ============================================================
// THEME & CONSTANTS
// ============================================================
const T = {
  bg: "#08080d", bgCard: "#101018", bgEl: "#181824", bgIn: "#0c0c14",
  brd: "#1c1c2c", brdF: "#6c5ce7",
  tx: "#e4e4ed", txM: "#65657a", txD: "#3e3e52",
  pr: "#6c5ce7", prH: "#7d6ef8", prG: "rgba(108,92,231,0.12)",
  dn: "#ff4757", dnG: "rgba(255,71,87,0.12)",
  ok: "#00d2a0", okG: "rgba(0,210,160,0.12)",
  ac: "#a29bfe",
};

const FTYPES = [
  { type: "text", label: "Text", icon: Type, def: "Full Name" },
  { type: "email", label: "Email", icon: Mail, def: "Email Address" },
  { type: "phone", label: "Phone", icon: Phone, def: "Phone Number" },
  { type: "number", label: "Number", icon: Hash, def: "Number" },
  { type: "textarea", label: "Long Text", icon: AlignLeft, def: "Message" },
  { type: "select", label: "Dropdown", icon: ChevronDown, def: "Select Option" },
  { type: "date", label: "Date", icon: Calendar, def: "Date" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, def: "I agree" },
  { type: "url", label: "URL", icon: Link2, def: "Website URL" },
  { type: "rating", label: "Rating", icon: Star, def: "Rate this" },
  { type: "opinion_scale", label: "Scale", icon: Sliders, def: "How likely?" },
  { type: "yesno", label: "Yes/No", icon: ThumbsUp, def: "Do you agree?" },
  { type: "picture_choice", label: "Pic Choice", icon: Image, def: "Choose one" },
];

const OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const ACTION_TYPES = [
  { value: "show_field", label: "Show field" },
  { value: "hide_field", label: "Hide field" },
  { value: "add_tag", label: "Add GHL tag" },
  { value: "set_pipeline", label: "Set GHL pipeline" },
  { value: "redirect", label: "Redirect to URL" },
];

const PIXEL_EVENTS = ['PageView','Lead','ViewContent','CompleteRegistration','InitiateCheckout','Purchase','Subscribe','Contact','CustomizeProduct','FindLocation','Schedule','StartTrial','SubmitApplication','Search'];

const ss = (base, extra) => ({ ...base, ...extra }); // style shorthand

// ============================================================
// SMALL COMPONENTS
// ============================================================
const Spin = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ animation: "spin .8s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.15" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Logo = ({ big }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: big ? 42 : 32, height: big ? 42 : 32,
      background: `linear-gradient(135deg, ${T.pr}, ${T.ac})`,
      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
      fontSize: big ? 19 : 14, color: "#fff", letterSpacing: -1,
    }}>FM</div>
    <span style={{
      fontSize: big ? 24 : 18, fontWeight: 700, letterSpacing: -0.5,
      background: `linear-gradient(135deg,${T.tx},${T.ac})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>Floumate</span>
  </div>
);

const Btn = ({ children, v = "pr", sm, onClick, dis, style: s }) => {
  const vars = {
    pr: { background: T.pr, color: "#fff", border: "none" },
    gh: { background: "transparent", color: T.txM, border: `1px solid ${T.brd}` },
    dn: { background: T.dnG, color: T.dn, border: `1px solid rgba(255,71,87,0.15)` },
    ok: { background: T.okG, color: T.ok, border: `1px solid rgba(0,210,160,0.15)` },
  };
  return (
    <button onClick={onClick} disabled={dis} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      borderRadius: 9, cursor: dis ? "not-allowed" : "pointer",
      fontFamily: "'Outfit',sans-serif", fontWeight: 600, transition: "all .2s",
      opacity: dis ? 0.5 : 1,
      fontSize: sm ? 12.5 : 14, padding: sm ? "7px 13px" : "10px 20px",
      ...vars[v], ...s,
    }}>{children}</button>
  );
};

const Inp = ({ label, err, style: s, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM }}>{label}</label>}
    <input style={{
      padding: "10px 13px", background: T.bgIn, border: `1px solid ${err ? T.dn : T.brd}`,
      borderRadius: 9, color: T.tx, fontSize: 13.5, fontFamily: "'Outfit',sans-serif",
      transition: "all .2s", outline: "none", ...s,
    }} {...p} />
    {err && <span style={{ fontSize: 11.5, color: T.dn }}>{err}</span>}
  </div>
);

const Crd = ({ children, style: s, onClick, hov }) => (
  <div onClick={onClick} style={{
    background: T.bgCard, border: `1px solid ${T.brd}`, borderRadius: 13,
    padding: 22, transition: "all .25s", cursor: onClick ? "pointer" : "default", ...s,
  }}
  onMouseEnter={e => { if (hov) { e.currentTarget.style.borderColor = T.pr; e.currentTarget.style.transform = "translateY(-2px)"; } }}
  onMouseLeave={e => { if (hov) { e.currentTarget.style.borderColor = T.brd; e.currentTarget.style.transform = "none"; } }}
  >{children}</div>
);

const Sel = ({ label, value, onChange, children, style: s }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ padding: "10px 13px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 9, color: T.tx, fontSize: 13.5, fontFamily: "'Outfit',sans-serif", outline: "none", ...s }}>{children}</select>
  </div>
);

const Section = ({ icon: I, title, desc, color, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ padding: 12, background: `${color}10`, borderRadius: 9, border: `1px solid ${color}20` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <I size={13} style={{ color }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color }}>{title}</span>
      </div>
      {desc && <p style={{ fontSize: 11.5, color: T.txM, lineHeight: 1.5 }}>{desc}</p>}
    </div>
    {children}
  </div>
);

const Label = ({ children }) => <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{children}</p>;

// ============================================================
// AUTH
// ============================================================
const Auth = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    setErr(""); setLoading(true);
    try {
      const ep = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login" ? { email, password: pw } : { email, password: pw, name };
      const r = await fetch(`${API_URL}${ep}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      localStorage.setItem("lf_token", d.token);
      localStorage.setItem("lf_user", JSON.stringify(d.user));
      onAuth(d.user, d.token);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 50% 0%,rgba(108,92,231,0.06) 0%,transparent 60%),${T.bg}` }}>
      <div className="fi" style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo big /></div>
          <p style={{ color: T.txM, fontSize: 14.5 }}>{mode === "login" ? "Welcome back" : "Create your account"}</p>
        </div>
        <Crd style={{ padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && <Inp label="Full Name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />}
            <Inp label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Inp label="Password" type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
            {err && <div style={{ padding: "9px 13px", background: T.dnG, borderRadius: 7, fontSize: 12.5, color: T.dn }}>{err}</div>}
            <Btn onClick={go} dis={loading} style={{ width: "100%", justifyContent: "center", marginTop: 2, padding: "12px 0", fontSize: 15 }}>
              {loading ? <Spin /> : mode === "login" ? "Sign In" : "Create Account"}
            </Btn>
            <div style={{ textAlign: "center", fontSize: 12.5, color: T.txM }}>
              {mode === "login" ? "No account? " : "Have an account? "}
              <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }} style={{ color: T.pr, cursor: "pointer", fontWeight: 600 }}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </span>
            </div>
          </div>
        </Crd>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dash = ({ user, token, onLogout, onOpen }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/forms`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setForms(d.forms || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch(`${API_URL}/forms`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newName,
          steps: [{ id: "s1", title: "Step 1", fields: [
            { id: "f1", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
            { id: "f2", type: "email", label: "Email", placeholder: "you@email.com", required: true },
          ]}],
          theme: { mode: "dark", primaryColor: "#6c5ce7", borderRadius: 10, fontFamily: "Outfit", buttonText: "Submit", successMessage: "Thanks! We'll be in touch.", afterSubmit: "message" },
          settings: {},
        }),
      });
      if (r.ok) { setNewName(""); setShowNew(false); load(); }
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this form?")) return;
    await fetch(`${API_URL}/forms/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "rgba(8,8,13,0.85)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.brd}` }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${T.pr},${T.ac})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{(user?.name || user?.email || "U")[0].toUpperCase()}</div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: T.txM, cursor: "pointer", padding: 4 }}><LogOut size={17} /></button>
        </div>
      </nav>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px" }}>
        <div className="fi" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 3 }}>Your Forms</h1>
            <p style={{ color: T.txM, fontSize: 13.5 }}>{forms.length} form{forms.length !== 1 ? "s" : ""}</p>
          </div>
          <Btn onClick={() => setShowNew(true)}><Plus size={15} /> New Form</Btn>
        </div>

        {showNew && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNew(false)}>
            <Crd className="fi" style={{ width: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Create New Form</h3>
              <Inp label="Form Name" placeholder="e.g. Contact Form, Lead Magnet..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && create()} />
              <div style={{ display: "flex", gap: 9, marginTop: 18, justifyContent: "flex-end" }}>
                <Btn v="gh" sm onClick={() => setShowNew(false)}>Cancel</Btn>
                <Btn sm onClick={create} dis={creating || !newName.trim()}>{creating ? <Spin s={14} /> : "Create"}</Btn>
              </div>
            </Crd>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 70, color: T.txM }}><Spin s={26} /></div>
        ) : forms.length === 0 ? (
          <Crd className="fi" style={{ textAlign: "center", padding: "56px 36px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: T.prG, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: T.pr }}><FileText size={26} /></div>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 7 }}>No forms yet</h3>
            <p style={{ color: T.txM, fontSize: 13.5, marginBottom: 22 }}>Create your first form to start capturing leads</p>
            <Btn onClick={() => setShowNew(true)}><Plus size={15} /> Create Form</Btn>
          </Crd>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {forms.map((f, i) => {
              const flds = (f.steps || []).flatMap(s => s.fields || []);
              return (
                <Crd key={f.id} className="fi" hov style={{ animationDelay: `${i * 0.04}s`, cursor: "pointer" }} onClick={() => onOpen(f)}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{f.name}</h3>
                      <p style={{ fontSize: 11.5, color: T.txD }}>{new Date(f.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: `${T.pr}18`, color: T.pr }}>{flds.length} fields</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
                    {flds.slice(0, 4).map((fl, j) => <span key={j} style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10.5, background: T.bgEl, color: T.txM }}>{fl.label || fl.type}</span>)}
                    {flds.length > 4 && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10.5, background: T.bgEl, color: T.txD }}>+{flds.length - 4}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11.5, color: T.txD, display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={11} /> {f.submissions_count || 0} leads</span>
                    <button onClick={e => { e.stopPropagation(); del(f.id); }} style={{ background: "none", border: "none", color: T.txD, cursor: "pointer", padding: 3 }}><Trash2 size={13} /></button>
                  </div>
                </Crd>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SUBMISSIONS PANEL
// ============================================================
const SubsPanel = ({ formId, formName, token, fields, onClose }) => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/forms/${formId}/submissions`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const d = await r.json(); setSubs(d.submissions || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [formId, token]);

  const completed = subs.filter(s => s.status !== 'partial');
  const partial = subs.filter(s => s.status === 'partial');
  const filtered = filter === "all" ? subs : filter === "success" ? completed : partial;
  const totalSessions = subs.length;
  const totalCompleted = completed.length;
  const convRate = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;

  const sources = {};
  subs.forEach(s => {
    const src = s.source?.utm_source || s.data?._source?.utm_source || "Direct";
    sources[src] = (sources[src] || 0) + 1;
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: 560, maxWidth: "100%", height: "100%", background: T.bg, borderLeft: `1px solid ${T.brd}`, overflow: "auto", padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div><h3 style={{ fontSize: 17, fontWeight: 700 }}>Submissions</h3><p style={{ fontSize: 12.5, color: T.txM }}>{formName}</p></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.txM, cursor: "pointer" }}><X size={18} /></button>
        </div>
        {loading ? <div style={{ textAlign: "center", padding: 40 }}><Spin /></div> : <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[[totalCompleted, "COMPLETED", T.pr], [partial.length, "DROP-OFFS", T.dn], [convRate + "%", "CONV. RATE", T.ok]].map(([v, l, c]) => (
              <div key={l} style={{ background: T.bgCard, border: `1px solid ${T.brd}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 10.5, color: T.txM, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
          {Object.keys(sources).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Label>Sources</Label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.entries(sources).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => (
                  <span key={src} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: T.bgEl, color: T.txM, border: `1px solid ${T.brd}` }}>{src}: {cnt}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[["all", "All"], ["success", "Completed"], ["partial", "Partial"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: filter === v ? T.prG : T.bgEl, border: `1px solid ${filter === v ? T.pr : T.brd}`, color: filter === v ? T.pr : T.txM, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                {l} ({v === "all" ? subs.length : v === "success" ? completed.length : partial.length})
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 ? <p style={{ textAlign: "center", padding: 30, color: T.txD, fontSize: 13 }}>No submissions yet</p> : filtered.map(s => (
              <div key={s.id} style={{ background: T.bgCard, border: `1px solid ${T.brd}`, borderRadius: 9, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, background: s.status === 'partial' ? T.dnG : T.okG, color: s.status === 'partial' ? T.dn : T.ok }}>
                    {s.status === 'partial' ? `PARTIAL (step ${(s.step_reached || s.data?._step_reached || 0) + 1})` : 'COMPLETED'}
                  </span>
                  <span style={{ fontSize: 10.5, color: T.txD }}>{new Date(s.created_at).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {fields.slice(0, 5).map(f => {
                    const val = s.data?.[f.id];
                    if (val === undefined || val === '' || val === null) return null;
                    return <div key={f.id} style={{ display: "flex", gap: 6, fontSize: 11.5 }}><span style={{ color: T.txD, minWidth: 70 }}>{f.label}:</span><span style={{ color: T.txM }}>{String(val)}</span></div>;
                  })}
                </div>
                {(s.source?.utm_source || s.data?._source?.utm_source) && (
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <Globe size={10} style={{ color: T.ac }} />
                    <span style={{ fontSize: 10, color: T.ac, fontWeight: 600 }}>{s.source?.utm_source || s.data?._source?.utm_source}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
};

// ============================================================
// FORM BUILDER
// ============================================================
const Builder = ({ form, token, onBack }) => {
  const initSteps = (form.steps && form.steps.length) ? form.steps : [{ id: "s1", title: "Step 1", fields: [] }];
  const [steps, setSteps] = useState(initSteps);
  const [activeStep, setActiveStep] = useState(0);
  const [tab, setTab] = useState("fields");
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sty, setSty] = useState(form.theme || { mode: "dark", primaryColor: "#6c5ce7", borderRadius: 10, fontFamily: "Outfit", buttonText: "Submit", successMessage: "Thanks! We'll be in touch.", afterSubmit: "message" });
  const [ghl, setGhl] = useState({ enabled: !!(form.ghl_key), location_id: form.ghl_location_id || "", api_key: form.ghl_key || "", pipeline_id: form.ghl_pipeline_id || "", stage_id: form.ghl_stage_id || "", tag: form.ghl_tag || "", field_mapping: form.ghl_field_map || {} });
  const [dragI, setDragI] = useState(null);
  const [rules, setRules] = useState(form.rules || []);
  const [pixelId, setPixelId] = useState(form.pixel_id || "");
  const [pixelEvents, setPixelEvents] = useState(form.pixel_events || { onLoad: "PageView", onSubmit: "Lead", onStep: "" });
  const [webhookUrl, setWebhookUrl] = useState(form.webhook_url || "");
  const [showSubs, setShowSubs] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingStepTitle, setEditingStepTitle] = useState(null);
  const [formSettings, setFormSettings] = useState(form.settings || {});

  const fields = steps.flatMap(s => s.fields || []);
  const curStep = steps[activeStep] || steps[0];
  const curFields = curStep?.fields || [];

  const tabs = [
    { id: "fields", label: "Fields", icon: LayoutGrid },
    { id: "style", label: "Style", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logic", label: "Logic", icon: GitBranch },
    { id: "integrations", label: "Connect", icon: Zap },
    { id: "embed", label: "Embed", icon: Code },
  ];

  // Step management
  const addStep = () => { const ns = { id: `s_${Date.now()}`, title: `Step ${steps.length + 1}`, fields: [] }; setSteps([...steps, ns]); setActiveStep(steps.length); };
  const rmStep = (i) => { if (steps.length <= 1) return; const ns = steps.filter((_, j) => j !== i); setSteps(ns); setActiveStep(Math.min(activeStep, ns.length - 1)); };
  const renameStep = (i, title) => setSteps(steps.map((s, j) => j === i ? { ...s, title } : s));
  const updateStepFields = (newFields) => setSteps(steps.map((s, i) => i === activeStep ? { ...s, fields: newFields } : s));

  const addField = (type) => {
    const c = FTYPES.find(f => f.type === type);
    const nf = { id: `f_${Date.now()}`, type, label: c?.def || "New Field", placeholder: "", required: false };
    if (type === "select" || type === "picture_choice") nf.options = type === "picture_choice" ? [{ label: "Option 1" }, { label: "Option 2" }] : ["Option 1", "Option 2", "Option 3"];
    if (type === "rating") { nf.maxRating = 5; nf.ratingType = "star"; }
    if (type === "opinion_scale") { nf.scaleMin = 1; nf.scaleMax = 10; nf.scaleLabels = ["Not likely", "Very likely"]; }
    updateStepFields([...curFields, nf]);
    setSel(nf.id);
  };

  const upField = (id, u) => updateStepFields(curFields.map(f => f.id === id ? { ...f, ...u } : f));
  const rmField = (id) => { updateStepFields(curFields.filter(f => f.id !== id)); if (sel === id) setSel(null); };
  const mvField = (a, b) => { const u = [...curFields]; const [m] = u.splice(a, 1); u.splice(b, 0, m); updateStepFields(u); };

  // Rule management
  const addRule = () => setRules([...rules, { id: `r_${Date.now()}`, field_id: fields[0]?.id || "", operator: "equals", value: "", actions: [{ type: "show_field", target: "", value: "" }] }]);
  const upRule = (id, u) => setRules(rules.map(r => r.id === id ? { ...r, ...u } : r));
  const rmRule = (id) => setRules(rules.filter(r => r.id !== id));
  const addAction = (ruleId) => setRules(rules.map(r => r.id === ruleId ? { ...r, actions: [...r.actions, { type: "show_field", target: "", value: "" }] } : r));
  const upAction = (ruleId, ai, u) => setRules(rules.map(r => r.id === ruleId ? { ...r, actions: r.actions.map((a, i) => i === ai ? { ...a, ...u } : a) } : r));
  const rmAction = (ruleId, ai) => setRules(rules.map(r => r.id === ruleId ? { ...r, actions: r.actions.filter((_, i) => i !== ai) } : r));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          steps, theme: sty, rules, settings: formSettings,
          ghl_key: ghl.api_key || "", ghl_location_id: ghl.location_id || "",
          ghl_pipeline_id: ghl.pipeline_id || "", ghl_stage_id: ghl.stage_id || "",
          ghl_tag: ghl.tag || "", ghl_field_map: ghl.field_mapping || {},
          pixel_id: pixelId || "", pixel_events: pixelEvents,
          webhook_url: webhookUrl || "",
        }),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const embed = `<div data-floumate-id="${form.id}"></div>\n<script src="${API_URL.replace('/api','')}/embed.js"></script>`;
  const cpEmbed = () => { navigator.clipboard.writeText(embed); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const sf = curFields.find(f => f.id === sel);
  const isDark = (sty.mode || "dark") === "dark";
  const pc = sty.primaryColor || "#6c5ce7";
  const br = sty.borderRadius || 10;
  const ff = `'${sty.fontFamily || "Outfit"}',sans-serif`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px", background: "rgba(8,8,13,0.9)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.brd}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: T.txM, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontFamily: "'Outfit',sans-serif" }}><ArrowLeft size={15} /> Back</button>
          <div style={{ width: 1, height: 18, background: T.brd }} />
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>{form.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Btn v={previewMode ? "pr" : "gh"} sm onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <><Pencil size={13} /> Edit</> : <><Play size={13} /> Test</>}
          </Btn>
          <Btn v="gh" sm onClick={() => setShowSubs(true)}><BarChart3 size={13} /> Submissions</Btn>
          <Btn sm onClick={save} dis={saving}>{saving ? <Spin s={13} /> : saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}</Btn>
        </div>
      </nav>

      {showSubs && <SubsPanel formId={form.id} formName={form.name} token={token} fields={fields} onClose={() => setShowSubs(false)} />}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 340, borderRight: `1px solid ${T.brd}`, background: T.bgCard, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.brd}`, overflowX: "auto" }}>
            {tabs.map(t => {
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "11px 12px", fontSize: 10.5, fontWeight: 600, fontFamily: "'Outfit',sans-serif",
                  background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  color: tab === t.id ? T.pr : T.txD,
                  borderBottom: tab === t.id ? `2px solid ${T.pr}` : "2px solid transparent",
                }}><I size={12} /> {t.label}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: 14 }}>

            {/* ===== FIELDS TAB ===== */}
            {tab === "fields" && (
              <div className="fi">
                {/* Step Tabs */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                  {steps.map((s, i) => (
                    <div key={s.id}>
                      {editingStepTitle === i ? (
                        <input autoFocus value={s.title} onChange={e => renameStep(i, e.target.value)}
                          onBlur={() => setEditingStepTitle(null)} onKeyDown={e => e.key === "Enter" && setEditingStepTitle(null)}
                          style={{ width: 80, padding: "4px 6px", background: T.bgIn, border: `1px solid ${T.pr}`, borderRadius: 5, color: T.tx, fontSize: 10.5, fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                      ) : (
                        <button onClick={() => setActiveStep(i)} onDoubleClick={() => setEditingStepTitle(i)} style={{
                          padding: "5px 10px", borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                          background: activeStep === i ? T.prG : T.bgEl, border: `1px solid ${activeStep === i ? T.pr : T.brd}`,
                          color: activeStep === i ? T.pr : T.txM, cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                        }}>
                          {s.title}
                          {steps.length > 1 && activeStep === i && <span onClick={e => { e.stopPropagation(); rmStep(i); }} style={{ marginLeft: 4, color: T.txD, fontSize: 9 }}>×</span>}
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addStep} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 600, background: "none", border: `1px dashed ${T.brd}`, color: T.txD, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>+</button>
                </div>
                {steps.length > 1 && <p style={{ fontSize: 9.5, color: T.txD, marginBottom: 10, marginTop: -4 }}>Double-click to rename</p>}

                <Label>Add Field</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 18 }}>
                  {FTYPES.map(ft => {
                    const I = ft.icon;
                    return (
                      <button key={ft.type} onClick={() => addField(ft.type)} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                        padding: "8px 3px", background: T.bgEl, border: `1px solid ${T.brd}`,
                        borderRadius: 7, cursor: "pointer", color: T.txM, fontSize: 9,
                        fontFamily: "'Outfit',sans-serif", fontWeight: 500, transition: "all .15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.pr; e.currentTarget.style.color = T.pr; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.brd; e.currentTarget.style.color = T.txM; }}
                      ><I size={13} />{ft.label}</button>
                    );
                  })}
                </div>

                <Label>Fields ({curFields.length})</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {curFields.map((f, i) => {
                    const FI = FTYPES.find(ft => ft.type === f.type)?.icon || Type;
                    const isSel = sel === f.id;
                    return (
                      <div key={f.id} draggable onDragStart={() => setDragI(i)} onDragOver={e => e.preventDefault()}
                        onDrop={() => { if (dragI !== null && dragI !== i) mvField(dragI, i); setDragI(null); }}
                        onClick={() => setSel(isSel ? null : f.id)}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 11px", borderRadius: 7, background: isSel ? T.prG : T.bgEl, border: `1px solid ${isSel ? T.pr : T.brd}`, cursor: "pointer", transition: "all .12s" }}>
                        <GripVertical size={11} style={{ color: T.txD, cursor: "grab", flexShrink: 0 }} />
                        <FI size={13} style={{ color: isSel ? T.pr : T.txM, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
                        {f.required && <span style={{ fontSize: 9.5, color: T.dn, fontWeight: 700 }}>*</span>}
                        <button onClick={e => { e.stopPropagation(); rmField(f.id); }} style={{ background: "none", border: "none", color: T.txD, cursor: "pointer", padding: 2 }}><Trash2 size={11} /></button>
                      </div>
                    );
                  })}
                </div>

                {sf && (
                  <div className="fi" style={{ marginTop: 18, padding: 14, background: T.bg, borderRadius: 9, border: `1px solid ${T.brd}` }}>
                    <Label>Edit Field</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Inp label="Label" value={sf.label} onChange={e => upField(sel, { label: e.target.value })} />
                      <Inp label="Placeholder" value={sf.placeholder || ""} onChange={e => upField(sel, { placeholder: e.target.value })} />
                      <Inp label="Description (optional)" value={sf.description || ""} onChange={e => upField(sel, { description: e.target.value })} />
                      <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12.5, color: T.txM }}>
                        <input type="checkbox" checked={sf.required || false} onChange={e => upField(sel, { required: e.target.checked })} style={{ accentColor: T.pr }} />
                        Required field
                      </label>
                      {sf.type === "select" && (
                        <div>
                          <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Options (one per line)</label>
                          <textarea value={(sf.options || []).join("\n")} onChange={e => upField(sel, { options: e.target.value.split("\n") })} rows={3}
                            style={{ width: "100%", padding: "9px 11px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 7, color: T.tx, fontSize: 12.5, fontFamily: "'Outfit',sans-serif", resize: "vertical", outline: "none" }} />
                        </div>
                      )}
                      {sf.type === "rating" && (<>
                        <Inp label="Max Rating" type="number" min="2" max="10" value={sf.maxRating || 5} onChange={e => upField(sel, { maxRating: +e.target.value })} />
                        <Sel label="Rating Type" value={sf.ratingType || "star"} onChange={e => upField(sel, { ratingType: e.target.value })}>
                          <option value="star">Stars</option><option value="number">Numbers</option>
                        </Sel>
                      </>)}
                      {sf.type === "opinion_scale" && (<>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Inp label="Min" type="number" value={sf.scaleMin || 1} onChange={e => upField(sel, { scaleMin: +e.target.value })} style={{ flex: 1 }} />
                          <Inp label="Max" type="number" value={sf.scaleMax || 10} onChange={e => upField(sel, { scaleMax: +e.target.value })} style={{ flex: 1 }} />
                        </div>
                        <Inp label="Left Label" value={sf.scaleLabels?.[0] || ""} onChange={e => upField(sel, { scaleLabels: [e.target.value, sf.scaleLabels?.[1] || ""] })} />
                        <Inp label="Right Label" value={sf.scaleLabels?.[1] || ""} onChange={e => upField(sel, { scaleLabels: [sf.scaleLabels?.[0] || "", e.target.value] })} />
                      </>)}
                      {sf.type === "picture_choice" && (
                        <div>
                          <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Options (one per line)</label>
                          <textarea value={(sf.options || []).map(o => typeof o === 'string' ? o : o.label || '').join("\n")} onChange={e => upField(sel, { options: e.target.value.split("\n").map(l => ({ label: l })) })} rows={3}
                            style={{ width: "100%", padding: "9px 11px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 7, color: T.tx, fontSize: 12.5, fontFamily: "'Outfit',sans-serif", resize: "vertical", outline: "none" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== STYLE TAB ===== */}
            {tab === "style" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Sel label="Theme" value={sty.mode || "dark"} onChange={e => setSty({ ...sty, mode: e.target.value })}>
                  <option value="dark">Dark</option><option value="light">Light</option>
                </Sel>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Primary Color</label>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <input type="color" value={pc} onChange={e => setSty({ ...sty, primaryColor: e.target.value })} style={{ width: 38, height: 34, border: "none", cursor: "pointer", borderRadius: 5, background: "none" }} />
                    <Inp value={pc} onChange={e => setSty({ ...sty, primaryColor: e.target.value })} style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Border Radius</label>
                  <input type="range" min="0" max="20" value={br} onChange={e => setSty({ ...sty, borderRadius: +e.target.value })} style={{ width: "100%", accentColor: T.pr }} />
                  <span style={{ fontSize: 11.5, color: T.txD }}>{br}px</span>
                </div>
                <Inp label="Button Text" value={sty.buttonText || "Submit"} onChange={e => setSty({ ...sty, buttonText: e.target.value })} />
                <Sel label="Font" value={sty.fontFamily || "Outfit"} onChange={e => setSty({ ...sty, fontFamily: e.target.value })}>
                  {["Outfit", "Inter", "DM Sans", "Space Grotesk", "Poppins", "Montserrat"].map(f => <option key={f} value={f}>{f}</option>)}
                </Sel>

                <div style={{ height: 1, background: T.brd, margin: "4px 0" }} />
                <Label>After Submit</Label>
                <div style={{ display: "flex", gap: 7 }}>
                  {[["message", "Thank You"], ["redirect", "Redirect"]].map(([v, l]) => (
                    <button key={v} onClick={() => setSty({ ...sty, afterSubmit: v })} style={{
                      flex: 1, padding: "9px 0", borderRadius: 7, cursor: "pointer", fontSize: 12.5,
                      fontFamily: "'Outfit',sans-serif", fontWeight: 600, transition: "all .2s",
                      background: (sty.afterSubmit || "message") === v ? T.prG : T.bgEl,
                      border: `1px solid ${(sty.afterSubmit || "message") === v ? T.pr : T.brd}`,
                      color: (sty.afterSubmit || "message") === v ? T.pr : T.txM,
                    }}>{l}</button>
                  ))}
                </div>
                {(sty.afterSubmit || "message") === "message" && (
                  <Inp label="Success Message" value={sty.successMessage || "Thanks!"} onChange={e => setSty({ ...sty, successMessage: e.target.value })} />
                )}
                {sty.afterSubmit === "redirect" && (
                  <Inp label="Redirect URL" placeholder="https://yoursite.com/thank-you" value={sty.redirectUrl || ""} onChange={e => setSty({ ...sty, redirectUrl: e.target.value })} />
                )}
              </div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {tab === "settings" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={Settings} title="Form Settings" desc="Configure cover screen, branding, and behavior." color={T.pr}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12.5, color: T.txM }}>
                    <input type="checkbox" checked={formSettings.showCover || false} onChange={e => setFormSettings({ ...formSettings, showCover: e.target.checked })} style={{ accentColor: T.pr }} />
                    Show Cover/Welcome Screen
                  </label>
                  {formSettings.showCover && (<>
                    <Inp label="Cover Title" placeholder="Welcome!" value={formSettings.coverTitle || ""} onChange={e => setFormSettings({ ...formSettings, coverTitle: e.target.value })} />
                    <Inp label="Cover Description" placeholder="Answer a few questions..." value={formSettings.coverDescription || ""} onChange={e => setFormSettings({ ...formSettings, coverDescription: e.target.value })} />
                  </>)}
                </Section>

                <div style={{ height: 1, background: T.brd }} />

                <Section icon={Image} title="Background" desc="Customize form background." color={T.ac}>
                  <Inp label="Background Color" placeholder="#0a0a0f" value={formSettings.backgroundColor || ""} onChange={e => setFormSettings({ ...formSettings, backgroundColor: e.target.value })} />
                  <Inp label="Background Image URL" placeholder="https://..." value={formSettings.backgroundImage || ""} onChange={e => setFormSettings({ ...formSettings, backgroundImage: e.target.value })} />
                </Section>

                <div style={{ height: 1, background: T.brd }} />

                <Label>Thank You Page CTA</Label>
                <Inp label="Button Text" placeholder="Visit our website" value={formSettings.thankYouCta || ""} onChange={e => setFormSettings({ ...formSettings, thankYouCta: e.target.value })} />
                <Inp label="Button URL" placeholder="https://yoursite.com" value={formSettings.thankYouCtaUrl || ""} onChange={e => setFormSettings({ ...formSettings, thankYouCtaUrl: e.target.value })} />

                <div style={{ height: 1, background: T.brd }} />

                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12.5, color: T.txM }}>
                  <input type="checkbox" checked={formSettings.showProgress !== false} onChange={e => setFormSettings({ ...formSettings, showProgress: e.target.checked })} style={{ accentColor: T.pr }} />
                  Show Progress Bar (multi-step)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12.5, color: T.txM }}>
                  <input type="checkbox" checked={formSettings.hideBranding || false} onChange={e => setFormSettings({ ...formSettings, hideBranding: e.target.checked })} style={{ accentColor: T.pr }} />
                  Hide "Powered by Floumate"
                </label>
              </div>
            )}

            {/* ===== LOGIC TAB ===== */}
            {tab === "logic" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={GitBranch} title="Conditional Logic" desc="Show/hide fields, add tags, or redirect based on answers." color={T.pr} />
                {rules.map(rule => (
                  <div key={rule.id} style={{ background: T.bg, border: `1px solid ${T.brd}`, borderRadius: 9, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.pr, textTransform: "uppercase", letterSpacing: 0.5 }}>IF</span>
                      <button onClick={() => rmRule(rule.id)} style={{ background: "none", border: "none", color: T.txD, cursor: "pointer", padding: 2 }}><Trash2 size={11} /></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      <select value={rule.field_id} onChange={e => upRule(rule.id, { field_id: e.target.value })}
                        style={{ width: "100%", padding: "7px 9px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 6, color: T.tx, fontSize: 11.5, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                        <option value="">-- Select field --</option>
                        {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 6 }}>
                        <select value={rule.operator} onChange={e => upRule(rule.id, { operator: e.target.value })}
                          style={{ flex: 1, padding: "7px 9px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 6, color: T.tx, fontSize: 11.5, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                          {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {!["is_empty", "is_not_empty"].includes(rule.operator) && (
                          <input value={rule.value || ""} onChange={e => upRule(rule.id, { value: e.target.value })} placeholder="value"
                            style={{ flex: 1, padding: "7px 9px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 6, color: T.tx, fontSize: 11.5, fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.ok, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "block" }}>THEN</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(rule.actions || []).map((a, ai) => (
                        <div key={ai} style={{ display: "flex", flexDirection: "column", gap: 5, padding: 8, background: T.bgEl, borderRadius: 6, border: `1px solid ${T.brd}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <select value={a.type} onChange={e => upAction(rule.id, ai, { type: e.target.value })}
                              style={{ flex: 1, padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                              {ACTION_TYPES.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                            </select>
                            <button onClick={() => rmAction(rule.id, ai)} style={{ background: "none", border: "none", color: T.txD, cursor: "pointer", padding: 2, flexShrink: 0 }}><X size={11} /></button>
                          </div>
                          {(a.type === "show_field" || a.type === "hide_field") && (
                            <select value={a.target || ""} onChange={e => upAction(rule.id, ai, { target: e.target.value })}
                              style={{ width: "100%", padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                              <option value="">-- Select field --</option>
                              {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                            </select>
                          )}
                          {a.type === "add_tag" && <input value={a.value || ""} onChange={e => upAction(rule.id, ai, { value: e.target.value })} placeholder="e.g. vip-lead" style={{ width: "100%", padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }} />}
                          {a.type === "redirect" && <input value={a.value || ""} onChange={e => upAction(rule.id, ai, { value: e.target.value })} placeholder="https://yoursite.com/page" style={{ width: "100%", padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }} />}
                          {a.type === "set_pipeline" && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <input value={a.pipeline_id || ""} onChange={e => upAction(rule.id, ai, { pipeline_id: e.target.value })} placeholder="Pipeline ID" style={{ flex: 1, padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                              <input value={a.stage_id || ""} onChange={e => upAction(rule.id, ai, { stage_id: e.target.value })} placeholder="Stage ID" style={{ flex: 1, padding: "6px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addAction(rule.id)} style={{ fontSize: 10.5, color: T.pr, background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600, padding: "6px 0 0" }}>+ Add Action</button>
                  </div>
                ))}
                <Btn v="gh" sm onClick={addRule}><Plus size={12} /> Add Rule</Btn>
              </div>
            )}

            {/* ===== INTEGRATIONS TAB ===== */}
            {tab === "integrations" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* GHL */}
                <Section icon={Zap} title="GoHighLevel" desc="Auto-create contacts on submit." color={T.pr}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    <input type="checkbox" checked={ghl.enabled || false} onChange={e => setGhl({ ...ghl, enabled: e.target.checked })} style={{ accentColor: T.pr }} />
                    Enable GHL
                  </label>
                  {ghl.enabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      <Inp label="Location ID" placeholder="loc_xxx" value={ghl.location_id || ""} onChange={e => setGhl({ ...ghl, location_id: e.target.value })} />
                      <Inp label="API Key" type="password" placeholder="Your GHL API key" value={ghl.api_key || ""} onChange={e => setGhl({ ...ghl, api_key: e.target.value })} />
                      <Inp label="Tag" placeholder="e.g. webinar-lead" value={ghl.tag || ""} onChange={e => setGhl({ ...ghl, tag: e.target.value })} />
                      <Inp label="Pipeline ID" placeholder="pipeline_xxx" value={ghl.pipeline_id || ""} onChange={e => setGhl({ ...ghl, pipeline_id: e.target.value })} />
                      <Inp label="Stage ID" placeholder="stage_xxx" value={ghl.stage_id || ""} onChange={e => setGhl({ ...ghl, stage_id: e.target.value })} />
                      <Label>Field Mapping</Label>
                      {fields.map(f => (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                          <span style={{ flex: 1, fontSize: 12, color: T.txM }}>{f.label}</span>
                          <ChevronRight size={10} style={{ color: T.txD }} />
                          <select value={ghl.field_mapping?.[f.id] || ""} onChange={e => setGhl({ ...ghl, field_mapping: { ...ghl.field_mapping, [f.id]: e.target.value } })}
                            style={{ flex: 1, padding: "5px 8px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                            <option value="">Skip</option>
                            <option value="firstName">First Name</option><option value="lastName">Last Name</option>
                            <option value="name">Full Name</option><option value="email">Email</option>
                            <option value="phone">Phone</option><option value="companyName">Company</option>
                            <option value="website">Website</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <div style={{ height: 1, background: T.brd }} />

                {/* Meta Pixel */}
                <Section icon={Eye} title="Meta Pixel" desc="Track conversions with Facebook/Meta Pixel." color="#0084ff">
                  <Inp label="Pixel ID" placeholder="123456789012345" value={pixelId} onChange={e => setPixelId(e.target.value)} />
                  {pixelId && (<>
                    <Sel label="On Page Load" value={pixelEvents.onLoad || "PageView"} onChange={e => setPixelEvents({ ...pixelEvents, onLoad: e.target.value })}>
                      {PIXEL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </Sel>
                    <Sel label="On Submit" value={pixelEvents.onSubmit || "Lead"} onChange={e => setPixelEvents({ ...pixelEvents, onSubmit: e.target.value })}>
                      {PIXEL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </Sel>
                    <Sel label="On Step Change" value={pixelEvents.onStep || ""} onChange={e => setPixelEvents({ ...pixelEvents, onStep: e.target.value })}>
                      <option value="">-- None --</option>
                      {PIXEL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </Sel>
                  </>)}
                </Section>

                <div style={{ height: 1, background: T.brd }} />

                {/* Webhook */}
                <Section icon={Send} title="Webhook" desc="Send data to Make, Zapier, or any URL." color={T.ok}>
                  <Inp label="Webhook URL" placeholder="https://hook.make.com/..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                </Section>
              </div>
            )}

            {/* ===== EMBED TAB ===== */}
            {tab === "embed" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={Code} title="Embed Code" desc="Paste into Webflow, WordPress, or raw HTML." color={T.ok} />
                <div style={{ position: "relative", background: T.bg, borderRadius: 9, border: `1px solid ${T.brd}`, overflow: "hidden" }}>
                  <pre style={{ padding: 14, fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: T.ac, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>{embed}</pre>
                  <button onClick={cpEmbed} style={{ position: "absolute", top: 7, right: 7, background: T.bgEl, border: `1px solid ${T.brd}`, borderRadius: 5, padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: copied ? T.ok : T.txM, fontSize: 10.5, fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>
                    {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <div>
                  <Label>Direct Link</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: T.bg, borderRadius: 7, border: `1px solid ${T.brd}` }}>
                    <Link2 size={13} style={{ color: T.txD, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: T.txM, overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{API_URL.replace('/api','')}/forms/{form.id}/view</span>
                    <button onClick={() => window.open(`${API_URL.replace('/api','')}/forms/${form.id}/view`, "_blank")} style={{ background: "none", border: "none", color: T.pr, cursor: "pointer", flexShrink: 0 }}><ExternalLink size={13} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== PREVIEW ===== */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 36, overflow: "auto",
          background: isDark ? "radial-gradient(ellipse at 50% 30%,rgba(108,92,231,0.03) 0%,transparent 70%)" : "radial-gradient(ellipse at 50% 30%,rgba(108,92,231,0.04) 0%,#f5f5fa 70%)",
        }}>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>
              {previewMode ? "TEST MODE — Submit works!" : "LIVE PREVIEW"}
            </p>

            {previewMode ? (
              <div style={{ borderRadius: br + 4, overflow: "hidden", border: `1px solid ${isDark ? "#1e1e2e" : "#e2e2e8"}`, boxShadow: `0 20px 60px rgba(0,0,0,${isDark ? "0.4" : "0.06"})` }}>
                <iframe key={saved ? "r" + Date.now() : "n"} src={`${API_URL.replace('/api','')}/forms/${form.id}/view`} style={{ width: "100%", minHeight: 520, border: "none", display: "block" }} title="Form Preview" />
                <p style={{ textAlign: "center", padding: "8px 0", fontSize: 10, color: T.txD, background: isDark ? "#0e0e16" : "#fff" }}>Save first to see latest changes</p>
              </div>
            ) : (
              <div style={{ background: isDark ? "#0e0e16" : "#ffffff", border: `1px solid ${isDark ? "#1e1e2e" : "#e2e2e8"}`, borderRadius: br + 4, padding: 28, boxShadow: `0 20px 60px rgba(0,0,0,${isDark ? "0.4" : "0.06"})` }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3, color: isDark ? "#e4e4ed" : "#1a1a2e", fontFamily: ff }}>{form.name}</h3>
                {steps.length > 1 && (
                  <div style={{ margin: "12px 0 16px" }}>
                    <div style={{ height: 4, background: isDark ? "#1a1a25" : "#eee", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: pc, borderRadius: 2, transition: "width .3s", width: `${((activeStep + 1) / steps.length) * 100}%` }} />
                    </div>
                    <p style={{ fontSize: 11, color: isDark ? "#65657a" : "#888", marginTop: 6, textAlign: "center" }}>Step {activeStep + 1} of {steps.length}</p>
                  </div>
                )}
                {steps.length <= 1 && <p style={{ fontSize: 12.5, marginBottom: 22, color: isDark ? "#65657a" : "#888", fontFamily: ff }}>Fill in the details below</p>}

                {curFields.map(f => (
                  <div key={f.id} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 5, color: isDark ? "#9a9ab0" : "#555", fontFamily: ff }}>
                      {f.label} {f.required && <span style={{ color: pc }}>*</span>}
                    </label>
                    {f.description && <p style={{ fontSize: 11, color: isDark ? "#65657a" : "#999", marginBottom: 6 }}>{f.description}</p>}
                    {f.type === "textarea" ? <textarea rows={3} placeholder={f.placeholder || ""} readOnly style={{ width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc", border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br, color: isDark ? "#e4e4ed" : "#1a1a2e", fontSize: 13, fontFamily: ff, resize: "vertical", outline: "none" }} />
                    : f.type === "select" ? <select disabled style={{ width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc", border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br, color: isDark ? "#65657a" : "#888", fontSize: 13, fontFamily: ff }}><option>{f.placeholder || "Select..."}</option></select>
                    : f.type === "checkbox" ? <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: isDark ? "#9a9ab0" : "#555", fontFamily: ff }}><input type="checkbox" disabled style={{ accentColor: pc }} /> {f.placeholder || f.label}</label>
                    : f.type === "rating" ? <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: f.maxRating || 5 }, (_, i) => <div key={i} style={{ width: 36, height: 36, borderRadius: br, border: `2px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: isDark ? "#65657a" : "#ccc" }}>{f.ratingType === "number" ? i + 1 : "★"}</div>)}</div>
                    : f.type === "opinion_scale" ? <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{Array.from({ length: (f.scaleMax || 10) - (f.scaleMin || 1) + 1 }, (_, i) => <div key={i} style={{ minWidth: 34, height: 34, borderRadius: br, border: `2px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: isDark ? "#65657a" : "#999" }}>{(f.scaleMin || 1) + i}</div>)}</div>
                    : f.type === "yesno" ? <div style={{ display: "flex", gap: 8 }}>{["Yes", "No"].map(v => <div key={v} style={{ flex: 1, padding: 12, borderRadius: br, border: `2px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, textAlign: "center", fontSize: 14, fontWeight: 600, color: isDark ? "#65657a" : "#999", fontFamily: ff }}>{v}</div>)}</div>
                    : f.type === "picture_choice" ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{(f.options || []).map((o, i) => <div key={i} style={{ padding: 12, borderRadius: br, border: `2px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, textAlign: "center", fontSize: 12, fontWeight: 500, color: isDark ? "#65657a" : "#999", fontFamily: ff }}>{typeof o === "string" ? o : o.label || `Option ${i + 1}`}</div>)}</div>
                    : <input type={f.type} placeholder={f.placeholder || ""} readOnly style={{ width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc", border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br, color: isDark ? "#e4e4ed" : "#1a1a2e", fontSize: 13, fontFamily: ff, outline: "none" }} />}
                  </div>
                ))}

                {steps.length > 1 ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {activeStep > 0 && <button style={{ flex: 1, padding: "11px 0", background: isDark ? "#1a1a25" : "#eee", color: isDark ? "#9a9ab0" : "#555", border: "none", borderRadius: br, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: ff }} onClick={() => setActiveStep(activeStep - 1)}>Back</button>}
                    {activeStep < steps.length - 1 ? (
                      <button style={{ flex: 1, padding: "11px 0", background: pc, color: "#fff", border: "none", borderRadius: br, fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: ff }} onClick={() => setActiveStep(activeStep + 1)}>Next</button>
                    ) : (
                      <button style={{ flex: 1, padding: "11px 0", background: pc, color: "#fff", border: "none", borderRadius: br, fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>{sty.buttonText || "Submit"}</button>
                    )}
                  </div>
                ) : (
                  <button style={{ width: "100%", padding: "11px 0", marginTop: 10, background: pc, color: "#fff", border: "none", borderRadius: br, fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>{sty.buttonText || "Submit"}</button>
                )}
                <p style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: isDark ? "#3e3e52" : "#bbb" }}>Powered by <span style={{ color: pc, fontWeight: 600 }}>Floumate</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState("dash");
  const [form, setForm] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("lf_token");
    const u = localStorage.getItem("lf_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
  }, []);

  const logout = () => { localStorage.removeItem("lf_token"); localStorage.removeItem("lf_user"); setUser(null); setToken(null); setView("dash"); setForm(null); };

  const globalStyles = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.tx};-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.brd};border-radius:3px}.fi{animation:fi .35s ease-out}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}input:focus,textarea:focus,select:focus{outline:none;border-color:${T.brdF}!important;box-shadow:0 0 0 3px ${T.prG}}::selection{background:${T.pr};color:#fff}`;

  if (!user || !token) return (<><style>{globalStyles}</style><Auth onAuth={(u, t) => { setUser(u); setToken(t); }} /></>);

  return (
    <><style>{globalStyles}</style>
      {view === "builder" && form ? (
        <Builder form={form} token={token} onBack={() => { setView("dash"); setForm(null); }} />
      ) : (
        <Dash user={user} token={token} onLogout={logout} onOpen={f => { setForm(f); setView("builder"); }} />
      )}
    </>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Copy, Check, LogOut, GripVertical, Eye, EyeOff, ChevronDown, Settings, Code, Palette, LayoutGrid, Zap, ExternalLink, X, FileText, BarChart3, ArrowLeft, Save, Type, Mail, Phone, Hash, AlignLeft, ChevronRight, Calendar, Link2, CheckSquare } from "lucide-react";

const API_URL = "https://leadflow-api-production-a68b.up.railway.app";

// ============================================================
// THEME
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

// ============================================================
// FIELD TYPES
// ============================================================
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
];

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
    }}>LF</div>
    <span style={{
      fontSize: big ? 24 : 18, fontWeight: 700, letterSpacing: -0.5,
      background: `linear-gradient(135deg,${T.tx},${T.ac})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>LeadFlow</span>
  </div>
);

const Btn = ({ children, v = "pr", sm, onClick, dis, style: s }) => {
  const vars = {
    pr: { background: T.pr, color: "#fff", border: "none" },
    gh: { background: "transparent", color: T.txM, border: `1px solid ${T.brd}` },
    dn: { background: T.dnG, color: T.dn, border: `1px solid rgba(255,71,87,0.15)` },
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
      const r = await fetch(`${API_URL}${ep}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      localStorage.setItem("lf_token", d.token);
      localStorage.setItem("lf_user", JSON.stringify(d.user));
      onAuth(d.user, d.token);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 0%,rgba(108,92,231,0.06) 0%,transparent 60%),${T.bg}`,
    }}>
      <div className="fi" style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo big /></div>
          <p style={{ color: T.txM, fontSize: 14.5 }}>{mode === "login" ? "Welcome back" : "Create your account"}</p>
        </div>
        <Crd style={{ padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && <Inp label="Full Name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />}
            <Inp label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Inp label="Password" type="password" placeholder="••••••••" value={pw}
              onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
            {err && <div style={{ padding: "9px 13px", background: T.dnG, borderRadius: 7, fontSize: 12.5, color: T.dn }}>{err}</div>}
            <Btn onClick={go} dis={loading} style={{ width: "100%", justifyContent: "center", marginTop: 2, padding: "12px 0", fontSize: 15 }}>
              {loading ? <Spin /> : mode === "login" ? "Sign In" : "Create Account"}
            </Btn>
            <div style={{ textAlign: "center", fontSize: 12.5, color: T.txM }}>
              {mode === "login" ? "No account? " : "Have an account? "}
              <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}
                style={{ color: T.pr, cursor: "pointer", fontWeight: 600 }}>
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
          fields: [
            { id: "f1", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
            { id: "f2", type: "email", label: "Email", placeholder: "you@email.com", required: true },
          ],
          styles: { theme: "dark", primaryColor: "#6c5ce7", borderRadius: 10, fontFamily: "Outfit", buttonText: "Submit", successMessage: "Thanks! We'll be in touch." },
          ghl_config: {},
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
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: "rgba(8,8,13,0.85)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.brd}`,
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg,${T.pr},${T.ac})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>{(user?.name || user?.email || "U")[0].toUpperCase()}</div>
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
          <div style={{
            position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }} onClick={() => setShowNew(false)}>
            <Crd className="fi" style={{ width: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Create New Form</h3>
              <Inp label="Form Name" placeholder="e.g. Contact Form, Lead Magnet..."
                value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && create()} />
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
            {forms.map((f, i) => (
              <Crd key={f.id} className="fi" hov style={{ animationDelay: `${i * 0.04}s`, cursor: "pointer" }} onClick={() => onOpen(f)}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{f.name}</h3>
                    <p style={{ fontSize: 11.5, color: T.txD }}>{new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: `${T.pr}18`, color: T.pr }}>
                    {(f.fields || []).length} fields
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
                  {(f.fields || []).slice(0, 4).map((fl, j) => (
                    <span key={j} style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10.5, background: T.bgEl, color: T.txM }}>{fl.label || fl.type}</span>
                  ))}
                  {(f.fields || []).length > 4 && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10.5, background: T.bgEl, color: T.txD }}>+{(f.fields || []).length - 4}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11.5, color: T.txD, display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={11} /> {f.submissions_count || 0} leads</span>
                  <button onClick={e => { e.stopPropagation(); del(f.id); }} style={{ background: "none", border: "none", color: T.txD, cursor: "pointer", padding: 3 }}><Trash2 size={13} /></button>
                </div>
              </Crd>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// FORM BUILDER
// ============================================================
const Builder = ({ form, token, onBack }) => {
  const [fields, setFields] = useState(form.fields || []);
  const [tab, setTab] = useState("fields");
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sty, setSty] = useState(form.styles || { theme: "dark", primaryColor: "#6c5ce7", borderRadius: 10, fontFamily: "Outfit", buttonText: "Submit", successMessage: "Thanks! We'll be in touch." });
  const [ghl, setGhl] = useState(form.ghl_config || { enabled: false, location_id: "", api_key: "", tag: "", field_mapping: {} });
  const [dragI, setDragI] = useState(null);

  const tabs = [
    { id: "fields", label: "Fields", icon: LayoutGrid },
    { id: "style", label: "Style", icon: Palette },
    { id: "ghl", label: "GHL", icon: Zap },
    { id: "embed", label: "Embed", icon: Code },
  ];

  const addField = (type) => {
    const c = FTYPES.find(f => f.type === type);
    const nf = { id: `f_${Date.now()}`, type, label: c?.def || "New Field", placeholder: "", required: false, options: type === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined };
    setFields([...fields, nf]);
    setSel(nf.id);
  };

  const upField = (id, u) => setFields(fields.map(f => f.id === id ? { ...f, ...u } : f));
  const rmField = (id) => { setFields(fields.filter(f => f.id !== id)); if (sel === id) setSel(null); };
  const mvField = (a, b) => { const u = [...fields]; const [m] = u.splice(a, 1); u.splice(b, 0, m); setFields(u); };

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fields, styles: sty, ghl_config: ghl }),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const embed = `<div id="leadflow-${form.id}"></div>\n<script src="${API_URL}/embed.js" data-form-id="${form.id}"></script>`;
  const cpEmbed = () => { navigator.clipboard.writeText(embed); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const sf = fields.find(f => f.id === sel);
  const isDark = sty.theme === "dark";
  const pc = sty.primaryColor || "#6c5ce7";
  const br = sty.borderRadius || 10;
  const ff = `'${sty.fontFamily || "Outfit"}',sans-serif`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 18px", background: "rgba(8,8,13,0.9)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.brd}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: T.txM, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontFamily: "'Outfit',sans-serif" }}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <div style={{ width: 1, height: 18, background: T.brd }} />
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>{form.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Btn sm onClick={save} dis={saving}>
            {saving ? <Spin s={13} /> : saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
          </Btn>
        </div>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 320, borderRight: `1px solid ${T.brd}`, background: T.bgCard, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.brd}` }}>
            {tabs.map(t => {
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "11px 0", fontSize: 11.5, fontWeight: 600, fontFamily: "'Outfit',sans-serif",
                  background: "none", border: "none", cursor: "pointer",
                  color: tab === t.id ? T.pr : T.txD,
                  borderBottom: tab === t.id ? `2px solid ${T.pr}` : "2px solid transparent",
                  transition: "all .2s",
                }}><I size={13} /> {t.label}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: 14 }}>
            {/* FIELDS */}
            {tab === "fields" && (
              <div className="fi">
                <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Add Field</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 18 }}>
                  {FTYPES.map(ft => {
                    const I = ft.icon;
                    return (
                      <button key={ft.type} onClick={() => addField(ft.type)} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                        padding: "9px 3px", background: T.bgEl, border: `1px solid ${T.brd}`,
                        borderRadius: 7, cursor: "pointer", color: T.txM, fontSize: 9.5,
                        fontFamily: "'Outfit',sans-serif", fontWeight: 500, transition: "all .15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.pr; e.currentTarget.style.color = T.pr; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.brd; e.currentTarget.style.color = T.txM; }}
                      ><I size={14} />{ft.label}</button>
                    );
                  })}
                </div>

                <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Fields ({fields.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {fields.map((f, i) => {
                    const FI = FTYPES.find(ft => ft.type === f.type)?.icon || Type;
                    const isSel = sel === f.id;
                    return (
                      <div key={f.id} draggable onDragStart={() => setDragI(i)} onDragOver={e => e.preventDefault()}
                        onDrop={() => { if (dragI !== null && dragI !== i) mvField(dragI, i); setDragI(null); }}
                        onClick={() => setSel(isSel ? null : f.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 7, padding: "9px 11px", borderRadius: 7,
                          background: isSel ? T.prG : T.bgEl, border: `1px solid ${isSel ? T.pr : T.brd}`,
                          cursor: "pointer", transition: "all .12s",
                        }}>
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
                    <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Edit Field</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Inp label="Label" value={sf.label} onChange={e => upField(sel, { label: e.target.value })} />
                      <Inp label="Placeholder" value={sf.placeholder || ""} onChange={e => upField(sel, { placeholder: e.target.value })} />
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STYLE */}
            {tab === "style" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Theme</label>
                  <div style={{ display: "flex", gap: 7 }}>
                    {["dark", "light"].map(t => (
                      <button key={t} onClick={() => setSty({ ...sty, theme: t })} style={{
                        flex: 1, padding: "9px 0", borderRadius: 7, cursor: "pointer", fontSize: 12.5,
                        fontFamily: "'Outfit',sans-serif", fontWeight: 600, transition: "all .2s",
                        background: sty.theme === t ? T.prG : T.bgEl,
                        border: `1px solid ${sty.theme === t ? T.pr : T.brd}`,
                        color: sty.theme === t ? T.pr : T.txM,
                      }}>{t[0].toUpperCase() + t.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Primary Color</label>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <input type="color" value={pc} onChange={e => setSty({ ...sty, primaryColor: e.target.value })}
                      style={{ width: 38, height: 34, border: "none", cursor: "pointer", borderRadius: 5, background: "none" }} />
                    <Inp value={pc} onChange={e => setSty({ ...sty, primaryColor: e.target.value })}
                      style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Border Radius</label>
                  <input type="range" min="0" max="20" value={br} onChange={e => setSty({ ...sty, borderRadius: +e.target.value })}
                    style={{ width: "100%", accentColor: T.pr }} />
                  <span style={{ fontSize: 11.5, color: T.txD }}>{br}px</span>
                </div>
                <Inp label="Button Text" value={sty.buttonText || "Submit"} onChange={e => setSty({ ...sty, buttonText: e.target.value })} />
                <Inp label="Success Message" value={sty.successMessage || "Thanks!"} onChange={e => setSty({ ...sty, successMessage: e.target.value })} />
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: T.txM, marginBottom: 5, display: "block" }}>Font</label>
                  <select value={sty.fontFamily || "Outfit"} onChange={e => setSty({ ...sty, fontFamily: e.target.value })}
                    style={{ width: "100%", padding: "9px 11px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 7, color: T.tx, fontSize: 12.5, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                    {["Outfit", "Inter", "DM Sans", "Space Grotesk", "Poppins", "Montserrat"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* GHL */}
            {tab === "ghl" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 12, background: T.prG, borderRadius: 9, border: `1px solid rgba(108,92,231,0.15)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <Zap size={13} style={{ color: T.pr }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: T.pr }}>GoHighLevel Integration</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: T.txM, lineHeight: 1.5 }}>Auto-create GHL contacts when leads submit your form.</p>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  <input type="checkbox" checked={ghl.enabled || false} onChange={e => setGhl({ ...ghl, enabled: e.target.checked })} style={{ accentColor: T.pr }} />
                  Enable GHL Integration
                </label>
                {ghl.enabled && (
                  <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <Inp label="Location ID" placeholder="loc_xxxxxxxxx" value={ghl.location_id || ""} onChange={e => setGhl({ ...ghl, location_id: e.target.value })} />
                    <Inp label="API Key" type="password" placeholder="Your GHL API key" value={ghl.api_key || ""} onChange={e => setGhl({ ...ghl, api_key: e.target.value })} />
                    <Inp label="Tag (optional)" placeholder="e.g. webinar-lead" value={ghl.tag || ""} onChange={e => setGhl({ ...ghl, tag: e.target.value })} />
                    <div style={{ marginTop: 3 }}>
                      <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Field Mapping</p>
                      {fields.map(f => (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                          <span style={{ flex: 1, fontSize: 12.5, color: T.txM }}>{f.label}</span>
                          <ChevronRight size={11} style={{ color: T.txD }} />
                          <select value={ghl.field_mapping?.[f.id] || ""} onChange={e => setGhl({ ...ghl, field_mapping: { ...ghl.field_mapping, [f.id]: e.target.value } })}
                            style={{ flex: 1, padding: "5px 9px", background: T.bgIn, border: `1px solid ${T.brd}`, borderRadius: 5, color: T.tx, fontSize: 11.5, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                            <option value="">-- Skip --</option>
                            <option value="firstName">First Name</option>
                            <option value="lastName">Last Name</option>
                            <option value="name">Full Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="companyName">Company</option>
                            <option value="website">Website</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EMBED */}
            {tab === "embed" && (
              <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 12, background: T.okG, borderRadius: 9, border: `1px solid rgba(0,210,160,0.15)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <Code size={13} style={{ color: T.ok }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ok }}>Embed Code</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: T.txM, lineHeight: 1.5 }}>Paste into Webflow, WordPress, or raw HTML.</p>
                </div>
                <div style={{ position: "relative", background: T.bg, borderRadius: 9, border: `1px solid ${T.brd}`, overflow: "hidden" }}>
                  <pre style={{ padding: 14, fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: T.ac, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>{embed}</pre>
                  <button onClick={cpEmbed} style={{
                    position: "absolute", top: 7, right: 7, background: T.bgEl, border: `1px solid ${T.brd}`,
                    borderRadius: 5, padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    color: copied ? T.ok : T.txM, fontSize: 10.5, fontFamily: "'Outfit',sans-serif", fontWeight: 500,
                  }}>{copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}</button>
                </div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Direct Link</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: T.bg, borderRadius: 7, border: `1px solid ${T.brd}` }}>
                    <Link2 size={13} style={{ color: T.txD, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: T.txM, overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{API_URL}/forms/{form.id}/view</span>
                    <button onClick={() => window.open(`${API_URL}/forms/${form.id}/view`, "_blank")} style={{ background: "none", border: "none", color: T.pr, cursor: "pointer", flexShrink: 0 }}><ExternalLink size={13} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 36, overflow: "auto",
          background: isDark ? "radial-gradient(ellipse at 50% 30%,rgba(108,92,231,0.03) 0%,transparent 70%)" : "radial-gradient(ellipse at 50% 30%,rgba(108,92,231,0.04) 0%,#f5f5fa 70%)",
        }}>
          <div style={{ width: "100%", maxWidth: 460 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: T.txD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>Live Preview</p>
            <div style={{
              background: isDark ? "#0e0e16" : "#ffffff",
              border: `1px solid ${isDark ? "#1e1e2e" : "#e2e2e8"}`,
              borderRadius: br + 4, padding: 28,
              boxShadow: `0 20px 60px rgba(0,0,0,${isDark ? "0.4" : "0.06"})`,
            }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3, color: isDark ? "#e4e4ed" : "#1a1a2e", fontFamily: ff }}>{form.name}</h3>
              <p style={{ fontSize: 12.5, marginBottom: 22, color: isDark ? "#65657a" : "#888", fontFamily: ff }}>Fill in the details below</p>

              {fields.map(f => (
                <div key={f.id} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 5, color: isDark ? "#9a9ab0" : "#555", fontFamily: ff }}>
                    {f.label} {f.required && <span style={{ color: pc }}>*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea rows={3} placeholder={f.placeholder || ""} readOnly style={{
                      width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc",
                      border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br,
                      color: isDark ? "#e4e4ed" : "#1a1a2e", fontSize: 13, fontFamily: ff, resize: "vertical", outline: "none",
                    }} />
                  ) : f.type === "select" ? (
                    <select disabled style={{
                      width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc",
                      border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br,
                      color: isDark ? "#65657a" : "#888", fontSize: 13, fontFamily: ff,
                    }}><option>{f.placeholder || "Select..."}</option></select>
                  ) : f.type === "checkbox" ? (
                    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: isDark ? "#9a9ab0" : "#555", fontFamily: ff }}>
                      <input type="checkbox" disabled style={{ accentColor: pc }} /> {f.placeholder || f.label}
                    </label>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder || ""} readOnly style={{
                      width: "100%", padding: "9px 12px", background: isDark ? "#12121a" : "#f8f8fc",
                      border: `1px solid ${isDark ? "#1e1e2e" : "#e0e0e5"}`, borderRadius: br,
                      color: isDark ? "#e4e4ed" : "#1a1a2e", fontSize: 13, fontFamily: ff, outline: "none",
                    }} />
                  )}
                </div>
              ))}

              <button style={{
                width: "100%", padding: "11px 0", marginTop: 6,
                background: pc, color: "#fff", border: "none", borderRadius: br,
                fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: ff,
              }}>{sty.buttonText || "Submit"}</button>

              <p style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: isDark ? "#3e3e52" : "#bbb" }}>
                Powered by <span style={{ color: pc, fontWeight: 600 }}>LeadFlow</span>
              </p>
            </div>
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

  const logout = () => {
    localStorage.removeItem("lf_token");
    localStorage.removeItem("lf_user");
    setUser(null); setToken(null); setView("dash"); setForm(null);
  };

  if (!user || !token) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.brd};border-radius:3px}.fi{animation:fi .35s ease-out}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}input:focus,textarea:focus,select:focus{outline:none;border-color:${T.brdF}!important;box-shadow:0 0 0 3px ${T.prG}}::selection{background:${T.pr};color:#fff}`}</style>
      <Auth onAuth={(u, t) => { setUser(u); setToken(t); }} />
    </>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.tx};-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.brd};border-radius:3px}.fi{animation:fi .35s ease-out}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}input:focus,textarea:focus,select:focus{outline:none;border-color:${T.brdF}!important;box-shadow:0 0 0 3px ${T.prG}}::selection{background:${T.pr};color:#fff}`}</style>
      {view === "builder" && form ? (
        <Builder form={form} token={token} onBack={() => { setView("dash"); setForm(null); }} />
      ) : (
        <Dash user={user} token={token} onLogout={logout} onOpen={f => { setForm(f); setView("builder"); }} />
      )}
    </>
  );
}

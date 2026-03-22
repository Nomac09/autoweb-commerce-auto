"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Car = {
  id: string;
  title: string;
  price: number;
  year: number;
  km: number;
  fuel: string;
  gearbox: string;
  images: string[];
  description: string;
  budget_tag: string;
  status: string;
  features: string[];
  color?: string;
  doors?: number;
  power_din?: number;
  co2?: number;
  equipments?: string[];
  guarantee?: string;
  added_at?: string;
};

const empty: Omit<Car, "id" | "budget_tag" | "added_at"> = {
  title: "", price: 0, year: new Date().getFullYear(), km: 0,
  fuel: "Essence", gearbox: "Manuelle", images: [],
  description: "", status: "available", features: [],
  color: "", doors: undefined, power_din: undefined,
  co2: undefined, equipments: [], guarantee: "",
};

function budgetTag(price: number) {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

function slugify(text: string, year: number) {
  return `${text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${year}-${Date.now().toString(36)}`;
}

// ── Login Screen ─────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { onLogin(); }
    else { setError("Mot de passe incorrect"); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "20px" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "40px", width: "100%", maxWidth: "380px", borderTop: "3px solid var(--accent)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--accent)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 900, color: "var(--bg)", margin: "0 auto 16px", fontFamily: "var(--font-head)" }}>A</div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "22px", fontWeight: 700, textTransform: "uppercase", color: "var(--white)" }}>AUTOWEB Admin</h1>
          <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "4px" }}>Accès réservé</p>
        </div>
        <form onSubmit={submit}>
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Mot de passe" autoFocus
            style={{ width: "100%", padding: "13px 16px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--white)", fontSize: "15px", fontFamily: "inherit", marginBottom: "12px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
          {error && <p style={{ color: "#ff4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: ".06em", cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? "..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Photo Upload ─────────────────────────────────────────
function PhotoUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const arr = Array.from(files);
    const uploaded: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const fd = new FormData();
      fd.append("file", arr[i]);
      fd.append("index", String(images.length + i));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
  };

  const moveUp   = (i: number) => { if (i === 0) return; const a = [...images]; [a[i-1], a[i]] = [a[i], a[i-1]]; onChange(a); };
  const moveDown = (i: number) => { if (i === images.length-1) return; const a = [...images]; [a[i], a[i+1]] = [a[i+1], a[i]]; onChange(a); };
  const remove   = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "var(--radius)", padding: "28px",
          textAlign: "center", cursor: "pointer",
          background: dragOver ? "rgba(154,255,58,.05)" : "var(--bg3)",
          transition: "all .15s ease", marginBottom: "16px",
        }}
      >
        {uploading
          ? <p style={{ color: "var(--accent)", fontSize: "14px" }}>⏳ Upload en cours…</p>
          : <><p style={{ color: "var(--gray)", fontSize: "14px" }}>📸 Cliquez ou glissez les photos ici</p><p style={{ color: "var(--gray2)", fontSize: "12px", marginTop: "4px" }}>JPG, PNG — plusieurs fichiers acceptés</p></>
        }
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
          onChange={e => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
          {images.map((img, i) => (
            <div key={img} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", border: i === 0 ? "2px solid var(--accent)" : "2px solid var(--border)", background: "var(--bg3)" }}>
              <img src={img} alt={`Photo ${i+1}`} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
              {i === 0 && (
                <div style={{ position: "absolute", top: "4px", left: "4px", background: "var(--accent)", color: "var(--bg)", fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px" }}>
                  PRINCIPALE
                </div>
              )}
              <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "3px" }}>
                <button onClick={() => moveUp(i)} style={{ width: "22px", height: "22px", background: "rgba(0,0,0,.7)", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}>←</button>
                <button onClick={() => moveDown(i)} style={{ width: "22px", height: "22px", background: "rgba(0,0,0,.7)", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}>→</button>
                <button onClick={() => remove(i)} style={{ width: "22px", height: "22px", background: "rgba(200,0,0,.8)", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}>✕</button>
              </div>
              <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,.6)", color: "#fff", fontSize: "10px", padding: "1px 6px", borderRadius: "3px" }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Car Form ──────────────────────────────────────────────
function CarForm({ initial, onSave, onCancel }: {
  initial?: Car;
  onSave: (car: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<any>(initial ?? { ...empty });
  const [saving, setSaving] = useState(false);
  const [featText, setFeatText] = useState((initial?.features ?? []).join(", "));
  const [equipText, setEquipText] = useState((initial?.equipments ?? []).join("\n"));

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const features = featText.split(",").map(s => s.trim()).filter(Boolean);
    const equipments = equipText.split("\n").map(s => s.trim()).filter(Boolean);
    await onSave({ ...form, features, equipments, budget_tag: budgetTag(Number(form.price)) });
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "10px 12px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--white)", fontSize: "14px", fontFamily: "inherit" };
  const labelStyle = { fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".06em", color: "var(--gray)", display: "block", marginBottom: "5px" };
  const groupStyle = { marginBottom: "16px" };

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ gridColumn: "1/-1", ...groupStyle }}>
          <label style={labelStyle}>Photos</label>
          <PhotoUploader images={form.images ?? []} onChange={imgs => set("images", imgs)} />
        </div>

        <div style={{ gridColumn: "1/-1", ...groupStyle }}>
          <label style={labelStyle}>Titre / Modèle *</label>
          <input required value={form.title} onChange={e => set("title", e.target.value)} style={inputStyle} placeholder="Mini Cooper Hatch Pack Chili 136ch" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Prix (€) *</label>
          <input required type="number" value={form.price || ""} onChange={e => set("price", Number(e.target.value))} style={inputStyle} placeholder="13500" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Année *</label>
          <input required type="number" value={form.year || ""} onChange={e => set("year", Number(e.target.value))} style={inputStyle} placeholder="2019" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Kilométrage *</label>
          <input required type="number" value={form.km || ""} onChange={e => set("km", Number(e.target.value))} style={inputStyle} placeholder="80000" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Carburant *</label>
          <select required value={form.fuel} onChange={e => set("fuel", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Boîte *</label>
          <select required value={form.gearbox} onChange={e => set("gearbox", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            <option value="Manuelle">Manuelle</option>
            <option value="Automatique">Automatique</option>
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Couleur</label>
          <input value={form.color ?? ""} onChange={e => set("color", e.target.value)} style={inputStyle} placeholder="Beige" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Puissance (ch)</label>
          <input type="number" value={form.power_din ?? ""} onChange={e => set("power_din", e.target.value ? Number(e.target.value) : null)} style={inputStyle} placeholder="136" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Portes</label>
          <input type="number" value={form.doors ?? ""} onChange={e => set("doors", e.target.value ? Number(e.target.value) : null)} style={inputStyle} placeholder="5" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>CO₂ (g/km)</label>
          <input type="number" value={form.co2 ?? ""} onChange={e => set("co2", e.target.value ? Number(e.target.value) : null)} style={inputStyle} placeholder="120" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Garantie</label>
          <input value={form.guarantee ?? ""} onChange={e => set("guarantee", e.target.value)} style={inputStyle} placeholder="3 mois" />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Statut</label>
          <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            <option value="available">✅ Disponible</option>
            <option value="reserved">🟡 Réservé</option>
            <option value="sold">❌ Vendu</option>
          </select>
        </div>

        <div style={{ gridColumn: "1/-1", ...groupStyle }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} placeholder="Très bel état général, révisée complètement…" />
        </div>

        <div style={{ gridColumn: "1/-1", ...groupStyle }}>
          <label style={labelStyle}>Caractéristiques (séparées par virgules)</label>
          <input value={featText} onChange={e => setFeatText(e.target.value)} style={inputStyle} placeholder="CT OK, Garantie 3 mois, Révision complète, Pneus neufs" />
        </div>

        <div style={{ gridColumn: "1/-1", ...groupStyle }}>
          <label style={labelStyle}>Équipements (un par ligne)</label>
          <textarea value={equipText} onChange={e => setEquipText(e.target.value)} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Climatisation automatique&#10;GPS intégré&#10;Bluetooth&#10;Caméra de recul&#10;Jantes alliage 17" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button type="submit" disabled={saving} style={{ flex: 1, padding: "13px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: ".06em", cursor: saving ? "wait" : "pointer", fontFamily: "inherit" }}>
          {saving ? "Enregistrement…" : initial ? "💾 Enregistrer" : "🚗 Publier la voiture"}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: "13px 20px", background: "var(--bg3)", color: "var(--gray)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
          Annuler
        </button>
      </div>
    </form>
  );
}

// ── Main Admin ────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [cars, setCars]       = useState<Car[]>([]);
  const [view, setView]       = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");

  // Check existing auth cookie
  useEffect(() => {
    fetch("/api/admin/auth", { method: "DELETE" })
      .then(() => {})
      .catch(() => {});
    // Try to load cars — if it works, we're authed
    setChecking(false);
  }, []);

  const loadCars = useCallback(async () => {
    setLoading(true);
    const { data } = await sb.from("cars").select("*").order("added_at", { ascending: false });
    setCars(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) loadCars(); }, [authed, loadCars]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleAdd = async (form: any) => {
    const id = slugify(form.title, form.year);
    const { error } = await sb.from("cars").insert({ ...form, id, added_at: new Date().toISOString() });
    if (error) { flash("❌ Erreur: " + error.message); return; }
    flash("✅ Voiture publiée !");
    setView("list");
    loadCars();
  };

  const handleEdit = async (form: any) => {
    const { error } = await sb.from("cars").update(form).eq("id", editing!.id);
    if (error) { flash("❌ Erreur: " + error.message); return; }
    flash("✅ Modifié !");
    setView("list");
    setEditing(null);
    loadCars();
  };

  const handleStatus = async (id: string, status: string) => {
    await sb.from("cars").update({ status }).eq("id", id);
    setCars(cs => cs.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDelete = async (id: string) => {
    if (deleting !== id) { setDeleting(id); return; }
    await sb.from("cars").delete().eq("id", id);
    setCars(cs => cs.filter(c => c.id !== id));
    setDeleting(null);
    flash("🗑️ Supprimée");
  };

  if (checking) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray)" }}>Chargement…</div>;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const filtered = cars.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    available: cars.filter(c => c.status === "available").length,
    reserved:  cars.filter(c => c.status === "reserved").length,
    sold:      cars.filter(c => c.status === "sold").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--white)" }}>
      {/* Header */}
      <div style={{ background: "var(--bg2)", borderBottom: "3px solid var(--accent)", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "var(--bg)", fontFamily: "var(--font-head)", fontSize: "18px" }}>A</div>
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "18px", textTransform: "uppercase" }}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {view !== "list" && (
              <button onClick={() => { setView("list"); setEditing(null); }} style={{ padding: "7px 14px", background: "var(--bg3)", color: "var(--gray)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                ← Stock
              </button>
            )}
            {view === "list" && (
              <button onClick={() => setView("add")} style={{ padding: "7px 16px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "var(--radius)", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                + Ajouter
              </button>
            )}
            <a href="/" target="_blank" style={{ padding: "7px 14px", background: "var(--bg3)", color: "var(--gray)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "13px", textDecoration: "none", fontFamily: "inherit" }}>
              🌐 Site
            </a>
          </div>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div style={{ background: msg.startsWith("❌") ? "rgba(255,68,68,.15)" : "rgba(154,255,58,.15)", border: `1px solid ${msg.startsWith("❌") ? "#ff4444" : "var(--accent)"}`, color: msg.startsWith("❌") ? "#ff4444" : "var(--accent)", padding: "10px 24px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>
          {msg}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>

        {/* ADD FORM */}
        {view === "add" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "22px", fontWeight: 700, textTransform: "uppercase", marginBottom: "24px", color: "var(--white)" }}>
              Ajouter une voiture
            </h2>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
              <CarForm onSave={handleAdd} onCancel={() => setView("list")} />
            </div>
          </div>
        )}

        {/* EDIT FORM */}
        {view === "edit" && editing && (
          <div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "22px", fontWeight: 700, textTransform: "uppercase", marginBottom: "24px", color: "var(--white)" }}>
              Modifier — {editing.title}
            </h2>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
              <CarForm initial={editing} onSave={handleEdit} onCancel={() => { setView("list"); setEditing(null); }} />
            </div>
          </div>
        )}

        {/* LIST */}
        {view === "list" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {[
                ["✅ Disponibles", statusCounts.available, "var(--accent)"],
                ["🟡 Réservées",   statusCounts.reserved,  "#f59e0b"],
                ["❌ Vendues",      statusCounts.sold,       "var(--gray)"],
              ].map(([label, count, color]) => (
                <div key={label as string} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: "28px", fontWeight: 700, color: color as string, lineHeight: 1 }}>{count as number}</div>
                  <div style={{ fontSize: "12px", color: "var(--gray)", marginTop: "4px", textTransform: "uppercase", letterSpacing: ".06em" }}>{label as string}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher…"
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--white)", fontSize: "14px", fontFamily: "inherit", marginBottom: "16px", outline: "none" }}
            />

            {/* Car list */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--gray)" }}>Chargement…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--gray)" }}>Aucune voiture</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filtered.map(car => (
                  <div key={car.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Thumbnail */}
                    <div style={{ width: "72px", height: "54px", borderRadius: "6px", overflow: "hidden", background: "var(--bg3)", flexShrink: 0 }}>
                      {car.images?.[0]
                        ? <img src={car.images[0]} alt={car.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🚗</div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{car.title}</p>
                      <p style={{ fontSize: "12px", color: "var(--gray)", marginTop: "2px" }}>
                        {car.price?.toLocaleString("fr-FR")} € · {car.km?.toLocaleString("fr-FR")} km · {car.year} · {car.fuel}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--gray2)", marginTop: "2px", fontFamily: "monospace" }}>{car.id}</p>
                    </div>

                    {/* Status selector */}
                    <select
                      value={car.status}
                      onChange={e => handleStatus(car.id, e.target.value)}
                      style={{ padding: "6px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: car.status === "available" ? "var(--accent)" : car.status === "reserved" ? "#f59e0b" : "var(--gray)", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
                    >
                      <option value="available">✅ Disponible</option>
                      <option value="reserved">🟡 Réservé</option>
                      <option value="sold">❌ Vendu</option>
                    </select>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => { setEditing(car); setView("edit"); }}
                        style={{ padding: "7px 12px", background: "var(--bg3)", color: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        ✏️ Modifier
                      </button>
                      <a
                        href={`/car/${car.id}`} target="_blank"
                        style={{ padding: "7px 12px", background: "var(--bg3)", color: "var(--gray)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}
                      >
                        👁
                      </a>
                      <button
                        onClick={() => handleDelete(car.id)}
                        style={{ padding: "7px 12px", background: deleting === car.id ? "#ff4444" : "var(--bg3)", color: deleting === car.id ? "#fff" : "#ff4444", border: `1px solid ${deleting === car.id ? "#ff4444" : "var(--border)"}`, borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {deleting === car.id ? "Confirmer" : "🗑"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

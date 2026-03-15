#!/bin/bash
# ============================================================
# AUTOWEB — Deploy Supabase + WhatsApp agent
# Run from project root: bash deploy-agent.sh
# ============================================================
set -e
echo "🚗 AUTOWEB — deploying agent pipeline..."

# 1. Install Supabase client
npm install @supabase/supabase-js
echo "  ✓ @supabase/supabase-js installed"

# 2. Add OWNER_WHATSAPP to .env.local (your number, never committed)
if [ ! -f .env.local ]; then
  cat > .env.local << 'ENVEOF'
# Your WhatsApp number in international format (no spaces, no +)
# e.g. if your number is +33 7 83 80 96 94, write: 33783809694
OWNER_WHATSAPP=33783809694
NEXT_PUBLIC_SITE_URL=https://autoweb-commerce-auto-nices-projects-16752daa.vercel.app
ENVEOF
  echo "  ✓ .env.local created — update OWNER_WHATSAPP if needed"
fi

# 3. Write all updated source files
echo "  Writing source files..."

# ── api/whatsapp/route.ts ──────────────────────────────────
mkdir -p src/app/api/whatsapp
cat > src/app/api/whatsapp/route.ts << 'HEREDOC'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Session = {
  step: string;
  photos: string[];
  partialData: Record<string, any>;
  startedAt: number;
};

const sessions = new Map<string, Session>();

function twilioReply(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

async function fetchTwilioMedia(url: string): Promise<Buffer> {
  const creds = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(url, { headers: { Authorization: `Basic ${creds}` } });
  return Buffer.from(await res.arrayBuffer());
}

async function uploadPhoto(buf: Buffer, filename: string): Promise<string | null> {
  const { error } = await supabase.storage.from("cars").upload(`photos/${filename}`, buf, { contentType: "image/jpeg", upsert: true });
  if (error) { console.error(error); return null; }
  return supabase.storage.from("cars").getPublicUrl(`photos/${filename}`).data.publicUrl;
}

async function callClaude(userContent: any[], system: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{ role:"user", content:userContent }] }),
  });
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

async function readCarteGrise(buf: Buffer): Promise<Record<string, any>> {
  const b64 = buf.toString("base64");
  const raw = await callClaude(
    [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 } },
     { type:"text",  text:"Extract all vehicle data from this registration document. Return ONLY valid JSON." }],
    `Return ONLY a JSON object with: make (string), model (string), year (number, first registration year), fuel ("Essence"|"Diesel"|"Hybride"|"Électrique"), power_din (number in ch, convert kW*1.36), doors (number or null), color (string or null), vin (string or null). No explanation.`
  );
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
    return {
      title: `${parsed.make ?? ""} ${parsed.model ?? ""}`.trim(),
      year:  parsed.year      ?? null,
      fuel:  parsed.fuel      ?? "Essence",
      power_din: parsed.power_din ? Math.round(parsed.power_din) : null,
      doors: parsed.doors     ?? null,
      color: parsed.color     ?? null,
    };
  } catch { return {}; }
}

async function parseDetails(text: string, existing: Record<string, any>): Promise<Record<string, any>> {
  const raw = await callClaude(
    [{ type:"text", text:`Dealer message: "${text}"\nExisting: ${JSON.stringify(existing)}\nExtract car details. Return ONLY JSON.` }],
    `Return ONLY valid JSON: { price: number|null, km: number|null, gearbox: "Manuelle"|"Automatique"|null, description: string|null, features: string[]|null, color: string|null, guarantee: string|null, equipments: string[]|null }. French: "auto"=Automatique, "manu"=Manuelle.`
  );
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return {}; }
}

function budgetTag(price: number): string {
  return price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
}

async function getStock(): Promise<string> {
  const { data } = await supabase.from("cars").select("id,title,price,status,km").order("added_at",{ascending:false});
  if (!data?.length) return "📦 Stock vide.";
  const lines = data.map(c => {
    const icon = c.status==="available"?"✅":c.status==="reserved"?"🟡":"❌";
    return `${icon} ${c.title} — ${c.price.toLocaleString("fr-FR")}€\nID: \`${c.id}\``;
  });
  return `📦 *Stock AUTOWEB* (${data.length})\n\n${lines.join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const form  = await req.formData();
  const from  = form.get("From")?.toString() ?? "";
  const body  = form.get("Body")?.toString().trim() ?? "";
  const nMedia = parseInt(form.get("NumMedia")?.toString() ?? "0");
  const lower  = body.toLowerCase();

  // Auth check
  const owner = process.env.OWNER_WHATSAPP ?? "";
  if (owner && !from.includes(owner)) return twilioReply("❌ Non autorisé.");

  // Commands
  if (lower==="stock"||lower==="status") return twilioReply(await getStock());
  if (lower==="annuler"||lower==="cancel") { sessions.delete(from); return twilioReply("✅ Session annulée. Envoyez des photos pour ajouter une voiture."); }

  if (lower.startsWith("vendu "))   { await supabase.from("cars").update({status:"sold"}).eq("id",body.slice(6).trim()); return twilioReply(`✅ Marquée vendue.`); }
  if (lower.startsWith("réservé ")||lower.startsWith("reserve ")) { await supabase.from("cars").update({status:"reserved"}).eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply(`✅ Marquée réservée.`); }
  if (lower.startsWith("dispo "))   { await supabase.from("cars").update({status:"available"}).eq("id",body.slice(6).trim()); return twilioReply(`✅ Remise disponible.`); }
  if (lower.startsWith("supprimer ")||lower.startsWith("delete ")) { await supabase.from("cars").delete().eq("id",body.split(" ").slice(1).join(" ").trim()); return twilioReply(`🗑️ Supprimée.`); }

  // Session
  let s = sessions.get(from);
  if (!s || Date.now()-s.startedAt>3600000) {
    s = { step:"idle", photos:[], partialData:{}, startedAt:Date.now() };
    sessions.set(from, s);
  }

  // Photos
  if (nMedia > 0) {
    const uploaded: string[] = [];
    for (let i=0; i<nMedia; i++) {
      const url  = form.get(`MediaUrl${i}`)?.toString() ?? "";
      const type = form.get(`MediaContentType${i}`)?.toString() ?? "";
      if (!type.startsWith("image/")) continue;
      const buf = await fetchTwilioMedia(url);
      const url2 = await uploadPhoto(buf, `${Date.now()}-${i}.jpg`);
      if (url2) uploaded.push(url2);
      // Try carte grise on first image if no data yet
      if (!s.partialData.year && !s.partialData.title) {
        const cg = await readCarteGrise(buf);
        if (cg.year || cg.title) s.partialData = { ...s.partialData, ...cg };
      }
    }
    s.photos.push(...uploaded);
    s.step = "waiting_details";
    sessions.set(from, s);
    const d = s.partialData;
    const detected = (d.title||d.year) ? `\n\n📋 Détecté: *${d.title??""} ${d.year??""}* · ${d.fuel??"?"}` : "";
    return twilioReply(`📸 *${uploaded.length} photo(s)* reçue(s) (total: ${s.photos.length})${detected}\n\nEnvoyez les détails:\n• Prix (ex: 3200€)\n• KM (ex: 87000km)\n• Boîte (auto/manuelle)\n• Équipements\n\nTapez *"publier"* quand prêt.`);
  }

  // Publish
  if (lower==="publier"||lower==="publish") {
    if (s.photos.length===0) return twilioReply("❌ Pas de photos. Envoyez d'abord des photos.");
    const d = s.partialData;
    if (!d.price) return twilioReply("❌ Prix manquant (ex: 3200€).");
    if (d.km==null) return twilioReply("❌ KM manquant (ex: 87000km).");
    if (!d.title) return twilioReply("❌ Modèle non identifié. Précisez: ex 'Peugeot 208'.");
    const year = d.year ?? new Date().getFullYear();
    const features: string[] = d.features ?? [];
    if (d.guarantee) features.push(`Garantie ${d.guarantee}`);
    if (!features.some((f:string)=>f.toLowerCase().includes("ct"))) features.push("CT OK");
    const car = {
      id: `${(d.title).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${year}-${Date.now().toString(36)}`,
      title: d.title, price: d.price, year, km: d.km,
      fuel: d.fuel??"Essence", gearbox: d.gearbox??"Manuelle",
      images: s.photos,
      description: d.description ?? `${d.title} ${year}. ${(d.km as number).toLocaleString("fr-FR")} km.`,
      budget_tag: budgetTag(d.price), status:"available",
      features, color:d.color??null, doors:d.doors??null,
      power_din:d.power_din??null, co2:d.co2??null,
      equipments:d.equipments??null,
      added_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("cars").insert(car);
    if (error) return twilioReply(`❌ Erreur: ${error.message}`);
    sessions.delete(from);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    return twilioReply(`✅ *Publiée !*\n\n🚗 ${car.title}\n💰 ${car.price.toLocaleString("fr-FR")} € · ${(car.km as number).toLocaleString("fr-FR")} km\n📸 ${s.photos.length} photo(s)\n\n🔗 ${site}/car/${car.id}`);
  }

  // Parse text details
  if (body.length>0 && s.step==="waiting_details") {
    const extracted = await parseDetails(body, s.partialData);
    s.partialData = { ...s.partialData, ...extracted };
    sessions.set(from, s);
    const d = s.partialData;
    const summary = [
      d.title  ? `🚗 ${d.title} ${d.year??""}` : null,
      d.price  ? `💰 ${(d.price as number).toLocaleString("fr-FR")} €` : "❓ Prix manquant",
      d.km!=null?`📍 ${(d.km as number).toLocaleString("fr-FR")} km`:"❓ KM manquant",
      d.fuel   ? `⛽ ${d.fuel}`   : null,
      d.gearbox? `🕹 ${d.gearbox}`: null,
      d.color  ? `🎨 ${d.color}`  : null,
    ].filter(Boolean).join("\n");
    return twilioReply(`📝 *Récap:*\n${summary}\n📸 ${s.photos.length} photo(s)\n\nAjoutez des détails ou tapez *"publier"*.`);
  }

  return twilioReply(`🚗 *AUTOWEB Agent*\n\n📸 Envoyez des photos + carte grise pour ajouter une voiture\n\n*Commandes:*\n• stock · vendu [id] · réservé [id] · dispo [id] · supprimer [id] · annuler`);
}
HEREDOC
echo "  ✓ api/whatsapp/route.ts"

# ── page.tsx (homepage) ────────────────────────────────────
cat > src/app/page.tsx << 'HEREDOC'
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CarCard from "./components/CarCard";

export const revalidate = 60;

async function getData() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ data: cars }, { count }] = await Promise.all([
    sb.from("cars").select("*").eq("status","available").order("added_at",{ascending:false}).limit(6),
    sb.from("cars").select("*",{count:"exact",head:true}).eq("status","available"),
  ]);
  return { cars: cars ?? [], count: count ?? 0 };
}

export default async function Home() {
  const { cars, count } = await getData();
  return (
    <>
      <section className="hero">
        <div className="hero-img-wrap">
          <div className="hero-bg-fallback">🚗</div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-tag">Bondues · Nord</span>
            <h1 className="hero-title">Voitures<br />d&apos;occasion<br /><span>à petit prix</span></h1>
            <p className="hero-sub">Dès <strong style={{color:"#fff"}}>1 900 €</strong> · Garantie 3 mois · CT OK · Paiement 3/4 fois dès 4 000 €</p>
            <div className="hero-actions">
              <Link href="/stock" className="btn btn-accent btn-lg">Voir toutes les annonces</Link>
              <Link href="/contact" className="btn btn-ghost btn-lg">Nous contacter</Link>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          {[[String(count),"En stock"],["3 mois","Garantie"],["CT OK","Contrôle"],["3/4×","Paiement"]].map(([v,l]) => (
            <div key={l} className="hero-stat"><div className="hero-stat-v">{v}</div><div className="hero-stat-l">{l}</div></div>
          ))}
        </div>
      </section>
      <div className="promise-strip">
        <div className="container promise-inner">
          {[["🛡️","Garantie 3 mois","Sur chaque véhicule vendu"],["✅","CT à jour","Livré contrôle technique OK"],["💳","Paiement facile","3 ou 4 fois sans frais"],["📋","Historique complet","Carnet d'entretien fourni"],["📍","Bondues, Nord","2 Allée de la Mannée"]].map(([icon,title,sub]) => (
            <div key={title as string} className="promise-item">
              <span className="promise-icon">{icon}</span>
              <div className="promise-text"><strong>{title}</strong><span>{sub}</span></div>
            </div>
          ))}
        </div>
      </div>
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="section-eyebrow">Stock · Mis à jour en temps réel</p>
            <h2 className="section-title">Nos dernières occasions</h2>
            <p className="section-sub">{count} véhicule{count!==1?"s":""} disponible{count!==1?"s":""}</p>
          </div>
          {cars.length===0 ? (
            <div className="empty"><div className="empty-icon">🚗</div><h3>Stock en cours de mise à jour</h3><p>Revenez bientôt ou contactez-nous directement.</p></div>
          ) : (
            <div className="cars-grid">{cars.map((car:any) => <CarCard key={car.id} car={car} />)}</div>
          )}
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <Link href="/stock" className="btn btn-accent btn-lg">Consulter toutes les annonces →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
HEREDOC
echo "  ✓ page.tsx"

# ── CarCard ────────────────────────────────────────────────
cat > src/app/components/CarCard.tsx << 'HEREDOC'
import Link from "next/link";
export default function CarCard({ car }: { car: any }) {
  const isSold=car.status==="sold", isReserved=car.status==="reserved";
  return (
    <Link href={isSold?"#":`/car/${car.id}`} className="car-card" style={isSold?{pointerEvents:"none",opacity:.5}:{}}>
      <div className="car-card-img">
        {car.images?.[0] ? <img src={car.images[0]} alt={car.title} loading="lazy" /> : <div className="car-no-img">🚗</div>}
        <div className="car-badge-wrap">
          {isReserved?<span className="car-badge badge-reserved">Réservé</span>:isSold?<span className="car-badge badge-sold">Vendu</span>:<span className="car-badge badge-budget">{car.budget_tag}</span>}
        </div>
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel} · {car.gearbox}{car.color?` · ${car.color}`:""}</p>
        <p className="car-title">{car.title}</p>
        <p className="car-specs"><span>{car.year}</span>&nbsp;·&nbsp;<span>{car.km?.toLocaleString("fr-FR")} km</span>{car.power_din?<>&nbsp;·&nbsp;<span>{car.power_din} ch</span></>:null}</p>
        <div className="car-features">{(car.features??[]).slice(0,3).map((f:string)=><span key={f} className="car-feat">{f}</span>)}</div>
        <p className="car-price">{car.price?.toLocaleString("fr-FR")} €<span className="car-price-ttc">TTC</span></p>
      </div>
      <div className="car-card-footer">
        <div className="btn btn-accent btn-full" style={{fontSize:"12px",padding:"10px"}}>Voir ce véhicule →</div>
      </div>
    </Link>
  );
}
HEREDOC
echo "  ✓ CarCard.tsx"

# ── stock/page.tsx ─────────────────────────────────────────
cat > src/app/stock/page.tsx << 'HEREDOC'
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import CarCard from "../components/CarCard";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function StockPage() {
  const [all,setAll]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(""); const [budget,setBudget]=useState(""); const [fuel,setFuel]=useState(""); const [gearbox,setGearbox]=useState(""); const [status,setStatus]=useState("available");
  useEffect(()=>{ sb.from("cars").select("*").order("added_at",{ascending:false}).then(({data})=>{setAll(data??[]);setLoading(false);}); },[]);
  const filtered=useMemo(()=>all.filter(c=>{
    if(status!=="all"&&c.status!==status)return false;
    if(budget&&c.budget_tag!==budget)return false;
    if(fuel&&c.fuel!==fuel)return false;
    if(gearbox&&c.gearbox!==gearbox)return false;
    if(search){const q=search.toLowerCase();return c.title?.toLowerCase().includes(q)||c.description?.toLowerCase().includes(q);}
    return true;
  }),[all,search,budget,fuel,gearbox,status]);
  const reset=()=>{setSearch("");setBudget("");setFuel("");setGearbox("");setStatus("available");};
  const hasFilters=!!(search||budget||fuel||gearbox||status!=="available");
  return (
    <section className="section"><div className="container">
      <div className="section-head"><p className="section-eyebrow">Bondues · Livraison possible</p><h1 className="section-title">Nos annonces</h1><p className="section-sub">Stock mis à jour en temps réel</p></div>
      <div className="filters-wrap">
        <input className="filter-input" placeholder="🔍  Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="filter-select" value={budget} onChange={e=>setBudget(e.target.value)}><option value="">💰  Tous budgets</option><option value="< 2000 €">&lt; 2 000 €</option><option value="2000-4000 €">2 000 – 4 000 €</option><option value="≥ 4000 €">≥ 4 000 €</option></select>
        <select className="filter-select" value={fuel} onChange={e=>setFuel(e.target.value)}><option value="">⛽  Carburant</option><option value="Essence">Essence</option><option value="Diesel">Diesel</option><option value="Hybride">Hybride</option><option value="Électrique">Électrique</option></select>
        <select className="filter-select" value={gearbox} onChange={e=>setGearbox(e.target.value)}><option value="">🕹  Boîte</option><option value="Manuelle">Manuelle</option><option value="Automatique">Automatique</option></select>
        <select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="available">Disponibles</option><option value="reserved">Réservées</option><option value="all">Tous statuts</option></select>
        <span className="filters-count">{loading?"…":`${filtered.length} résultat${filtered.length!==1?"s":""}`}</span>
        {hasFilters&&<button className="btn-reset" onClick={reset}>✕ Effacer</button>}
      </div>
      {loading?<div className="empty"><div className="empty-icon">⏳</div><h3>Chargement…</h3></div>:filtered.length===0?<div className="empty"><div className="empty-icon">🔍</div><h3>Aucun résultat</h3><button className="btn btn-ghost" style={{marginTop:"20px"}} onClick={reset}>Voir tout</button></div>:(
        <div className="cars-grid">{filtered.map(car=><CarCard key={car.id} car={car} />)}</div>
      )}
    </div></section>
  );
}
HEREDOC
echo "  ✓ stock/page.tsx"

# ── car/[id]/page.tsx ──────────────────────────────────────
mkdir -p "src/app/car/[id]"
cat > "src/app/car/[id]/page.tsx" << 'HEREDOC'
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
export const revalidate = 60;
async function getCar(id:string){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const{data}=await sb.from("cars").select("*").eq("id",id).single();
  return data;
}
export async function generateStaticParams(){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const{data}=await sb.from("cars").select("id");
  return(data??[]).map((r:any)=>({id:r.id}));
}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const{id}=await params; const car=await getCar(id);
  if(!car)return{title:"Voiture non trouvée"};
  return{title:`${car.title} — ${car.price.toLocaleString("fr-FR")} € | AUTOWEB`,description:car.description};
}
export default async function CarDetailPage({params}:{params:Promise<{id:string}>}){
  const{id}=await params; const car=await getCar(id); if(!car)notFound();
  const isAvailable=car.status==="available";
  const statusColor=car.status==="available"?"var(--accent)":car.status==="reserved"?"#f59e0b":"var(--gray)";
  const statusLabel=car.status==="available"?"Disponible":car.status==="reserved"?"Réservé":"Vendu";
  const images:string[]=car.images??[]; const features:string[]=car.features??[]; const equipments:string[]=car.equipments??[];
  const specs=[["Année",String(car.year)],["Kilométrage",`${car.km?.toLocaleString("fr-FR")} km`],["Carburant",car.fuel],["Boîte",car.gearbox],car.power_din?["Puissance",`${car.power_din} ch`]:null,car.power_fiscal?["Puissance fiscale",`${car.power_fiscal} cv`]:null,car.doors?["Portes",String(car.doors)]:null,car.co2?["CO₂",`${car.co2} g/km`]:null,car.color?["Couleur",car.color]:null,car.guarantee?["Garantie",car.guarantee]:null].filter(Boolean) as [string,string][];
  return(
    <section className="section"><div className="container">
      <Link href="/stock" className="back-link">← Retour aux annonces</Link>
      <div className="detail-wrap">
        <div>
          <div className="detail-img-main">{images[0]?<img src={images[0]} alt={car.title}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"64px",background:"var(--bg3)"}}>🚗</div>}</div>
          {images.length>1&&<div className="detail-thumbs">{images.slice(1,6).map((img:string,i:number)=><div key={i} className="detail-thumb"><img src={img} alt={`${car.title} ${i+2}`}/></div>)}</div>}
        </div>
        <div>
          <p className="detail-brand">{car.fuel} · {car.gearbox}{car.color?` · ${car.color}`:""}</p>
          <h1 className="detail-title">{car.title}</h1>
          <div className="detail-status"><span className="status-dot" style={{background:statusColor}}/><span style={{color:statusColor}}>{statusLabel}</span><span style={{color:"var(--gray)",marginLeft:"8px"}}>{car.budget_tag}</span></div>
          <p className="detail-price">{car.price?.toLocaleString("fr-FR")} €<span style={{fontSize:"16px",color:"var(--gray)",fontWeight:400,marginLeft:"8px"}}>TTC</span></p>
          <div className="detail-specs-grid">{specs.map(([l,v])=><div key={l} className="spec-box"><p className="spec-box-label">{l}</p><p className="spec-box-value">{v}</p></div>)}</div>
          {features.length>0&&<div className="detail-feats">{features.map((f:string)=><span key={f} className="car-feat">{f}</span>)}</div>}
          {car.description&&<div className="detail-desc">{car.description}</div>}
          {isAvailable?(
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <Link href={`/contact?voiture=${encodeURIComponent(car.title)}&prix=${car.price}`} className="btn btn-accent btn-full btn-lg">🎯 Réserver ce véhicule</Link>
              <a href="https://wa.me/33698765432" className="btn btn-ghost btn-full">💬 WhatsApp — Réponse rapide</a>
              <a href="tel:0698765432" className="btn btn-ghost btn-full">📞 06 98 76 54 32</a>
            </div>
          ):(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"20px",textAlign:"center",color:"var(--gray)"}}>
              Ce véhicule n&apos;est plus disponible.{" "}<Link href="/stock" style={{color:"var(--accent)",fontWeight:600}}>Voir le stock →</Link>
            </div>
          )}
        </div>
      </div>
      {equipments.length>0&&(
        <div style={{marginTop:"48px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"32px"}}>
          <h2 style={{fontFamily:"var(--font-head)",fontSize:"20px",fontWeight:700,textTransform:"uppercase",color:"var(--white)",marginBottom:"20px",letterSpacing:".04em"}}>Équipements et options</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"10px"}}>
            {equipments.map((eq:string)=><div key={eq} style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"rgba(255,255,255,.8)"}}><span style={{color:"var(--accent)",fontWeight:700}}>✓</span>{eq}</div>)}
          </div>
        </div>
      )}
    </div></section>
  );
}
HEREDOC
echo "  ✓ car/[id]/page.tsx"

# 4. Add OWNER_WHATSAPP to Vercel env reminder
echo ""
echo "⚠️  Add these to Vercel Environment Variables:"
echo "   OWNER_WHATSAPP = 33783809694"
echo "   NEXT_PUBLIC_SITE_URL = https://autoweb-commerce-auto-nices-projects-16752daa.vercel.app"
echo ""

# 5. Push to git
git add -A
git commit -m "feat: Supabase DB + WhatsApp agent with Claude vision"
git push origin main

echo ""
echo "✅ Deployed! Now set the Twilio webhook:"
echo "   URL: https://autoweb-commerce-auto-nices-projects-16752daa.vercel.app/api/whatsapp"
echo "   Method: POST"
echo ""
echo "📱 Test on WhatsApp:"
echo "   Send 'stock' → see your inventory"
echo "   Send photos + carte grise → add a car"
echo "   Send 'publier' → publish it live"

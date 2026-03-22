"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import CarCard from "../components/CarCard";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function StockPage() {
  const [all,setAll]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(""); const [budget,setBudget]=useState(""); const [fuel,setFuel]=useState(""); const [gearbox,setGearbox]=useState(""); const [status,setStatus]=useState("all");
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

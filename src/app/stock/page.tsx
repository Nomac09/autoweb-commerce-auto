"use client";
import { useState, useMemo } from "react";
import { cars } from "../data/cars";
import CarCard from "../components/CarCard";

export default function StockPage() {
  const [search,  setSearch]  = useState("");
  const [budget,  setBudget]  = useState("");
  const [fuel,    setFuel]    = useState("");
  const [gearbox, setGearbox] = useState("");
  const [status,  setStatus]  = useState("available");

  const filtered = useMemo(() =>
    cars.filter((car) => {
      if (status !== "all" && car.status !== status) return false;
      if (budget && car.budgetTag !== budget) return false;
      if (fuel   && car.fuel    !== fuel)     return false;
      if (gearbox && car.gearbox !== gearbox) return false;
      if (search) {
        const q = search.toLowerCase();
        return car.title.toLowerCase().includes(q) || car.description.toLowerCase().includes(q);
      }
      return true;
    }),
    [search, budget, fuel, gearbox, status]
  );

  const reset = () => { setSearch(""); setBudget(""); setFuel(""); setGearbox(""); setStatus("available"); };
  const hasFilters = !!(search || budget || fuel || gearbox || status !== "available");

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="section-eyebrow">Bondues · Livraison possible</p>
          <h1 className="section-title">Nos annonces</h1>
          <p className="section-sub">Stock mis à jour quotidiennement</p>
        </div>
        <div className="filters-wrap">
          <input className="filter-input" placeholder="🔍  Rechercher (Peugeot, Clio…)" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">💰  Tous budgets</option>
            <option value="< 2000 €">&lt; 2 000 €</option>
            <option value="2000-4000 €">2 000 – 4 000 €</option>
            <option value="≥ 4000 €">≥ 4 000 €</option>
          </select>
          <select className="filter-select" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">⛽  Carburant</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
          <select className="filter-select" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
            <option value="">🕹  Boîte</option>
            <option value="Manuelle">Manuelle</option>
            <option value="Automatique">Automatique</option>
          </select>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="available">Disponibles</option>
            <option value="reserved">Réservées</option>
            <option value="all">Tous statuts</option>
          </select>
          <span className="filters-count">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && <button className="btn-reset" onClick={reset}>✕ Effacer</button>}
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h3>Aucun résultat</h3>
            <p style={{marginBottom:"24px"}}>Essayez d&apos;autres filtres ou revenez bientôt.</p>
            <button className="btn btn-ghost" onClick={reset}>Voir toutes les annonces</button>
          </div>
        ) : (
          <div className="cars-grid">
            {filtered.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { getLatestCars, getAvailableCars } from "./data/cars";
import CarCard from "./components/CarCard";

export default function Home() {
  const latest    = getLatestCars(6);
  const available = getAvailableCars();
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
          {[
            [String(available.length), "En stock"],
            ["3 mois",  "Garantie"],
            ["CT OK",   "Contrôle"],
            ["3/4×",    "Paiement"],
          ].map(([v, l]) => (
            <div key={l} className="hero-stat">
              <div className="hero-stat-v">{v}</div>
              <div className="hero-stat-l">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="promise-strip">
        <div className="container promise-inner">
          {[
            ["🛡️","Garantie 3 mois","Sur chaque véhicule vendu"],
            ["✅","CT à jour","Livré contrôle technique OK"],
            ["💳","Paiement facile","3 ou 4 fois sans frais"],
            ["📋","Historique complet","Carnet d'entretien fourni"],
            ["📍","Bondues, Nord","2 Allée de la Mannée"],
          ].map(([icon, title, sub]) => (
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
            <p className="section-eyebrow">Stock · Mis à jour quotidiennement</p>
            <h2 className="section-title">Nos dernières occasions</h2>
            <p className="section-sub">{available.length} véhicule{available.length !== 1 ? "s" : ""} disponible{available.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="cars-grid">
            {latest.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <Link href="/stock" className="btn btn-accent btn-lg">Consulter toutes les annonces →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

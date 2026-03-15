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

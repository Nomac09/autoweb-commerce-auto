import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CarCard from "./components/CarCard";
import HeroCarousel from "./components/HeroCarousel";

export const revalidate = 60;

async function getData() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [{ data: cars }, { count }] = await Promise.all([
    sb.from("cars").select("*").eq("status", "available").order("sort_order", { ascending: true, nullsFirst: false }).order("added_at", { ascending: false }).limit(6),
    sb.from("cars").select("*", { count: "exact", head: true }).eq("status", "available"),
  ]);
  return { cars: cars ?? [], count: count ?? 0 };
}

export default async function Home() {
  const { cars, count } = await getData();
  return (
    <>
      <HeroCarousel count={count} />

      <div className="promise-strip">
        <div className="container promise-inner">
          {([
            ["Garantie 3 mois", "Sur chaque véhicule vendu"],
            ["CT à jour", "Livré contrôle technique OK"],
            ["Paiement facile", "3 ou 4 fois sans frais"],
            ["Historique complet", "Carnet d entretien fourni"],
          ] as [string, string][]).map(([title, sub]) => (
            <div key={title} className="promise-item">
              <div className="promise-icon" />
              <div className="promise-text"><strong>{title}</strong><span>{sub}</span></div>
            </div>
          ))}
        </div>
      </div>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="section-eyebrow">Stock mis à jour quotidiennement</p>
              <h2 className="section-title">Dernières occasions</h2>
              <p className="section-sub">{count} véhicule{count !== 1 ? "s" : ""} disponible{count !== 1 ? "s" : ""}</p>
            </div>
            <Link href="/stock" className="btn btn-ghost">Tout le stock →</Link>
          </div>
          {cars.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">—</div>
              <h3>Stock en cours de mise à jour</h3>
              <p>Revenez bientôt ou contactez-nous directement.</p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car: any) => <CarCard key={car.id} car={car} />)}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/stock" className="btn btn-accent btn-lg">Consulter toutes les annonces →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

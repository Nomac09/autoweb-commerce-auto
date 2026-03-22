import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Gallery from "../../components/Gallery";

export const revalidate = 60;

async function getCar(id: string) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("cars").select("*").eq("id", id).single();
  return data;
}

export async function generateStaticParams() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("cars").select("id");
  return (data ?? []).map((r: any) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) return { title: "Voiture non trouvée" };
  return {
    title: `${car.title} — ${car.price?.toLocaleString("fr-FR")} € TTC | AUTOWEB`,
    description: car.description,
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  const isAvailable = car.status === "available";
  const statusColor = car.status === "available" ? "var(--accent)" : car.status === "reserved" ? "#f59e0b" : "var(--gray)";
  const statusLabel = car.status === "available" ? "Disponible" : car.status === "reserved" ? "Réservé" : "Vendu";
  const images: string[]     = car.images     ?? [];
  const features: string[]   = car.features   ?? [];
  const equipments: string[] = car.equipments ?? [];

  const specs = [
    ["Année",            String(car.year)],
    ["Kilométrage",      `${car.km?.toLocaleString("fr-FR")} km`],
    ["Carburant",        car.fuel],
    ["Boîte",            car.gearbox],
    car.power_din    ? ["Puissance",         `${car.power_din} ch`]         : null,
    car.power_fiscal ? ["Puissance fiscale", `${car.power_fiscal} cv`]      : null,
    car.doors        ? ["Portes",            String(car.doors)]              : null,
    car.co2          ? ["CO₂",              `${car.co2} g/km`]              : null,
    car.color        ? ["Couleur",           car.color]                      : null,
    car.guarantee    ? ["Garantie",          car.guarantee]                  : null,
  ].filter(Boolean) as [string, string][];

  return (
    <section className="section">
      <div className="container">
        <Link href="/stock" className="back-link">← Retour aux annonces</Link>
        <div className="detail-wrap">

          {/* Gallery with lightbox */}
          <Gallery images={images} title={car.title} />

          {/* Info */}
          <div>
            <p className="detail-brand">{car.fuel} · {car.gearbox}{car.color ? ` · ${car.color}` : ""}</p>
            <h1 className="detail-title">{car.title}</h1>
            <div className="detail-status">
              <span className="status-dot" style={{ background: statusColor }} />
              <span style={{ color: statusColor }}>{statusLabel}</span>
              <span style={{ color: "var(--gray)", marginLeft: "8px" }}>{car.budget_tag}</span>
            </div>
            <p className="detail-price">
              {car.price?.toLocaleString("fr-FR")} €
              <span style={{ fontSize: "16px", color: "var(--gray)", fontWeight: 400, marginLeft: "8px" }}>TTC</span>
            </p>

            <div className="detail-specs-grid">
              {specs.map(([l, v]) => (
                <div key={l} className="spec-box">
                  <p className="spec-box-label">{l}</p>
                  <p className="spec-box-value">{v}</p>
                </div>
              ))}
            </div>

            {features.length > 0 && (
              <div className="detail-feats">
                {features.map((f: string) => <span key={f} className="car-feat">{f}</span>)}
              </div>
            )}

            {car.description && <div className="detail-desc">{car.description}</div>}

            {isAvailable ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href={`/contact?voiture=${encodeURIComponent(car.title)}&prix=${car.price}`} className="btn btn-accent btn-full btn-lg">
                  🎯 Réserver ce véhicule
                </Link>
                <a href="https://wa.me/33783809694" className="btn btn-ghost btn-full">💬 WhatsApp — Réponse rapide</a>
                <a href="tel:0783809694" className="btn btn-ghost btn-full">📞 06 98 76 54 32</a>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", textAlign: "center", color: "var(--gray)" }}>
                Ce véhicule n&apos;est plus disponible.{" "}
                <Link href="/stock" style={{ color: "var(--accent)", fontWeight: 600 }}>Voir le stock →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Equipment section */}
        {equipments.length > 0 && (
          <div style={{ marginTop: "48px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700, textTransform: "uppercase", color: "var(--white)", marginBottom: "20px", letterSpacing: ".04em" }}>
              Équipements et options
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "10px" }}>
              {equipments.map((eq: string) => (
                <div key={eq} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,.8)" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span> {eq}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

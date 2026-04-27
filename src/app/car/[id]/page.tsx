import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Gallery from "../../components/Gallery";

export const dynamic = "force-dynamic";

async function getCar(id: string) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("cars").select("*").eq("id", id).single();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) return { title: "Voiture non trouvee" };
  return {
    title: car.title + " — " + car.price?.toLocaleString("fr-FR") + " € TTC",
    description: car.description,
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  const isAvailable = car.status === "available";
  const statusColor = car.status === "available" ? "#4ade80" : car.status === "reserved" ? "#d4a843" : "var(--silver2)";
  const statusLabel = car.status === "available" ? "Disponible" : car.status === "reserved" ? "Reserve" : "Vendu";
  const images: string[] = car.images ?? [];
  const features: string[] = car.features ?? [];
  const equipments: string[] = car.equipments ?? [];

  const specs = [
    ["Annee", String(car.year)],
    ["Kilometrage", car.km?.toLocaleString("fr-FR") + " km"],
    ["Carburant", car.fuel],
    ["Boite", car.gearbox],
    car.power_din    ? ["Puissance",         car.power_din + " ch"]    : null,
    car.power_fiscal ? ["Puissance fiscale", car.power_fiscal + " cv"] : null,
    car.doors        ? ["Portes",            String(car.doors)]         : null,
    car.co2          ? ["CO2",               car.co2 + " g/km"]        : null,
    car.color        ? ["Couleur",           car.color]                 : null,
    car.guarantee    ? ["Garantie",          car.guarantee]             : null,
  ].filter(Boolean) as [string, string][];

  return (
    <section className="section">
      <div className="container">
        <Link href="/stock" className="back-link">← Retour aux annonces</Link>

        <div className="detail-wrap">
          <Gallery images={images} title={car.title} />

          <div>
            <p className="detail-brand">{car.fuel}{car.gearbox ? " · " + car.gearbox : ""}{car.color ? " · " + car.color : ""}</p>
            <h1 className="detail-title">{car.title}</h1>
            <div className="detail-status">
              <span className="status-dot" style={{ background: statusColor }} />
              <span style={{ color: statusColor, fontSize: "11px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>{statusLabel}</span>
            </div>

            <p className="detail-price">
              {car.price?.toLocaleString("fr-FR")} €
              <span style={{ fontSize: "14px", color: "var(--silver2)", fontWeight: 400, marginLeft: "8px", fontFamily: "var(--font-body)" }}>TTC</span>
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
                <Link href={"/contact?voiture=" + encodeURIComponent(car.title) + "&prix=" + car.price} className="btn btn-accent btn-full btn-lg">
                  Reserver ce vehicule
                </Link>
                <a href="https://wa.me/33783809694" className="btn btn-ghost btn-full">WhatsApp — Reponse rapide</a>
                <a href="tel:0783809694" className="btn btn-ghost btn-full">07 83 80 96 94</a>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", textAlign: "center", color: "var(--silver2)" }}>
                Ce vehicule nest plus disponible.{" "}
                <Link href="/stock" style={{ color: "var(--white)", fontWeight: 600 }}>Voir le stock →</Link>
              </div>
            )}
          </div>
        </div>

        {equipments.length > 0 && (
          <div style={{ marginTop: "64px", borderTop: "1px solid var(--border)", paddingTop: "48px" }}>
            <p className="section-eyebrow" style={{ marginBottom: "24px" }}>Equipements et options</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
              {equipments.map((eq: string) => (
                <div key={eq} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--silver)" }}>
                  <span style={{ color: "var(--gold)", fontSize: "10px" }}>◆</span> {eq}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

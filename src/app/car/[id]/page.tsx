import { notFound } from "next/navigation";
import Link from "next/link";
import { cars, getCarById } from "../../data/cars";
import type { Metadata } from "next";

export async function generateStaticParams() { return cars.map((car) => ({ id: car.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) return { title: "Voiture non trouvée" };
  return { title: `${car.title} — ${car.price.toLocaleString("fr-FR")} € | AUTOWEB`, description: car.description };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) notFound();
  const isAvailable = car.status === "available";
  const statusColor = car.status === "available" ? "var(--accent)" : car.status === "reserved" ? "#f59e0b" : "var(--gray)";
  const statusLabel = car.status === "available" ? "Disponible" : car.status === "reserved" ? "Réservé" : "Vendu";
  return (
    <section className="section">
      <div className="container">
        <Link href="/stock" className="back-link">← Retour aux annonces</Link>
        <div className="detail-wrap">
          <div>
            <div className="detail-img-main">
              {car.images[0]
                ? <img src={car.images[0]} alt={car.title} />
                : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"64px",background:"var(--bg3)"}}>🚗</div>
              }
            </div>
            {car.images.length > 1 && (
              <div className="detail-thumbs">
                {car.images.slice(1).map((img, i) => (
                  <div key={i} className="detail-thumb"><img src={img} alt={`${car.title} ${i+2}`} /></div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="detail-brand">{car.fuel} · {car.gearbox}</p>
            <h1 className="detail-title">{car.title}</h1>
            <div className="detail-status">
              <span className="status-dot" style={{background:statusColor}} />
              <span style={{color:statusColor}}>{statusLabel}</span>
              <span style={{color:"var(--gray)",marginLeft:"8px"}}>{car.budgetTag}</span>
            </div>
            <p className="detail-price">{car.price.toLocaleString("fr-FR")} €<span style={{fontSize:"16px",color:"var(--gray)",fontWeight:400,marginLeft:"8px"}}>TTC</span></p>
            <div className="detail-specs-grid">
              {[["Année",String(car.year)],["Kilométrage",`${car.km.toLocaleString("fr-FR")} km`],["Carburant",car.fuel],["Boîte",car.gearbox]].map(([l,v]) => (
                <div key={l} className="spec-box"><p className="spec-box-label">{l}</p><p className="spec-box-value">{v}</p></div>
              ))}
            </div>
            <div className="detail-feats">{car.features.map((f) => <span key={f} className="car-feat">{f}</span>)}</div>
            <div className="detail-desc">{car.description}</div>
            {isAvailable ? (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <Link href={`/contact?voiture=${encodeURIComponent(car.title)}&prix=${car.price}`} className="btn btn-accent btn-full btn-lg">🎯 Réserver ce véhicule</Link>
                <a href="https://wa.me/33698765432" className="btn btn-ghost btn-full">💬 WhatsApp — Réponse rapide</a>
                <a href="tel:0698765432" className="btn btn-ghost btn-full">📞 06 98 76 54 32</a>
              </div>
            ) : (
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"20px",textAlign:"center",color:"var(--gray)"}}>
                Ce véhicule n&apos;est plus disponible.{" "}
                <Link href="/stock" style={{color:"var(--accent)",fontWeight:600}}>Voir le stock →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

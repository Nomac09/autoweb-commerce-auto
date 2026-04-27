import Link from "next/link";

export default function CarCard({ car }: { car: any }) {
  const isSold = car.status === "sold";
  const isReserved = car.status === "reserved";
  return (
    <Link href={`/car/${car.id}`} className="car-card">
      <div className="car-card-img">
        {car.images?.[0] ? (
          <img src={car.images[0]} alt={car.title} loading="lazy" />
        ) : (
          <img
            src="https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/images-1.png"
            alt="Photo à venir"
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "var(--bg3)", padding: "20px", opacity: .25 }}
          />
        )}
        {isReserved && (
          <div className="status-overlay">
            <span className="status-tag tag-reserved">Réservé</span>
          </div>
        )}
        {isSold && (
          <div className="status-overlay">
            <span className="status-tag tag-sold">Vendu</span>
          </div>
        )}
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel}{car.gearbox ? ` · ${car.gearbox}` : ""}{car.color ? ` · ${car.color}` : ""}</p>
        <p className="car-title">{car.title}</p>
        <div className="car-specs">
          <span>{car.year}</span>
          <span style={{ borderLeft: "1px solid var(--border2)", paddingLeft: "10px" }}>{car.km?.toLocaleString("fr-FR")} km</span>
          {car.power_din && <span style={{ borderLeft: "1px solid var(--border2)", paddingLeft: "10px" }}>{car.power_din} ch</span>}
        </div>
        {(car.features ?? []).length > 0 && (
          <div className="car-features">
            {(car.features ?? []).slice(0, 3).map((f: string) => (
              <span key={f} className="car-feat">{f}</span>
            ))}
          </div>
        )}
        <p className="car-price">
          {car.price?.toLocaleString("fr-FR")} €<span className="car-price-ttc">TTC</span>
        </p>
      </div>
      <div className="car-card-footer">
        <span className="car-card-link">Voir ce véhicule</span>
        <span style={{ color: "var(--silver2)", fontSize: "16px", transition: "var(--t)" }}>→</span>
      </div>
    </Link>
  );
}

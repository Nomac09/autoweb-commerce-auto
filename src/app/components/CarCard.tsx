import Link from "next/link";
import { Car } from "../data/cars";

export default function CarCard({ car }: { car: Car }) {
  const isSold     = car.status === "sold";
  const isReserved = car.status === "reserved";
  return (
    <Link
      href={isSold ? "#" : `/car/${car.id}`}
      className="car-card"
      style={isSold ? { pointerEvents: "none", opacity: 0.5 } : {}}
    >
      <div className="car-card-img">
        {car.images[0]
          ? <img src={car.images[0]} alt={car.title} loading="lazy" />
          : <div className="car-no-img">🚗</div>
        }
        <div className="car-badge-wrap">
          {isReserved ? <span className="car-badge badge-reserved">Réservé</span>
          : isSold    ? <span className="car-badge badge-sold">Vendu</span>
          :             <span className="car-badge badge-budget">{car.budgetTag}</span>}
        </div>
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel} · {car.gearbox}</p>
        <p className="car-title">{car.title}</p>
        <p className="car-specs">
          <span>{car.year}</span>&nbsp;·&nbsp;<span>{car.km.toLocaleString("fr-FR")} km</span>
        </p>
        <div className="car-features">
          {car.features.slice(0, 3).map((f) => <span key={f} className="car-feat">{f}</span>)}
        </div>
        <p className="car-price">{car.price.toLocaleString("fr-FR")} €<span className="car-price-ttc">TTC</span></p>
      </div>
      <div className="car-card-footer">
        <div className="btn btn-accent btn-full" style={{ fontSize: "12px", padding: "10px" }}>
          Voir ce véhicule →
        </div>
      </div>
    </Link>
  );
}

import Reveal from "../components/Reveal";
import CarCard from "../components/CarCard";
import { getAllCars } from "@/lib/cars";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notre stock - AUTOWEB COMMERCE | Bondues, Lille",
  description:
    "Véhicules d'occasion disponibles chez AUTOWEB COMMERCE à Bondues, près de Lille.",
};

export default async function StockPage() {
  const cars = await getAllCars();
  const availableCount = cars.filter((c) => c.status === "available").length;

  return (
    <div className="min-h-screen bg-anthracite">
      <div className="border-b border-hairline px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <Reveal onLoad i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-3">
              Bondues · Lille
            </p>
          </Reveal>
          <Reveal onLoad i={1}>
            <h1 className="font-display text-4xl md:text-5xl text-bone">Notre stock</h1>
          </Reveal>
          <Reveal onLoad i={2}>
            <p className="mt-3 text-muted text-sm">
              {availableCount} véhicule{availableCount > 1 ? "s" : ""} disponible
              {availableCount > 1 ? "s" : ""}
              {cars.length > availableCount
                ? ` · ${cars.length} au total`
                : ""}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14">
        {cars.length === 0 ? (
          <p className="text-muted text-sm">Aucun véhicule pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

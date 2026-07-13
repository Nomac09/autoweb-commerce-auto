import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Gauge, Fuel, Settings2, Calendar, Palette } from "lucide-react";
import type { Metadata } from "next";
import Reveal from "../../components/Reveal";
import Gallery from "../../components/Gallery";
import { getCarBySlug } from "@/lib/cars";
import { formatPrice, formatKm } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Véhicule introuvable - AUTOWEB COMMERCE" };
  return {
    title: `${car.make} ${car.model}${car.version ? " " + car.version : ""} (${car.year}) - AUTOWEB COMMERCE`,
    description: `${car.make} ${car.model} ${car.year}${car.mileage_km ? ", " + formatKm(car.mileage_km) : ""}${car.fuel ? ", " + car.fuel : ""}. Bondues, Lille.`,
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const sold = car.status === "sold";
  const reserved = car.status === "reserved";

  const specs = [
    car.registration_date && { icon: Calendar, label: "Mise en circulation", value: car.registration_date },
    car.mileage_km != null && { icon: Gauge, label: "Kilométrage", value: formatKm(car.mileage_km) },
    car.fuel && { icon: Fuel, label: "Énergie", value: car.fuel },
    car.gearbox && { icon: Settings2, label: "Boîte", value: car.gearbox },
    car.color && { icon: Palette, label: "Couleur", value: car.color },
    car.ct_valid_until && { icon: Calendar, label: "Contrôle technique", value: `Valide jusqu'au ${new Date(car.ct_valid_until).toLocaleDateString("fr-FR")}` },
  ].filter(Boolean) as { icon: typeof Gauge; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-anthracite">
      <div className="border-b border-hairline px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/stock"
            className="inline-flex items-center gap-2 text-muted text-xs uppercase tracking-widest hover:text-bone transition-colors"
          >
            <ArrowLeft size={14} /> Stock
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <Reveal onLoad>
          <Gallery
            photos={car.photos ?? []}
            alt={`${car.make} ${car.model}`}
            overlay={sold ? "Vendu" : reserved ? "Réservé" : undefined}
          />
        </Reveal>

        {/* Info */}
        <div className="flex flex-col gap-8">
          <Reveal onLoad i={1}>
            <div>
              {(sold || reserved) && (
                <span className="inline-block border border-bone/60 text-bone text-[0.6rem] uppercase tracking-[0.2em] px-3 py-1 mb-4">
                  {sold ? "Vendu" : "Réservé"}
                </span>
              )}
              <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-2">
                {car.year}
                {car.fuel ? ` · ${car.fuel}` : ""}
                {car.power_hp ? ` · ${car.power_hp} ch` : ""}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-bone leading-tight">
                {car.make} {car.model}
              </h1>
              {car.version && <p className="text-muted mt-1">{car.version}</p>}
            </div>
          </Reveal>

          {/* Price — hidden for sold vehicles */}
          <Reveal i={2}>
            <div className="border-t border-b border-hairline py-6">
              {sold ? (
                <p className="font-display text-2xl text-muted">Véhicule vendu</p>
              ) : car.price_eur != null ? (
                <>
                  <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-1">
                    Prix
                  </p>
                  <p className="font-display text-4xl text-bone">
                    {formatPrice(car.price_eur)}{" "}
                    <span className="text-lg text-muted">TTC</span>
                  </p>
                </>
              ) : (
                <p className="font-display text-2xl text-bone">Prix : nous consulter</p>
              )}
            </div>
          </Reveal>

          {/* Specs */}
          {specs.length > 0 && (
            <Reveal i={3}>
              <div className="grid grid-cols-2 gap-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-surface border border-hairline rounded-sm p-4 flex gap-3 items-start"
                  >
                    <Icon size={16} className="text-oxblood mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted text-[0.6rem] uppercase tracking-widest">{label}</p>
                      <p className="text-bone text-sm mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Options */}
          {car.options && car.options.length > 0 && (
            <Reveal i={4}>
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-3">
                  Équipements
                </p>
                <div className="flex flex-wrap gap-2">
                  {car.options.map((opt) => (
                    <span
                      key={opt}
                      className="border border-hairline text-bone text-xs px-3 py-1.5 rounded-full"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* CTA — reservation CTA only for cars that are not sold */}
          <Reveal i={5}>
            <div className="flex flex-wrap gap-3 pt-2">
              {!sold && (
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-7 py-3.5 text-sm hover:brightness-110 transition"
                >
                  Demander ce véhicule <ArrowRight size={16} />
                </Link>
              )}
              <Link
                href="/stock"
                className="inline-flex items-center gap-2 border border-hairline text-bone rounded-full px-7 py-3.5 text-sm hover:border-muted transition"
              >
                Retour au stock
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

const vehicles = [
  { slug: "bmw-serie-5-530d-2021", make: "BMW", model: "Série 5", version: "530d xDrive", year: 2021, price: 42900, mileage: 58000, fuel: "Diesel", gearbox: "Automatique", power_hp: 286, status: "Disponible" },
  { slug: "audi-a6-45-tfsi-2020", make: "Audi", model: "A6", version: "45 TFSI S line", year: 2020, price: 37500, mileage: 72000, fuel: "Essence", gearbox: "Automatique", power_hp: 245, status: "Disponible" },
  { slug: "mercedes-classe-c-220d-2022", make: "Mercedes", model: "Classe C", version: "220d AMG Line", year: 2022, price: 51200, mileage: 31000, fuel: "Diesel", gearbox: "Automatique", power_hp: 200, status: "Disponible" },
  { slug: "volkswagen-passat-20-tdi-2021", make: "Volkswagen", model: "Passat", version: "2.0 TDI 150 DSG", year: 2021, price: 28900, mileage: 64000, fuel: "Diesel", gearbox: "Automatique", power_hp: 150, status: "Disponible" },
  { slug: "volvo-xc60-t8-recharge-2022", make: "Volvo", model: "XC60", version: "T8 Recharge AWD", year: 2022, price: 59500, mileage: 24000, fuel: "Hybride", gearbox: "Automatique", power_hp: 390, status: "Disponible" },
  { slug: "peugeot-508-gt-2021", make: "Peugeot", model: "508", version: "GT 225 e-EAT8", year: 2021, price: 32400, mileage: 49000, fuel: "Essence", gearbox: "Automatique", power_hp: 225, status: "Réservé" },
];

function PriceFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}
function KmFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " km";
}

export default function StockPage() {
  return (
    <div className="min-h-screen bg-anthracite">
      {/* Header */}
      <div className="border-b border-hairline px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-3"
          >
            Bondues · Lille
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl md:text-5xl text-bone"
          >
            Notre stock
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-3 text-muted text-sm"
          >
            {vehicles.length} véhicules disponibles
          </motion.p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.slug}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={`/stock/${v.slug}`}
                className="group block bg-surface border border-hairline rounded-sm overflow-hidden hover:border-muted transition-colors duration-300"
              >
                {/* Photo placeholder */}
                <div className="relative aspect-[4/3] bg-[#1e1e22] flex items-center justify-center overflow-hidden">
                  <span className="font-display text-5xl text-hairline group-hover:scale-105 transition-transform duration-500">
                    {v.make[0]}
                  </span>
                  {v.status === "Réservé" && (
                    <div className="absolute top-3 left-3 bg-oxblood/90 text-bone text-[0.6rem] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Réservé
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted mb-1">
                    {v.year} · {v.fuel} · {v.power_hp} ch · {v.gearbox}
                  </p>
                  <h2 className="font-display text-bone text-xl leading-tight">
                    {v.make} {v.model}
                  </h2>
                  <p className="text-muted text-sm mt-0.5 mb-4">{v.version}</p>
                  <div className="border-t border-hairline pt-4 flex items-center justify-between">
                    <span className="text-bone font-sans text-base font-medium">
                      {PriceFormat(v.price)}
                    </span>
                    <span className="text-muted text-xs">
                      {KmFormat(v.mileage)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gauge, Fuel, Settings2, Calendar } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

// Mock data — replace with Supabase fetch once schema is live
const vehicles: Record<string, {
  make: string; model: string; version: string; year: number;
  price: number; mileage: number; fuel: string; gearbox: string;
  power_hp: number; power_kw: number; doors: number; seats: number;
  registration_date: string; status: string;
  options: string[];
}> = {
  "bmw-serie-5-530d-2021": {
    make: "BMW", model: "Série 5", version: "530d xDrive", year: 2021,
    price: 42900, mileage: 58000, fuel: "Diesel", gearbox: "Automatique",
    power_hp: 286, power_kw: 210, doors: 4, seats: 5,
    registration_date: "03/2021", status: "Disponible",
    options: ["Toit ouvrant panoramique", "Pack M Sport", "Affichage tête haute", "Caméra 360°", "Sièges chauffants", "Navigation Live"],
  },
  "audi-a6-45-tfsi-2020": {
    make: "Audi", model: "A6", version: "45 TFSI S line", year: 2020,
    price: 37500, mileage: 72000, fuel: "Essence", gearbox: "Automatique",
    power_hp: 245, power_kw: 180, doors: 4, seats: 5,
    registration_date: "06/2020", status: "Disponible",
    options: ["Pack S line", "Matrix LED", "Virtual Cockpit Plus", "Sièges sport", "Keyless", "Bang & Olufsen"],
  },
  "mercedes-classe-c-220d-2022": {
    make: "Mercedes", model: "Classe C", version: "220d AMG Line", year: 2022,
    price: 51200, mileage: 31000, fuel: "Diesel", gearbox: "Automatique",
    power_hp: 200, power_kw: 147, doors: 4, seats: 5,
    registration_date: "09/2022", status: "Disponible",
    options: ["Pack AMG Line", "Écran MBUX 11\"", "Caméra de recul", "Keyless Go", "Sièges cuir", "Phares Digital Light"],
  },
  "volkswagen-passat-20-tdi-2021": {
    make: "Volkswagen", model: "Passat", version: "2.0 TDI 150 DSG", year: 2021,
    price: 28900, mileage: 64000, fuel: "Diesel", gearbox: "Automatique",
    power_hp: 150, power_kw: 110, doors: 4, seats: 5,
    registration_date: "01/2021", status: "Disponible",
    options: ["GPS Discover Pro", "Régulateur adaptatif", "Park Assist", "Sièges chauffants", "CarPlay"],
  },
  "volvo-xc60-t8-recharge-2022": {
    make: "Volvo", model: "XC60", version: "T8 Recharge AWD", year: 2022,
    price: 59500, mileage: 24000, fuel: "Hybride", gearbox: "Automatique",
    power_hp: 390, power_kw: 287, doors: 4, seats: 5,
    registration_date: "04/2022", status: "Disponible",
    options: ["Toit panoramique", "Bowers & Wilkins", "Pack Inscription", "Pilot Assist", "Sièges ventilés", "Hayon électrique"],
  },
  "peugeot-508-gt-2021": {
    make: "Peugeot", model: "508", version: "GT 225 e-EAT8", year: 2021,
    price: 32400, mileage: 49000, fuel: "Essence", gearbox: "Automatique",
    power_hp: 225, power_kw: 165, doors: 4, seats: 5,
    registration_date: "05/2021", status: "Réservé",
    options: ["Pack GT", "Toit panoramique", "Focal Premium", "Vision 360°", "Sièges cuir nappa", "Night Vision"],
  },
};

function PriceFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}
function KmFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " km";
}

export default function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const v = vehicles[params.slug];

  if (!v) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center gap-6 px-6">
        <p className="font-display text-bone text-3xl">Véhicule introuvable</p>
        <Link href="/stock" className="inline-flex items-center gap-2 text-muted text-sm hover:text-bone transition-colors">
          <ArrowLeft size={16} /> Retour au stock
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: Calendar, label: "Mise en circulation", value: v.registration_date },
    { icon: Gauge, label: "Kilométrage", value: KmFormat(v.mileage) },
    { icon: Fuel, label: "Énergie", value: v.fuel },
    { icon: Settings2, label: "Boîte", value: v.gearbox },
  ];

  return (
    <div className="min-h-screen bg-anthracite">
      {/* Back */}
      <div className="border-b border-hairline px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <Link href="/stock" className="inline-flex items-center gap-2 text-muted text-xs uppercase tracking-widest hover:text-bone transition-colors">
            <ArrowLeft size={14} /> Stock
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: photo */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="aspect-[4/3] bg-surface border border-hairline rounded-sm flex items-center justify-center"
        >
          <span className="font-display text-8xl text-hairline">{v.make[0]}</span>
        </motion.div>

        {/* Right: info */}
        <div className="flex flex-col gap-8">
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
            {v.status === "Réservé" && (
              <span className="inline-block bg-oxblood/90 text-bone text-[0.6rem] uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Réservé
              </span>
            )}
            <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-2">
              {v.year} · {v.fuel} · {v.power_hp} ch ({v.power_kw} kW)
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-bone leading-tight">
              {v.make} {v.model}
            </h1>
            <p className="text-muted mt-1">{v.version}</p>
          </motion.div>

          {/* Price */}
          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="border-t border-b border-hairline py-6"
          >
            <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-1">Prix</p>
            <p className="font-display text-4xl text-bone">{PriceFormat(v.price)}</p>
          </motion.div>

          {/* Specs grid */}
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
            className="grid grid-cols-2 gap-4"
          >
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-surface border border-hairline rounded-sm p-4 flex gap-3 items-start">
                <Icon size={16} className="text-oxblood mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted text-[0.6rem] uppercase tracking-widest">{label}</p>
                  <p className="text-bone text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Options */}
          {v.options.length > 0 && (
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
              <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted mb-3">Equipements</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <span key={opt} className="border border-hairline text-bone text-xs px-3 py-1.5 rounded-full">
                    {opt}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible"
            className="flex flex-wrap gap-3 pt-2"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-7 py-3.5 text-sm hover:brightness-110 transition"
            >
              Demander ce véhicule <ArrowRight size={16} />
            </Link>
            <Link
              href="/stock"
              className="inline-flex items-center gap-2 border border-hairline text-bone rounded-full px-7 py-3.5 text-sm hover:border-muted transition"
            >
              Retour au stock
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Eye, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

const mockVehicles = [
  { slug: "bmw-serie-5-530d-2021", make: "BMW", model: "Série 5", version: "530d xDrive", year: 2021, price: 42900, mileage: 58000, fuel: "Diesel", power_hp: 286 },
  { slug: "audi-a6-45-tfsi-2020", make: "Audi", model: "A6", version: "45 TFSI S line", year: 2020, price: 37500, mileage: 72000, fuel: "Essence", power_hp: 245 },
  { slug: "mercedes-classe-c-220d-2022", make: "Mercedes", model: "Classe C", version: "220d AMG Line", year: 2022, price: 51200, mileage: 31000, fuel: "Diesel", power_hp: 200 },
];

const usps = [
  { icon: Shield, label: "Véhicules garantis", desc: "Inspection complète 140 points avant mise en vente." },
  { icon: Eye, label: "Transparence totale", desc: "Historique complet, carnet d'entretien, rapport Cartell." },
  { icon: Star, label: "Sélection exigeante", desc: "Moins de 10 % des véhicules inspectés intègrent notre stock." },
];

function PriceFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}
function KmFormat(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " km";
}

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center bg-anthracite px-6 overflow-hidden">
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 80px)",
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full pt-12 pb-24">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-6"
          >
            Bondues · Lille — Véhicules d'occasion premium
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-5xl md:text-7xl xl:text-8xl text-bone leading-[1.05] tracking-tight max-w-4xl"
          >
            Des voitures choisies.
            <br />
            <span className="text-muted">Pas ramassées.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 text-muted text-base md:text-lg max-w-xl leading-relaxed"
          >
            Chaque véhicule de notre stock passe une inspection complète et
            bénéficie d'une remise en état soignée avant d'être proposé.
            Aucun compromis.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/stock"
              className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-7 py-3.5 text-sm hover:brightness-110 transition"
            >
              Voir le stock
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-hairline text-bone rounded-full px-7 py-3.5 text-sm hover:border-muted transition"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>

        {/* bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
      </section>

      {/* ── USP strip ── */}
      <section className="bg-surface border-b border-hairline py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {usps.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-5"
            >
              <div className="mt-0.5 shrink-0">
                <Icon size={20} className="text-oxblood" />
              </div>
              <div>
                <p className="font-sans text-bone text-sm font-medium mb-1">{label}</p>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Vehicle teaser ── */}
      <section className="bg-anthracite py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          >
            <div>
              <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-2">
                Notre sélection
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-bone">
                Véhicules disponibles
              </h2>
            </div>
            <Link
              href="/stock"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-bone transition-colors"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockVehicles.map((v, i) => (
              <motion.div
                key={v.slug}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  href={`/stock/${v.slug}`}
                  className="group block bg-surface border border-hairline rounded-sm overflow-hidden hover:border-muted transition-colors duration-300"
                >
                  {/* photo placeholder */}
                  <div className="aspect-[4/3] bg-[#1e1e22] flex items-center justify-center">
                    <span className="font-display text-4xl text-hairline">
                      {v.make[0]}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted mb-1">
                      {v.year} · {v.fuel} · {v.power_hp} ch
                    </p>
                    <h3 className="font-display text-bone text-xl leading-tight mb-1">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-muted text-sm mb-4">{v.version}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-bone font-sans text-base">
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
      </section>

      {/* ── Contact CTA ── */}
      <section className="bg-surface border-t border-hairline py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-4"
          >
            Une question ? Un projet ?
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-bone mb-6"
          >
            Parlons de votre prochain véhicule.
          </motion.h2>
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-8 py-4 text-sm hover:brightness-110 transition"
            >
              Prendre contact <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

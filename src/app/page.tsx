import Link from "next/link";
import { ArrowRight, Shield, Eye, Star } from "lucide-react";
import Reveal from "./components/Reveal";
import CarCard from "./components/CarCard";
import { getAllCars } from "@/lib/cars";

export const dynamic = "force-dynamic";

const usps = [
  { icon: Shield, label: "Véhicules contrôlés", desc: "Contrôle technique à jour et historique vérifié avant mise en vente." },
  { icon: Eye, label: "Transparence totale", desc: "Kilométrage réel, carte grise et contrôle technique consultables." },
  { icon: Star, label: "Sélection soignée", desc: "Des véhicules d'occasion préparés et proposés au juste prix." },
];

export default async function Home() {
  const cars = await getAllCars();
  const available = cars.filter((c) => c.status === "available");
  const teaser = (available.length ? available : cars).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col justify-center bg-anthracite px-6 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 80px)",
          }}
        />
        <div className="relative max-w-7xl mx-auto w-full pt-12 pb-24">
          <Reveal onLoad i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-6">
              Bondues · Lille — Véhicules d&apos;occasion
            </p>
          </Reveal>
          <Reveal onLoad i={1}>
            <h1 className="font-display text-5xl md:text-7xl xl:text-8xl text-bone leading-[1.05] tracking-tight max-w-4xl">
              Des voitures choisies.
              <br />
              <span className="text-muted">Pas ramassées.</span>
            </h1>
          </Reveal>
          <Reveal onLoad i={2}>
            <p className="mt-8 text-muted text-base md:text-lg max-w-xl leading-relaxed">
              Chaque véhicule de notre stock est contrôlé et préparé avant
              d&apos;être proposé. Kilométrage réel, papiers en règle, juste prix.
            </p>
          </Reveal>
          <Reveal onLoad i={3}>
            <div className="mt-10 flex flex-wrap gap-4">
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
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
      </section>

      {/* USP strip */}
      <section className="bg-surface border-b border-hairline py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {usps.map(({ icon: Icon, label, desc }, i) => (
            <Reveal key={label} i={i}>
              <div className="flex gap-5">
                <div className="mt-0.5 shrink-0">
                  <Icon size={20} className="text-oxblood" />
                </div>
                <div>
                  <p className="font-sans text-bone text-sm font-medium mb-1">{label}</p>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Vehicle teaser */}
      <section className="bg-anthracite py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
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
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teaser.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface border-t border-hairline py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-4">
              Une question ? Un projet ?
            </p>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display text-3xl md:text-4xl text-bone mb-6">
              Parlons de votre prochain véhicule.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-8 py-4 text-sm hover:brightness-110 transition"
            >
              Prendre contact <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

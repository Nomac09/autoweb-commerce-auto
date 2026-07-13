import Link from "next/link";
import { ArrowRight, CheckCircle2, Gauge, HandCoins, FileCheck } from "lucide-react";
import Reveal from "../components/Reveal";
import { site } from "@/lib/site";

export const metadata = {
  title: "À propos - AUTOWEB COMMERCE | Bondues, Lille",
  description:
    "AUTOWEB COMMERCE, garage indépendant à Bondues près de Lille : des véhicules d'occasion contrôlés, au kilométrage réel et au juste prix.",
};

const pillars = [
  {
    icon: FileCheck,
    title: "Papiers en règle",
    desc: "Carte grise, contrôle technique à jour et historique vérifié pour chaque véhicule.",
  },
  {
    icon: Gauge,
    title: "Kilométrage réel",
    desc: "Compteurs contrôlés et cohérents. Ce qui est affiché correspond au véhicule.",
  },
  {
    icon: HandCoins,
    title: "Le juste prix",
    desc: "Des tarifs alignés sur le marché, sans surprise et sans frais cachés.",
  },
  {
    icon: CheckCircle2,
    title: "Sans intermédiaire",
    desc: "Vous parlez directement au responsable. Conseil honnête, réponse rapide.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-anthracite">
      {/* Intro */}
      <section className="border-b border-hairline px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <Reveal onLoad i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-4">
              À propos — {site.city} · {site.region}
            </p>
          </Reveal>
          <Reveal onLoad i={1}>
            <h1 className="font-display text-4xl md:text-6xl xl:text-7xl text-bone leading-[1.05] tracking-tight max-w-4xl">
              Un garage à taille humaine,
              <br />
              <span className="text-muted">pas une chaîne.</span>
            </h1>
          </Reveal>
          <Reveal onLoad i={2}>
            <p className="mt-8 text-muted text-base md:text-lg max-w-2xl leading-relaxed">
              {site.name} est un garage indépendant installé à {site.city}, aux
              portes de {site.region}. Nous sélectionnons des voitures
              d&apos;occasion citadines et compactes, contrôlées et préparées,
              proposées au juste prix. Pas de survente, pas de discours : des
              véhicules sains pour rouler l&apos;esprit tranquille.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} i={i}>
              <div className="flex gap-5 bg-surface border border-hairline rounded-sm p-7 h-full">
                <Icon size={22} className="text-oxblood mt-0.5 shrink-0" />
                <div>
                  <p className="font-display text-bone text-xl mb-1.5">{title}</p>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="bg-surface border-y border-hairline px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-4">
              Notre approche
            </p>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display text-3xl md:text-4xl text-bone mb-6 leading-tight">
              Acheter une occasion sans se poser mille questions.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="text-muted text-base leading-relaxed">
              Chaque véhicule est choisi puis préparé avant d&apos;être proposé :
              vérification mécanique, contrôle technique, remise en état si
              nécessaire. Nous vous montrons les documents, nous répondons
              franchement, et nous vous laissons décider. C&apos;est cette
              relation directe qui fait la différence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal i={0}>
            <h2 className="font-display text-3xl md:text-4xl text-bone mb-8">
              Un véhicule en tête ?
            </h2>
          </Reveal>
          <Reveal i={1}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/stock"
                className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-8 py-4 text-sm hover:brightness-110 transition"
              >
                Voir le stock <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-hairline text-bone rounded-full px-8 py-4 text-sm hover:border-muted transition"
              >
                Nous contacter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

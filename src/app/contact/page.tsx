import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact - AUTOWEB COMMERCE | Bondues, Lille",
  description:
    "Contactez AUTOWEB COMMERCE à Bondues, près de Lille. Téléphone, WhatsApp, email et adresse.",
};

const details = [
  {
    icon: Phone,
    label: "Téléphone",
    value: site.phoneDisplay,
    href: site.phoneHref,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: site.phoneDisplay,
    href: site.whatsappHref,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: `${site.address.street}, ${site.address.zip} ${site.address.city}`,
    href: site.mapsHref,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-anthracite">
      {/* Header */}
      <section className="border-b border-hairline px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <Reveal onLoad i={0}>
            <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-3">
              {site.city} · {site.region}
            </p>
          </Reveal>
          <Reveal onLoad i={1}>
            <h1 className="font-display text-4xl md:text-6xl text-bone leading-tight max-w-3xl">
              Parlons de votre prochain véhicule.
            </h1>
          </Reveal>
          <Reveal onLoad i={2}>
            <p className="mt-6 text-muted text-base md:text-lg max-w-xl leading-relaxed">
              Une question sur un véhicule, une reprise, un financement ? Appelez,
              écrivez ou passez nous voir. Réponse rapide, sans intermédiaire.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Details + hours */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map(({ icon: Icon, label, value, href }, i) => {
              const external = href.startsWith("http");
              return (
                <Reveal key={label} i={i}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-4 bg-surface border border-hairline rounded-sm p-6 h-full hover:border-muted transition-colors"
                  >
                    <Icon size={20} className="text-oxblood mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted text-[0.6rem] uppercase tracking-widest mb-1">
                        {label}
                      </p>
                      <p className="text-bone text-sm group-hover:text-oxblood transition-colors break-words">
                        {value}
                      </p>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>

          {/* Hours */}
          <Reveal i={1}>
            <div className="bg-surface border border-hairline rounded-sm p-6 h-full">
              <div className="flex items-center gap-3 mb-5">
                <Clock size={18} className="text-oxblood" />
                <p className="font-sans text-[0.65rem] uppercase tracking-widest text-muted">
                  Horaires
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex flex-col gap-0.5">
                    <span className="text-bone text-sm">{h.days}</span>
                    <span className="text-muted text-sm">{h.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-hairline">
                <a
                  href={site.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-bone transition-colors"
                >
                  Voir sur Google Maps <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface border-t border-hairline px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal i={0}>
            <h2 className="font-display text-3xl md:text-4xl text-bone mb-6">
              Envie de voir le stock d&apos;abord ?
            </h2>
          </Reveal>
          <Reveal i={1}>
            <Link
              href="/stock"
              className="inline-flex items-center gap-2 bg-oxblood text-bone rounded-full px-8 py-4 text-sm hover:brightness-110 transition"
            >
              Voir les véhicules <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

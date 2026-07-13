import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = {
  title: "Mentions légales - AUTOWEB COMMERCE",
  description: "Mentions légales du site AUTOWEB COMMERCE.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl md:text-2xl text-bone mb-4">{title}</h2>
      <div className="text-muted text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  const addr = `${site.address.street}, ${site.address.zip} ${site.address.city}`;
  return (
    <div className="min-h-screen bg-anthracite px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-3">
          Informations légales
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bone mb-12">
          Mentions légales
        </h1>

        <div className="space-y-10">
          <Section title="Éditeur du site">
            <p>{site.legalName} — société par actions simplifiée ({site.legal.form})</p>
            <p>Siège social : {addr}</p>
            <p>SIREN : {site.siren}</p>
            <p>{site.legal.rcs}</p>
            <p>
              Téléphone :{" "}
              <a href={site.phoneHref} className="text-bone hover:text-oxblood transition-colors">
                {site.phoneDisplay}
              </a>
            </p>
            <p>
              Email :{" "}
              <a href={`mailto:${site.email}`} className="text-bone hover:text-oxblood transition-colors">
                {site.email}
              </a>
            </p>
            <p>Directeur de la publication : {site.legal.director}</p>
          </Section>

          <Section title="Hébergement">
            <p>Le site est hébergé par :</p>
            <p>{site.host.name}</p>
            <p>{site.host.address}</p>
            <p>
              <a
                href={site.host.site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bone hover:text-oxblood transition-colors"
              >
                {site.host.site}
              </a>
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus de ce site (textes, photographies,
              logos, éléments graphiques) est la propriété de {site.legalName} ou
              de ses partenaires. Toute reproduction ou représentation, totale ou
              partielle, sans autorisation écrite préalable, est interdite.
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              Les informations transmises via le site (formulaire de contact,
              email, téléphone) sont utilisées uniquement pour répondre à votre
              demande et ne sont pas cédées à des tiers. Conformément au Règlement
              Général sur la Protection des Données (RGPD), vous disposez d&apos;un
              droit d&apos;accès, de rectification et de suppression de vos
              données. Pour l&apos;exercer, contactez-nous à{" "}
              <a href={`mailto:${site.email}`} className="text-bone hover:text-oxblood transition-colors">
                {site.email}
              </a>
              .
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Ce site peut utiliser des cookies de mesure d&apos;audience et de
              suivi publicitaire. Vous pouvez configurer votre navigateur pour les
              refuser.
            </p>
          </Section>
        </div>

        <div className="mt-14 pt-8 border-t border-hairline">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-bone transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

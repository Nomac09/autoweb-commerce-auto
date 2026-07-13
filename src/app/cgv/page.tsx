import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = {
  title: "Conditions générales de vente - AUTOWEB COMMERCE",
  description: "Conditions générales de vente d'AUTOWEB COMMERCE.",
};

function Article({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl md:text-2xl text-bone mb-4">
        <span className="text-muted">Article {n}.</span> {title}
      </h2>
      <div className="text-muted text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-anthracite px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <p className="font-sans text-[0.65rem] tracking-widest uppercase text-muted mb-3">
          Conditions générales
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bone mb-6">
          Conditions générales de vente
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-12">
          Les présentes conditions générales de vente (CGV) régissent les ventes
          de véhicules d&apos;occasion réalisées par {site.legalName}, dont le
          siège social est situé {site.address.street}, {site.address.zip}{" "}
          {site.address.city}.
        </p>

        <div className="space-y-10">
          <Article n={1} title="Objet et champ d'application">
            <p>
              Les présentes CGV s&apos;appliquent à toute vente de véhicule
              d&apos;occasion conclue entre {site.legalName} (le vendeur) et
              l&apos;acheteur. Toute commande implique l&apos;acceptation sans
              réserve des présentes conditions.
            </p>
          </Article>

          <Article n={2} title="Véhicules">
            <p>
              Les véhicules proposés sont des véhicules d&apos;occasion, vendus en
              l&apos;état, décrits de bonne foi (année, kilométrage, énergie,
              contrôle technique). L&apos;acheteur reconnaît avoir pu examiner le
              véhicule et l&apos;essayer avant l&apos;achat.
            </p>
          </Article>

          <Article n={3} title="Prix">
            <p>
              Les prix sont indiqués en euros, toutes taxes comprises (TTC). Le
              prix applicable est celui figurant sur le bon de commande. La TVA est
              appliquée selon le régime en vigueur (notamment le régime de la TVA
              sur la marge pour les véhicules d&apos;occasion, le cas échéant).
            </p>
          </Article>

          <Article n={4} title="Commande et acompte">
            <p>
              La vente est formalisée par un bon de commande signé. Un acompte peut
              être demandé à la réservation ; le solde est réglé au plus tard à la
              remise du véhicule.
            </p>
          </Article>

          <Article n={5} title="Paiement">
            <p>
              Le paiement s&apos;effectue selon les moyens acceptés par le vendeur
              et indiqués sur le bon de commande. Le véhicule reste la propriété du
              vendeur jusqu&apos;au paiement intégral du prix (clause de réserve de
              propriété).
            </p>
          </Article>

          <Article n={6} title="Remise du véhicule et documents">
            <p>
              Le véhicule est remis après encaissement complet du prix. Le vendeur
              remet à l&apos;acheteur les documents nécessaires : certificat de
              cession, certificat de situation administrative (non-gage), et le cas
              échéant le contrôle technique de moins de six mois.
            </p>
          </Article>

          <Article n={7} title="Droit de rétractation">
            <p>
              Pour une vente conclue sur place, dans les locaux du vendeur, le
              droit de rétractation de 14 jours prévu pour la vente à distance ne
              s&apos;applique pas. Un droit de rétractation peut s&apos;appliquer en
              cas de vente conclue à distance ou hors établissement, dans les
              conditions prévues par le Code de la consommation.
            </p>
          </Article>

          <Article n={8} title="Garanties">
            <p>
              Indépendamment de toute garantie commerciale, le vendeur reste tenu
              de la garantie légale de conformité (articles L.217-3 et suivants du
              Code de la consommation) et de la garantie des vices cachés (articles
              1641 et suivants du Code civil).
            </p>
            <p>
              Une garantie commerciale peut être proposée sur certains véhicules ;
              sa durée et son étendue sont alors précisées sur le bon de commande.
            </p>
          </Article>

          <Article n={9} title="Réclamation">
            <p>
              Toute réclamation peut être adressée à{" "}
              <a href={`mailto:${site.email}`} className="text-bone hover:text-oxblood transition-colors">
                {site.email}
              </a>
              . Une solution amiable sera recherchée en priorité.
            </p>
          </Article>

          <Article n={10} title="Droit applicable">
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige,
              une solution amiable sera recherchée avant toute action judiciaire.
            </p>
          </Article>
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

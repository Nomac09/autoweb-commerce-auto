import Link from "next/link";
import { site } from "@/lib/site";

const navLinks = [
  { label: "Le stock", href: "/stock" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
];

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans uppercase text-[0.65rem] tracking-widest text-muted mb-4">
      {children}
    </p>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted text-[0.65rem] uppercase tracking-widest">
        {label}
      </span>
      {href ? (
        <a href={href} className="text-bone text-sm hover:text-oxblood transition-colors">
          {value}
        </a>
      ) : (
        <span className="text-bone text-sm">{value}</span>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-hairline py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand */}
          <div>
            <p className="font-display text-xl text-bone mb-3">AUTOWEB</p>
            <p className="text-muted text-sm leading-relaxed">
              Voitures d&apos;occasion contrôlées à {site.city}, près de {site.region}.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <ColHeader>Navigation</ColHeader>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-bone text-sm hover:text-oxblood transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Contact */}
          <div>
            <ColHeader>Contact</ColHeader>
            <div className="flex flex-col gap-4">
              <InfoRow
                label="Adresse"
                value={`${site.address.street}, ${site.address.zip} ${site.address.city}`}
                href={site.mapsHref}
              />
              <InfoRow label="Téléphone" value={site.phoneDisplay} href={site.phoneHref} />
              <InfoRow label="Email" value={site.email} href={`mailto:${site.email}`} />
            </div>
          </div>

          {/* Col 4: Horaires */}
          <div>
            <ColHeader>Horaires</ColHeader>
            <div className="flex flex-col gap-4">
              {site.hours.map((h) => (
                <InfoRow key={h.days} label={h.days} value={h.time} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-hairline mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} {site.legalName} · SIREN {site.siren}
          </p>
          <p className="text-muted text-xs">{site.address.city}, {site.region}</p>
        </div>
      </div>
    </footer>
  );
}

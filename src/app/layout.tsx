import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AUTOWEB COMMERCE — Voitures d'occasion à petit prix | Bondues",
  description: "Voitures d'occasion dès 1 900 €. Garantie 3 mois, CT OK, paiement 3/4 fois dès 4 000 €. SIREN 100148469 — Bondues.",
  openGraph: { title: "AUTOWEB COMMERCE", description: "Voitures d'occasion à petit prix avec garantie 3 mois.", locale: "fr_FR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="navbar">
          <div className="container navbar-inner">
            <Link href="/" className="navbar-logo">
              <span className="logo-badge">A</span>
              AUTOWEB
            </Link>
            <nav className="navbar-links">
              <Link href="/" className="nav-link">Accueil</Link>
              <Link href="/stock" className="nav-link">Nos annonces</Link>
              <Link href="/contact" className="nav-link nav-cta">Contact</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-brand">
              <span className="logo-badge">A</span>
              <div>
                <p className="footer-name">AUTOWEB COMMERCE</p>
                <p className="footer-siren">SAS · SIREN 100148469</p>
              </div>
            </div>
            <div className="footer-links">
              <a href="tel:0698765432" className="footer-link">📞 06 98 76 54 32</a>
              <a href="https://wa.me/33698765432" className="footer-link">💬 WhatsApp</a>
              <a href="mailto:contact@autowebcommerce.fr" className="footer-link">✉ contact@autowebcommerce.fr</a>
            </div>
            <p className="footer-addr">2 Allée de la Mannée · 59910 Bondues</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

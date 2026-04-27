import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.autoweb-commerce.fr"),
  title: {
    default: "AUTOWEB COMMERCE — Voitures d'occasion · Bondues, Nord",
    template: "%s | AUTOWEB COMMERCE",
  },
  description: "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK, révision complète. Situé à Bondues (59910), proche Lille.",
  authors: [{ name: "AUTOWEB COMMERCE" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.autoweb-commerce.fr",
    siteName: "AUTOWEB COMMERCE",
    title: "AUTOWEB COMMERCE — Voitures d'occasion · Bondues, Nord",
    description: "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK. Bondues (59910), proche Lille.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AUTOWEB COMMERCE" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="canonical" href="https://www.autoweb-commerce.fr" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18041617288" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18041617288');` }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          "name": "AUTOWEB COMMERCE",
          "description": "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK, révision complète.",
          "url": "https://www.autoweb-commerce.fr",
          "telephone": "+33783809694",
          "email": "autowebcommercesas@gmail.com",
          "address": { "@type": "PostalAddress", "streetAddress": "2 Allée de la Mannée", "addressLocality": "Bondues", "postalCode": "59910", "addressCountry": "FR" },
          "geo": { "@type": "GeoCoordinates", "latitude": 50.693, "longitude": 3.08 },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "09:00", "closes": "17:00" }
          ],
        })}} />

        <header className="navbar">
          <div className="container navbar-inner">
            <Link href="/" className="navbar-logo">
              <img src="/autoweb-logo-dark.svg" alt="AUTOWEB COMMERCE" height="36" />
            </Link>
            <nav className="navbar-links">
              <Link href="/" className="nav-link">Accueil</Link>
              <Link href="/stock" className="nav-link">Annonces</Link>
              <Link href="/contact" className="nav-cta">Nous contacter</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="footer" style={{ background: "var(--bg2)" }}>
          <div className="container footer-inner">
            <div>
              <p className="footer-brand">AUTOWEB COMMERCE</p>
              <p className="footer-siren">SAS · SIREN 100148469</p>
            </div>
            <div className="footer-links">
              <a href="tel:0783809694" className="footer-link">07 83 80 96 94</a>
              <a href="https://wa.me/33783809694" className="footer-link">WhatsApp</a>
              <a href="mailto:autowebcommercesas@gmail.com" className="footer-link">autowebcommercesas@gmail.com</a>
            </div>
            <p className="footer-siren">2 Allée de la Mannée · 59910 Bondues</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

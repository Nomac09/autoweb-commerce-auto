import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.autoweb-commerce.fr"),
  title: {
    default: "AUTOWEB COMMERCE — Voitures d'occasion à petit prix · Bondues, Nord",
    template: "%s | AUTOWEB COMMERCE",
  },
  description: "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK, révision complète. Situé à Bondues (59910), proche Lille. Essence, Diesel, Automatique. Paiement facilité.",
  keywords: [
    "voiture occasion", "voiture occasion pas cher", "auto occasion garantie",
    "voiture occasion Bondues", "voiture occasion Lille", "voiture occasion Nord",
    "voiture occasion Hauts-de-France", "voiture occasion France",
    "voiture occasion Belgique", "occasion Luxembourg",
    "voiture garantie 3 mois", "voiture CT OK", "voiture révisée",
    "petit budget voiture", "voiture pas cher Nord", "financement voiture occasion",
    "essence occasion", "diesel occasion", "hybride occasion", "électrique occasion",
    "Renault occasion", "Renault Clio occasion", "Renault Megane occasion", "Renault Captur occasion", "Renault Twingo occasion", "Renault Zoe occasion",
    "Peugeot occasion", "Peugeot 208 occasion", "Peugeot 206 occasion", "Peugeot 308 occasion", "Peugeot 3008 occasion", "Peugeot 2008 occasion",
    "Citroën occasion", "Citroën C3 occasion", "Citroën C4 occasion", "Citroën Berlingo occasion", "Citroën C3 Picasso occasion",
    "Volkswagen occasion", "VW Golf occasion", "VW Polo occasion", "VW Tiguan occasion", "VW T-Roc occasion",
    "BMW occasion", "BMW Série 1 occasion", "BMW Série 3 occasion", "BMW X1 occasion", "BMW X3 occasion", "BMW X5 occasion",
    "Mercedes occasion", "Mercedes Classe A occasion", "Mercedes Classe C occasion", "Mercedes GLA occasion", "Mercedes GLC occasion",
    "Audi occasion", "Audi A1 occasion", "Audi A3 occasion", "Audi A4 occasion", "Audi Q3 occasion", "Audi Q5 occasion",
    "Toyota occasion", "Toyota Yaris occasion", "Toyota Corolla occasion", "Toyota RAV4 occasion", "Toyota C-HR occasion",
    "Ford occasion", "Ford Fiesta occasion", "Ford Focus occasion", "Ford Puma occasion", "Ford Kuga occasion",
    "Opel occasion", "Opel Corsa occasion", "Opel Astra occasion", "Opel Mokka occasion",
    "Fiat occasion", "Fiat 500 occasion", "Fiat Punto occasion", "Fiat Tipo occasion", "Fiat Panda occasion",
    "Mini occasion", "Mini Cooper occasion", "Mini Clubman occasion", "Mini Countryman occasion",
    "Seat occasion", "Seat Ibiza occasion", "Seat Leon occasion", "Seat Arona occasion",
    "Skoda occasion", "Skoda Fabia occasion", "Skoda Octavia occasion", "Skoda Karoq occasion",
    "Hyundai occasion", "Hyundai i20 occasion", "Hyundai i30 occasion", "Hyundai Tucson occasion", "Hyundai Kona occasion",
    "Kia occasion", "Kia Picanto occasion", "Kia Rio occasion", "Kia Ceed occasion", "Kia Sportage occasion",
    "Nissan occasion", "Nissan Micra occasion", "Nissan Juke occasion", "Nissan Qashqai occasion", "Nissan Leaf occasion",
    "Honda occasion", "Honda Jazz occasion", "Honda Civic occasion", "Honda HR-V occasion",
    "Mazda occasion", "Mazda 2 occasion", "Mazda 3 occasion", "Mazda CX-3 occasion", "Mazda CX-5 occasion",
    "Volvo occasion", "Volvo V40 occasion", "Volvo XC40 occasion", "Volvo XC60 occasion",
    "Dacia occasion", "Dacia Sandero occasion", "Dacia Logan occasion", "Dacia Duster occasion",
    "Alfa Romeo occasion", "Alfa Giulietta occasion", "Alfa Stelvio occasion",
    "Jeep occasion", "Jeep Renegade occasion", "Jeep Compass occasion",
    "Land Rover occasion", "Range Rover occasion", "Land Rover Discovery occasion",
    "Porsche occasion", "Porsche Cayenne occasion", "Porsche Macan occasion",
    "Tesla occasion", "Tesla Model 3 occasion", "Tesla Model Y occasion",
    "Suzuki occasion", "Suzuki Swift occasion", "Suzuki Vitara occasion",
    "Mitsubishi occasion", "Mitsubishi ASX occasion", "Mitsubishi Outlander occasion",
    "Lexus occasion", "Lexus CT200h occasion", "Lexus UX occasion",
    "Subaru occasion", "Subaru Outback occasion", "Subaru Forester occasion",
    "autoweb commerce", "autoweb-commerce.fr"
  ],
  authors: [{ name: "AUTOWEB COMMERCE" }],
  creator: "AUTOWEB COMMERCE",
  publisher: "AUTOWEB COMMERCE",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.autoweb-commerce.fr",
    siteName: "AUTOWEB COMMERCE",
    title: "AUTOWEB COMMERCE — Voitures d'occasion · Bondues, Nord",
    description: "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK. Bondues (59910), proche Lille.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AUTOWEB COMMERCE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUTOWEB COMMERCE — Voitures d'occasion · Bondues, Nord",
    description: "Voitures d'occasion à petit prix avec garantie 3 mois. CT OK. Bondues, Nord.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="canonical" href="https://www.autoweb-commerce.fr" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18041617288"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18041617288');
        `}} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
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
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "2 Allée de la Mannée",
            "addressLocality": "Bondues",
            "postalCode": "59910",
            "addressCountry": "FR",
            "addressRegion": "Nord"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": 50.693, "longitude": 3.08 },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "09:00", "closes": "17:00" }
          ],
          "priceRange": "€€",
          "areaServed": ["France","Belgique","Luxembourg","Nord","Hauts-de-France","Lille","Roubaix","Tourcoing","Bondues","Villeneuve-d'Ascq","Lens","Douai","Valenciennes","Dunkerque","Calais","Arras","Amiens"],
          "sameAs": []
        })}} />
        <header className="navbar">
          <div className="container nav-inner">
            <Link href="/" className="nav-logo">
              <img src="/autoweb-logo.svg" alt="AUTOWEB COMMERCE" height="40" style={{height:"40px",width:"auto"}} />
            </Link>
            <nav className="nav-links">
              <Link href="/" className="nav-link">Accueil</Link>
              <Link href="/stock" className="nav-link">Nos annonces</Link>
              <Link href="/about" className="nav-link">À propos</Link>
              <Link href="/contact" className="btn btn-accent">Contact</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", padding: "32px 0", marginTop: "60px" }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "16px", textTransform: "uppercase", color: "var(--white)" }}>AUTOWEB COMMERCE</p>
              <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "4px" }}>SAS · SIREN 100148469</p>
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "var(--gray)", flexWrap: "wrap" }}>
              <a href="tel:0783809694" style={{ color: "var(--gray)", textDecoration: "none" }}>📞 07 83 80 96 94</a>
              <a href="https://wa.me/33783809694" style={{ color: "var(--gray)", textDecoration: "none" }}>💬 WhatsApp</a>
              <a href="mailto:autowebcommercesas@gmail.com" style={{ color: "var(--gray)", textDecoration: "none" }}>✉ autowebcommercesas@gmail.com</a>
            </div>
            <p style={{ fontSize: "12px", color: "var(--gray2)" }}>2 Allée de la Mannée · 59910 Bondues</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

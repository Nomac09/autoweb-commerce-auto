#!/bin/bash
# ============================================================
# AUTOWEB COMMERCE — Full redesign
# Run from inside autoweb-commerce-auto/:  bash setup.sh
# ============================================================
set -e
echo "🚗 AUTOWEB — applying full redesign..."

mkdir -p src/app/data src/app/components src/app/stock \
         "src/app/car/[id]" src/app/contact \
         src/app/api/cars public/cars scripts

# ── globals.css — NO @import, fonts via <link> in layout ────
cat > src/app/globals.css << 'HEREDOC'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:       #111111;
  --bg2:      #1a1a1a;
  --bg3:      #222222;
  --border:   #2e2e2e;
  --accent:   #9aff3a;
  --accent2:  #7dd62e;
  --white:    #ffffff;
  --gray:     #888888;
  --gray2:    #555555;
  --red:      #ff4444;
  --radius:   6px;
  --radius-lg:12px;
  --font-head:'Oswald', sans-serif;
  --font-body:'DM Sans', sans-serif;
  --t:        all .18s ease;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-family:var(--font-body);font-size:16px;scroll-behavior:smooth;background:var(--bg);color:var(--white)}
body{background:var(--bg);color:var(--white);line-height:1.6;min-height:100vh}
img{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}

.container{max-width:1240px;margin:0 auto;padding:0 20px}

/* Navbar */
.navbar{background:var(--bg);border-bottom:3px solid var(--accent);position:sticky;top:0;z-index:100}
.navbar-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
.navbar-logo{display:flex;align-items:center;gap:12px;font-family:var(--font-head);font-size:26px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.logo-badge{background:var(--accent);color:var(--bg);width:38px;height:38px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0}
.navbar-links{display:flex;align-items:center;gap:4px}
.nav-link{padding:8px 18px;border-radius:4px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--gray);transition:var(--t)}
.nav-link:hover{color:var(--white);background:var(--bg3)}
.nav-cta{background:var(--accent) !important;color:var(--bg) !important;font-weight:700}
.nav-cta:hover{background:var(--accent2) !important}
@media(max-width:600px){.navbar-links .nav-link:not(.nav-cta){display:none}}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 28px;border-radius:var(--radius);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border:none;transition:var(--t);cursor:pointer;font-family:var(--font-body);white-space:nowrap}
.btn-accent{background:var(--accent);color:var(--bg)}
.btn-accent:hover{background:var(--accent2);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--white);border:2px solid var(--border)}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.btn-lg{padding:16px 36px;font-size:14px}
.btn-full{width:100%}

/* Hero */
.hero{background:var(--bg)}
.hero-img-wrap{position:relative;height:500px;overflow:hidden}
.hero-img-wrap img{width:100%;height:100%;object-fit:cover;opacity:.55}
.hero-bg-fallback{width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);display:flex;align-items:center;justify-content:center;font-size:100px}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(17,17,17,.96) 30%,rgba(17,17,17,.1) 100%)}
.hero-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(20px,5vw,64px);max-width:700px}
.hero-tag{display:inline-block;background:var(--accent);color:var(--bg);font-family:var(--font-head);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 14px;border-radius:3px;margin-bottom:20px;width:fit-content}
.hero-title{font-family:var(--font-head);font-size:clamp(2.4rem,5vw,4.2rem);font-weight:700;line-height:1.0;text-transform:uppercase;color:var(--white);margin-bottom:16px}
.hero-title span{color:var(--accent)}
.hero-sub{font-size:16px;color:rgba(255,255,255,.65);margin-bottom:32px;line-height:1.75;max-width:480px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}
.hero-stats{display:flex;background:var(--bg2);border-top:3px solid var(--accent)}
.hero-stat{flex:1;padding:20px 8px;text-align:center;border-right:1px solid var(--border)}
.hero-stat:last-child{border-right:none}
.hero-stat-v{font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--accent);line-height:1}
.hero-stat-l{font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.05em;margin-top:4px}

/* Promise strip */
.promise-strip{background:var(--bg3);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.promise-inner{display:flex;flex-wrap:wrap}
.promise-item{flex:1;min-width:180px;padding:18px 16px;display:flex;align-items:center;gap:12px;border-right:1px solid var(--border)}
.promise-item:last-child{border-right:none}
.promise-icon{font-size:20px;flex-shrink:0}
.promise-text strong{display:block;font-size:12px;font-weight:700;color:var(--white);text-transform:uppercase;letter-spacing:.04em}
.promise-text span{font-size:11px;color:var(--gray)}

/* Section */
.section{padding:64px 0}
.section-dark{background:var(--bg2)}
.section-head{margin-bottom:36px}
.section-eyebrow{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.section-title{font-family:var(--font-head);font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:700;text-transform:uppercase;color:var(--white);line-height:1.1}
.section-sub{font-size:14px;color:var(--gray);margin-top:6px}

/* Car grid */
.cars-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2px}
.car-card{background:var(--bg2);border:1px solid var(--border);overflow:hidden;transition:var(--t);display:flex;flex-direction:column;cursor:pointer}
.car-card:hover{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.car-card:hover .car-card-img img{transform:scale(1.04)}
.car-card-img{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--bg3)}
.car-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
.car-no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--gray2)}
.car-badge-wrap{position:absolute;top:10px;left:10px;display:flex;gap:6px}
.car-badge{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:3px}
.badge-budget{background:var(--accent);color:var(--bg)}
.badge-reserved{background:#f59e0b;color:#000}
.badge-sold{background:var(--gray2);color:var(--white)}
.car-card-body{padding:14px 16px 16px;flex:1;display:flex;flex-direction:column;gap:6px}
.car-make{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)}
.car-title{font-family:var(--font-head);font-size:16px;font-weight:700;text-transform:uppercase;color:var(--white);line-height:1.2}
.car-specs{font-size:12px;color:var(--gray);display:flex;gap:8px}
.car-price{font-family:var(--font-head);font-size:26px;font-weight:700;color:var(--white);margin-top:4px}
.car-price-ttc{font-size:11px;font-weight:400;color:var(--gray);margin-left:4px}
.car-features{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
.car-feat{background:rgba(154,255,58,.1);border:1px solid rgba(154,255,58,.25);color:var(--accent);font-size:10px;font-weight:600;padding:3px 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.03em}
.car-card-footer{padding:10px 16px;border-top:1px solid var(--border);background:var(--bg3)}

/* Filters */
.filters-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;margin-bottom:24px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.filter-input,.filter-select{padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);font-size:13px;font-family:var(--font-body);color:var(--white);transition:var(--t)}
.filter-input{flex:1;min-width:180px}
.filter-select{min-width:140px;appearance:none;cursor:pointer}
.filter-input::placeholder{color:var(--gray2)}
.filter-input:focus,.filter-select:focus{outline:none;border-color:var(--accent)}
.filter-select option{background:var(--bg3)}
.filters-count{margin-left:auto;font-size:13px;color:var(--gray);font-weight:500;white-space:nowrap}
.btn-reset{background:var(--bg3);border:1px solid var(--border);color:var(--gray);padding:9px 14px;border-radius:var(--radius);font-size:12px;font-weight:600;cursor:pointer;transition:var(--t);font-family:var(--font-body);text-transform:uppercase;letter-spacing:.04em}
.btn-reset:hover{border-color:var(--red);color:var(--red)}

/* Empty */
.empty{text-align:center;padding:80px 20px;color:var(--gray)}
.empty-icon{font-size:52px;margin-bottom:16px}
.empty h3{font-family:var(--font-head);font-size:22px;font-weight:700;text-transform:uppercase;color:var(--white);margin-bottom:8px}

/* Detail */
.detail-wrap{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:start}
.detail-img-main{border-radius:var(--radius);overflow:hidden;aspect-ratio:4/3;background:var(--bg3)}
.detail-img-main img{width:100%;height:100%;object-fit:cover}
.detail-thumbs{display:flex;gap:8px;margin-top:8px}
.detail-thumb{flex:1;aspect-ratio:16/9;overflow:hidden;border-radius:var(--radius);background:var(--bg3);border:1px solid var(--border)}
.detail-thumb img{width:100%;height:100%;object-fit:cover}
.detail-brand{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.detail-title{font-family:var(--font-head);font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;text-transform:uppercase;line-height:1.1;color:var(--white)}
.detail-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:8px}
.status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.detail-price{font-family:var(--font-head);font-size:52px;font-weight:700;color:var(--accent);line-height:1;margin:16px 0}
.detail-specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}
.spec-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px}
.spec-box-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--gray);font-weight:600}
.spec-box-value{font-size:17px;font-weight:700;margin-top:3px;color:var(--white)}
.detail-desc{background:var(--bg2);border-left:3px solid var(--accent);padding:14px 18px;border-radius:0 var(--radius) var(--radius) 0;font-size:14px;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:20px}
.detail-feats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px}
.back-link{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--gray);transition:var(--t);margin-bottom:28px}
.back-link:hover{color:var(--accent)}

/* Contact */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.contact-phone-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;text-align:center;border-top:3px solid var(--accent)}
.contact-phone-num{font-family:var(--font-head);font-size:36px;font-weight:700;color:var(--accent);letter-spacing:.04em;margin:12px 0}
.contact-row{padding:14px 0;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:3px}
.contact-row-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--gray2);font-weight:700}
.contact-row-value{font-size:15px;font-weight:500;color:var(--white)}
.form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.form-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--gray)}
.form-input,.form-select,.form-textarea{padding:11px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);font-size:14px;font-family:var(--font-body);color:var(--white);transition:var(--t);width:100%}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(154,255,58,.1)}
.form-textarea{resize:vertical;min-height:110px}

/* Footer */
.footer{background:var(--bg);border-top:3px solid var(--accent);padding:36px 0}
.footer-inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.footer-brand{display:flex;align-items:center;gap:10px}
.footer-name{font-family:var(--font-head);font-size:18px;font-weight:700;text-transform:uppercase;color:var(--white)}
.footer-siren{font-size:11px;color:var(--gray2);margin-top:2px}
.footer-links{display:flex;flex-wrap:wrap;gap:14px}
.footer-link{font-size:13px;color:var(--gray);transition:var(--t)}
.footer-link:hover{color:var(--accent)}
.footer-addr{font-size:12px;color:var(--gray2)}

@media(max-width:900px){
  .detail-wrap,.contact-grid{grid-template-columns:1fr;gap:28px}
  .detail-price{font-size:40px}
  .hero-img-wrap{height:380px}
}
@media(max-width:640px){
  .section{padding:48px 0}
  .cars-grid{grid-template-columns:1fr 1fr;gap:2px}
  .hero-img-wrap{height:300px}
  .hero-title{font-size:2rem}
  .filters-wrap{flex-direction:column}
  .filter-input,.filter-select{width:100%;min-width:unset}
  .filters-count{margin-left:0}
  .promise-item{min-width:50%}
  .hero-stats{flex-wrap:wrap}
  .hero-stat{min-width:50%}
}
@media(max-width:380px){
  .cars-grid{grid-template-columns:1fr}
}
HEREDOC
echo "  ✓ globals.css"

# ── layout.tsx ──────────────────────────────────────────────
cat > src/app/layout.tsx << 'HEREDOC'
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
HEREDOC
echo "  ✓ layout.tsx"

# ── CarCard — no nested <a> ─────────────────────────────────
cat > src/app/components/CarCard.tsx << 'HEREDOC'
import Link from "next/link";
import { Car } from "../data/cars";

export default function CarCard({ car }: { car: Car }) {
  const isSold     = car.status === "sold";
  const isReserved = car.status === "reserved";
  return (
    <Link
      href={isSold ? "#" : `/car/${car.id}`}
      className="car-card"
      style={isSold ? { pointerEvents: "none", opacity: 0.5 } : {}}
    >
      <div className="car-card-img">
        {car.images[0]
          ? <img src={car.images[0]} alt={car.title} loading="lazy" />
          : <div className="car-no-img">🚗</div>
        }
        <div className="car-badge-wrap">
          {isReserved ? <span className="car-badge badge-reserved">Réservé</span>
          : isSold    ? <span className="car-badge badge-sold">Vendu</span>
          :             <span className="car-badge badge-budget">{car.budgetTag}</span>}
        </div>
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel} · {car.gearbox}</p>
        <p className="car-title">{car.title}</p>
        <p className="car-specs">
          <span>{car.year}</span>&nbsp;·&nbsp;<span>{car.km.toLocaleString("fr-FR")} km</span>
        </p>
        <div className="car-features">
          {car.features.slice(0, 3).map((f) => <span key={f} className="car-feat">{f}</span>)}
        </div>
        <p className="car-price">{car.price.toLocaleString("fr-FR")} €<span className="car-price-ttc">TTC</span></p>
      </div>
      <div className="car-card-footer">
        <div className="btn btn-accent btn-full" style={{ fontSize: "12px", padding: "10px" }}>
          Voir ce véhicule →
        </div>
      </div>
    </Link>
  );
}
HEREDOC
echo "  ✓ CarCard.tsx"

# ── Homepage ────────────────────────────────────────────────
cat > src/app/page.tsx << 'HEREDOC'
import Link from "next/link";
import { getLatestCars, getAvailableCars } from "./data/cars";
import CarCard from "./components/CarCard";

export default function Home() {
  const latest    = getLatestCars(6);
  const available = getAvailableCars();
  return (
    <>
      <section className="hero">
        <div className="hero-img-wrap">
          <div className="hero-bg-fallback">🚗</div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-tag">Bondues · Nord</span>
            <h1 className="hero-title">Voitures<br />d&apos;occasion<br /><span>à petit prix</span></h1>
            <p className="hero-sub">Dès <strong style={{color:"#fff"}}>1 900 €</strong> · Garantie 3 mois · CT OK · Paiement 3/4 fois dès 4 000 €</p>
            <div className="hero-actions">
              <Link href="/stock" className="btn btn-accent btn-lg">Voir toutes les annonces</Link>
              <Link href="/contact" className="btn btn-ghost btn-lg">Nous contacter</Link>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          {[
            [String(available.length), "En stock"],
            ["3 mois",  "Garantie"],
            ["CT OK",   "Contrôle"],
            ["3/4×",    "Paiement"],
          ].map(([v, l]) => (
            <div key={l} className="hero-stat">
              <div className="hero-stat-v">{v}</div>
              <div className="hero-stat-l">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="promise-strip">
        <div className="container promise-inner">
          {[
            ["🛡️","Garantie 3 mois","Sur chaque véhicule vendu"],
            ["✅","CT à jour","Livré contrôle technique OK"],
            ["💳","Paiement facile","3 ou 4 fois sans frais"],
            ["📋","Historique complet","Carnet d'entretien fourni"],
            ["📍","Bondues, Nord","2 Allée de la Mannée"],
          ].map(([icon, title, sub]) => (
            <div key={title as string} className="promise-item">
              <span className="promise-icon">{icon}</span>
              <div className="promise-text"><strong>{title}</strong><span>{sub}</span></div>
            </div>
          ))}
        </div>
      </div>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="section-eyebrow">Stock · Mis à jour quotidiennement</p>
            <h2 className="section-title">Nos dernières occasions</h2>
            <p className="section-sub">{available.length} véhicule{available.length !== 1 ? "s" : ""} disponible{available.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="cars-grid">
            {latest.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <Link href="/stock" className="btn btn-accent btn-lg">Consulter toutes les annonces →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
HEREDOC
echo "  ✓ page.tsx"

# ── Stock page ──────────────────────────────────────────────
cat > src/app/stock/page.tsx << 'HEREDOC'
"use client";
import { useState, useMemo } from "react";
import { cars } from "../data/cars";
import CarCard from "../components/CarCard";

export default function StockPage() {
  const [search,  setSearch]  = useState("");
  const [budget,  setBudget]  = useState("");
  const [fuel,    setFuel]    = useState("");
  const [gearbox, setGearbox] = useState("");
  const [status,  setStatus]  = useState("available");

  const filtered = useMemo(() =>
    cars.filter((car) => {
      if (status !== "all" && car.status !== status) return false;
      if (budget && car.budgetTag !== budget) return false;
      if (fuel   && car.fuel    !== fuel)     return false;
      if (gearbox && car.gearbox !== gearbox) return false;
      if (search) {
        const q = search.toLowerCase();
        return car.title.toLowerCase().includes(q) || car.description.toLowerCase().includes(q);
      }
      return true;
    }),
    [search, budget, fuel, gearbox, status]
  );

  const reset = () => { setSearch(""); setBudget(""); setFuel(""); setGearbox(""); setStatus("available"); };
  const hasFilters = !!(search || budget || fuel || gearbox || status !== "available");

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="section-eyebrow">Bondues · Livraison possible</p>
          <h1 className="section-title">Nos annonces</h1>
          <p className="section-sub">Stock mis à jour quotidiennement</p>
        </div>
        <div className="filters-wrap">
          <input className="filter-input" placeholder="🔍  Rechercher (Peugeot, Clio…)" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">💰  Tous budgets</option>
            <option value="< 2000 €">&lt; 2 000 €</option>
            <option value="2000-4000 €">2 000 – 4 000 €</option>
            <option value="≥ 4000 €">≥ 4 000 €</option>
          </select>
          <select className="filter-select" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">⛽  Carburant</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
          <select className="filter-select" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
            <option value="">🕹  Boîte</option>
            <option value="Manuelle">Manuelle</option>
            <option value="Automatique">Automatique</option>
          </select>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="available">Disponibles</option>
            <option value="reserved">Réservées</option>
            <option value="all">Tous statuts</option>
          </select>
          <span className="filters-count">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && <button className="btn-reset" onClick={reset}>✕ Effacer</button>}
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h3>Aucun résultat</h3>
            <p style={{marginBottom:"24px"}}>Essayez d&apos;autres filtres ou revenez bientôt.</p>
            <button className="btn btn-ghost" onClick={reset}>Voir toutes les annonces</button>
          </div>
        ) : (
          <div className="cars-grid">
            {filtered.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </section>
  );
}
HEREDOC
echo "  ✓ stock/page.tsx"

# ── Car detail ──────────────────────────────────────────────
mkdir -p "src/app/car/[id]"
cat > "src/app/car/[id]/page.tsx" << 'HEREDOC'
import { notFound } from "next/navigation";
import Link from "next/link";
import { cars, getCarById } from "../../data/cars";
import type { Metadata } from "next";

export async function generateStaticParams() { return cars.map((car) => ({ id: car.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) return { title: "Voiture non trouvée" };
  return { title: `${car.title} — ${car.price.toLocaleString("fr-FR")} € | AUTOWEB`, description: car.description };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) notFound();
  const isAvailable = car.status === "available";
  const statusColor = car.status === "available" ? "var(--accent)" : car.status === "reserved" ? "#f59e0b" : "var(--gray)";
  const statusLabel = car.status === "available" ? "Disponible" : car.status === "reserved" ? "Réservé" : "Vendu";
  return (
    <section className="section">
      <div className="container">
        <Link href="/stock" className="back-link">← Retour aux annonces</Link>
        <div className="detail-wrap">
          <div>
            <div className="detail-img-main">
              {car.images[0]
                ? <img src={car.images[0]} alt={car.title} />
                : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"64px",background:"var(--bg3)"}}>🚗</div>
              }
            </div>
            {car.images.length > 1 && (
              <div className="detail-thumbs">
                {car.images.slice(1).map((img, i) => (
                  <div key={i} className="detail-thumb"><img src={img} alt={`${car.title} ${i+2}`} /></div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="detail-brand">{car.fuel} · {car.gearbox}</p>
            <h1 className="detail-title">{car.title}</h1>
            <div className="detail-status">
              <span className="status-dot" style={{background:statusColor}} />
              <span style={{color:statusColor}}>{statusLabel}</span>
              <span style={{color:"var(--gray)",marginLeft:"8px"}}>{car.budgetTag}</span>
            </div>
            <p className="detail-price">{car.price.toLocaleString("fr-FR")} €<span style={{fontSize:"16px",color:"var(--gray)",fontWeight:400,marginLeft:"8px"}}>TTC</span></p>
            <div className="detail-specs-grid">
              {[["Année",String(car.year)],["Kilométrage",`${car.km.toLocaleString("fr-FR")} km`],["Carburant",car.fuel],["Boîte",car.gearbox]].map(([l,v]) => (
                <div key={l} className="spec-box"><p className="spec-box-label">{l}</p><p className="spec-box-value">{v}</p></div>
              ))}
            </div>
            <div className="detail-feats">{car.features.map((f) => <span key={f} className="car-feat">{f}</span>)}</div>
            <div className="detail-desc">{car.description}</div>
            {isAvailable ? (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <Link href={`/contact?voiture=${encodeURIComponent(car.title)}&prix=${car.price}`} className="btn btn-accent btn-full btn-lg">🎯 Réserver ce véhicule</Link>
                <a href="https://wa.me/33698765432" className="btn btn-ghost btn-full">💬 WhatsApp — Réponse rapide</a>
                <a href="tel:0698765432" className="btn btn-ghost btn-full">📞 06 98 76 54 32</a>
              </div>
            ) : (
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"20px",textAlign:"center",color:"var(--gray)"}}>
                Ce véhicule n&apos;est plus disponible.{" "}
                <Link href="/stock" style={{color:"var(--accent)",fontWeight:600}}>Voir le stock →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
HEREDOC
echo "  ✓ car/[id]/page.tsx"

# ── Contact ─────────────────────────────────────────────────
cat > src/app/contact/page.tsx << 'HEREDOC'
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ContactForm() {
  const sp = useSearchParams();
  const voiture = sp.get("voiture") ?? "";
  const prix    = sp.get("prix") ?? "";
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form    = e.currentTarget;
    const nom     = (form.elements.namedItem("nom")     as HTMLInputElement).value;
    const tel     = (form.elements.namedItem("tel")     as HTMLInputElement).value;
    const budget  = (form.elements.namedItem("budget")  as HTMLSelectElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const body = [voiture?`Véhicule : ${voiture}${prix?` — ${prix} €`:""}`:"",,`Nom : ${nom}`,`Téléphone : ${tel}`,`Budget : ${budget}`,message?`\nMessage :\n${message}`:""].filter(Boolean).join("\n");
    window.location.href = `mailto:contact@autowebcommerce.fr?subject=Demande${voiture?` — ${voiture}`:""}&body=${encodeURIComponent(body)}`;
  };
  return (
    <form onSubmit={handleSubmit}>
      {voiture && (
        <div style={{background:"rgba(154,255,58,.08)",border:"1px solid rgba(154,255,58,.2)",borderRadius:"var(--radius)",padding:"12px 16px",marginBottom:"20px",fontSize:"14px",color:"var(--accent)"}}>
          🚗 <strong>{voiture}</strong>{prix?` — ${Number(prix).toLocaleString("fr-FR")} € TTC`:""}
        </div>
      )}
      <div className="form-group"><label className="form-label" htmlFor="nom">Nom complet *</label><input id="nom" name="nom" required className="form-input" placeholder="Jean Dupont" /></div>
      <div className="form-group"><label className="form-label" htmlFor="tel">Téléphone *</label><input id="tel" name="tel" type="tel" required className="form-input" placeholder="06 XX XX XX XX" /></div>
      <div className="form-group">
        <label className="form-label" htmlFor="budget">Budget</label>
        <select id="budget" name="budget" className="form-select">
          <option value="">Sélectionner</option>
          <option value="< 2000 €">&lt; 2 000 €</option>
          <option value="2000-4000 €">2 000 – 4 000 €</option>
          <option value="≥ 4000 €">≥ 4 000 €</option>
        </select>
      </div>
      <div className="form-group"><label className="form-label" htmlFor="message">Message</label><textarea id="message" name="message" className="form-textarea" placeholder="Type de véhicule recherché…" defaultValue={voiture?`Bonjour, je suis intéressé(e) par la ${voiture}.`:""} /></div>
      <button type="submit" className="btn btn-accent btn-full btn-lg" style={{marginTop:"8px"}}>📩 Envoyer ma demande</button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="section-eyebrow">Réponse sous 24h</p>
          <h1 className="section-title">Contactez-nous</h1>
          <p className="section-sub">Par téléphone, WhatsApp ou formulaire</p>
        </div>
        <div className="contact-grid">
          <div>
            <div className="contact-phone-card">
              <p style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:".1em",color:"var(--gray)",fontWeight:700}}>Appel direct</p>
              <p className="contact-phone-num">06 98 76 54 32</p>
              <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
                <a href="tel:0698765432" className="btn btn-accent">📞 Appeler</a>
                <a href="https://wa.me/33698765432" className="btn btn-ghost">💬 WhatsApp</a>
              </div>
            </div>
            {([["Email","contact@autowebcommerce.fr","mailto:contact@autowebcommerce.fr"],["Site","www.souqify.fr","https://souqify.fr"],["Adresse","2 Allée de la Mannée · 59910 Bondues",null],["SIREN","SAS 100148469",null]] as [string,string,string|null][]).map(([l,v,h]) => (
              <div key={l} className="contact-row">
                <span className="contact-row-label">{l}</span>
                {h?<a href={h} className="contact-row-value" style={{color:"var(--accent)"}}>{v}</a>:<span className="contact-row-value">{v}</span>}
              </div>
            ))}
            <div style={{borderRadius:"var(--radius)",overflow:"hidden",border:"1px solid var(--border)",marginTop:"20px"}}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2515.496335972989!2d3.0745!3d50.9167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDU1JzM2LjQiTiAzwrAzJzU2LjIiRQ!5e0!3m2!1sfr!2sfr!4v1699999999999" width="100%" height="200" loading="lazy" style={{border:0,display:"block"}} allowFullScreen />
            </div>
          </div>
          <div>
            <Suspense fallback={<div style={{color:"var(--gray)"}}>Chargement…</div>}><ContactForm /></Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
HEREDOC
echo "  ✓ contact/page.tsx"

# ── cars.ts ─────────────────────────────────────────────────
cat > src/app/data/cars.ts << 'HEREDOC'
export type FuelType    = "Essence" | "Diesel" | "Hybride" | "Électrique";
export type GearboxType = "Manuelle" | "Automatique";
export type BudgetTag   = "< 2000 €" | "2000-4000 €" | "≥ 4000 €";
export type CarStatus   = "available" | "reserved" | "sold";
export type Car = {
  id: string; title: string; price: number; year: number; km: number;
  fuel: FuelType; gearbox: GearboxType; images: string[];
  description: string; budgetTag: BudgetTag; status: CarStatus;
  features: string[]; addedAt: string;
};
export const cars: Car[] = [
  { "id":"peugeot-206-2008","title":"Peugeot 206 1.4 Essence","price":1900,"year":2008,"km":145000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/peugeot1.jpg"],"description":"Peugeot 206 en très bon état. Idéale premier véhicule ou petits budgets. Carnet d'entretien à jour.","budgetTag":"< 2000 €","status":"available","features":["CT OK","Entretien à jour","Économique"],"addedAt":"2026-03-10T10:00:00Z" },
  { "id":"renault-clio-2012","title":"Renault Clio 1.2 16V","price":3500,"year":2012,"km":98000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/clio1.jpg"],"description":"Clio très propre, historique complet, aucun accident. Clim, vitres électriques, radio Bluetooth.","budgetTag":"2000-4000 €","status":"available","features":["Climatisation","CT OK","Garantie 3 mois","Bluetooth"],"addedAt":"2026-03-12T09:00:00Z" },
  { "id":"citroen-c3-2015","title":"Citroën C3 1.6 HDi","price":5200,"year":2015,"km":112000,"fuel":"Diesel","gearbox":"Manuelle","images":["/cars/c31.jpg"],"description":"C3 Diesel économique, parfaite pour longs trajets. Garantie 3 mois incluse. Équipements complets.","budgetTag":"≥ 4000 €","status":"available","features":["Garantie 3 mois","CT OK","Diesel économique","GPS"],"addedAt":"2026-03-14T14:00:00Z" },
  { "id":"fiat-punto-2009","title":"Fiat Punto 1.2","price":2400,"year":2009,"km":132000,"fuel":"Essence","gearbox":"Manuelle","images":["/cars/punto1.jpg"],"description":"Punto fiable et économique. Idéale en ville. Faible consommation, petite assurance.","budgetTag":"2000-4000 €","status":"available","features":["CT OK","Faible consommation","Petite assurance"],"addedAt":"2026-03-08T11:00:00Z" }
];
export const getAvailableCars = () => cars.filter((c) => c.status === "available");
export const getCarById = (id: string) => cars.find((c) => c.id === id) ?? null;
export const getLatestCars = (n = 6) =>
  [...cars].filter((c) => c.status === "available")
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, n);
export const getBudgetTag = (price: number): BudgetTag =>
  price < 2000 ? "< 2000 €" : price <= 4000 ? "2000-4000 €" : "≥ 4000 €";
HEREDOC
echo "  ✓ cars.ts"

# ── API route ────────────────────────────────────────────────
cat > src/app/api/cars/route.ts << 'HEREDOC'
import { NextRequest, NextResponse } from "next/server";
import { cars } from "../../data/cars";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  let r = [...cars];
  const s = p.get("status"); if (s && s !== "all") r = r.filter(c => c.status === s);
  const f = p.get("fuel");   if (f) r = r.filter(c => c.fuel === f);
  const b = p.get("budget"); if (b) { const m: Record<string,string> = {"<2000":"< 2000 €","2000-4000":"2000-4000 €","4000+":"≥ 4000 €"}; const t = m[b]; if (t) r = r.filter(c => c.budgetTag === t); }
  return NextResponse.json({ count: r.length, cars: r, updatedAt: new Date().toISOString() });
}
HEREDOC
echo "  ✓ api/cars/route.ts"

# ── Configs ──────────────────────────────────────────────────
cat > next.config.js << 'HEREDOC'
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: __dirname },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
module.exports = nextConfig;
HEREDOC
cat > tailwind.config.ts << 'HEREDOC'
import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: {} }, plugins: [] };
export default config;
HEREDOC
[ -f next.config.ts ] && rm next.config.ts && echo "  ✓ removed next.config.ts"

for f in peugeot1.jpg clio1.jpg c31.jpg punto1.jpg; do
  [ -f "public/cars/$f" ] || touch "public/cars/$f"
done

echo ""
echo "✅ Done! Run:  npm run build && npm run dev"
echo ""
echo "📸 The site will look good but GREAT once you add real photos to public/cars/"
echo "   Real photos: peugeot1.jpg, clio1.jpg, c31.jpg, punto1.jpg"

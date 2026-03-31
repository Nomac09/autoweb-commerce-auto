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
    const body = [
      voiture ? `Véhicule : ${voiture}${prix ? ` — ${prix} €` : ""}` : "",
      `Nom : ${nom}`, `Téléphone : ${tel}`, `Budget : ${budget}`,
      message ? `\nMessage :\n${message}` : "",
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:autowebcommercesas@gmail.com?subject=Demande${voiture ? ` — ${voiture}` : ""}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      {voiture && (
        <div style={{ background:"rgba(154,255,58,.08)", border:"1px solid rgba(154,255,58,.2)", borderRadius:"var(--radius)", padding:"12px 16px", marginBottom:"20px", fontSize:"14px", color:"var(--accent)" }}>
          🚗 <strong>{voiture}</strong>{prix ? ` — ${Number(prix).toLocaleString("fr-FR")} € TTC` : ""}
        </div>
      )}
      <div className="form-group">
        <label className="form-label" htmlFor="nom">Nom complet *</label>
        <input id="nom" name="nom" required className="form-input" placeholder="Jean Dupont" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="tel">Téléphone *</label>
        <input id="tel" name="tel" type="tel" required className="form-input" placeholder="07 XX XX XX XX" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="budget">Budget</label>
        <select id="budget" name="budget" className="form-select">
          <option value="">Sélectionner</option>
          <option value="< 2000 €">&lt; 2 000 €</option>
          <option value="2000-4000 €">2 000 – 4 000 €</option>
          <option value="≥ 4000 €">≥ 4 000 €</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="message">Message</label>
        <textarea id="message" name="message" className="form-textarea"
          placeholder="Type de véhicule recherché, disponibilités…"
          defaultValue={voiture ? `Bonjour, je suis intéressé(e) par la ${voiture}.` : ""}
        />
      </div>
      <button type="submit" className="btn btn-accent btn-full btn-lg" style={{ marginTop:"8px" }}>
        📩 Envoyer ma demande
      </button>
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
          <div className="contact-info">
            {/* Phone card */}
            <div className="contact-phone-card">
              <p style={{ fontSize:"11px", textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.5)", fontWeight:700 }}>Appel direct</p>
              <p className="contact-phone-num">07 83 80 96 94</p>
              <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
                <a href="tel:0783809694" className="btn btn-accent">📞 Appeler</a>
                <a href="https://wa.me/33783809694" className="btn btn-ghost">💬 WhatsApp</a>
              </div>
            </div>

            {/* Info rows */}
            {([
              ["Téléphone", "07 83 80 96 94",            "tel:0783809694"],
              ["WhatsApp",  "07 83 80 96 94",            "https://wa.me/33783809694"],
              ["Email",     "autowebcommercesas@gmail.com", "mailto:autowebcommercesas@gmail.com"],
              ["Site",      "www.autoweb-commerce.fr",             "https://souqify.fr"],
              ["Adresse",   "2 Allée de la Mannée · 59910 Bondues", null],
              ["SIREN",     "SAS 100148469",              null],
            ] as [string, string, string | null][]).map(([label, value, href]) => (
              <div key={label} className="contact-row">
                <span className="contact-row-label">{label}</span>
                {href
                  ? <a href={href} className="contact-row-value" style={{ color:"var(--accent)" }}>{value}</a>
                  : <span className="contact-row-value">{value}</span>
                }
              </div>
            ))}

            {/* Horaires */}
            <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"20px", marginTop:"8px" }}>
              <p style={{ fontFamily:"var(--font-head)", fontSize:"14px", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"var(--accent)", marginBottom:"12px" }}>Horaires d&apos;ouverture</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px", fontSize:"14px", color:"rgba(255,255,255,.8)" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Lundi – Vendredi</span>
                  <span style={{ color:"var(--white)", fontWeight:600 }}>9h – 12h · 14h – 19h</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Samedi</span>
                  <span style={{ color:"var(--white)", fontWeight:600 }}>9h – 17h</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Dimanche</span>
                  <span style={{ color:"var(--gray)" }}>Fermé</span>
                </div>
              </div>
            </div>

            {/* Google Maps — correct address */}
            <div style={{ borderRadius:"var(--radius-lg)", overflow:"hidden", border:"1px solid var(--border)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2513.8!2d3.08!3d50.693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c2d5e7a1234567%3A0x1234567890abcdef!2s2%20All%C3%A9e%20de%20la%20Mann%C3%A9e%2C%2059910%20Bondues!5e0!3m2!1sfr!2sfr!4v1742665200000"
                width="100%" height="220" loading="lazy"
                style={{ border:0, display:"block" }}
                allowFullScreen
              />
              <p style={{ fontSize:"12px", color:"var(--gray)", padding:"10px 14px", textAlign:"center" }}>
                2 Allée de la Mannée · 59910 Bondues
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <Suspense fallback={<div style={{ color:"var(--gray)" }}>Chargement…</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

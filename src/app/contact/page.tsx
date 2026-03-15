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

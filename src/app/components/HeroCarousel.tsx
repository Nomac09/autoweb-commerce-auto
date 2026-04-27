"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1600&q=80&fit=crop",
    label: "Sélection premium",
  },
  {
    img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&q=80&fit=crop",
    label: "CT OK · Révisé",
  },
  {
    img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80&fit=crop",
    label: "Garantie 3 mois",
  },
];

export default function HeroCarousel({ count }: { count: number }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const go = useCallback((idx: number) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  }, []);

  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go]);
  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(320px, 55vw, 620px)", overflow: "hidden", background: "#0a0a0b" }}>
      <img
        src={SLIDES[current].img}
        alt="AUTOWEB COMMERCE"
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          opacity: fade ? 1 : 0,
          transition: "opacity .4s ease",
          filter: "brightness(0.45)",
        }}
      />

      {/* Overlay content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 clamp(24px, 6vw, 96px)",
        maxWidth: "800px",
      }}>
        <p style={{
          fontSize: "11px", fontWeight: 500, letterSpacing: ".18em",
          textTransform: "uppercase", color: "rgba(255,255,255,.5)",
          marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px"
        }}>
          <span style={{ display: "inline-block", width: "24px", height: "1px", background: "rgba(255,255,255,.4)" }} />
          Bondues, Nord · {SLIDES[current].label}
        </p>
        <h1 style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
          fontWeight: 700, lineHeight: 1.02,
          letterSpacing: "-.01em", color: "#f4f2ef",
          marginBottom: "20px",
        }}>
          {"L’occasion de confiance,"}<br />
          <span style={{ color: "rgba(255,255,255,.55)" }}>{"à prix net."}</span>
        </h1>
        <p style={{
          fontSize: "15px", color: "rgba(255,255,255,.6)",
          lineHeight: 1.75, maxWidth: "440px", marginBottom: "36px"
        }}>
          Garantie 3 mois · CT à jour · Paiement en 3 ou 4 fois sans frais
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/stock" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "13px 32px", background: "#f4f2ef", color: "#0a0a0b",
            fontSize: "12px", fontWeight: 700, letterSpacing: ".06em",
            textTransform: "uppercase", borderRadius: "4px", textDecoration: "none",
          }}>Voir le stock</Link>
          <a href="https://wa.me/33783809694" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "13px 32px", background: "transparent", color: "rgba(255,255,255,.8)",
            fontSize: "12px", fontWeight: 600, letterSpacing: ".06em",
            textTransform: "uppercase", borderRadius: "4px", textDecoration: "none",
            border: "1px solid rgba(255,255,255,.25)",
          }}>WhatsApp</a>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "rgba(10,10,11,.85)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255,255,255,.07)",
        display: "flex",
      }}>
        {[
          [String(count), "Véhicules disponibles"],
          ["3 mois", "Garantie incluse"],
          ["CT OK", "À jour à la livraison"],
          ["4×", "Sans frais dès 4 000 €"],
        ].map(([v, l], i) => (
          <div key={l} style={{
            flex: 1, padding: "16px 8px", textAlign: "center",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,.07)" : "none",
          }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "20px", fontWeight: 700, color: "#f4f2ef", lineHeight: 1 }}>{v}</p>
            <p style={{ fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginTop: "4px" }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button onClick={prev} style={{
        position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
        width: "40px", height: "40px", borderRadius: "50%",
        background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.15)",
        color: "#fff", fontSize: "20px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>‹</button>
      <button onClick={next} style={{
        position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
        width: "40px", height: "40px", borderRadius: "50%",
        background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.15)",
        color: "#fff", fontSize: "20px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>›</button>

      {/* Dots */}
      <div style={{
        position: "absolute", right: "24px", bottom: "90px",
        display: "flex", flexDirection: "column", gap: "6px",
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{
            width: "6px", height: i === current ? "22px" : "6px",
            borderRadius: "100px", border: "none", cursor: "pointer", padding: 0,
            background: i === current ? "#f4f2ef" : "rgba(255,255,255,.3)",
            transition: "all .3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

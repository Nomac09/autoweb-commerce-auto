"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Car = { id: string; title: string; price: number; images: string[]; fuel: string; km: number; year: number; };

const HERO_SLIDES = [
  {
    id: "hero-1",
    img: "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_1.svg",
    label: null,
  },
  {
    id: "hero-2",
    img: "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_2.svg",
    label: null,
  },
  {
    id: "hero-3",
    img: "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_3.svg",
    label: null,
  },
];

export default function HeroCarousel({ cars }: { cars: Car[] }) {
  // Combine hero slides + real car slides
  const slides = [
    ...HERO_SLIDES,
    ...cars.filter(c => c.images?.[0]).slice(0, 5).map(c => ({
      id: c.id,
      img: c.images[0],
      label: { title: c.title, price: c.price, fuel: c.fuel, km: c.km, year: c.year },
    })),
  ];

  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const go = useCallback((idx: number) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  }, []);

  const prev = useCallback(() => go((current - 1 + slides.length) % slides.length), [current, slides.length, go]);
  const next = useCallback(() => go((current + 1) % slides.length), [current, slides.length, go]);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(280px, 52vw, 580px)", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Image */}
      <img
        key={slide.id}
        src={slide.img}
        alt="AUTOWEB"
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          opacity: fade ? 1 : 0,
          transition: "opacity .35s ease",
        }}
      />

      {/* Overlay only for car slides */}
      {slide.label && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.15) 55%, transparent 100%)" }} />
      )}

      {/* Car info caption */}
      {slide.label && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "clamp(16px,4vw,40px)",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: "16px", flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9aff3a", marginBottom: "6px" }}>
              {slide.label.fuel} · {slide.label.year} · {slide.label.km?.toLocaleString("fr-FR")} km
            </p>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(1.3rem,3vw,2.4rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", lineHeight: 1.1, marginBottom: "10px" }}>
              {slide.label.title}
            </h2>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(1.5rem,3.5vw,2.6rem)", fontWeight: 700, color: "#9aff3a", lineHeight: 1 }}>
              {slide.label.price?.toLocaleString("fr-FR")} €{" "}
              <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,.55)" }}>TTC</span>
            </p>
          </div>
          <Link href={`/car/${slide.id}`} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "13px 24px", background: "#9aff3a", color: "#0a0a0a",
            borderRadius: "6px", fontWeight: 700, fontSize: "13px",
            textTransform: "uppercase", letterSpacing: ".06em",
            textDecoration: "none", flexShrink: 0,
          }}>
            Voir ce véhicule →
          </Link>
        </div>
      )}

      {/* Prev / Next */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} style={{
            position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
            width: "42px", height: "42px", borderRadius: "50%",
            background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.15)",
            color: "#fff", fontSize: "22px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <button onClick={next} style={{
            position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
            width: "42px", height: "42px", borderRadius: "50%",
            background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.15)",
            color: "#fff", fontSize: "22px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        </>
      )}

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: "7px",
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{
            width: i === current ? "22px" : "7px", height: "7px",
            borderRadius: "100px", border: "none", cursor: "pointer", padding: 0,
            background: i === current ? "#9aff3a" : "rgba(255,255,255,.35)",
            transition: "all .3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

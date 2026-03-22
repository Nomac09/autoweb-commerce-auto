"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Car = { id: string; title: string; price: number; images: string[]; fuel: string; km: number; year: number; };

export default function HeroCarousel({ cars }: { cars: Car[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 400);
  }, [animating]);

  const prev = useCallback(() => go((current - 1 + cars.length) % cars.length), [current, cars.length, go]);
  const next = useCallback(() => go((current + 1) % cars.length), [current, cars.length, go]);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  if (!cars.length) return null;
  const car = cars[current];

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(300px, 55vw, 620px)", overflow: "hidden", background: "#000", cursor: "pointer" }}>
      {/* Slides */}
      {cars.map((c, i) => (
        <div key={c.id} style={{
          position: "absolute", inset: 0,
          opacity: i === current ? 1 : 0,
          transition: "opacity .5s ease",
          pointerEvents: i === current ? "auto" : "none",
        }}>
          {c.images?.[0] && (
            <img
              src={c.images[0]}
              alt={c.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
          {/* Dark gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 50%, rgba(0,0,0,.3) 100%)" }} />
        </div>
      ))}

      {/* Caption */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "clamp(16px,4vw,40px)",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: "16px", flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px" }}>
            {car.fuel} · {car.year} · {car.km?.toLocaleString("fr-FR")} km
          </p>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(1.4rem,3.5vw,2.6rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", lineHeight: 1.1, marginBottom: "10px" }}>
            {car.title}
          </h2>
          <p style={{ fontFamily: "var(--font-head)", fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
            {car.price?.toLocaleString("fr-FR")} € <span style={{ fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,.6)" }}>TTC</span>
          </p>
        </div>
        <Link href={`/car/${car.id}`} className="btn btn-accent" style={{ flexShrink: 0 }}>
          Voir ce véhicule →
        </Link>
      </div>

      {/* Prev / Next arrows */}
      {cars.length > 1 && (
        <>
          <button onClick={prev} style={{
            position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
            fontSize: "22px", cursor: "pointer", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
          >‹</button>
          <button onClick={next} style={{
            position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
            fontSize: "22px", cursor: "pointer", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
          >›</button>
        </>
      )}

      {/* Dots */}
      {cars.length > 1 && (
        <div style={{
          position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "8px",
        }}>
          {cars.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{
              width: i === current ? "24px" : "8px", height: "8px",
              borderRadius: "100px", border: "none", cursor: "pointer",
              background: i === current ? "var(--accent)" : "rgba(255,255,255,.4)",
              transition: "all .3s ease", padding: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

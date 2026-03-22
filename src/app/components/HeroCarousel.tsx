"use client";
import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_1.svg",
  "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_2.svg",
  "https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/hero_banner_3.svg",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const go = useCallback((idx: number) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  }, []);

  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go]);
  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(280px, 52vw, 580px)", overflow: "hidden", background: "#0a0a0a" }}>
      <img
        key={current}
        src={SLIDES[current]}
        alt="AUTOWEB COMMERCE"
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          opacity: fade ? 1 : 0,
          transition: "opacity .35s ease",
        }}
      />

      {/* Prev / Next */}
      <button onClick={prev} style={{
        position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
        width: "42px", height: "42px", borderRadius: "50%",
        background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.15)",
        color: "#fff", fontSize: "24px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>‹</button>
      <button onClick={next} style={{
        position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
        width: "42px", height: "42px", borderRadius: "50%",
        background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.15)",
        color: "#fff", fontSize: "24px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>›</button>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: "8px",
      }}>
        {SLIDES.map((_, i) => (
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

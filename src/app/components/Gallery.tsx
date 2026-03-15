"use client";
import { useState, useEffect, useCallback } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  if (!images.length) {
    return (
      <div style={{ background: "var(--bg3)", borderRadius: "var(--radius)", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>
        🚗
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div>
        <div
          onClick={() => setLightbox(true)}
          style={{ cursor: "zoom-in", borderRadius: "var(--radius)", overflow: "hidden", aspectRatio: "4/3", background: "var(--bg3)", position: "relative" }}
        >
          <img src={images[active]} alt={`${title} ${active + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {images.length > 1 && (
            <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,.6)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "100px", backdropFilter: "blur(4px)" }}>
              {active + 1} / {images.length}
            </div>
          )}
          <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,.5)", color: "var(--accent)", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px", backdropFilter: "blur(4px)", letterSpacing: ".06em" }}>
            🔍 Agrandir
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: "72px", height: "54px", borderRadius: "6px", overflow: "hidden",
                  cursor: "pointer", flexShrink: 0,
                  border: i === active ? "2px solid var(--accent)" : "2px solid transparent",
                  opacity: i === active ? 1 : 0.6,
                  transition: "all .15s ease",
                }}
              >
                <img src={img} alt={`${title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.95)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: "40px", height: "40px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", zIndex: 10 }}
          >
            ✕
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: "48px", height: "48px", borderRadius: "50%", fontSize: "22px", cursor: "pointer", zIndex: 10 }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={images[active]}
            alt={`${title} ${active + 1}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px", userSelect: "none" }}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: "48px", height: "48px", borderRadius: "50%", fontSize: "22px", cursor: "pointer", zIndex: 10 }}
            >
              ›
            </button>
          )}

          {/* Counter */}
          <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.7)", fontSize: "13px", fontWeight: 600 }}>
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

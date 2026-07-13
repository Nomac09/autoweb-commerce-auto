"use client";

import { useState } from "react";
import Image from "next/image";

export default function Gallery({
  photos,
  alt,
  overlay,
}: {
  photos: string[];
  alt: string;
  overlay?: string; // e.g. "Vendu" scrim on sold vehicles
}) {
  const [active, setActive] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[4/3] bg-surface border border-hairline rounded-sm flex items-center justify-center">
        <span className="text-muted text-sm">Photos à venir</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] bg-[#1e1e22] border border-hairline rounded-sm overflow-hidden">
        <Image
          src={photos[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
        {overlay && (
          <div className="absolute inset-0 bg-anthracite/45 flex items-center justify-center">
            <span className="border border-bone/70 text-bone text-sm uppercase tracking-[0.2em] px-6 py-2">
              {overlay}
            </span>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={`relative aspect-[4/3] rounded-sm overflow-hidden border transition-colors ${
                i === active ? "border-bone" : "border-hairline hover:border-muted"
              }`}
            >
              <Image src={p} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

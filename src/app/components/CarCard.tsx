"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Car } from "@/lib/cars";
import { formatPrice, formatKm } from "@/lib/format";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

export default function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const sold = car.status === "sold";
  const reserved = car.status === "reserved";
  const cover = car.photos?.[0];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Link
        href={`/stock/${car.slug}`}
        className="group block bg-surface border border-hairline rounded-sm overflow-hidden hover:border-muted transition-colors duration-300"
      >
        <div className="relative aspect-[4/3] bg-[#1e1e22] overflow-hidden">
          {cover && (
            <Image
              src={cover}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {(sold || reserved) && (
            <div className="absolute inset-0 bg-anthracite/55 flex items-center justify-center">
              <span className="border border-bone/70 text-bone text-xs uppercase tracking-[0.2em] px-4 py-1.5">
                {sold ? "Vendu" : "Réservé"}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="font-sans text-[0.6rem] uppercase tracking-widest text-muted mb-1">
            {car.year}
            {car.fuel ? ` · ${car.fuel}` : ""}
            {car.mileage_km ? ` · ${formatKm(car.mileage_km)}` : ""}
          </p>
          <h3 className="font-display text-bone text-xl leading-tight">
            {car.make} {car.model}
          </h3>
          {car.version && <p className="text-muted text-sm mt-0.5">{car.version}</p>}
          <div className="mt-4 border-t border-hairline pt-4 flex items-center justify-between">
            {sold ? (
              <span className="text-muted text-sm uppercase tracking-widest">Vendu</span>
            ) : car.price_eur != null ? (
              <span className="text-bone font-sans text-base font-medium">
                {formatPrice(car.price_eur)}{" "}
                <span className="text-muted text-xs font-normal">TTC</span>
              </span>
            ) : (
              <span className="text-muted text-sm">Nous consulter</span>
            )}
            {car.color && <span className="text-muted text-xs">{car.color}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

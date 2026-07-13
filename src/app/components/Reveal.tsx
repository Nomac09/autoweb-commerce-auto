"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

// Generic fade-up wrapper so server components can compose animated sections.
// `onLoad` animates immediately (hero); otherwise animates when scrolled into view.
export default function Reveal({
  children,
  i = 0,
  onLoad = false,
  className,
}: {
  children: ReactNode;
  i?: number;
  onLoad?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      custom={i}
      variants={fadeUp}
      initial="hidden"
      {...(onLoad
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true } })}
      className={className}
    >
      {children}
    </motion.div>
  );
}

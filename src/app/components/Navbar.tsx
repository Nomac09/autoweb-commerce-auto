"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Le stock", href: "/stock" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-anthracite border-b border-hairline transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-black/40" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-[72px] flex items-center justify-between">
          {/* Left: wordmark + eyebrow */}
          <Link href="/" className="flex flex-col leading-none gap-0.5">
            <span className="font-display tracking-tight text-bone text-lg md:text-xl">
              AUTOWEB
            </span>
            <span className="font-sans text-[0.65rem] text-muted tracking-widest uppercase">
              BONDUES · LILLE
            </span>
          </Link>

          {/* Center: nav links (desktop only) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm text-bone hover:text-oxblood transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: CTA (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden md:inline-flex rounded-full bg-oxblood text-bone px-5 py-2 text-sm hover:brightness-110 transition"
            >
              Nous contacter
            </Link>
            <button
              className="md:hidden text-bone"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-anthracite flex flex-col px-6 py-8"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ ease: "easeOut" as const, duration: 0.4 }}
          >
            <button
              className="self-end text-bone mb-12"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer le menu"
            >
              <X size={28} />
            </button>
            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-display text-3xl text-bone hover:text-oxblood transition-colors duration-200"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

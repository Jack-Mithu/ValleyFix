"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why ValleyFix", href: "#why-valleyfix" },
  { label: "Service areas", href: "#areas" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Transparent over the dark hero, solid white once the page scrolls.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  const solid = scrolled || mobileOpen;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <nav
        className={`mx-auto max-w-7xl rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
          solid
            ? "border border-slate-200/80 bg-white/90 shadow-lg shadow-oxford-900/10 backdrop-blur-xl"
            : "border border-white/10 bg-white/5 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo tone={solid ? "light" : "dark"} />

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  solid
                    ? "text-slate-600 hover:bg-oxford-50 hover:text-oxford-900"
                    : "text-oxford-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                solid ? "text-oxford-900 hover:bg-oxford-50" : "text-white hover:bg-white/10"
              }`}
            >
              Login
            </Link>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="inline-flex rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-semibold text-oxford-900 shadow-lg shadow-gold-500/30 transition-colors hover:bg-marigold-400"
              >
                Get started
              </Link>
            </motion.div>
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className={`rounded-xl p-2 transition-colors md:hidden ${
              solid ? "text-oxford-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-4 flex flex-col gap-1 border-t border-slate-200 pt-4">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-oxford-50 hover:text-oxford-900"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/login"
                  className="mt-2 rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-oxford-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gold-400 px-3 py-3 text-center text-sm font-semibold text-oxford-900"
                >
                  Get started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

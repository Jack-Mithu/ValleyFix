"use client";
import Link from "next/link";

import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-4"
    >
      <nav className="mx-auto max-w-7xl rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-3 shadow-lg shadow-slate-200/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-600/20 transition-transform duration-300 group-hover:rotate-6">
              V
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Valley<span className="text-blue-600">Fix</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Services
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How it works
            </a>

            <a
              href="#why-valleyfix"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Why ValleyFix
            </a>

            <a
              href="#areas"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Service areas
            </a>
          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <motion.a
              href="/login"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Login
            </motion.a>

            <motion.a
              href="/register"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
            >
              Get started
            </motion.a>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 border-t border-slate-200 pt-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              <a
                href="#services"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                Services
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                How it works
              </a>

              <a
                href="#why-valleyfix"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                Why ValleyFix
              </a>

              <a
                href="#areas"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                Service areas
              </a>

              <a
                href="/login"
                className="mt-2 rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Login
              </a>

              <a
                href="/register"
                className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white"
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
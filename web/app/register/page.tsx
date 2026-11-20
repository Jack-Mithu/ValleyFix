"use client";
import Link from "next/link";

import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

const customerFeatures = [
  "Book trusted local home services",
  "Manage bookings in one place",
  "Review quotes and payments",
];

const technicianFeatures = [
  "Offer your professional services",
  "Manage your working availability",
  "Receive and manage bookings",
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-oxford-900 text-xl font-bold text-gold-400 shadow-lg shadow-oxford-900/20">
              V
            </div>

            <span className="text-2xl font-bold tracking-tight text-oxford-900">
              Valley<span className="text-marigold-600">Fix</span>
            </span>
          </Link>

          <p className="hidden text-sm text-slate-600 sm:block">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-oxford-900 transition hover:text-oxford-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-20 lg:px-8">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-oxford-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-oxford-100 bg-white px-4 py-2 text-sm font-medium text-oxford-700 shadow-sm">
              <Sparkles size={16} />
              Welcome to ValleyFix
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-oxford-900 sm:text-5xl lg:text-6xl">
              Let&apos;s get you
              <span className="block text-oxford-900">
                started.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Whether you need a helping hand at home or want to offer your
              professional services, there&apos;s a place for you at ValleyFix.
            </p>
          </motion.div>

          {/* Account type cards */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-7 lg:grid-cols-2">
            {/* Customer card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:border-oxford-200 hover:shadow-xl hover:shadow-oxford-950/5 sm:p-9"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-oxford-50 text-oxford-900 transition-colors group-hover:bg-oxford-900 group-hover:text-white">
                  <Home size={27} />
                </div>

                <span className="rounded-full bg-oxford-50 px-3 py-1.5 text-xs font-semibold text-oxford-700">
                  For customers
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-oxford-900">
                I need help at home
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Find the services you need, arrange bookings and keep
                everything organised in one place.
              </p>

              <div className="mt-7 space-y-4">
                {customerFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-oxford-900"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-9">
                <Link
                  href="/register/customer"
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-oxford-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-oxford-900/20 transition hover:bg-oxford-700"
                >
                  Create customer account
                  <ArrowRight size={18} />
                </Link>

                <p className="mt-3 text-center text-xs text-slate-600">
                  Register and start using ValleyFix.
                </p>
              </div>
            </motion.div>

            {/* Technician card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:border-gold-200 hover:shadow-xl hover:shadow-marigold-900/5 sm:p-9"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-marigold-800 transition-colors group-hover:bg-gold-400 group-hover:text-oxford-900">
                  <Wrench size={27} />
                </div>

                <span className="rounded-full bg-gold-50 px-3 py-1.5 text-xs font-semibold text-marigold-900">
                  For professionals
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-oxford-900">
                I offer home services
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Join our network of service professionals and manage your
                services, working areas and availability.
              </p>

              <div className="mt-7 space-y-4">
                {technicianFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-marigold-800"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-9">
                <Link
                  href="/register/technician"
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-4 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/20 transition hover:bg-marigold-400"
                >
                  Apply as a technician
                  <ArrowRight size={18} />
                </Link>

                <p className="mt-3 text-center text-xs text-slate-600">
                  Your application will be reviewed by our team.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trust section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-5 border-t border-slate-200 pt-8 sm:flex-row sm:gap-10"
          >
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck size={19} className="text-marigold-800" />
              A structured registration process
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ClipboardCheck size={19} className="text-marigold-800" />
              Technician applications reviewed
            </div>
          </motion.div>

          {/* Mobile sign in */}
          <p className="mt-10 text-center text-sm text-slate-600 sm:hidden">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-oxford-900 hover:text-oxford-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-600 sm:flex-row">
          <p>
            © {new Date().getFullYear()} ValleyFix. All rights reserved.
          </p>

          <Link
            href="/"
            className="font-medium transition hover:text-oxford-900"
          >
            Back to home
          </Link>
        </div>
      </footer>
    </main>
  );
}
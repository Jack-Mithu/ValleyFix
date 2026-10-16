"use client";

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
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
              V
            </div>

            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Valley<span className="text-blue-600">Fix</span>
            </span>
          </a>

          <p className="hidden text-sm text-slate-500 sm:block">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Sign in
            </a>
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-20 lg:px-8">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <Sparkles size={16} />
              Welcome to ValleyFix
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Let's get you
              <span className="block text-blue-600">
                started.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Whether you need a helping hand at home or want to offer your
              professional services, there's a place for you at ValleyFix.
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
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 sm:p-9"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Home size={27} />
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  For customers
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-slate-950">
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
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-9">
                <a
                  href="/register/customer"
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Create customer account
                  <ArrowRight size={18} />
                </a>

                <p className="mt-3 text-center text-xs text-slate-500">
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
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 sm:p-9"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                  <Wrench size={27} />
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  For professionals
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold text-slate-950">
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
                      className="mt-0.5 shrink-0 text-teal-700"
                    />

                    <span className="text-sm leading-6 text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-9">
                <a
                  href="/register/technician"
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800"
                >
                  Apply as a technician
                  <ArrowRight size={18} />
                </a>

                <p className="mt-3 text-center text-xs text-slate-500">
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
              <ShieldCheck size={19} className="text-teal-700" />
              A structured registration process
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ClipboardCheck size={19} className="text-teal-700" />
              Technician applications reviewed
            </div>
          </motion.div>

          {/* Mobile sign in */}
          <p className="mt-10 text-center text-sm text-slate-500 sm:hidden">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} ValleyFix. All rights reserved.
          </p>

          <a
            href="/"
            className="font-medium transition hover:text-blue-600"
          >
            Back to home
          </a>
        </div>
      </footer>
    </main>
  );
}
"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">

      {/* Soft background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[5%] top-[15%] h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[5%] right-[5%] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_40%)]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-16 pt-32 lg:px-8">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT CONTENT */}
          <div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              Trusted local home services
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl"
            >
              Reliable help for your home.

              <span className="mt-2 block text-blue-600">
                Right when you need it.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-7 max-w-xl text-lg leading-8 text-slate-600"
            >
              Book trusted local professionals for repairs, maintenance and
              everyday home services across South Wales.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <motion.a
                href="/register"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Book a service

                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.a>

              <motion.a
                href="#services"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Explore services
              </motion.a>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                Verified professionals
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-600" />
                Secure booking
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={16} className="text-green-600" />
                Flexible appointments
              </span>
            </motion.div>
          </div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-xl"
          >

            {/* Main card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50"
            >
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-7">

                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-200/50 blur-3xl" />

                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Wrench size={28} />
                  </div>

                  <p className="text-sm font-medium text-slate-500">
                    Your local service
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    Home repairs,
                    <br />
                    made simple.
                  </h2>
                </div>

                <div className="relative space-y-3">

                  {/* Service card */}
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Plumbing service
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Professional technician
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <Star size={14} fill="currentColor" />
                        4.9
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <MapPin size={18} className="text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        South Wales
                      </p>

                      <p className="text-xs text-slate-500">
                        Cardiff · Bridgend · Swansea
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating rating */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-5 top-16 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/50 sm:-left-10"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Star
                    size={19}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    4.9/5
                  </p>

                  <p className="text-xs text-slate-500">
                    Customer rating
                  </p>
                </div>

              </div>
            </motion.div>

            {/* Floating booking */}
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -right-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/50 sm:-right-8"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <CheckCircle2
                    size={19}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Booking confirmed
                  </p>

                  <p className="text-xs text-slate-500">
                    Your technician is on the way
                  </p>
                </div>

              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
} from "lucide-react";

const areas = [
  {
    name: "Cardiff",
    description: "Home services across Cardiff and surrounding communities.",
  },
  {
    name: "Bridgend",
    description: "Local professionals available across the Bridgend area.",
  },
  {
    name: "Swansea",
    description: "Reliable home services for customers across Swansea.",
  },
  {
    name: "Maesteg",
    description: "Helping residents find trusted local professionals nearby.",
  },
];

export default function ServiceAreas() {
  return (
    <section
      id="areas"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-28"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
            <MapPin size={15} />
            Service areas
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Local help, where you live.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            ValleyFix is being built to connect customers with local
            professionals across South Wales.
          </p>
        </motion.div>

        {/* Areas + map-style visual */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Areas */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {areas.map((area) => (
              <motion.div
                key={area.name}
                variants={{
                  hidden: {
                    opacity: 0,
                    x: -25,
                  },
                  visible: {
                    opacity: 1,
                    x: 0,
                  },
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <MapPin
                      size={22}
                      className="text-blue-600"
                    />
                  </div>

                  <CheckCircle2
                    size={20}
                    className="text-green-500"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {area.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {area.description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  Explore services
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Map-style panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          >
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Soft map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/70" />

            {/* Connection lines */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 600 420"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M105 105 C190 70 220 145 290 170 C355 195 395 130 490 155"
                stroke="#bfdbfe"
                strokeWidth="3"
                strokeDasharray="8 8"
              />

              <path
                d="M290 170 C260 235 330 275 405 300"
                stroke="#99f6e4"
                strokeWidth="3"
                strokeDasharray="8 8"
              />
            </svg>

            {/* Cardiff */}
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-[16%] top-[22%]"
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <MapPin size={21} />
                </div>

                <div className="absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md">
                  Cardiff
                </div>
              </div>
            </motion.div>

            {/* Bridgend */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="absolute left-[43%] top-[38%]"
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30">
                  <MapPin size={21} />
                </div>

                <div className="absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md">
                  Bridgend
                </div>
              </div>
            </motion.div>

            {/* Swansea */}
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="absolute left-[14%] top-[57%]"
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <MapPin size={21} />
                </div>

                <div className="absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md">
                  Swansea
                </div>
              </div>
            </motion.div>

            {/* Maesteg */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
              className="absolute left-[62%] top-[65%]"
            >
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                  <MapPin size={21} />
                </div>

                <div className="absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md">
                  Maesteg
                </div>
              </div>
            </motion.div>

            {/* Center information card */}
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Navigation
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Expanding locally
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    More areas can be added as ValleyFix grows.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500">
            Don&apos;t see your area?
          </p>

          <a
            href="/register"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Join ValleyFix and let us know
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import Contours from "./Contours";
import { usePauseOffscreen } from "./usePauseOffscreen";

// Map positions are percentages of the 600x420 map, roughly matching real geography.
const areas = [
  { name: "Swansea", postcode: "SA1", description: "Reliable home services across Swansea and the bay.", x: 16.7, y: 66 },
  { name: "Maesteg", postcode: "CF34", description: "Trusted local professionals in the Llynfi valley.", x: 41.7, y: 38 },
  { name: "Bridgend", postcode: "CF31", description: "Local technicians covering the Bridgend area.", x: 46, y: 62 },
  { name: "Cardiff", postcode: "CF10", description: "Home services across Cardiff and nearby communities.", x: 78.3, y: 64 },
];

const toSvg = (a: { x: number; y: number }) => `${(a.x / 100) * 600} ${(a.y / 100) * 420}`;
const [swansea, maesteg, bridgend, cardiff] = areas;

const routes = [
  `M${toSvg(swansea)} C 180 250 230 300 ${toSvg(bridgend)}`,
  `M${toSvg(bridgend)} C 340 300 400 300 ${toSvg(cardiff)}`,
  `M${toSvg(maesteg)} C 240 200 290 220 ${toSvg(bridgend)}`,
];

export default function ServiceAreas() {
  const [active, setActive] = useState<string | null>(null);
  const mapRef = usePauseOffscreen<HTMLDivElement>();

  return (
    <section id="areas" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-gold-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-marigold-700">
            Service areas
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-oxford-900 sm:text-5xl">
            Local help, where you live.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            We&apos;re starting across South Wales and growing valley by valley.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* Area list */}
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {areas.map((area) => (
              <motion.li
                key={area.name}
                variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
                onMouseEnter={() => setActive(area.name)}
                onMouseLeave={() => setActive(null)}
                className={`group cursor-default rounded-3xl border p-6 transition-all duration-300 ${
                  active === area.name
                    ? "-translate-y-1 border-gold-400 bg-gold-50 shadow-lg shadow-gold-500/10"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                      active === area.name ? "bg-gold-400 text-oxford-900" : "bg-oxford-900 text-gold-400"
                    }`}
                  >
                    <MapPin size={20} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                    {area.postcode}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-oxford-900">{area.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{area.description}</p>
              </motion.li>
            ))}
          </motion.ul>

          {/* Animated map */}
          <motion.div
            ref={mapRef}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[10/8] overflow-hidden rounded-[2rem] bg-oxford-900 shadow-2xl shadow-oxford-900/25 sm:aspect-[10/7]"
          >
            <Contours className="opacity-[0.14]" />

            <svg viewBox="0 0 600 420" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {/* Bristol Channel */}
              <path
                d="M0 318 C50 300 80 336 120 326 C165 315 190 290 235 306 C275 320 305 334 350 322 C410 306 440 332 490 322 C530 314 565 300 600 306 V420 H0 Z"
                fill="#001630"
              />
              <path
                d="M0 318 C50 300 80 336 120 326 C165 315 190 290 235 306 C275 320 305 334 350 322 C410 306 440 332 490 322 C530 314 565 300 600 306"
                fill="none"
                stroke="#ffbf00"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <text x="300" y="385" textAnchor="middle" fill="#5b7fb2" fontSize="12" letterSpacing="4">
                BRISTOL CHANNEL
              </text>

              {/* Routes between towns */}
              {routes.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#ffbf00"
                  strokeWidth="2"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="animate-road"
                  style={{ animationDuration: `${2 + i * 0.4}s` }}
                />
              ))}
            </svg>

            {/* Pins */}
            {areas.map((area, i) => {
              const isActive = active === area.name;
              return (
                <div
                  key={area.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                >
                  <span
                    className="absolute inset-0 m-auto h-10 w-10 animate-pulse-ring rounded-full bg-gold-400/40"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                  <motion.span
                    animate={{ scale: isActive ? 1.25 : 1 }}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-colors ${
                      isActive
                        ? "border-white bg-gold-400 text-oxford-900"
                        : "border-gold-400 bg-oxford-800 text-gold-400"
                    }`}
                  >
                    <MapPin size={18} />
                  </motion.span>
                  <span
                    className={`absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold shadow-md transition-colors ${
                      isActive ? "bg-gold-400 text-oxford-900" : "bg-white text-oxford-900"
                    }`}
                  >
                    {area.name}
                  </span>
                </div>
              );
            })}

            <div className="absolute left-4 right-4 top-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md sm:left-5 sm:right-auto">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-oxford-900">
                <Navigation size={17} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Expanding across the valleys</p>
                <p className="text-xs text-oxford-200">More areas are added as ValleyFix grows.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="mt-12 text-center text-sm text-slate-600">
          Don&apos;t see your area?{" "}
          <Link href="/register" className="inline-flex items-center gap-1 font-semibold text-oxford-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-marigold-700">
            Join and let us know <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}

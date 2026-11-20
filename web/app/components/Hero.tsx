"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Droplets,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import ValleyScene from "./ValleyScene";
import { usePauseOffscreen } from "./usePauseOffscreen";

const quickServices = [
  { label: "Plumbing", icon: Droplets },
  { label: "Electrical", icon: Lightbulb },
  { label: "Handyman", icon: Wrench },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Stop the hero animations once it has scrolled out of view.
  usePauseOffscreen(ref);

  // 0 when the hero is at the top of the screen, 1 when it has scrolled away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-b from-oxford-950 via-oxford-900 to-oxford-700 text-white"
    >
      <ValleyScene progress={scrollYProgress} edgeFill="#ffffff" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-64 pt-32 sm:px-6 sm:pb-40 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-48"
      >
        {/* Left: message */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-oxford-50 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
            </span>
            Local home services across South Wales
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Reliable help for your home.
            <span className="mt-2 block bg-gradient-to-r from-gold-300 via-gold-400 to-marigold-500 bg-clip-text text-transparent">
              Right when you need it.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-8 text-oxford-100 sm:text-lg"
          >
            Book trusted local technicians for repairs, maintenance and everyday
            home services, from Cardiff to Swansea and the valleys in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-400 px-7 py-4 font-semibold text-oxford-900 shadow-xl shadow-gold-500/30 transition-colors hover:bg-marigold-400 sm:w-auto"
              >
                Book a service
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.a
              href="#services"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              Explore services
            </motion.a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-oxford-100"
          >
            {[
              { icon: BadgeCheck, label: "ID-verified technicians" },
              { icon: ShieldCheck, label: "Secure booking" },
              { icon: Clock3, label: "Flexible appointments" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-gold-400" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: animated booking preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="animate-float rounded-[2rem] border border-white/15 bg-oxford-900/85 p-5 shadow-2xl shadow-oxford-950/50 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Book a service</p>
              <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold text-gold-300">
                Takes 2 minutes
              </span>
            </div>

            {/* Service choice */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {quickServices.map(({ label, icon: Icon }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-medium ${
                    i === 0
                      ? "border-gold-400 bg-gold-400 text-oxford-900"
                      : "border-white/10 bg-white/5 text-oxford-50"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oxford-50/10">
                  <CalendarCheck size={17} className="text-gold-300" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Tomorrow, 10:00 – 12:00</p>
                  <p className="text-xs text-oxford-200">Choose a time that suits you</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oxford-50/10">
                  <MapPin size={17} className="text-gold-300" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Cardiff, CF14</p>
                  <p className="truncate text-xs text-oxford-200">Cardiff · Bridgend · Swansea · Maesteg</p>
                </div>
              </div>
            </div>

            {/* Live status */}
            <div className="mt-4 rounded-2xl bg-oxford-950/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-oxford-900">
                  <Truck size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Technician on the way</p>
                  <p className="text-xs text-oxford-200">You&apos;ll get updates at every step</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                {/* CSS (not JS) loop, so it can be paused off-screen; scaleX avoids re-layout. */}
                <div className="h-full origin-left animate-progress rounded-full bg-gradient-to-r from-gold-400 to-marigold-500" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#services"
        aria-label="Scroll to services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <span className="flex h-10 w-6 animate-hint items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <span className="h-2 w-1 rounded-full bg-gold-400" />
        </span>
      </motion.a>
    </section>
  );
}

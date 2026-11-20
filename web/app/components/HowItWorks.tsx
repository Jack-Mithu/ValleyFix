"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { CalendarCheck, CheckCircle2, Search, UserCheck } from "lucide-react";
import HouseBlueprint from "./HouseBlueprint";

const steps = [
  {
    title: "Choose a service",
    description: "Tell us what you need help with and pick the service that matches your job.",
    icon: Search,
  },
  {
    title: "Book a time",
    description: "Choose a convenient date and time, add your address and any details for the technician.",
    icon: CalendarCheck,
  },
  {
    title: "Meet your technician",
    description: "We match you with a verified local professional who covers your area.",
    icon: UserCheck,
  },
  {
    title: "Job done",
    description: "Your technician completes the work and keeps you updated if anything extra is needed.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  // The gold route draws itself as the steps scroll into view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  const routeLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-oxford-900 py-24 text-white sm:py-32"
    >
      <HouseBlueprint className="opacity-[0.28]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-400">
            How it works
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Getting help is simple.
          </h2>
          <p className="mt-5 text-lg leading-8 text-oxford-100">
            Four steps from &ldquo;something&apos;s broken&rdquo; to &ldquo;all sorted&rdquo;.
          </p>
        </motion.div>

        <div ref={ref} className="relative mt-20">
          {/* Route connecting the steps (desktop) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            className="absolute inset-x-[12%] top-2 hidden h-24 w-[76%] lg:block"
          >
            <path
              d="M0 40 C120 -10 210 110 333 60 C450 10 540 110 666 60 C790 10 880 100 1000 40"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="3"
              strokeDasharray="6 10"
            />
            <motion.path
              d="M0 40 C120 -10 210 110 333 60 C450 10 540 110 666 60 C790 10 880 100 1000 40"
              fill="none"
              stroke="#ffbf00"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength: routeLength }}
            />
          </svg>

          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map(({ title, description, icon: Icon }, index) => (
              <motion.li
                key={title}
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative flex flex-col text-center"
              >
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-gold-400/20 opacity-0 transition-opacity duration-300 group-hover:animate-pulse-ring group-hover:opacity-100" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-oxford-800/80 shadow-xl shadow-oxford-950/40 backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold-400/60">
                    <Icon size={30} className="text-gold-400" />
                  </span>
                  <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/30">
                    {index + 1}
                  </span>
                </div>

                <div className="mt-6 flex-1 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/[0.08]">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-oxford-100">{description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

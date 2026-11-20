"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  BadgeCheck,
  CreditCard,
  FileCheck2,
  Headphones,
  IdCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { dotGrid } from "./patterns";

const benefits: { icon: LucideIcon; title: string; description: string; tone: "oxford" | "gold" | "marigold" }[] = [
  { icon: CreditCard, title: "Clear pricing", description: "See the service price before you book. Any extra work is agreed with you first.", tone: "gold" },
  { icon: MapPin, title: "Genuinely local", description: "Technicians who live and work in your part of South Wales.", tone: "oxford" },
  { icon: Headphones, title: "Support when needed", description: "Questions about a booking? Messages and updates stay in one place.", tone: "marigold" },
  { icon: Sparkles, title: "Simple from start to finish", description: "Finding, booking and paying are designed to stay straightforward.", tone: "oxford" },
];

const toneStyles = {
  oxford: "bg-oxford-900 text-gold-400",
  gold: "bg-gold-400 text-oxford-900",
  marigold: "bg-marigold-100 text-marigold-800",
};

const checks = [
  { icon: IdCard, label: "Photo ID checked" },
  { icon: FileCheck2, label: "National Insurance number verified" },
  { icon: BadgeCheck, label: "Services and areas approved by our team" },
];

export default function WhyValleyFix() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const hillsY = useTransform(scrollYProgress, [0, 1], [80, -40]);

  return (
    <section ref={ref} id="why-valleyfix" className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: dotGrid, backgroundSize: "24px 24px" }}
      />

      {/* Soft valley hills rising at the bottom */}
      <motion.svg
        aria-hidden="true"
        style={{ y: hillsY }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full"
      >
        <path d="M0 160 C240 80 420 150 640 170 C860 190 1060 90 1440 130 V320 H0 Z" fill="#dbe4f0" />
        <path d="M0 230 C300 170 520 220 760 230 C1000 240 1200 180 1440 200 V320 H0 Z" fill="#f0f4f9" />
      </motion.svg>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-marigold-700">
            Why ValleyFix
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-oxford-900 sm:text-5xl">
            Home services you can feel good about booking.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {/* Featured: how technicians are verified */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] bg-oxford-900 p-8 text-white shadow-2xl shadow-oxford-900/20 lg:row-span-2"
          >
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 animate-glow rounded-full bg-oxford-400/40 blur-3xl" />

            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-oxford-900">
              <ShieldCheck size={28} />
            </span>
            <h3 className="relative mt-7 text-2xl font-bold">Every technician is checked</h3>
            <p className="relative mt-3 text-sm leading-6 text-oxford-100">
              Before anyone can take a job on ValleyFix, our team reviews their
              application.
            </p>

            <ul className="relative mt-8 space-y-3">
              {checks.map(({ icon: Icon, label }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={17} className="text-gold-400" />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {benefits.map(({ icon: Icon, title, description, tone }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-sm backdrop-blur transition-shadow duration-300 hover:shadow-xl hover:shadow-oxford-900/10"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 ${toneStyles[tone]}`}>
                <Icon size={24} />
              </span>
              <h3 className="mt-6 text-lg font-bold text-oxford-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

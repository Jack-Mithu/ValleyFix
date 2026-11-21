"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Brush,
  Droplets,
  Flower2,
  Lightbulb,
  PaintRoller,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { toolsPattern } from "./patterns";
import { usePauseOffscreen } from "./usePauseOffscreen";

// `slug` must match a service in the catalogue (backend/prisma/seed.ts) so
// "Book ..." opens the booking page with that service already chosen.
const services: { title: string; slug: string; description: string; icon: LucideIcon }[] = [
  { title: "Plumbing", slug: "plumbing", description: "Leaks, taps, toilets, pipes and everyday plumbing repairs.", icon: Droplets },
  { title: "Electrical", slug: "electrical-work", description: "Safe help with electrical repairs, fixtures and installations.", icon: Lightbulb },
  { title: "Cleaning", slug: "cleaning", description: "Professional cleaning for homes, move-outs and rental properties.", icon: Brush },
  { title: "Gardening", slug: "gardening", description: "Lawns, hedges, weeding and keeping your garden tidy.", icon: Flower2 },
  { title: "Painting & decorating", slug: "painting-and-decorating", description: "Walls, ceilings, woodwork and fresh coats of paint.", icon: PaintRoller },
  { title: "Handyman", slug: "handyman-services", description: "Repairs, assembly, hanging and general home maintenance.", icon: Wrench },
];

export default function Services() {
  const ref = usePauseOffscreen<HTMLElement>();

  return (
    <section ref={ref} id="services" className="relative overflow-hidden bg-white py-24 sm:py-32">
      {/* Animated blueprint of tools */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 bottom-0 right-0 animate-pan opacity-[0.05] will-change-transform"
        style={{ backgroundImage: toolsPattern, backgroundSize: "160px 160px" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-marigold-700">
            Our services
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-oxford-900 sm:text-5xl">
            Everything your home needs.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            From a dripping tap to a full repaint, find trusted local
            professionals for the jobs that matter.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map(({ title, slug, description, icon: Icon }, index) => (
            <motion.div
              key={title}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link
                href={`/book?service=${slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-2xl hover:shadow-oxford-900/10"
              >
                {/* Big faded number in the corner */}
                <span className="absolute -right-2 -top-4 text-8xl font-black text-slate-100 transition-colors duration-300 group-hover:text-gold-50">
                  0{index + 1}
                </span>

                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-oxford-900 text-gold-400 shadow-lg shadow-oxford-900/20 transition-all duration-300 group-hover:rotate-6 group-hover:bg-gold-400 group-hover:text-oxford-900">
                  <Icon size={26} />
                </span>

                <h3 className="relative mt-7 text-xl font-bold text-oxford-900">{title}</h3>
                <p className="relative mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>

                <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-oxford-900">
                  Book {title.toLowerCase()}
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>

                {/* Gold bar that grows on hover */}
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-marigold-500 transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 text-center text-sm text-slate-600"
        >
          Can&apos;t find the service you need?{" "}
          <Link href="/book" className="font-semibold text-oxford-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-marigold-700">
            Tell us what you need
          </Link>
        </motion.p>
      </div>
    </section>
  );
}

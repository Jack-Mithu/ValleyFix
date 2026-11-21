"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUp, Mail, MapPin, Wrench } from "lucide-react";
import Logo from "./Logo";
import ValleyScene from "./ValleyScene";

const serviceLinks = ["Plumbing", "Electrical", "Cleaning", "Gardening", "Painting & decorating", "Handyman"];

const companyLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why ValleyFix", href: "#why-valleyfix" },
  { label: "Service areas", href: "#areas" },
];

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);

  // As the footer scrolls into view the value goes 1 -> 0, so the sun rises.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const rising = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <footer className="bg-oxford-950 text-white">
      {/* Call to action over the valley */}
      <div
        ref={ref}
        id="get-started"
        className="relative isolate overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-oxford-950 via-oxford-900 to-oxford-700" />
        <ValleyScene progress={rising} showRoad={false} sun={{ x: 1250, y: 560 }} />
        {/* Curved top edge flowing out of the white section above */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-10 w-full sm:h-14"
        >
          <path d="M0 0 H1440 V18 C1080 62 360 0 0 40 Z" fill="#ffffff" />
        </svg>

        <div className="relative mx-auto max-w-4xl px-5 pb-56 pt-28 text-center sm:px-6 sm:pb-72">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-oxford-50 backdrop-blur-md">
              <Wrench size={15} className="text-gold-400" />
              Ready when you are
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Get your home <span className="text-gold-400">sorted</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-oxford-100">
              Book a trusted local technician in minutes, or join ValleyFix and
              grow your own business across the valleys.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/book"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-400 px-7 py-4 font-semibold text-oxford-900 shadow-xl shadow-gold-500/30 transition-colors hover:bg-marigold-400 sm:w-auto"
                >
                  Book a service
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register/technician"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 sm:w-auto"
                >
                  Become a technician
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="dark" size="lg" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-oxford-200">
              A local home-services platform connecting South Wales homes with
              verified technicians for repairs, maintenance and everyday jobs.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Services</h3>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((service) => (
                <li key={service}>
                  <a href="#services" className="text-sm text-oxford-200 transition-colors hover:text-white">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">ValleyFix</h3>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-oxford-200 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-sm text-oxford-200 transition-colors hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-oxford-200 transition-colors hover:text-white">
                  Create account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Get in touch</h3>
            <div className="mt-5 space-y-4">
              <p className="flex gap-3 text-sm leading-6 text-oxford-200">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
                <span>
                  South Wales
                  <br />
                  United Kingdom
                </span>
              </p>
              <a
                href="mailto:hello@valleyfix.co.uk"
                className="flex gap-3 text-sm text-oxford-200 transition-colors hover:text-white"
              >
                <Mail size={18} className="mt-0.5 shrink-0 text-gold-400" />
                hello@valleyfix.co.uk
              </a>
            </div>
          </div>
        </div>

        <div className="my-10 h-px bg-white/10" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-oxford-300">© {new Date().getFullYear()} ValleyFix. All rights reserved.</p>
          <a
            href="#"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-oxford-200 transition-colors hover:border-gold-400/50 hover:text-white"
          >
            Back to top
            <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}

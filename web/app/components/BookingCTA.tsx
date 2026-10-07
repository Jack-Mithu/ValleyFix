"use client";

import { motion } from "motion/react";
import {
  ArrowUp,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const serviceLinks = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Heating",
  "Bathroom",
  "Handyman",
];

const companyLinks = [
  {
    label: "How it works",
    href: "#how-it-works",
  },
  {
    label: "Why ValleyFix",
    href: "#why-valleyfix",
  },
  {
    label: "Service areas",
    href: "#areas",
  },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Main footer */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20">
                V
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Valley<span className="text-blue-400">Fix</span>
              </span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              A local home-services platform connecting customers with
              professionals for everyday repairs, maintenance and home
              services.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.675 0H1.325C.593 0 0 .594 0 1.326v21.348C0 23.406.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.406 24 22.674V1.326C24 .594 23.407 0 22.675 0Z" />
                </svg>
              </motion.a>

              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x={3} y={3} width={18} height={18} rx={5} />
                  <circle cx={12} cy={12} r={4} />
                  <circle cx={17.5} cy={6.5} r={0.5} fill="currentColor" />
                </svg>
              </motion.a>

              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM8.03 18.34H5.06V9.02h2.97v9.32ZM6.54 7.75a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm11.8 10.59h-2.96v-4.53c0-1.08-.02-2.47-1.51-2.47-1.52 0-1.75 1.18-1.75 2.39v4.61H9.16V9.02h2.84v1.27h.04c.4-.73 1.36-1.5 2.8-1.5 3 0 3.56 1.97 3.56 4.53v5.02h-.06Z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h3>

            <ul className="mt-5 space-y-3">
              {serviceLinks.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              ValleyFix
            </h3>

            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              <li>
                <a
                  href="/login"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Login
                </a>
              </li>

              <li>
                <a
                  href="/register"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Create account
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Get in touch
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <p className="text-sm leading-6 text-slate-400">
                  South Wales
                  <br />
                  United Kingdom
                </p>
              </div>

              <div className="flex gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <a
                  href="mailto:hello@valleyfix.co.uk"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  hello@valleyfix.co.uk
                </a>
              </div>

              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <a
                  href="tel:+440000000000"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Contact ValleyFix
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ValleyFix. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#"
              className="text-sm text-slate-500 transition-colors hover:text-white"
            >
              Privacy
            </a>

            <a
              href="#"
              className="text-sm text-slate-500 transition-colors hover:text-white"
            >
              Terms
            </a>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Back to top
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
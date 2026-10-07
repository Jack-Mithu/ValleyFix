"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Bath,
  Brush,
  Droplets,
  Home,
  Lightbulb,
  Snowflake,
  Wrench,
} from "lucide-react";

const services = [
  {
    title: "Plumbing",
    description: "Leaks, taps, toilets, pipes and everyday plumbing repairs.",
    icon: Droplets,
    color: "blue",
  },
  {
    title: "Electrical",
    description: "Reliable help with electrical repairs, fixtures and installations.",
    icon: Lightbulb,
    color: "amber",
  },
  {
    title: "Cleaning",
    description: "Professional cleaning services for homes and properties.",
    icon: Brush,
    color: "teal",
  },
  {
    title: "Heating",
    description: "Heating maintenance, repairs and home comfort services.",
    icon: Snowflake,
    color: "indigo",
  },
  {
    title: "Bathroom",
    description: "Repairs, maintenance and improvements for your bathroom.",
    icon: Bath,
    color: "cyan",
  },
  {
    title: "Handyman",
    description: "Practical help with repairs, assembly and general home maintenance.",
    icon: Wrench,
    color: "green",
  },
];

const iconStyles: Record<
  string,
  {
    background: string;
    text: string;
  }
> = {
  blue: {
    background: "bg-blue-50",
    text: "text-blue-600",
  },
  amber: {
    background: "bg-amber-50",
    text: "text-amber-600",
  },
  teal: {
    background: "bg-teal-50",
    text: "text-teal-600",
  },
  indigo: {
    background: "bg-indigo-50",
    text: "text-indigo-600",
  },
  cyan: {
    background: "bg-cyan-50",
    text: "text-cyan-600",
  },
  green: {
    background: "bg-green-50",
    text: "text-green-600",
  },
};

export default function Services() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

      <div className="pointer-events-none absolute -left-32 bottom-20 h-72 w-72 rounded-full bg-teal-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Our services
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Everything your home needs.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            From everyday repairs to specialist services, find trusted local
            professionals for the jobs that matter.
          </p>
        </motion.div>

        {/* Service cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = service.icon;
            const style = iconStyles[service.color];

            return (
              <motion.a
                key={service.title}
                href="#"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 35,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -7,
                  transition: {
                    duration: 0.25,
                  },
                }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/70"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    transition={{ duration: 0.2 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.background}`}
                  >
                    <Icon size={26} className={style.text} />
                  </motion.div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mt-7 text-xl font-bold text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                  {service.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  Explore service
                  <ArrowRight size={15} />
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500">
            Can't find the service you need?
          </p>

          <a
            href="/register"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Tell us what you need
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
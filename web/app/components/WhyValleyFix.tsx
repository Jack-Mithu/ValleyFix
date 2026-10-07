"use client";

import { motion } from "motion/react";
import {
  BadgeCheck,
  CreditCard,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted professionals",
    description:
      "Connect with professionals who are matched to the services they are qualified to provide.",
    color: "blue",
  },
  {
    icon: CreditCard,
    title: "Clear pricing",
    description:
      "See the service price before booking, with any additional work handled transparently.",
    color: "green",
  },
  {
    icon: BadgeCheck,
    title: "Quality-focused",
    description:
      "We are building ValleyFix around reliable service, clear communication and customer satisfaction.",
    color: "violet",
  },
  {
    icon: MapPin,
    title: "Local service",
    description:
      "Find home services from professionals serving your local area across South Wales.",
    color: "orange",
  },
  {
    icon: Headphones,
    title: "Support when needed",
    description:
      "Have a question about your booking? ValleyFix keeps support and communication in one place.",
    color: "cyan",
  },
  {
    icon: Sparkles,
    title: "Simple experience",
    description:
      "From finding a service to completing the job, everything is designed to stay straightforward.",
    color: "pink",
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
  green: {
    background: "bg-green-50",
    text: "text-green-600",
  },
  violet: {
    background: "bg-violet-50",
    text: "text-violet-600",
  },
  orange: {
    background: "bg-orange-50",
    text: "text-orange-600",
  },
  cyan: {
    background: "bg-cyan-50",
    text: "text-cyan-600",
  },
  pink: {
    background: "bg-pink-50",
    text: "text-pink-600",
  },
};

export default function WhyValleyFix() {
  return (
    <section
      id="why-valleyfix"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-teal-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Why ValleyFix
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Home services you can feel good about booking.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            We are building ValleyFix to make finding reliable local help
            easier, clearer and more convenient.
          </p>
        </motion.div>

        {/* Benefits */}
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
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            const style = iconStyles[benefit.color];

            return (
              <motion.div
                key={benefit.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.25,
                  },
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotate: 4,
                  }}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.background}`}
                >
                  <Icon
                    size={26}
                    className={style.text}
                  />
                </motion.div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-16 overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 shadow-xl sm:px-10 sm:py-12"
        >
          <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                Built for local communities
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Reliable help, closer to home.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                ValleyFix is designed to connect customers with local
                professionals and make everyday home maintenance easier.
              </p>
            </div>

            <motion.a
              href="/register"
              whileHover={{
                y: -3,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="shrink-0 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition-colors hover:bg-blue-50"
            >
              Get started
            </motion.a>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
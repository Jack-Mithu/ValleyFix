"use client";

import { motion } from "motion/react";
import {
  Search,
  CalendarCheck,
  UserCheck,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a service",
    description:
      "Tell us what you need help with and choose the service that best matches your job.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book your service",
    description:
      "Choose a convenient date and time, add your address and describe anything our technician should know.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Meet your technician",
    description:
      "ValleyFix assigns a suitable local professional who can handle your service.",
    icon: UserCheck,
  },
  {
    number: "04",
    title: "Get the job done",
    description:
      "Your technician completes the work and keeps you updated if anything additional is required.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-20 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
            How it works
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Getting help is simple.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            ValleyFix makes it easy to find the right professional,
            book a service and get your home sorted.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16">

          {/* Connecting line - desktop */}
          <div className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-slate-200 lg:block" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="grid gap-10 lg:grid-cols-4 lg:gap-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
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
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="relative text-center"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      y: -5,
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.25 }}
                    className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Icon
                        size={24}
                        className="text-blue-600"
                      />
                    </div>

                    {/* Number */}
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md">
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Content */}
                  <h3 className="mt-7 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>

                  {/* Mobile connector */}
                  {index !== steps.length - 1 && (
                    <div className="mt-8 flex justify-center lg:hidden">
                      <ArrowDown
                        size={20}
                        className="text-slate-300"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom trust message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-16 max-w-3xl rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-sm sm:p-8"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
            <CheckCircle2
              size={25}
              className="text-green-600"
            />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            Simple, transparent and local.
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            From your first booking to the final job, ValleyFix keeps
            the process clear so you always know what happens next.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, CalendarPlus, KeyRound, Menu, UserRound, Users, Wrench, X } from "lucide-react";
import Logo from "@/app/components/Logo";

const links = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/technicians", label: "Technicians", icon: Users },
  { href: "/dashboard", label: "Bookings", icon: CalendarCheck },
];

function isActive(pathname: string, href: string) {
  // "Bookings" is /dashboard itself, plus the booking wizard.
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/book");
  return pathname.startsWith(href);
}

function NavContents({ name, email, onNavigate }: { name: string; email: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo tone="dark" />
      </div>

      <div className="px-4">
        <Link
          href="/book"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/20 transition hover:bg-marigold-400"
        >
          <CalendarPlus size={18} /> Book a service
        </Link>
      </div>

      <nav className="mt-5 flex flex-col gap-1 px-3" aria-label="Customer">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/10 text-white" : "text-oxford-100 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className={active ? "text-gold-400" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-5 py-5">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-oxford-200">{email}</p>
        <Link
          href="/account/password"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-oxford-100 transition hover:bg-white/5 hover:text-white"
        >
          <KeyRound size={16} className="text-gold-400" /> Change password
        </Link>
        <form action="/api/auth/logout" method="post" className="mt-2">
          <button className="w-full rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-oxford-50 transition hover:bg-white/10">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerNav({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 bg-oxford-900 lg:block">
        <NavContents name={name} email={email} />
      </aside>

      {/* Mobile: top bar + slide-in drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-oxford-900 px-4 py-3 lg:hidden">
        <Logo tone="dark" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="rounded-xl p-2 text-white hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="absolute inset-0 bg-oxford-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-oxford-900 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="absolute right-3 top-4 rounded-xl p-2 text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
              <NavContents name={name} email={email} onNavigate={close} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

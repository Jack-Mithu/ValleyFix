"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, History, LayoutDashboard, ShieldCheck, UserCog, Users } from "lucide-react";

export default function AdminNav({ isSuper }: { isSuper: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/technicians", label: "Technician approvals", icon: ShieldCheck },
    { href: "/admin/users", label: "Customers & technicians", icon: Users },
    ...(isSuper
      ? [
          { href: "/admin/admins", label: "Sub admins", icon: UserCog },
          { href: "/admin/audit", label: "Audit log", icon: History },
        ]
      : []),
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-white/10 text-white" : "text-oxford-100 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} className={active ? "text-gold-400" : ""} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { CalendarCheck, CalendarPlus, UserRound, Users, Wrench } from "lucide-react";
import PortalSidebar, { type PortalLink } from "@/app/components/portal-sidebar";

const links: PortalLink[] = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/technicians", label: "Technicians", icon: Users },
  {
    href: "/dashboard",
    label: "Bookings",
    icon: CalendarCheck,
    // "Bookings" is /dashboard itself, plus the booking wizard.
    isActive: (path) => path === "/dashboard" || path.startsWith("/book"),
  },
];

export default function CustomerNav({ name, email }: { name: string; email: string }) {
  return (
    <PortalSidebar
      links={links}
      name={name}
      email={email}
      ariaLabel="Customer"
      cta={{ href: "/book", label: "Book a service", icon: CalendarPlus }}
    />
  );
}

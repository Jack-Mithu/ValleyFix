"use client";

import { BellRing, CalendarCheck, CircleCheckBig, Hammer, UserRound } from "lucide-react";
import PortalSidebar from "@/app/components/portal-sidebar";
import type { TechnicianSummary } from "./layout";

export default function TechnicianNav({
  name,
  email,
  summary,
}: {
  name: string;
  email: string;
  summary: TechnicianSummary;
}) {
  return (
    <PortalSidebar
      ariaLabel="Technician"
      roleLabel="Technician"
      name={name}
      email={email}
      links={[
        { href: "/technician/requests", label: "Booking requests", icon: BellRing, badge: summary.requests },
        { href: "/technician/accepted", label: "Accepted works", icon: CalendarCheck, badge: summary.accepted },
        { href: "/technician/pending", label: "Pending works", icon: Hammer, badge: summary.pending },
        { href: "/technician/completed", label: "Completed works", icon: CircleCheckBig },
        { href: "/technician/profile", label: "Profile", icon: UserRound },
      ]}
    />
  );
}

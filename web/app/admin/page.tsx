import PortalShell from "@/app/components/PortalShell";
import { requireRole } from "@/app/lib/require-role";

export default async function AdminDashboard() {
  const user = await requireRole(["admin", "super_admin"]);

  return (
    <PortalShell
      label="VALLEYFIX ADMIN"
      user={user}
      description="Technician approvals, bookings and payments will be managed here."
      sections={["Technician Approvals", "Bookings", "Payments", "Users"]}
    />
  );
}

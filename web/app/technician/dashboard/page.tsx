import PortalShell from "@/app/components/PortalShell";
import { requireRole } from "@/app/lib/require-role";

export default async function TechnicianDashboard() {
  const user = await requireRole(["technician"]);

  return (
    <PortalShell
      label="VALLEYFIX TECHNICIAN PORTAL"
      user={user}
      description="Your jobs, schedule, quotes and earnings will appear here."
      sections={["My Jobs", "Schedule", "Quotes", "Earnings"]}
    />
  );
}

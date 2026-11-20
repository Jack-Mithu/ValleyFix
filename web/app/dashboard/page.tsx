import PortalShell from "@/app/components/PortalShell";
import { requireRole } from "@/app/lib/require-role";

export default async function CustomerDashboard() {
  // The real security check: verifies the token with the backend.
  const user = await requireRole(["customer"]);

  return (
    <PortalShell
      label="VALLEYFIX CUSTOMER PORTAL"
      user={user}
      description="We'll add your bookings, quotes, payments and notifications here."
      sections={["My Bookings", "Quotes", "Payments", "Notifications"]}
    />
  );
}

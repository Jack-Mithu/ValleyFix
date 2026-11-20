import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import PortalShell from "@/app/components/PortalShell";
import { requireRole } from "@/app/lib/require-role";

const statusBanner = {
  PENDING: {
    icon: Clock3,
    className: "border-gold-300 bg-gold-50 text-marigold-900",
    title: "Your application is being reviewed",
    text: "Our team is checking your details and documents. You'll be able to take jobs once you're approved.",
  },
  APPROVED: {
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-800",
    title: "You're approved",
    text: "Your account is verified. Jobs in your areas will appear here.",
  },
  REJECTED: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
    title: "Your application wasn't approved",
    text: "Please contact ValleyFix support for details on how to re-apply.",
  },
} as const;

export default async function TechnicianDashboard() {
  const user = await requireRole(["technician"]);
  const banner = statusBanner[user.approvalStatus ?? "PENDING"];
  const Icon = banner.icon;

  return (
    <PortalShell
      label="VALLEYFIX TECHNICIAN PORTAL"
      user={user}
      description="Your jobs, schedule, quotes and earnings will appear here."
      sections={["My Jobs", "Schedule", "Quotes", "Earnings"]}
    >
      <div className={`mt-6 flex gap-3 rounded-xl border p-4 ${banner.className}`}>
        <Icon size={22} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{banner.title}</p>
          <p className="mt-1 text-sm">{banner.text}</p>
        </div>
      </div>
    </PortalShell>
  );
}

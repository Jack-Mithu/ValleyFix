import type { ReactNode } from "react";
import { Clock3, XCircle } from "lucide-react";
import { requireRole } from "@/app/lib/require-role";
import { apiFetch } from "@/app/lib/admin-api";
import TechnicianNav from "./nav";

export type TechnicianSummary = { requests: number; accepted: number; pending: number; completed: number };

// Every /technician/* page is for technicians only.
export default async function TechnicianLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["technician"]);
  const approved = user.approvalStatus === "APPROVED";

  // Counts for the sidebar badges (only meaningful once approved).
  const summary = approved
    ? await apiFetch<TechnicianSummary>("/bookings/technician-summary")
    : { requests: 0, accepted: 0, pending: 0, completed: 0 };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <TechnicianNav name={user.name} email={user.email} summary={summary} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          {user.approvalStatus === "PENDING" && (
            <p className="mb-8 flex gap-3 rounded-2xl border border-gold-300 bg-gold-50 p-4 text-sm text-marigold-900">
              <Clock3 size={20} className="shrink-0" />
              <span>
                <strong>Your application is being reviewed.</strong> Once approved, booking requests for your services and
                areas will appear here. You can update your profile and working hours in the meantime.
              </span>
            </p>
          )}
          {user.approvalStatus === "REJECTED" && (
            <p className="mb-8 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <XCircle size={20} className="shrink-0" />
              <span>
                <strong>Your application wasn&apos;t approved.</strong> Please contact ValleyFix support for details on how
                to re-apply.
              </span>
            </p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

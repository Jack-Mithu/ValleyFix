import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import PortalShell from "@/app/components/PortalShell";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import { requireRole } from "@/app/lib/require-role";
import { apiFetch } from "@/app/lib/admin-api";
import { ACTIVE_STATUSES, type Booking } from "@/app/lib/bookings";
import BookingCard from "@/app/bookings/booking-card";
import { completeJobAction, startJobAction } from "@/app/bookings/actions";

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
    text: "Customers can book you for the services and areas you offer. New jobs appear below.",
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
  const status = user.approvalStatus ?? "PENDING";
  const banner = statusBanner[status];
  const Icon = banner.icon;

  const jobs = status === "APPROVED" ? await apiFetch<Booking[]>("/bookings/mine") : [];
  const active = jobs.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const past = jobs
    .filter((b) => !ACTIVE_STATUSES.includes(b.status))
    .sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart));

  return (
    <PortalShell label="VALLEYFIX TECHNICIAN PORTAL" user={user} description="Your jobs and schedule.">
      <div className={`mt-6 flex gap-3 rounded-xl border p-4 ${banner.className}`}>
        <Icon size={22} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{banner.title}</p>
          <p className="mt-1 text-sm">{banner.text}</p>
        </div>
      </div>

      {status === "APPROVED" && (
        <>
          <section className="mt-10">
            <h2 className="text-lg font-bold text-oxford-900">Your jobs</h2>
            {active.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
                No upcoming jobs yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {active.map((b) => {
                  return (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      view="technician"
                      actions={
                        b.allowedActions.complete ? (
                          <ActionForm action={completeJobAction}>
                            <input type="hidden" name="id" value={b.id} />
                            <SubmitButton variant="gold">Mark job complete</SubmitButton>
                          </ActionForm>
                        ) : b.allowedActions.start ? (
                          <ActionForm action={startJobAction}>
                            <input type="hidden" name="id" value={b.id} />
                            <SubmitButton>Start job</SubmitButton>
                          </ActionForm>
                        ) : (
                          <p className="text-sm text-slate-600">You can start this job from an hour before the booked time.</p>
                        )
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-oxford-900">Completed and cancelled</h2>
              <div className="mt-4 space-y-4">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} view="technician" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PortalShell>
  );
}

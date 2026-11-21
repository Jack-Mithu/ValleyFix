import { requireRole } from "@/app/lib/require-role";
import { formatPrice } from "@/app/lib/bookings";
import BookingCard from "@/app/bookings/booking-card";
import PageHeader from "@/app/components/page-header";
import Notice from "@/app/components/notice";
import NotApprovedYet from "../not-approved";
import { myJobs } from "../jobs";

export default async function CompletedWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; ref?: string }>;
}) {
  const { notice, ref } = await searchParams;
  const user = await requireRole(["technician"]);
  if (user.approvalStatus !== "APPROVED") {
    return (
      <>
        <PageHeader title="Completed works" />
        <NotApprovedYet />
      </>
    );
  }

  const { completed, cancelled } = await myJobs();
  const total = completed.reduce((sum, b) => sum + b.estimatedPrice, 0);

  return (
    <>
      <PageHeader title="Completed works" description="Jobs you've finished.">
        {completed.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {completed.length} job{completed.length === 1 ? "" : "s"}
            </p>
            <p className="text-lg font-bold text-oxford-900">{formatPrice(total)}</p>
          </div>
        )}
      </PageHeader>
      <Notice notice={notice} refCode={ref} />

      {completed.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No completed jobs yet.
        </p>
      ) : (
        <div className="space-y-4">
          {completed.map((b) => (
            <BookingCard key={b.id} booking={b} view="technician" />
          ))}
        </div>
      )}

      {cancelled.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-oxford-900">Cancelled</h2>
          <div className="mt-4 space-y-4">
            {cancelled.map((b) => (
              <BookingCard key={b.id} booking={b} view="technician" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

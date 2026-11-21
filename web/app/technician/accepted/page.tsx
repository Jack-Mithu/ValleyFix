import { requireRole } from "@/app/lib/require-role";
import BookingCard from "@/app/bookings/booking-card";
import PageHeader from "@/app/components/page-header";
import Notice from "@/app/components/notice";
import NotApprovedYet from "../not-approved";
import { myJobs } from "../jobs";

export default async function AcceptedWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; ref?: string }>;
}) {
  const { notice, ref } = await searchParams;
  const user = await requireRole(["technician"]);
  if (user.approvalStatus !== "APPROVED") {
    return (
      <>
        <PageHeader title="Accepted works" />
        <NotApprovedYet />
      </>
    );
  }

  const { accepted } = await myJobs();

  return (
    <>
      <PageHeader
        title="Accepted works"
        description="Jobs you've accepted. They move to Pending works an hour before they start."
      />
      <Notice notice={notice} refCode={ref} />
      {accepted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No upcoming accepted jobs. Check Booking requests for new work.
        </p>
      ) : (
        <div className="space-y-4">
          {accepted.map((b) => (
            <BookingCard key={b.id} booking={b} view="technician" />
          ))}
        </div>
      )}
    </>
  );
}

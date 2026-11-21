import { requireRole } from "@/app/lib/require-role";
import BookingCard from "@/app/bookings/booking-card";
import { completeJobAction, startJobAction } from "@/app/bookings/actions";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import PageHeader from "@/app/components/page-header";
import Notice from "@/app/components/notice";
import NotApprovedYet from "../not-approved";
import { myJobs } from "../jobs";

export default async function PendingWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; ref?: string }>;
}) {
  const { notice, ref } = await searchParams;
  const user = await requireRole(["technician"]);
  if (user.approvalStatus !== "APPROVED") {
    return (
      <>
        <PageHeader title="Pending works" />
        <NotApprovedYet />
      </>
    );
  }

  const { pending } = await myJobs();

  return (
    <>
      <PageHeader title="Pending works" description="Jobs that need you now: ready to start, or in progress." />
      <Notice notice={notice} refCode={ref} />
      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Nothing needs action right now. Jobs appear here an hour before they start.
        </p>
      ) : (
        <div className="space-y-4">
          {pending.map((b) => (
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
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

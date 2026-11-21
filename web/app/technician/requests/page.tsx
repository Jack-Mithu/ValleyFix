import { Info } from "lucide-react";
import { requireRole } from "@/app/lib/require-role";
import { apiFetch } from "@/app/lib/admin-api";
import type { Booking } from "@/app/lib/bookings";
import BookingCard from "@/app/bookings/booking-card";
import { acceptRequestAction } from "@/app/bookings/actions";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import PageHeader from "@/app/components/page-header";
import Notice from "@/app/components/notice";
import NotApprovedYet from "../not-approved";

export default async function BookingRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; ref?: string }>;
}) {
  const { notice, ref } = await searchParams;
  const user = await requireRole(["technician"]);
  if (user.approvalStatus !== "APPROVED") {
    return (
      <>
        <PageHeader title="Booking requests" />
        <NotApprovedYet />
      </>
    );
  }

  const requests = await apiFetch<Booking[]>("/bookings/requests");

  return (
    <>
      <PageHeader
        title="Booking requests"
        description="Customer requests for your services, in your areas, at times you're working and free."
      />
      <Notice notice={notice} refCode={ref} />

      <p className="mb-6 flex items-start gap-2 rounded-2xl bg-oxford-50 p-4 text-sm text-oxford-900">
        <Info size={17} className="mt-0.5 shrink-0" />
        The first technician to accept gets the job. You&apos;ll see the customer&apos;s name, phone and full address once
        you accept.
      </p>

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No open requests right now. New ones appear here as customers book.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              view="technician"
              actions={
                b.allowedActions.accept ? (
                  <ActionForm action={acceptRequestAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton variant="gold">Accept this job</SubmitButton>
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

import Link from "next/link";
import { CalendarPlus, PartyPopper } from "lucide-react";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import { apiFetch } from "@/app/lib/admin-api";
import { ACTIVE_STATUSES, type Booking } from "@/app/lib/bookings";
import BookingCard from "@/app/bookings/booking-card";
import { cancelBookingAction } from "@/app/bookings/actions";
import PageHeader from "../page-header";

// Bookings: the customer's home page. (The layout already checked the role.)
export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  const { booked } = await searchParams;

  const bookings = await apiFetch<Booking[]>("/bookings/mine");
  const upcoming = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const past = bookings
    .filter((b) => !ACTIVE_STATUSES.includes(b.status))
    .sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart));

  return (
    <>
      <PageHeader title="Bookings" description="Your upcoming appointments and booking history.">
        <Link
          href="/book"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/25 transition hover:bg-marigold-400"
        >
          <CalendarPlus size={18} /> Book a service
        </Link>
      </PageHeader>

      {booked && (
        <p className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <PartyPopper size={20} className="shrink-0" />
          <span>
            <strong>You&apos;re booked!</strong> Your reference is <span className="font-mono">{booked}</span>. Your
            technician will arrive at the time shown below.
          </span>
        </p>
      )}

      <section>
        <h2 className="text-lg font-bold text-oxford-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            No upcoming bookings. Need something fixed? Book a technician in a couple of minutes.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                view="customer"
                actions={
                  b.allowedActions.cancel ? (
                    <details>
                      <summary className="cursor-pointer list-none text-sm font-semibold text-red-700 hover:underline">
                        Cancel this booking
                      </summary>
                      <ActionForm action={cancelBookingAction} className="mt-3 space-y-3">
                        <input type="hidden" name="id" value={b.id} />
                        <input
                          name="reason"
                          maxLength={500}
                          placeholder="Reason (optional)"
                          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-oxford-500"
                        />
                        <SubmitButton variant="danger">Yes, cancel booking</SubmitButton>
                      </ActionForm>
                    </details>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-oxford-900">Past and cancelled</h2>
          <div className="mt-4 space-y-4">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} view="customer" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

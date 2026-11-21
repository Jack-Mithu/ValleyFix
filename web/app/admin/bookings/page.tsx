import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminFetch } from "@/app/lib/admin-api";
import { statusLabel, type Booking, type BookingStatus } from "@/app/lib/bookings";
import BookingCard from "@/app/bookings/booking-card";
import { cancelBookingAction } from "@/app/bookings/actions";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import { EmptyState, PageHeader } from "../components";

type BookingList = { total: number; page: number; pageSize: number; bookings: Booking[] };

const tabs: (BookingStatus | "")[] = ["", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = tabs.includes(params.status as BookingStatus) ? (params.status as BookingStatus | "") : "";
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  const data = await adminFetch<BookingList>(`/admin/bookings?${query}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const link = (changes: { status?: string; page?: number }) => {
    const next = new URLSearchParams();
    const s = changes.status ?? status;
    if (s) next.set("status", s);
    next.set("page", String(changes.page ?? 1));
    return `/admin/bookings?${next}`;
  };

  return (
    <>
      <PageHeader title="Bookings" description={`${data.total} booking${data.total === 1 ? "" : "s"}`} />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t || "all"}
            href={link({ status: t, page: 1 })}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              t === status ? "bg-oxford-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t ? statusLabel[t] : "All"}
          </Link>
        ))}
      </div>

      {data.bookings.length === 0 ? (
        <EmptyState>No bookings here yet.</EmptyState>
      ) : (
        <div className="space-y-4">
          {data.bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              view="admin"
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
                        required
                        maxLength={500}
                        placeholder="Reason (shown to the customer)"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-oxford-500"
                      />
                      <SubmitButton variant="danger">Cancel booking</SubmitButton>
                    </ActionForm>
                  </details>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-slate-600">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={link({ page: page - 1 })} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50">
                <ChevronLeft size={16} /> Previous
              </Link>
            )}
            {page < pages && (
              <Link href={link({ page: page + 1 })} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50">
                Next <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

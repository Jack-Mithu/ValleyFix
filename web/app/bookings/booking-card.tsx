// One booking, shown on the customer, technician and admin pages.
import type { ReactNode } from "react";
import { CalendarDays, Clock3, MapPin, MessageSquareText, Phone, UserRound } from "lucide-react";
import {
  formatAddress,
  formatDay,
  formatPrice,
  formatTime,
  statusLabel,
  statusStyle,
  type Booking,
} from "@/app/lib/bookings";

export function StatusPill({ status }: { status: Booking["status"] }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

export default function BookingCard({
  booking,
  view,
  actions,
}: {
  booking: Booking;
  view: "customer" | "technician" | "admin";
  actions?: ReactNode;
}) {
  const b = booking;
  const muted = b.status === "CANCELLED";

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
        b.status === "IN_PROGRESS" ? "border-gold-400" : "border-slate-200"
      } ${muted ? "opacity-75" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-oxford-900">{b.service.name}</h3>
          <p className="font-mono text-xs text-slate-500">{b.reference}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-oxford-900">{formatPrice(b.estimatedPrice)}</span>
          <StatusPill status={b.status} />
        </div>
      </div>

      <dl className="mt-4 grid gap-2.5 text-sm text-slate-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="shrink-0 text-marigold-600" />
          <dd>{formatDay(b.scheduledStart)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="shrink-0 text-marigold-600" />
          <dd>
            {formatTime(b.scheduledStart)} – {formatTime(b.scheduledEnd)}
          </dd>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-marigold-600" />
          <dd>{formatAddress(b.address)}</dd>
        </div>

        {view !== "technician" && (
          <div className="flex items-center gap-2">
            <UserRound size={16} className="shrink-0 text-marigold-600" />
            <dd>{b.technician ? `Technician: ${b.technician.name}` : "Finding a technician…"}</dd>
          </div>
        )}

        {view !== "customer" && b.customer && (
          <div className="flex items-center gap-2">
            <Phone size={16} className="shrink-0 text-marigold-600" />
            <dd>
              {b.customer.name}
              {b.customer.phone && (
                <>
                  {" · "}
                  <a href={`tel:${b.customer.phone}`} className="font-medium text-oxford-900 underline">
                    {b.customer.phone}
                  </a>
                </>
              )}
            </dd>
          </div>
        )}
      </dl>

      {b.description && (
        <p className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <MessageSquareText size={16} className="mt-0.5 shrink-0 text-slate-500" />
          {b.description}
        </p>
      )}

      {b.status === "CANCELLED" && b.cancellationReason && (
        <p className="mt-3 text-sm text-slate-600">Cancelled: {b.cancellationReason}</p>
      )}

      {actions && <div className="mt-4 border-t border-slate-100 pt-4">{actions}</div>}
    </article>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MapPin,
  Wrench,
} from "lucide-react";
import { createBookingAction, getSlotsAction } from "@/app/bookings/actions";
import {
  formatAddress,
  formatDuration,
  formatPrice,
  type CatalogService,
  type CustomerAddress,
  type Slot,
} from "@/app/lib/bookings";

type Day = { date: string; weekday: string; day: string };

const STEPS = ["Service", "Address", "Date & time", "Confirm"];

export default function BookingWizard({
  services,
  addresses,
  days,
  initialServiceSlug,
}: {
  services: CatalogService[];
  addresses: CustomerAddress[];
  days: Day[];
  initialServiceSlug?: string;
}) {
  const router = useRouter();
  const preselected = services.find((s) => s.slug === initialServiceSlug);
  const coveredAddresses = addresses.filter((a) => a.covered);

  const [step, setStep] = useState(preselected ? 1 : 0);
  const [serviceId, setServiceId] = useState<number | null>(preselected?.id ?? null);
  const [addressId, setAddressId] = useState<number | null>(
    coveredAddresses.find((a) => a.isDefault)?.id ?? coveredAddresses[0]?.id ?? null,
  );
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loadingSlots, startLoadingSlots] = useTransition();
  const [submitting, startSubmitting] = useTransition();

  const service = services.find((s) => s.id === serviceId);
  const address = addresses.find((a) => a.id === addressId);
  const dayLabel = days.find((d) => d.date === date);

  const go = (next: number) => {
    setError("");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadSlots = (nextDate: string) => {
    if (!serviceId || !addressId) return;
    setDate(nextDate);
    setTime(null);
    setSlots(null);
    setError("");
    startLoadingSlots(async () => {
      const result = await getSlotsAction(serviceId, addressId, nextDate);
      if (result.ok) setSlots(result.slots);
      else setError(result.message);
    });
  };

  const confirm = () => {
    if (!serviceId || !addressId || !date || !time) return;
    setError("");
    startSubmitting(async () => {
      const result = await createBookingAction({ serviceId, addressId, date, time, description });
      if (result.ok) {
        router.push(`/dashboard?booked=${encodeURIComponent(result.reference)}`);
        router.refresh();
      } else {
        // Most likely someone else just took that time: show fresh times.
        setError(result.message);
        setStep(2);
        loadSlots(date);
      }
    });
  };

  return (
    <div>
      {/* Progress */}
      <ol className="mb-6 flex gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gold-400" : "bg-slate-200"}`} />
            <p className={`mt-2 hidden text-xs font-semibold sm:block ${i === step ? "text-oxford-900" : "text-slate-500"}`}>
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {/* STEP 1: service */}
        {step === 0 && (
          <section>
            <h2 className="text-xl font-bold text-oxford-900">What do you need help with?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setDate(null);
                    setSlots(null);
                    setTime(null);
                    go(1);
                  }}
                  className={`group rounded-2xl border p-4 text-left transition hover:border-gold-400 hover:shadow-md ${
                    s.id === serviceId ? "border-gold-400 bg-gold-50" : "border-slate-200"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-marigold-700">{s.category}</p>
                  <p className="mt-1 font-bold text-oxford-900">{s.name}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    From {formatPrice(s.basePrice)} · about {formatDuration(s.durationInMinutes)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 2: address */}
        {step === 1 && (
          <section>
            <h2 className="text-xl font-bold text-oxford-900">Where should we come?</h2>
            <div className="mt-5 space-y-3">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    !a.covered
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
                      : a.id === addressId
                        ? "border-gold-400 bg-gold-50"
                        : "border-slate-200 hover:border-gold-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 accent-oxford-900"
                    disabled={!a.covered}
                    checked={a.id === addressId}
                    onChange={() => {
                      setAddressId(a.id);
                      setDate(null);
                      setSlots(null);
                      setTime(null);
                    }}
                  />
                  <span>
                    <span className="flex items-center gap-2 font-semibold text-oxford-900">
                      <MapPin size={16} className="text-marigold-600" /> {formatAddress(a)}
                    </span>
                    {!a.covered && (
                      <span className="mt-1 block text-sm text-slate-600">
                        Sorry, we don&apos;t cover {a.city} yet.
                      </span>
                    )}
                  </span>
                </label>
              ))}
              {coveredAddresses.length === 0 && (
                <p className="rounded-xl bg-oxford-50 p-4 text-sm text-oxford-900">
                  You need an address in an area we cover.{" "}
                  <a href="/dashboard/profile" className="font-semibold underline">Add one in your profile</a>.
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => go(0)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!addressId}
                onClick={() => go(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-oxford-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-oxford-700 disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: date & time */}
        {step === 2 && (
          <section>
            <h2 className="text-xl font-bold text-oxford-900">When suits you?</h2>
            <p className="mt-1 text-sm text-slate-600">
              {service?.name}: about {service && formatDuration(service.durationInMinutes)}. Times are shown in UK time.
            </p>

            <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => loadSlots(d.date)}
                  className={`flex w-20 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 text-center transition ${
                    d.date === date ? "border-oxford-900 bg-oxford-900 text-white" : "border-slate-200 text-oxford-900 hover:border-gold-400"
                  }`}
                >
                  <span className={`text-xs font-semibold ${d.date === date ? "text-gold-300" : "text-slate-500"}`}>{d.weekday}</span>
                  <span className="mt-1 text-sm font-bold">{d.day}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 min-h-24">
              {!date && <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} /> Pick a day to see available times.</p>}
              {loadingSlots && <p className="flex items-center gap-2 text-sm text-slate-600"><Loader2 size={16} className="animate-spin" /> Checking which technicians are free…</p>}
              {date && !loadingSlots && slots?.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  No technicians are free on this day. Please try another date.
                </p>
              )}
              {date && !loadingSlots && slots && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      onClick={() => setTime(s.time)}
                      className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                        s.time === time ? "border-gold-400 bg-gold-400 text-oxford-900" : "border-slate-200 text-oxford-900 hover:border-gold-400"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!time}
                onClick={() => go(3)}
                className="inline-flex items-center gap-2 rounded-xl bg-oxford-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-oxford-700 disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 4: review & confirm */}
        {step === 3 && service && address && dayLabel && time && (
          <section>
            <h2 className="text-xl font-bold text-oxford-900">Check and confirm</h2>

            <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 p-4">
                <Wrench size={18} className="text-marigold-600" />
                <dt className="sr-only">Service</dt>
                <dd className="font-semibold text-oxford-900">{service.name}</dd>
              </div>
              <div className="flex items-center gap-3 p-4">
                <Clock3 size={18} className="text-marigold-600" />
                <dt className="sr-only">When</dt>
                <dd className="text-oxford-900">
                  {dayLabel.weekday} {dayLabel.day} at <strong>{time}</strong> · about {formatDuration(service.durationInMinutes)}
                </dd>
              </div>
              <div className="flex items-center gap-3 p-4">
                <MapPin size={18} className="text-marigold-600" />
                <dt className="sr-only">Address</dt>
                <dd className="text-oxford-900">{formatAddress(address)}</dd>
              </div>
            </dl>

            <label htmlFor="description" className="mt-6 block text-sm font-semibold text-slate-700">
              Anything the technician should know? <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The kitchen tap has been dripping for a week. Parking is on the street."
              className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 text-sm text-oxford-900 outline-none focus:border-oxford-500 focus:ring-4 focus:ring-oxford-500/10"
            />

            <div className="mt-5 rounded-2xl bg-oxford-50 p-4 text-sm text-oxford-900">
              <p>
                Estimated price <strong>from {formatPrice(service.basePrice)}</strong>. Verified technicians in your area
                will see your request, and the first to accept confirms your booking. No payment is taken now.
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => go(2)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirm}
                className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/25 hover:bg-marigold-400 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Send booking request
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

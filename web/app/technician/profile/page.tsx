import { Lock, MapPin, Wrench } from "lucide-react";
import { apiFetch } from "@/app/lib/admin-api";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import PageHeader from "@/app/components/page-header";
import { setWorkingHoursAction, updateTechnicianProfileAction } from "./actions";

type TechnicianProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  memberSince: string;
  services: string[];
  areas: string[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
};

// Shown Monday first; values are the backend's day numbers (0 = Sunday).
const WEEK = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
  { day: 0, label: "Sunday" },
];

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-500 focus:ring-4 focus:ring-oxford-500/10";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

export default async function TechnicianProfilePage() {
  const me = await apiFetch<TechnicianProfile>("/technicians/me");

  return (
    <>
      <PageHeader title="Profile" description="What customers see, and when you're available for work." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 font-bold text-oxford-900">Your details</h2>
            <ActionForm action={updateTechnicianProfileAction} className="space-y-4">
              <div>
                <label htmlFor="name" className={label}>Name</label>
                <input id="name" value={`${me.firstName} ${me.lastName}`} readOnly disabled className={`${input} bg-slate-50 text-slate-500`} />
              </div>
              <div>
                <label htmlFor="email" className={label}>Email</label>
                <input id="email" value={me.email} readOnly disabled className={`${input} bg-slate-50 text-slate-500`} />
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock size={12} /> Your name and email were verified at approval. Contact support to change them.
                </p>
              </div>
              <div>
                <label htmlFor="phone" className={label}>Phone</label>
                <input id="phone" name="phone" type="tel" defaultValue={me.phone ?? ""} placeholder="+447700900123" className={input} />
              </div>
              <div>
                <label htmlFor="bio" className={label}>About you <span className="font-normal text-slate-500">(shown to customers)</span></label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  maxLength={2000}
                  defaultValue={me.bio ?? ""}
                  placeholder="Your experience, qualifications and the kind of jobs you enjoy."
                  className={`${input} h-auto py-2.5`}
                />
              </div>
              <SubmitButton>Save details</SubmitButton>
            </ActionForm>
          </section>

          <section className={card}>
            <h2 className="font-bold text-oxford-900">Services and areas</h2>
            <p className="mt-1 text-sm text-slate-600">Checked by our team. Contact support to change them.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {me.services.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-marigold-900">
                  <Wrench size={12} /> {s}
                </span>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-700">
              <MapPin size={15} className="text-marigold-600" /> {me.areas.join(", ")}
            </p>
          </section>
        </div>

        <section className={card}>
          <h2 className="font-bold text-oxford-900">Working hours</h2>
          <p className="mt-1 text-sm text-slate-600">
            You&apos;ll only see booking requests inside these hours (UK time). Jobs you&apos;ve already accepted aren&apos;t affected.
          </p>

          <ActionForm action={setWorkingHoursAction} className="mt-5">
            <ul className="divide-y divide-slate-100">
              {WEEK.map(({ day, label: dayLabel }) => {
                const hours = me.availability.find((a) => a.dayOfWeek === day);
                return (
                  <li key={day} className="flex flex-wrap items-center gap-3 py-3">
                    <label className="flex w-32 items-center gap-2 text-sm font-semibold text-oxford-900">
                      <input type="checkbox" name={`on-${day}`} defaultChecked={Boolean(hours)} className="h-4 w-4 accent-oxford-900" />
                      {dayLabel}
                    </label>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="time"
                        name={`start-${day}`}
                        aria-label={`${dayLabel} start`}
                        defaultValue={hours?.startTime ?? "09:00"}
                        className="h-10 rounded-xl border border-slate-200 px-2.5 text-sm text-oxford-900"
                      />
                      to
                      <input
                        type="time"
                        name={`end-${day}`}
                        aria-label={`${dayLabel} end`}
                        defaultValue={hours?.endTime ?? "17:00"}
                        className="h-10 rounded-xl border border-slate-200 px-2.5 text-sm text-oxford-900"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <SubmitButton className="mt-4">Save working hours</SubmitButton>
          </ActionForm>
        </section>
      </div>
    </>
  );
}

import Link from "next/link";
import { AlertTriangle, KeyRound, Lock, MapPin, Plus, Star } from "lucide-react";
import { ActionForm, SubmitButton } from "@/app/components/action-form";
import { apiFetch } from "@/app/lib/admin-api";
import { formatAddress, type CustomerProfile } from "@/app/lib/bookings";
import PageHeader from "../../page-header";
import { addAddressAction, makeDefaultAddressAction, updateAddressAction, updateProfileAction } from "./actions";

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-500 focus:ring-4 focus:ring-oxford-500/10";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

type Address = CustomerProfile["addresses"][number];

function AddressFields({ address, idPrefix }: { address?: Address; idPrefix: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-line1`} className={label}>Address line 1</label>
        <input id={`${idPrefix}-line1`} name="addressLine1" required maxLength={255} defaultValue={address?.addressLine1} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-line2`} className={label}>Address line 2 <span className="font-normal text-slate-500">(optional)</span></label>
        <input id={`${idPrefix}-line2`} name="addressLine2" maxLength={255} defaultValue={address?.addressLine2 ?? ""} className={input} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-city`} className={label}>Town / city</label>
        <input id={`${idPrefix}-city`} name="city" required maxLength={100} defaultValue={address?.city} className={input} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-postcode`} className={label}>Postcode</label>
        <input id={`${idPrefix}-postcode`} name="postcode" required maxLength={20} defaultValue={address?.postalCode} className={`${input} uppercase`} />
      </div>
      <input type="hidden" name="country" value={address?.country ?? "United Kingdom"} />
    </div>
  );
}

export default async function ProfilePage() {
  const me = await apiFetch<CustomerProfile>("/customers/me");

  return (
    <>
      <PageHeader title="Profile" description="Your details and the addresses technicians can visit." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <div className="space-y-6">
          {/* Account details */}
          <section className={card}>
            <h2 className="mb-4 font-bold text-oxford-900">Your details</h2>
            <ActionForm action={updateProfileAction} className="space-y-4">
              <div>
                <label htmlFor="name" className={label}>Full name</label>
                <input id="name" name="name" required minLength={2} maxLength={100} defaultValue={me.name} className={input} />
              </div>
              <div>
                <label htmlFor="email" className={label}>Email</label>
                <input id="email" value={me.email} readOnly disabled className={`${input} bg-slate-50 text-slate-500`} />
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock size={12} /> To change your email, please contact ValleyFix support.
                </p>
              </div>
              <div>
                <label htmlFor="phone" className={label}>Phone <span className="font-normal text-slate-500">(so your technician can reach you)</span></label>
                <input id="phone" name="phone" type="tel" defaultValue={me.phone ?? ""} placeholder="+447700900123" className={input} />
              </div>
              <SubmitButton>Save details</SubmitButton>
            </ActionForm>
          </section>

          {/* Security */}
          <section className={card}>
            <h2 className="font-bold text-oxford-900">Security</h2>
            <p className="mt-1 text-sm text-slate-600">Changing your password signs you out on other devices.</p>
            <Link
              href="/account/password"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-oxford-900 hover:bg-slate-50"
            >
              <KeyRound size={16} className="text-marigold-600" /> Change password
            </Link>
          </section>
        </div>

        <div className="space-y-6">
          {/* Addresses */}
          <section className={card}>
            <h2 className="mb-4 font-bold text-oxford-900">Your addresses</h2>
            <ul className="space-y-3">
              {me.addresses.map((a) => (
                <li key={a.id} className={`rounded-xl border p-4 ${a.isDefault ? "border-gold-300 bg-gold-50/50" : "border-slate-200"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="flex items-start gap-2 text-sm text-oxford-900">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-marigold-600" />
                      {formatAddress(a)}
                    </p>
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-oxford-900">
                        <Star size={11} /> Default
                      </span>
                    )}
                  </div>
                  {!a.covered && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-marigold-800">
                      <AlertTriangle size={13} /> ValleyFix doesn&apos;t cover {a.city} yet, so it can&apos;t be booked.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-start gap-4">
                    {!a.isDefault && (
                      <ActionForm action={makeDefaultAddressAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="text-sm font-semibold text-oxford-900 hover:underline">Make default</button>
                      </ActionForm>
                    )}
                    <details className="w-full">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-oxford-900 hover:underline">Edit</summary>
                      <ActionForm action={updateAddressAction} className="mt-4 space-y-4">
                        <input type="hidden" name="id" value={a.id} />
                        <AddressFields address={a} idPrefix={`a${a.id}`} />
                        <SubmitButton>Save address</SubmitButton>
                      </ActionForm>
                    </details>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 font-bold text-oxford-900">
              <Plus size={18} className="text-marigold-600" /> Add an address
            </h2>
            <ActionForm action={addAddressAction} className="space-y-4">
              <AddressFields idPrefix="new" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="isDefault" className="accent-oxford-900" /> Make this my default address
              </label>
              <SubmitButton variant="gold">Add address</SubmitButton>
            </ActionForm>
          </section>
        </div>
      </div>
    </>
  );
}

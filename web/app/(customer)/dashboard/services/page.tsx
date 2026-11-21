import Link from "next/link";
import { ArrowRight, Clock3, Users } from "lucide-react";
import { apiFetch } from "@/app/lib/admin-api";
import { getBackendUrl } from "@/app/lib/auth";
import {
  fetchCatalog,
  formatDuration,
  formatPrice,
  type CatalogService,
  type CustomerProfile,
  type PublicTechnician,
} from "@/app/lib/bookings";
import PageHeader from "@/app/components/page-header";

export default async function ServicesPage() {
  const backend = getBackendUrl();
  const me = await apiFetch<CustomerProfile>("/customers/me");

  // Show availability for the customer's default address (if we cover it).
  const home = me.addresses.find((a) => a.isDefault && a.covered) ?? me.addresses.find((a) => a.covered);

  const [services, technicians] = await Promise.all([
    fetchCatalog<CatalogService[]>(backend, "/services"),
    home
      ? fetchCatalog<PublicTechnician[]>(backend, `/technicians?city=${encodeURIComponent(home.city)}`)
      : Promise.resolve([] as PublicTechnician[]),
  ]);

  // How many approved technicians in the customer's town offer each service.
  const techniciansFor = (slug: string) =>
    technicians.filter((t) => t.services.some((s) => s.slug === slug)).length;

  return (
    <>
      <PageHeader
        title="Services"
        description={
          home
            ? `Everything ValleyFix offers, with availability in ${home.city}.`
            : "Everything ValleyFix offers. Add an address we cover in your profile to see local availability."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => {
          const count = home ? techniciansFor(s.slug) : null;
          return (
            <article key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-marigold-700">{s.category}</p>
              <h2 className="mt-1 text-xl font-bold text-oxford-900">{s.name}</h2>
              {s.description && <p className="mt-2 text-sm leading-6 text-slate-600">{s.description}</p>}

              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
                <div>
                  <dt className="sr-only">Price</dt>
                  <dd>
                    From <strong className="text-oxford-900">{formatPrice(s.basePrice)}</strong>
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 size={15} className="text-marigold-600" />
                  <dt className="sr-only">Duration</dt>
                  <dd>About {formatDuration(s.durationInMinutes)}</dd>
                </div>
                {count !== null && (
                  <div className="flex items-center gap-1.5">
                    <Users size={15} className="text-marigold-600" />
                    <dt className="sr-only">Technicians</dt>
                    <dd>
                      {count > 0 ? `${count} technician${count === 1 ? "" : "s"} in ${home!.city}` : `Not yet available in ${home!.city}`}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-auto flex items-center gap-4 pt-5">
                {count !== 0 ? (
                  <Link
                    href={`/book?service=${s.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-oxford-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-oxford-700"
                  >
                    Book {s.name.toLowerCase()} <ArrowRight size={15} />
                  </Link>
                ) : (
                  <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">Coming soon to {home?.city}</span>
                )}
                {count !== null && count > 0 && (
                  <Link href={`/dashboard/technicians?service=${s.slug}`} className="text-sm font-semibold text-oxford-900 hover:underline">
                    See technicians
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

import Link from "next/link";
import { BadgeCheck, CalendarPlus, Info, MapPin } from "lucide-react";
import { apiFetch } from "@/app/lib/admin-api";
import { getBackendUrl } from "@/app/lib/auth";
import { fetchCatalog, type CatalogService, type CustomerProfile, type PublicTechnician } from "@/app/lib/bookings";
import PageHeader from "@/app/components/page-header";

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; city?: string }>;
}) {
  const params = await searchParams;
  const backend = getBackendUrl();
  const me = await apiFetch<CustomerProfile>("/customers/me");

  const [services, areas] = await Promise.all([
    fetchCatalog<CatalogService[]>(backend, "/services"),
    fetchCatalog<{ city: string }[]>(backend, "/areas"),
  ]);

  // Default to the customer's own town; allow browsing other covered towns.
  const cities = [...new Set(areas.map((a) => a.city))];
  const home = me.addresses.find((a) => a.isDefault && a.covered) ?? me.addresses.find((a) => a.covered);
  const city = cities.find((c) => c.toLowerCase() === params.city?.toLowerCase()) ?? home?.city ?? cities[0];
  const service = services.find((s) => s.slug === params.service);

  const query = new URLSearchParams();
  if (city) query.set("city", city);
  if (service) query.set("service", service.slug);
  const technicians = await fetchCatalog<PublicTechnician[]>(backend, `/technicians?${query}`);

  const link = (changes: { city?: string; service?: string | null }) => {
    const next = new URLSearchParams();
    const c = changes.city ?? city;
    const s = changes.service === null ? undefined : changes.service ?? service?.slug;
    if (c) next.set("city", c);
    if (s) next.set("service", s);
    return `/dashboard/technicians?${next}`;
  };

  const chip = (active: boolean) =>
    `shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
      active ? "bg-oxford-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <>
      <PageHeader title="Technicians" description="Every technician is ID-checked and approved by the ValleyFix team." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {cities.map((c) => (
          <Link key={c} href={link({ city: c })} className={chip(c === city)}>
            <MapPin size={14} className="mr-1 inline" />
            {c}
          </Link>
        ))}
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Link href={link({ service: null })} className={chip(!service)}>
          All services
        </Link>
        {services.map((s) => (
          <Link key={s.id} href={link({ service: s.slug })} className={chip(s.slug === service?.slug)}>
            {s.name}
          </Link>
        ))}
      </div>

      <p className="mb-6 flex items-start gap-2 rounded-2xl bg-oxford-50 p-4 text-sm text-oxford-900">
        <Info size={17} className="mt-0.5 shrink-0" />
        When you book, we match you with an available technician like these for your chosen time.
      </p>

      {technicians.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          No approved technicians {service ? `offer ${service.name.toLowerCase()} ` : ""}in {city} yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {technicians.map((t) => (
            <article key={t.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {t.hasPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- served by our own photo proxy
                  <img
                    src={`/api/catalog/technicians/${t.id}/photo`}
                    alt={`${t.name}`}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 bg-oxford-50 object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-oxford-900 text-xl font-bold text-gold-400">
                    {t.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5 text-lg font-bold text-oxford-900">
                    {t.name} <BadgeCheck size={18} className="text-marigold-600" aria-label="Verified" />
                  </h2>
                  <p className="text-sm text-slate-600">
                    {t.completedJobs > 0
                      ? `${t.completedJobs} job${t.completedJobs === 1 ? "" : "s"} completed`
                      : "New to ValleyFix"}
                    {" · since "}
                    {new Date(t.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {t.bio && <p className="mt-4 text-sm leading-6 text-slate-700">{t.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.services.map((s) => (
                  <span key={s.slug} className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-marigold-900">
                    {s.name}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin size={14} className="text-marigold-600" /> {t.areas.join(", ")}
              </p>

              <div className="mt-auto pt-5">
                <Link
                  href={`/book?service=${service?.slug ?? t.services[0]?.slug ?? ""}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-oxford-900 transition hover:bg-marigold-400"
                >
                  <CalendarPlus size={16} /> Book {(service ?? t.services[0])?.name.toLowerCase()}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

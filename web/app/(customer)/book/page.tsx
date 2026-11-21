import { apiFetch } from "@/app/lib/admin-api";
import { getBackendUrl } from "@/app/lib/auth";
import type { CatalogService, CustomerAddress } from "@/app/lib/bookings";
import BookingWizard from "./wizard";
import PageHeader from "@/app/components/page-header";

const BOOKABLE_DAYS = 14; // shown in the date picker (the backend allows up to 30)

/** The next N days in UK time, with labels, computed on the server. */
function upcomingDays(count: number) {
  const todayUk = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  const [y, m, d] = todayUk.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d + i));
    return {
      date: date.toISOString().slice(0, 10),
      weekday: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short" }),
      day: date.toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }),
    };
  });
}

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;

  const [services, addresses] = await Promise.all([
    fetch(`${getBackendUrl()}/catalog/services`, { cache: "no-store" }).then((r) => r.json() as Promise<CatalogService[]>),
    apiFetch<CustomerAddress[]>("/bookings/my-addresses"),
  ]);

  return (
    <>
      <PageHeader
        title="Book a service"
        description="Choose what you need and a time that suits you. A verified local technician will accept your request."
      />
      <BookingWizard
        services={services}
        addresses={addresses}
        days={upcomingDays(BOOKABLE_DAYS)}
        initialServiceSlug={service}
      />
    </>
  );
}

// Booking types and display helpers shared by the customer, technician and admin pages.
// (Mirrors backend/src/bookings/bookings.service.ts -> present())

export type BookingStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Booking = {
  id: number;
  reference: string;
  status: BookingStatus;
  service: { id: number; name: string; durationInMinutes: number };
  scheduledStart: string;
  scheduledEnd: string;
  description: string | null;
  estimatedPrice: number;
  address: { addressLine1: string; addressLine2: string | null; city: string; postalCode: string };
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  technician: { id?: number; userId?: number; name: string } | null;
  customer?: { name: string; phone: string | null };
  /** Decided by the backend for the current viewer. */
  allowedActions: { cancel: boolean; start: boolean; complete: boolean };
};

export type CatalogService = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  durationInMinutes: number;
  category: string;
};

export type CustomerAddress = {
  id: number;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  isDefault: boolean;
  covered: boolean;
};

export type Slot = { time: string; start: string; end: string };

export const ACTIVE_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

export const statusLabel: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const statusStyle: Record<BookingStatus, string> = {
  PENDING: "bg-gold-100 text-marigold-900",
  CONFIRMED: "bg-oxford-50 text-oxford-800",
  IN_PROGRESS: "bg-gold-400 text-oxford-900",
  COMPLETED: "bg-green-50 text-green-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

// Always show times in UK time, whatever the server's or visitor's time zone.
const TZ = "Europe/London";

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

export const formatDuration = (minutes: number) =>
  minutes % 60 === 0 ? `${minutes / 60} hour${minutes === 60 ? "" : "s"}` : `${minutes} minutes`;

export const formatAddress = (a: { addressLine1: string; addressLine2: string | null; city: string; postalCode: string }) =>
  [a.addressLine1, a.addressLine2, a.city, a.postalCode].filter(Boolean).join(", ");

// ----- Customer area -----

export type PublicTechnician = {
  id: number;
  name: string;
  bio: string | null;
  hasPhoto: boolean;
  memberSince: string;
  completedJobs: number;
  services: { name: string; slug: string }[];
  areas: string[];
};

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: (Omit<CustomerAddress, "postalCode"> & { postalCode: string; country: string })[];
};

/** Public catalogue data (no login needed), fetched on the server. */
export async function fetchCatalog<T>(backendUrl: string, path: string): Promise<T> {
  const response = await fetch(`${backendUrl}/catalog${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Catalogue request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

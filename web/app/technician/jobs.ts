// Shared data helpers for the technician pages (server-side).
import { apiFetch } from "@/app/lib/admin-api";
import type { Booking } from "@/app/lib/bookings";

/** The technician's own jobs, grouped the way the sidebar shows them. */
export async function myJobs() {
  const jobs = await apiFetch<Booking[]>("/bookings/mine");

  return {
    // Accepted, not due yet.
    accepted: jobs.filter((b) => b.status === "CONFIRMED" && !b.allowedActions.start),
    // Needs action now: can be started (from an hour before), or in progress.
    pending: jobs.filter((b) => b.status === "IN_PROGRESS" || (b.status === "CONFIRMED" && b.allowedActions.start)),
    completed: jobs
      .filter((b) => b.status === "COMPLETED")
      .sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart)),
    cancelled: jobs
      .filter((b) => b.status === "CANCELLED")
      .sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart)),
  };
}

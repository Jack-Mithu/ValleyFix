"use server";

// Server Actions for bookings. Each checks the caller's role here, and the
// backend checks again: the UI hiding a button is never the security boundary.
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/app/lib/admin-api";
import { getCurrentUser } from "@/app/lib/auth";
import type { ActionState } from "@/app/lib/action-state";
import type { Booking, Slot } from "@/app/lib/bookings";

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : "Something went wrong. Please try again.";

async function requireRoleIn(roles: string[]) {
  const user = await getCurrentUser();
  return user && roles.includes(user.role) ? user : null;
}

// ----- Customer: booking wizard -----

export type SlotsResult =
  | { ok: true; slots: Slot[]; area: string; durationInMinutes: number }
  | { ok: false; message: string };

export async function getSlotsAction(serviceId: number, addressId: number, date: string): Promise<SlotsResult> {
  if (!(await requireRoleIn(["customer"]))) return { ok: false, message: "Please sign in as a customer." };
  try {
    const query = new URLSearchParams({ serviceId: String(serviceId), addressId: String(addressId), date });
    const data = await apiFetch<{ slots: Slot[]; area: string; durationInMinutes: number }>(
      `/bookings/availability?${query}`,
    );
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, message: messageOf(error) };
  }
}

export type CreateResult = { ok: true; reference: string } | { ok: false; message: string };

export async function createBookingAction(input: {
  serviceId: number;
  addressId: number;
  date: string;
  time: string;
  description: string;
}): Promise<CreateResult> {
  if (!(await requireRoleIn(["customer"]))) return { ok: false, message: "Please sign in as a customer." };
  try {
    const booking = await apiFetch<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({ ...input, description: input.description.trim() || undefined }),
    });
    revalidatePath("/dashboard");
    return { ok: true, reference: booking.reference };
  } catch (error) {
    return { ok: false, message: messageOf(error) };
  }
}

// ----- Cancelling (customer: own future bookings; admins: any active one) -----

export async function cancelBookingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await requireRoleIn(["customer", "admin", "super_admin"]))) {
    return { ok: false, message: "You can't cancel this booking." };
  }
  const id = Number(form.get("id"));
  const reason = String(form.get("reason") ?? "").trim();
  try {
    await apiFetch(`/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    });
  } catch (error) {
    return { ok: false, message: messageOf(error) };
  }
  revalidatePath("/dashboard");
  revalidatePath("/admin/bookings");
  return { ok: true, message: "Booking cancelled." };
}

// ----- Technician: doing the job -----

async function technicianStep(form: FormData, step: "start" | "complete"): Promise<ActionState> {
  if (!(await requireRoleIn(["technician"]))) return { ok: false, message: "Technicians only." };
  const id = Number(form.get("id"));
  try {
    await apiFetch(`/bookings/${id}/${step}`, { method: "POST" });
  } catch (error) {
    return { ok: false, message: messageOf(error) };
  }
  revalidatePath("/technician/dashboard");
  return { ok: true, message: step === "start" ? "Job started." : "Job completed. Great work!" };
}

export async function startJobAction(_prev: ActionState, form: FormData) {
  return technicianStep(form, "start");
}

export async function completeJobAction(_prev: ActionState, form: FormData) {
  return technicianStep(form, "complete");
}

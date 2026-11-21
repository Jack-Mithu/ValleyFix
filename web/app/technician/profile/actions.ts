"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/app/lib/admin-api";
import { getCurrentUser } from "@/app/lib/auth";
import type { ActionState } from "@/app/lib/action-state";

async function isTechnician() {
  return (await getCurrentUser())?.role === "technician";
}

function fail(error: unknown): ActionState {
  return { ok: false, message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." };
}

export async function updateTechnicianProfileAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isTechnician())) return { ok: false, message: "Technicians only." };
  try {
    await apiFetch("/technicians/me", {
      method: "PATCH",
      body: JSON.stringify({
        phone: String(form.get("phone") ?? "").trim(),
        bio: String(form.get("bio") ?? "").trim(),
      }),
    });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/technician/profile");
  return { ok: true, message: "Profile saved." };
}

/** The form has, for each day 0-6: on-N (checkbox), start-N and end-N. */
export async function setWorkingHoursAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isTechnician())) return { ok: false, message: "Technicians only." };

  const days = [0, 1, 2, 3, 4, 5, 6]
    .filter((d) => form.get(`on-${d}`) === "on")
    .map((d) => ({
      dayOfWeek: d,
      startTime: String(form.get(`start-${d}`) ?? ""),
      endTime: String(form.get(`end-${d}`) ?? ""),
    }));

  try {
    await apiFetch("/technicians/me/availability", { method: "PUT", body: JSON.stringify({ days }) });
  } catch (error) {
    return fail(error);
  }
  // New hours change which booking requests this technician sees.
  revalidatePath("/technician", "layout");
  return {
    ok: true,
    message: days.length ? "Working hours saved." : "Saved. You're not taking new jobs until you add working days.",
  };
}

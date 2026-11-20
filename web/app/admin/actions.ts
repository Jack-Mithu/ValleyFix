"use server";

// Server Actions for the admin area. Each one re-checks the role here AND the
// backend checks again: Server Actions can be called directly with a POST, so
// the UI hiding a button is never the security boundary.
import { revalidatePath } from "next/cache";
import { ApiError, adminFetch } from "@/app/lib/admin-api";
import { requireRole } from "@/app/lib/require-role";

export type ActionState = { ok: boolean; message: string } | null;

const ADMINS = ["admin", "super_admin"];

function fail(error: unknown): ActionState {
  return {
    ok: false,
    message: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
  };
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function updateUserAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireRole(ADMINS);
  const id = Number(form.get("id"));
  try {
    await adminFetch(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: text(form, "name"),
        email: text(form, "email"),
        phone: text(form, "phone"),
      }),
    });
  } catch (error) {
    return fail(error);
  }
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Details saved." };
}

export async function setActiveAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireRole(ADMINS);
  const id = Number(form.get("id"));
  const isActive = form.get("isActive") === "true";
  try {
    await adminFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: isActive ? "Account activated." : "Account deactivated." };
}

export async function approveTechnicianAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireRole(["super_admin"]);
  const id = Number(form.get("id"));
  try {
    await adminFetch(`/admin/technicians/${id}/approve`, { method: "POST" });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Technician approved." };
}

export async function rejectTechnicianAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireRole(["super_admin"]);
  const id = Number(form.get("id"));
  try {
    await adminFetch(`/admin/technicians/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason: text(form, "reason") }),
    });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Application rejected." };
}

export async function createSubAdminAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireRole(["super_admin"]);
  try {
    await adminFetch("/admin/admins", {
      method: "POST",
      body: JSON.stringify({
        name: text(form, "name"),
        email: text(form, "email"),
        password: String(form.get("password") ?? ""),
      }),
    });
  } catch (error) {
    return fail(error);
  }
  revalidatePath("/admin/admins");
  return { ok: true, message: "Sub admin created. Share the password with them securely." };
}

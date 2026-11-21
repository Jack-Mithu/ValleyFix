"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/app/lib/admin-api";
import { getCurrentUser } from "@/app/lib/auth";
import type { ActionState } from "@/app/lib/action-state";

// Server Actions can be called directly with a POST, so each checks the role;
// the backend also only ever touches the logged-in customer's own data.
async function isCustomer() {
  return (await getCurrentUser())?.role === "customer";
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function fail(error: unknown): ActionState {
  return { ok: false, message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." };
}

function addressFrom(form: FormData) {
  return {
    addressLine1: text(form, "addressLine1"),
    addressLine2: text(form, "addressLine2"),
    city: text(form, "city"),
    postcode: text(form, "postcode"),
    country: text(form, "country") || "United Kingdom",
  };
}

function refresh() {
  revalidatePath("/dashboard", "layout"); // name in the sidebar, address pickers, etc.
}

export async function updateProfileAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isCustomer())) return { ok: false, message: "Customers only." };
  try {
    await apiFetch("/customers/me", {
      method: "PATCH",
      body: JSON.stringify({ name: text(form, "name"), phone: text(form, "phone") }),
    });
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function addAddressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isCustomer())) return { ok: false, message: "Customers only." };
  try {
    await apiFetch("/customers/me/addresses", {
      method: "POST",
      body: JSON.stringify({ ...addressFrom(form), isDefault: form.get("isDefault") === "on" }),
    });
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { ok: true, message: "Address added." };
}

export async function updateAddressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isCustomer())) return { ok: false, message: "Customers only." };
  const id = Number(form.get("id"));
  try {
    await apiFetch(`/customers/me/addresses/${id}`, { method: "PATCH", body: JSON.stringify(addressFrom(form)) });
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { ok: true, message: "Address updated." };
}

export async function makeDefaultAddressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isCustomer())) return { ok: false, message: "Customers only." };
  const id = Number(form.get("id"));
  try {
    await apiFetch(`/customers/me/addresses/${id}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) });
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { ok: true, message: "Default address changed." };
}

"use server";

import { cookies } from "next/headers";
import { getBackendUrl, getCurrentUser } from "@/app/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/app/lib/session";

export type PasswordState = { ok: boolean; message: string } | null;

export async function changePasswordAction(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  // Server Actions can be called directly, so always check who is calling.
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  // Quick checks here for friendly messages; the backend enforces the real rules.
  if (!currentPassword || !newPassword) {
    return { ok: false, message: "Please fill in every field." };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, message: "The new passwords don't match." };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/auth/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Unable to reach ValleyFix. Please try again." };
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(". ") : data.message;
    return { ok: false, message: message || "Unable to change your password." };
  }

  // The old token is now rejected everywhere; keep THIS browser signed in
  // by swapping in the fresh token the backend returned.
  if (typeof data.accessToken === "string") {
    cookieStore.set(SESSION_COOKIE, data.accessToken, sessionCookieOptions);
  }

  return { ok: true, message: "Password changed. Any other devices have been signed out." };
}

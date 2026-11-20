// Server-only auth helpers: use from Server Components and Route Handlers.
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE, type SessionUser } from "./session";

export function getBackendUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL is not configured for the web app.");
  }
  return url.replace(/\/$/, "");
}

// Asks the backend "who owns this token?".
// Wrapped in React `cache` so several components can call it during one
// request but the backend is only asked once.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const response = await fetch(`${getBackendUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // Expired, tampered or deactivated -> treat as logged out.
  if (response.status === 401 || response.status === 403) {
    return null;
  }

  // Anything else (backend down, 500...) is a real error, not "logged out".
  // Throwing shows the error page instead of silently kicking the user out.
  if (!response.ok) {
    throw new Error(`Failed to load current user (status ${response.status}).`);
  }

  const data = (await response.json()) as { user?: SessionUser };
  return data.user ?? null;
});

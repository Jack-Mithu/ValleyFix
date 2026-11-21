// Shared, browser-safe session constants and helpers.
// (No server-only imports here, so client components and proxy.ts can use it.)

export const SESSION_COOKIE = "valleyfix_access_token";

// Keep in sync with the JWT lifetime in backend/src/auth/auth.module.ts ("1d").
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

// One definition of the session cookie, used by login and password change.
export const sessionCookieOptions = {
  httpOnly: true, // JavaScript (and XSS) can't read it
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // not sent on cross-site POSTs (CSRF protection)
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  /** Technicians only: PENDING until a super admin approves them. */
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
};

// Where each role lands after logging in.
export function homePathForRole(role: string): string | null {
  switch (role) {
    case "customer":
      return "/dashboard";
    case "technician":
      return "/technician/requests";
    case "admin":
    case "super_admin":
      return "/admin";
    default:
      return null;
  }
}

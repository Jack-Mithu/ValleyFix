// Shared, browser-safe session constants and helpers.
// (No server-only imports here, so client components and proxy.ts can use it.)

export const SESSION_COOKIE = "valleyfix_access_token";

// Keep in sync with the JWT lifetime in backend/src/auth/auth.module.ts ("1d").
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

// Where each role lands after logging in.
export function homePathForRole(role: string): string | null {
  switch (role) {
    case "customer":
      return "/dashboard";
    case "technician":
      return "/technician/dashboard";
    case "admin":
    case "super_admin":
      return "/admin";
    default:
      return null;
  }
}

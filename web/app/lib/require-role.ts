import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { homePathForRole, type SessionUser } from "./session";

// Use at the top of a protected page:
//   const user = await requireRole(["customer"]);
// - Not logged in (or token invalid) -> /login
// - Logged in with another role      -> that role's own home page
export async function requireRole(allowed: string[]): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowed.includes(user.role)) {
    redirect(homePathForRole(user.role) ?? "/login");
  }

  return user;
}

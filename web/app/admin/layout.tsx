import type { ReactNode } from "react";
import { requireRole } from "@/app/lib/require-role";
import Logo from "@/app/components/Logo";
import AdminNav from "./nav";

// Every page under /admin is protected here: only admins and the super admin.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["admin", "super_admin"]);
  const isSuper = user.role === "super_admin";

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="bg-oxford-900 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Logo tone="dark" />
          <div className="flex items-center gap-2 lg:mt-4">
            <span className="rounded-full bg-gold-400 px-2.5 py-1 text-xs font-bold text-oxford-900">
              {isSuper ? "Super admin" : "Sub admin"}
            </span>
            <form action="/api/auth/logout" method="post" className="lg:hidden">
              <button className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-medium text-oxford-50">Log out</button>
            </form>
          </div>
        </div>

        <AdminNav isSuper={isSuper} />

        <div className="hidden border-t border-white/10 px-5 py-5 lg:mt-auto lg:block">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-oxford-200">{user.email}</p>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button className="w-full rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-oxford-50 transition hover:bg-white/10">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

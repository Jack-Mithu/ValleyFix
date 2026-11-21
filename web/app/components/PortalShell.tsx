import type { ReactNode } from "react";
import Link from "next/link";
import type { SessionUser } from "@/app/lib/session";

// Shared layout for the logged-in areas (customer, technician, admin).
export default function PortalShell({
  label,
  user,
  description,
  sections,
  children,
}: {
  label: string;
  user: SessionUser;
  description: string;
  /** Optional "coming soon" tiles for features not built yet. */
  sections?: string[];
  children?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-oxford-900">{label}</p>

            <div className="flex items-center gap-2">
              <Link
                href="/account/password"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Change password
              </Link>
              {/* Plain HTML form: works even before JavaScript loads. */}
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-oxford-900">
            Welcome, {user.name}!
          </h1>

          <p className="mt-3 text-slate-600">
            Signed in as {user.email}. {description}
          </p>

          {children}

          {sections && sections.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-800">{item}</h2>
                  <p className="mt-2 text-sm text-slate-600">Coming soon</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

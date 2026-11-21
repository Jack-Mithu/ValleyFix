import type { ReactNode } from "react";
import { requireRole } from "@/app/lib/require-role";
import CustomerNav from "./nav";

// Every page in the (customer) group (/dashboard/*, /book) is for customers only.
// The "(customer)" folder name is a route group: it doesn't appear in URLs.
export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["customer"]);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <CustomerNav name={user.name} email={user.email} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

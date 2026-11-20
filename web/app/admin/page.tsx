import Link from "next/link";
import { ArrowRight, ShieldCheck, UserCog, Users, Wrench } from "lucide-react";
import { adminFetch, type Overview } from "@/app/lib/admin-api";
import { getCurrentUser } from "@/app/lib/auth";
import { Card, PageHeader } from "./components";

export default async function AdminOverview() {
  const [user, overview] = await Promise.all([getCurrentUser(), adminFetch<Overview>("/admin/overview")]);
  const isSuper = user?.role === "super_admin";

  const stats = [
    { label: "Customers", value: overview.customers, icon: Users, href: "/admin/users?role=customer" },
    { label: "Technicians", value: overview.technicians, icon: Wrench, href: "/admin/users?role=technician" },
    ...(overview.subAdmins !== null
      ? [{ label: "Sub admins", value: overview.subAdmins, icon: UserCog, href: "/admin/admins" }]
      : []),
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name.split(" ")[0] ?? "admin"}`} description="Here's what needs your attention today." />

      {/* Pending approvals call-out */}
      <Link
        href="/admin/technicians"
        className="group mb-6 flex items-center gap-4 rounded-2xl bg-oxford-900 p-6 text-white shadow-lg shadow-oxford-900/15 transition hover:-translate-y-0.5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-oxford-900">
          <ShieldCheck size={24} />
        </span>
        <div className="flex-1">
          <p className="text-3xl font-bold">{overview.pendingTechnicians}</p>
          <p className="text-sm text-oxford-100">
            technician application{overview.pendingTechnicians === 1 ? "" : "s"} waiting for review
            {!isSuper && " (approval is done by the super admin)"}
          </p>
        </div>
        <ArrowRight className="text-gold-400 transition group-hover:translate-x-1" />
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <Icon size={18} className="text-marigold-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-oxford-900">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

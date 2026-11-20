// Small presentational pieces shared by the admin pages (server components).
import type { ReactNode } from "react";
import type { ApprovalStatus } from "@/app/lib/admin-api";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-oxford-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

const statusStyles: Record<ApprovalStatus, string> = {
  PENDING: "bg-gold-100 text-marigold-900",
  APPROVED: "bg-green-50 text-green-800",
  REJECTED: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

const roleLabels: Record<string, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Sub admin",
  super_admin: "Super admin",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-full bg-oxford-50 px-2.5 py-1 text-xs font-semibold text-oxford-800">
      {roleLabels[role] ?? role}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? "text-green-700" : "text-slate-500"}`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-slate-300"}`} />
      {active ? "Active" : "Deactivated"}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">{children}</p>;
}

export const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-500 focus:ring-4 focus:ring-oxford-500/10";

export const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

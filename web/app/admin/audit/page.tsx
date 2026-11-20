import { redirect } from "next/navigation";
import { adminFetch, type AuditEntry } from "@/app/lib/admin-api";
import { requireRole } from "@/app/lib/require-role";
import { EmptyState, PageHeader } from "../components";

const describe: Record<string, string> = {
  "user.update": "updated an account",
  "technician.approve": "approved a technician",
  "technician.reject": "rejected a technician",
  "admin.create": "created a sub admin",
};

export default async function AuditLogPage() {
  const me = await requireRole(["admin", "super_admin"]);
  if (me.role !== "super_admin") redirect("/admin");

  const entries = await adminFetch<AuditEntry[]>("/admin/audit-log");

  return (
    <>
      <PageHeader title="Audit log" description="The 50 most recent admin actions." />
      {entries.length === 0 ? (
        <EmptyState>No admin actions yet.</EmptyState>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <time className="shrink-0 font-mono text-xs text-slate-500 sm:w-40">
                {new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </time>
              <p className="min-w-0 flex-1 text-sm text-slate-700">
                <span className="font-semibold text-oxford-900">{e.user?.name ?? "Deleted user"}</span>{" "}
                {describe[e.action] ?? e.action}
                <span className="text-slate-500"> · {e.entity} #{e.entityId}</span>
              </p>
              {e.newValues != null && (
                <code className="max-w-full truncate rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600 sm:max-w-xs">
                  {JSON.stringify(e.newValues)}
                </code>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

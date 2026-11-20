import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";
import { adminFetch, type UserList } from "@/app/lib/admin-api";
import { requireRole } from "@/app/lib/require-role";
import { redirect } from "next/navigation";
import { createSubAdminAction } from "../actions";
import { ActionForm, SubmitButton } from "../ui";
import { ActiveBadge, Card, EmptyState, PageHeader, formatDate, inputClass, labelClass } from "../components";

export default async function SubAdminsPage() {
  const me = await requireRole(["admin", "super_admin"]);
  if (me.role !== "super_admin") redirect("/admin");

  const { users } = await adminFetch<UserList>("/admin/users?role=admin&pageSize=100");

  return (
    <>
      <PageHeader
        title="Sub admins"
        description="Sub admins can view and edit customers and technicians. They can't approve technicians, manage other admins or change your account."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div>
          {users.length === 0 ? (
            <EmptyState>No sub admins yet. Create one with the form.</EmptyState>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              {users.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-oxford-900 font-bold text-gold-400">
                      {u.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-oxford-900">{u.name}</p>
                      <p className="truncate text-sm text-slate-600">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <ActiveBadge active={u.isActive} />
                      <p className="mt-1 text-xs text-slate-500">Added {formatDate(u.createdAt)}</p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Card>
          <h2 className="flex items-center gap-2 font-bold text-oxford-900">
            <UserPlus size={18} className="text-marigold-600" /> Create a sub admin
          </h2>
          <ActionForm action={createSubAdminAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="sa-name" className={labelClass}>Name</label>
              <input id="sa-name" name="name" required minLength={2} maxLength={100} className={inputClass} />
            </div>
            <div>
              <label htmlFor="sa-email" className={labelClass}>Email</label>
              <input id="sa-email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="sa-password" className={labelClass}>Temporary password</label>
              <input
                id="sa-password"
                name="password"
                type="password"
                required
                minLength={10}
                maxLength={72}
                autoComplete="new-password"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-500">At least 10 characters. Share it with them privately.</p>
            </div>
            <SubmitButton variant="gold">Create sub admin</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}

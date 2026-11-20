import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { adminFetch, type UserList } from "@/app/lib/admin-api";
import { ActiveBadge, EmptyState, PageHeader, RoleBadge, StatusBadge, formatDate, inputClass } from "../components";

const filters = [
  { value: "", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "technician", label: "Technicians" },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const role = filters.some((f) => f.value === params.role) ? params.role ?? "" : "";
  const search = (params.search ?? "").slice(0, 100);
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (role) query.set("role", role);
  if (search) query.set("search", search);

  const data = await adminFetch<UserList>(`/admin/users?${query}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const link = (changes: Record<string, string | number>) => {
    const next = new URLSearchParams({ ...(role && { role }), ...(search && { search }), page: String(page) });
    for (const [k, v] of Object.entries(changes)) {
      if (v === "" ) next.delete(k);
      else next.set(k, String(v));
    }
    return `/admin/users?${next}`;
  };

  return (
    <>
      <PageHeader title="Customers & technicians" description={`${data.total} account${data.total === 1 ? "" : "s"}`} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={link({ role: f.value, page: 1 })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                f.value === role ? "bg-oxford-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Plain GET form: the search lives in the URL, so it can be shared/bookmarked */}
        <form action="/admin/users" className="relative flex-1 sm:max-w-sm sm:ml-auto">
          {role && <input type="hidden" name="role" value={role} />}
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="search" defaultValue={search} placeholder="Search name, email or phone" className={`${inputClass} pl-10`} />
        </form>
      </div>

      {data.users.length === 0 ? (
        <EmptyState>No accounts match your search.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {data.users.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-oxford-50 font-bold text-oxford-900">
                    {u.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-oxford-900">{u.name}</p>
                      <RoleBadge role={u.role} />
                      {u.technicianProfile && <StatusBadge status={u.technicianProfile.approvalStatus} />}
                    </div>
                    <p className="truncate text-sm text-slate-600">{u.email}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <ActiveBadge active={u.isActive} />
                    <p className="mt-1 text-xs text-slate-500">Joined {formatDate(u.createdAt)}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-slate-600">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={link({ page: page - 1 })} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50">
                <ChevronLeft size={16} /> Previous
              </Link>
            )}
            {page < pages && (
              <Link href={link({ page: page + 1 })} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50">
                Next <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { ChevronRight, MapPin, Wrench } from "lucide-react";
import { adminFetch, type ApprovalStatus, type TechnicianRow } from "@/app/lib/admin-api";
import { EmptyState, PageHeader, StatusBadge, formatDate } from "../components";

const tabs: { status: ApprovalStatus; label: string }[] = [
  { status: "PENDING", label: "Waiting for review" },
  { status: "APPROVED", label: "Approved" },
  { status: "REJECTED", label: "Rejected" },
];

export default async function TechnicianApprovals({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status = tabs.some((t) => t.status === raw) ? (raw as ApprovalStatus) : "PENDING";
  const technicians = await adminFetch<TechnicianRow[]>(`/admin/technicians?status=${status}`);

  return (
    <>
      <PageHeader
        title="Technician approvals"
        description="New technicians can't take jobs until their application is approved."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/technicians?status=${tab.status}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab.status === status
                ? "bg-oxford-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {technicians.length === 0 ? (
        <EmptyState>No {status.toLowerCase()} applications.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {technicians.map((t) => (
            <li key={t.userId}>
              <Link
                href={`/admin/users/${t.userId}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-gold-300 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-oxford-900 font-bold text-gold-400">
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-oxford-900">{t.name}</p>
                    <StatusBadge status={t.approvalStatus} />
                    {!t.isActive && <span className="text-xs text-slate-500">(deactivated)</span>}
                  </div>
                  <p className="truncate text-sm text-slate-600">{t.email}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Wrench size={13} /> {t.services.join(", ")}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {t.areas.join(", ")}</span>
                    <span>Applied {formatDate(t.appliedAt)}</span>
                  </div>
                </div>
                <ChevronRight className="shrink-0 text-slate-400 transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Lock, MapPin } from "lucide-react";
import { ApiError, adminFetch, type UserDetail } from "@/app/lib/admin-api";
import { getCurrentUser } from "@/app/lib/auth";
import { approveTechnicianAction, rejectTechnicianAction, setActiveAction, updateUserAction } from "../../actions";
import { ActionForm, SubmitButton } from "../../ui";
import { ActiveBadge, Card, RoleBadge, StatusBadge, formatDate, inputClass, labelClass } from "../../components";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const me = await getCurrentUser();
  const isSuper = me?.role === "super_admin";

  let user: UserDetail;
  try {
    user = await adminFetch<UserDetail>(`/admin/users/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <Card className="max-w-xl">
          <p className="flex items-center gap-2 font-semibold text-oxford-900"><Lock size={18} /> Not available</p>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        </Card>
      );
    }
    throw error;
  }

  // Same rules as the backend: nobody edits the super admin; only the super admin edits sub admins.
  const canEdit = user.role !== "super_admin" && (user.role !== "admin" || isSuper);
  const tech = user.technician;
  const backHref = user.role === "admin" ? "/admin/admins" : "/admin/users";

  return (
    <>
      <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-oxford-900">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-oxford-900 sm:text-3xl">{user.name}</h1>
        <RoleBadge role={user.role} />
        {tech && <StatusBadge status={tech.approvalStatus} />}
        <ActiveBadge active={user.isActive} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          {/* Account details */}
          <Card>
            <h2 className="mb-4 font-bold text-oxford-900">Account details</h2>
            {canEdit ? (
              <ActionForm action={updateUserAction} className="space-y-4">
                <input type="hidden" name="id" value={user.id} />
                <div>
                  <label htmlFor="name" className={labelClass}>Name</label>
                  <input id="name" name="name" defaultValue={user.name} required minLength={2} maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input id="email" name="email" type="email" defaultValue={user.email} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone</label>
                  <input id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="+447700900123" className={inputClass} />
                </div>
                <SubmitButton>Save changes</SubmitButton>
              </ActionForm>
            ) : (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">Email</dt><dd className="font-medium text-oxford-900">{user.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-medium text-oxford-900">{user.phone ?? "—"}</dd></div>
                <p className="flex items-center gap-2 pt-2 text-slate-600"><Lock size={14} /> This account can&apos;t be changed from the admin area.</p>
              </dl>
            )}
            <p className="mt-4 text-xs text-slate-500">Joined {formatDate(user.createdAt)}</p>
          </Card>

          {/* Activate / deactivate */}
          {canEdit && (
            <Card>
              <h2 className="font-bold text-oxford-900">Account access</h2>
              <p className="mt-1 text-sm text-slate-600">
                {user.isActive
                  ? "Deactivating signs them out immediately and blocks future logins."
                  : "This account is deactivated and cannot sign in."}
              </p>
              <ActionForm action={setActiveAction} className="mt-4">
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="isActive" value={String(!user.isActive)} />
                <SubmitButton variant={user.isActive ? "danger" : "gold"}>
                  {user.isActive ? "Deactivate account" : "Activate account"}
                </SubmitButton>
              </ActionForm>
            </Card>
          )}

          {user.address.length > 0 && (
            <Card>
              <h2 className="mb-3 font-bold text-oxford-900">Address</h2>
              {user.address.map((a) => (
                <p key={a.id} className="flex gap-2 text-sm text-slate-700">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-marigold-600" />
                  <span>{[a.addressLine1, a.addressLine2, a.city, a.postalCode, a.country].filter(Boolean).join(", ")}</span>
                </p>
              ))}
            </Card>
          )}
        </div>

        {tech && (
          <div className="space-y-6">
            {/* Technician application */}
            <Card>
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-protected image */}
                <img
                  src={`/api/admin/files/${user.id}/profile`}
                  alt={`${user.name} profile photo`}
                  className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 bg-slate-100 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="font-bold text-oxford-900">Technician application</h2>
                  <p className="text-sm text-slate-600">Applied {formatDate(tech.appliedAt)}</p>
                  {tech.reviewedAt && <p className="text-sm text-slate-600">Reviewed {formatDate(tech.reviewedAt)}</p>}
                </div>
              </div>

              {tech.bio && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{tech.bio}</p>}

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Services</dt><dd className="font-medium text-oxford-900">{tech.services.join(", ")}</dd></div>
                <div><dt className="text-slate-500">Areas</dt><dd className="font-medium text-oxford-900">{tech.areas.join(", ")}</dd></div>
                <div><dt className="text-slate-500">National Insurance no.</dt><dd className="font-mono font-medium text-oxford-900">{tech.niNumber}</dd></div>
                <div>
                  <dt className="text-slate-500">Availability</dt>
                  <dd className="font-medium text-oxford-900">
                    {tech.availability.map((a) => (
                      <span key={a.dayOfWeek} className="block">{DAYS[a.dayOfWeek]} {a.startTime}–{a.endTime}</span>
                    ))}
                  </dd>
                </div>
              </dl>

              {isSuper ? (
                <a
                  href={`/api/admin/files/${user.id}/identity`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-oxford-900 hover:bg-slate-50"
                >
                  <FileText size={16} className="text-marigold-600" /> View identity document
                </a>
              ) : (
                <p className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                  <Lock size={14} /> Identity documents are visible to the super admin only.
                </p>
              )}

              {tech.rejectionReason && tech.approvalStatus === "REJECTED" && (
                <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  <strong>Rejected:</strong> {tech.rejectionReason}
                </p>
              )}
            </Card>

            {/* Decision: super admin only */}
            {isSuper ? (
              <Card className="border-gold-300">
                <h2 className="font-bold text-oxford-900">Decision</h2>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700" data-testid="decision-status">
                  Current status: <StatusBadge status={tech.approvalStatus} />
                  {tech.reviewedAt && <span className="text-slate-500">on {formatDate(tech.reviewedAt)}</span>}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {tech.approvalStatus === "APPROVED"
                    ? "This technician can be offered jobs. You can revoke the approval below if needed."
                    : "Check the identity document and details before approving. Approved technicians can be offered jobs."}
                </p>

                {tech.approvalStatus !== "APPROVED" && (
                  <ActionForm action={approveTechnicianAction} className="mt-4">
                    <input type="hidden" name="id" value={user.id} />
                    <SubmitButton variant="gold">Approve technician</SubmitButton>
                  </ActionForm>
                )}

                {tech.approvalStatus !== "REJECTED" && (
                  <ActionForm action={rejectTechnicianAction} className="mt-5 border-t border-slate-100 pt-5">
                    <input type="hidden" name="id" value={user.id} />
                    <label htmlFor="reason" className={labelClass}>Reason for rejection</label>
                    <textarea
                      id="reason"
                      name="reason"
                      required
                      maxLength={500}
                      rows={3}
                      placeholder="e.g. The ID document is unreadable. Please re-apply with a clear photo."
                      className={`${inputClass} h-auto py-2.5`}
                    />
                    <SubmitButton variant="danger" className="mt-3">
                      {tech.approvalStatus === "APPROVED" ? "Revoke approval" : "Reject application"}
                    </SubmitButton>
                  </ActionForm>
                )}
              </Card>
            ) : (
              <Card>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Lock size={14} /> Approving or rejecting technicians is done by the super admin.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}

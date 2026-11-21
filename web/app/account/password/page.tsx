import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Logo from "@/app/components/Logo";
import { requireRole } from "@/app/lib/require-role";
import { homePathForRole } from "@/app/lib/session";
import PasswordForm from "./password-form";

export default async function ChangePasswordPage() {
  // Any signed-in user can change their own password.
  const user = await requireRole(["customer", "technician", "admin", "super_admin"]);
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const home = homePathForRole(user.role) ?? "/";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link href={home} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-oxford-900">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-oxford-900 text-gold-400">
            <ShieldCheck size={24} />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-oxford-900">Change your password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Signed in as <span className="font-medium text-oxford-900">{user.email}</span>. After changing it, any
            other devices signed in to your account will be signed out.
          </p>

          <div className="mt-7">
            <PasswordForm isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </main>
  );
}

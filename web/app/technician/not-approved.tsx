import Link from "next/link";

// Shown on job pages before the technician is approved.
export default function NotApprovedYet() {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
      Jobs will appear here once your account is approved. Meanwhile, check your{" "}
      <Link href="/technician/profile" className="font-semibold text-oxford-900 underline">
        profile and working hours
      </Link>
      .
    </p>
  );
}

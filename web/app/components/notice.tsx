import { AlertTriangle, CheckCircle2 } from "lucide-react";

/*
 * One-off banners shown after an action, chosen by a CODE in the URL
 * (e.g. ?notice=accepted&ref=VF-ABC12345). Only these fixed messages can be
 * shown, so nobody can craft a link that displays a fake message on our site.
 */
const NOTICES: Record<string, { tone: "ok" | "warn"; text: (ref?: string) => string }> = {
  accepted: { tone: "ok", text: (ref) => `Job ${ref ?? ""} accepted. The customer's details are now shown below.` },
  started: { tone: "ok", text: (ref) => `Job ${ref ?? ""} started. Mark it complete when you're done.` },
  completed: { tone: "ok", text: (ref) => `Job ${ref ?? ""} completed. Great work!` },
  taken: { tone: "warn", text: () => "Sorry, that request was just accepted by another technician or cancelled." },
  "accept-failed": { tone: "warn", text: () => "That request couldn't be accepted. It may no longer match your hours or areas." },
};

// Booking references look like VF-ABCD2345; anything else is ignored.
const REF = /^VF-[A-Z0-9]{4,12}$/;

export default function Notice({ notice, refCode }: { notice?: string; refCode?: string }) {
  const entry = notice ? NOTICES[notice] : undefined;
  if (!entry) return null;
  const ref = refCode && REF.test(refCode) ? refCode : undefined;
  const warn = entry.tone === "warn";

  return (
    <p
      role="status"
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
        warn ? "border-gold-300 bg-gold-50 text-marigold-900" : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {warn ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
      <span>{entry.text(ref).replace("  ", " ")}</span>
    </p>
  );
}

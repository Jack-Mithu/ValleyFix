"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ActionState } from "@/app/lib/action-state";

/**
 * A form wired to a Server Action that shows the action's success/error
 * message underneath. Works without JavaScript too (progressive enhancement).
 */
export function ActionForm({
  action,
  children,
  className = "",
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      {state && (
        <p
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {state.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          {state.message}
        </p>
      )}
    </form>
  );
}

const variants = {
  primary: "bg-oxford-900 text-white hover:bg-oxford-700",
  gold: "bg-gold-400 text-oxford-900 hover:bg-marigold-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "border border-slate-200 bg-white text-oxford-900 hover:bg-slate-50",
};

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

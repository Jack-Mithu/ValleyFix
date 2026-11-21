"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { changePasswordAction, type PasswordState } from "./actions";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-500 focus:ring-4 focus:ring-oxford-500/10";

function PasswordField({
  name,
  label,
  autoComplete,
  minLength,
  hint,
}: {
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          maxLength={72}
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-oxford-900"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-oxford-900 text-sm font-bold text-white transition hover:bg-oxford-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      Change password
    </button>
  );
}

export default function PasswordForm({ isAdmin }: { isAdmin: boolean }) {
  const [state, formAction] = useActionState<PasswordState, FormData>(changePasswordAction, null);
  const minLength = isAdmin ? 10 : 8;

  return (
    // Remount (and so clear) the form after a successful change.
    <form key={state?.ok ? "done" : "form"} action={formAction} className="space-y-5">
      <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" />
      <PasswordField
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        minLength={minLength}
        hint={`At least ${minLength} characters. A short phrase is easier to remember and harder to guess.`}
      />
      <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" minLength={minLength} />

      {state && (
        <p
          role="status"
          className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {state.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

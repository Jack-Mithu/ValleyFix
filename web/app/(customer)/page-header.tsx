import type { ReactNode } from "react";

export default function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-oxford-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-600 sm:text-base">{description}</p>}
      </div>
      {children}
    </div>
  );
}

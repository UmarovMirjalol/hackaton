import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[var(--radius-md)] border px-3.5 py-3 text-[13px] leading-5",
        tone === "info" && "border-[var(--signal)]/20 bg-[var(--signal-subtle)] text-[var(--signal)]",
        tone === "success" && "border-success/20 bg-[var(--success-subtle)] text-success",
        tone === "warning" && "border-warning/25 bg-[var(--warning-subtle)] text-warning",
        tone === "error" && "border-error/25 bg-[var(--error-subtle)] text-error",
        className,
      )}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      <div className={cn(title && "mt-1", "opacity-90")}>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  detail,
  action,
  className,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-dashed border-border bg-surface px-5 py-8 rounded-[var(--radius-lg)]",
        className,
      )}
    >
      <div>
        <p className="text-[15px] font-medium tracking-tight">{title}</p>
        {detail ? <p className="body mt-1.5 max-w-md text-secondary">{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8" aria-busy="true" aria-label={label}>
      <div className="skeleton h-3 w-3 rounded-full" />
      <p className="meta">{label}</p>
    </div>
  );
}

import { cn } from "@/lib/cn";

export function StatusBadge({
  status,
}: {
  status: "todo" | "started" | "done" | "good" | "mixed" | "watch";
}) {
  const map = {
    todo: "To do",
    started: "Started",
    done: "Done",
    good: "Fits",
    mixed: "Mixed",
    watch: "Watch",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.04em]",
        status === "done" || status === "good"
          ? "bg-[var(--success-subtle)] text-success"
          : status === "watch"
            ? "bg-[var(--error-subtle)] text-error"
            : status === "started" || status === "mixed"
              ? "bg-[var(--warning-subtle)] text-warning"
              : "bg-surface-muted text-tertiary",
      )}
    >
      {map[status]}
    </span>
  );
}

export function SourceCitation({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-[11px] text-tertiary underline decoration-border underline-offset-4 transition-colors hover:text-primary"
    >
      {label}
    </a>
  );
}

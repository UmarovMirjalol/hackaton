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
        "meta inline-flex items-center border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        status === "done" || status === "good"
          ? "border-success/30 text-success"
          : status === "watch"
            ? "border-error/30 text-error"
            : status === "started" || status === "mixed"
              ? "border-warning/30 text-warning"
              : "border-border text-tertiary",
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
      className="meta text-tertiary underline decoration-border underline-offset-4 hover:text-primary"
    >
      {label}
    </a>
  );
}

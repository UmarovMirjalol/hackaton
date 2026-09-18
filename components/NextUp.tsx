"use client";

import { Button } from "@/components/ui/Button";

export function NextUp({
  label,
  title,
  detail,
  href,
  cta,
  onClick,
  disabled,
}: {
  label?: string;
  title: string;
  detail?: string;
  href: string;
  cta: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="sticky bottom-16 z-10 border-t border-border bg-surface/95 backdrop-blur-md transition-[box-shadow,background-color] duration-[var(--duration)] md:bottom-0 hover:shadow-[0_-12px_40px_-28px_rgba(11,13,18,0.28)]">
      <div
        className="mx-auto flex flex-col gap-3 px-[var(--space-page)] py-3.5 sm:flex-row sm:items-center sm:justify-between"
        style={{ maxWidth: "var(--content)" }}
      >
        <div className="min-w-0">
          <p className="label">{label ?? "Next"}</p>
          <p className="truncate text-[14px] font-medium">{title}</p>
          {detail ? <p className="caption mt-0.5">{detail}</p> : null}
        </div>
        {onClick ? (
          <Button onClick={onClick} variant="signal" className="shrink-0" disabled={disabled}>
            {cta}
          </Button>
        ) : (
          <Button href={href} variant="signal" className="shrink-0">
            {cta}
          </Button>
        )}
      </div>
    </div>
  );
}

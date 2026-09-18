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
    <div className="sticky bottom-16 z-10 border-t border-border/80 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md backdrop-saturate-150 transition-[box-shadow] duration-[var(--duration)] md:bottom-0 hover:shadow-[0_-16px_48px_-30px_rgba(10,18,20,0.35)]">
      <div
        className="mx-auto flex flex-col gap-3 px-[var(--space-page)] py-3.5 sm:flex-row sm:items-center sm:justify-between"
        style={{ maxWidth: "var(--content)" }}
      >
        <div className="min-w-0 border-l-2 border-[var(--signal)] pl-3">
          <p className="label">{label ?? "Next"}</p>
          <p className="truncate font-[family-name:var(--font-display)] text-[1.05rem] tracking-tight">
            {title}
          </p>
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

"use client";

import { Button } from "@/components/ui/Button";

export function NextUp({
  label,
  title,
  detail,
  href,
  cta,
  onClick,
}: {
  label?: string;
  title: string;
  detail?: string;
  href: string;
  cta: string;
  onClick?: () => void;
}) {
  return (
    <div className="border-t border-border bg-surface-muted/40 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label">{label ?? "Next"}</p>
          <p className="text-[15px] font-medium">{title}</p>
          {detail ? <p className="caption mt-0.5">{detail}</p> : null}
        </div>
        {onClick ? (
          <Button onClick={onClick}>{cta}</Button>
        ) : (
          <Button href={href}>{cta}</Button>
        )}
      </div>
    </div>
  );
}

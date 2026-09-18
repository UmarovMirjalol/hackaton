"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import { campusImage } from "@/lib/media";
import type { RankedUniversity } from "@/lib/types";

export function UniversityCard({
  row,
  rank,
  selected,
  onToggleCompare,
  onViewMatch,
  fieldLabel,
  style,
  featured,
}: {
  row: RankedUniversity;
  rank: number;
  selected: boolean;
  onToggleCompare: () => void;
  onViewMatch: () => void;
  fieldLabel: string;
  style?: CSSProperties;
  featured?: boolean;
}) {
  const img = campusImage(row.university.id);
  const primaryFactors = row.factors.filter((f) =>
    ["aid", "research", "location"].includes(f.key),
  );

  return (
    <article
      className={cn(
        "group uni-card overflow-hidden rounded-[var(--radius-lg)] border bg-surface transition-[border-color,box-shadow] duration-200",
        featured ? "border-primary/20 shadow-[var(--shadow-md)]" : "border-border",
        "hover:border-primary/25 hover:shadow-[var(--shadow-md)]",
      )}
      style={style}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted sm:aspect-[2.2/1]">
        {img ? (
          <>
            <Image
              src={img.src}
              alt={img.caption}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={rank < 2}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <div className="min-w-0 text-white">
                <p className="font-mono text-[10px] tracking-[0.08em] text-white/70">
                  {String(rank).padStart(2, "0")} · {row.university.city}, {row.university.country}
                </p>
                <h2 className="mt-1 text-[20px] font-semibold tracking-tight sm:text-[22px]">
                  {row.university.name}
                </h2>
              </div>
              <span
                aria-hidden
                className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </div>
            <p className="absolute left-3 top-3 rounded-[var(--radius-sm)] bg-black/45 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-white/85 backdrop-blur-sm">
              Demo photo
            </p>
          </>
        ) : (
          <div className="flex h-full items-end p-4">
            <div>
              <p className="meta">
                {String(rank).padStart(2, "0")} · {row.university.city}
              </p>
              <h2 className="mt-1 text-[20px] font-semibold">{row.university.name}</h2>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="label">Why you’re seeing this</p>
            <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-secondary">{row.why}</p>
          </div>
          <div className="text-right">
            <p className="label">Fit index</p>
            <p className="font-mono text-[22px] font-medium tabular-nums transition-colors group-hover:text-accent">
              {row.fitIndex}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-0 border-t border-border sm:grid-cols-3">
          {primaryFactors.map((f) => (
            <div
              key={f.key}
              className="border-border py-3 sm:border-r sm:px-3 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
            >
              <div className="flex items-center gap-2 text-[11px] text-tertiary">
                {f.label}
                <StatusBadge status={f.tone} />
              </div>
              <p className="mt-1 text-[13px] font-medium leading-5">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <Button size="sm" onClick={onViewMatch}>
            View match
          </Button>
          <button
            type="button"
            onClick={onToggleCompare}
            className={cn(
              "small font-medium transition-colors",
              selected ? "text-accent" : "text-secondary hover:text-primary",
            )}
          >
            {selected ? "In comparison" : "Compare"}
          </button>
          <span className="meta ml-auto hidden sm:inline">
            {row.university.application} · {fieldLabel}
          </span>
        </div>

        {img ? (
          <p className="mt-3 text-[10.5px] leading-4 text-tertiary">
            {img.demoNote}{" "}
            <a
              href={img.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-border underline-offset-2 hover:text-primary"
            >
              Source
            </a>
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function CampusThumb({
  universityId,
  alt,
  className,
}: {
  universityId: string;
  alt: string;
  className?: string;
}) {
  const img = campusImage(universityId);
  if (!img) return <div className={cn("bg-surface-muted", className)} />;
  return (
    <div className={cn("relative overflow-hidden bg-surface-muted", className)}>
      <Image src={img.src} alt={alt} fill sizes="120px" className="object-cover" />
    </div>
  );
}

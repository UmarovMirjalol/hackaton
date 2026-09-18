"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
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

  return (
    <article
      className={cn(
        "group grid gap-5 border-b border-border pb-7 last:border-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6",
        featured && "pt-1",
      )}
      style={style}
    >
      <button
        type="button"
        onClick={onViewMatch}
        className="relative aspect-[5/4] overflow-hidden bg-surface-muted text-left sm:aspect-[4/5]"
      >
        {img ? (
          <Image
            src={img.src}
            alt={img.caption}
            fill
            sizes="140px"
            className="object-cover transition-[transform,filter] duration-500 ease-[var(--ease)] group-hover:scale-[1.04]"
            priority={rank < 2}
          />
        ) : (
          <div className="flex h-full items-end p-3">
            <span className="meta">{row.university.shortName}</span>
          </div>
        )}
        <span className="absolute left-2 top-2 font-mono text-[10px] text-white mix-blend-difference">
          {String(rank).padStart(2, "0")}
        </span>
      </button>

      <div className="min-w-0 flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight transition-colors group-hover:text-accent">
              {row.university.name}
            </h2>
            <p className="meta mt-1">
              {row.university.city} · {row.university.country}
            </p>
          </div>
          <div className="text-right">
            <p className="label">Fit</p>
            <p className="font-mono text-[18px] font-medium tabular-nums leading-none">
              {row.fitIndex}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="label">Why this matches you</p>
          <p className="mt-1.5 max-w-xl text-[14px] leading-[1.55] text-secondary">{row.why}</p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-3 text-[12px]">
          {row.factors.slice(0, 3).map((f) => (
            <li key={f.key} className="text-tertiary">
              <span className="text-primary">{f.label}</span>
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="font-medium text-primary">{f.value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" onClick={onViewMatch}>
            Inspect match
          </Button>
          <button
            type="button"
            onClick={onToggleCompare}
            aria-pressed={selected}
            className={cn(
              "text-[13px] font-medium transition-colors",
              selected ? "text-accent" : "text-secondary hover:text-primary",
            )}
          >
            {selected ? "Selected for compare" : "Add to compare"}
          </button>
          <span className="meta ml-auto hidden sm:inline">
            {row.university.application} · {fieldLabel}
          </span>
        </div>
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

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
        "group grid gap-5 sm:grid-cols-[168px_1fr] sm:gap-6",
        featured && "sm:-mx-2 sm:border-y sm:border-border sm:py-6 sm:px-2",
      )}
      style={style}
    >
      <button
        type="button"
        onClick={onViewMatch}
        className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-surface-muted text-left sm:aspect-square"
      >
        {img ? (
          <Image
            src={img.src}
            alt={img.caption}
            fill
            sizes="168px"
            className="object-cover transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
            priority={rank < 2}
          />
        ) : null}
        <span className="absolute left-2 top-2 font-mono text-[10px] text-white/90 mix-blend-difference">
          {String(rank).padStart(2, "0")}
        </span>
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight">{row.university.name}</h2>
            <p className="meta mt-0.5">
              {row.university.city} · {row.university.country}
            </p>
          </div>
          <p className="font-mono text-[13px] tabular-nums text-secondary">
            Fit {row.fitIndex}
          </p>
        </div>

        <p className="mt-3 max-w-xl text-[14px] leading-[1.55] text-secondary">{row.why}</p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-tertiary">
          {row.factors.slice(0, 3).map((f) => (
            <li key={f.key}>
              <span className="text-primary">{f.value}</span>
              <span className="ml-1">{f.label.toLowerCase()}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" onClick={onViewMatch}>
            Why this match
          </Button>
          <button
            type="button"
            onClick={onToggleCompare}
            className={cn(
              "text-[13px] font-medium underline-offset-4 hover:underline",
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

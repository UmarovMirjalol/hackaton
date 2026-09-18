"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { CampusMedia } from "@/components/CampusMedia";
import { cn } from "@/lib/cn";
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
  const u = row.university;

  return (
    <article
      className={cn(
        "uni-card group grid gap-5 border-b border-border pb-8 last:border-0",
        featured
          ? "sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-8 sm:pb-10"
          : "sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-7",
      )}
      style={style}
    >
      <button
        type="button"
        onClick={onViewMatch}
        className={cn(
          "relative overflow-hidden text-left outline-none focus-visible:shadow-[var(--shadow-focus)]",
          featured ? "aspect-[16/11] sm:aspect-[5/4]" : "aspect-[5/4] sm:aspect-[4/5]",
        )}
      >
        <CampusMedia
          universityId={u.id}
          countryId={u.countryId}
          shortName={u.shortName}
          alt={`${u.name} campus`}
          className="absolute inset-0"
          priority={rank < 2}
          sizes={featured ? "(max-width: 640px) 100vw, 420px" : "168px"}
          overlay
        />
        <span className="absolute left-2.5 top-2.5 z-[1] font-mono text-[10px] tracking-[0.12em] text-white">
          {String(rank).padStart(2, "0")}
        </span>
        {featured ? (
          <span className="absolute bottom-2.5 left-2.5 z-[1] text-[11px] font-medium tracking-wide text-white/90">
            Top route pick
          </span>
        ) : null}
      </button>

      <div className="min-w-0 flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-medium tracking-tight transition-colors duration-[var(--duration)] group-hover:text-[var(--signal)]">
              {u.name}
            </h2>
            <p className="meta mt-1">
              {u.city} · {u.country}
            </p>
          </div>
          <div className="text-right">
            <p className="label">Fit</p>
            <p className="font-mono text-[20px] font-medium tabular-nums leading-none tracking-tight">
              {row.fitIndex}
            </p>
          </div>
        </div>

        <div className="mt-4 border-l-2 border-[var(--signal)] pl-3.5 signal-rail">
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

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" onClick={onViewMatch}>
            Inspect match
          </Button>
          <button
            type="button"
            onClick={onToggleCompare}
            aria-pressed={selected}
            className={cn(
              "text-[13px] font-medium transition-colors duration-[var(--duration)]",
              selected ? "text-[var(--signal)]" : "text-secondary hover:text-primary",
            )}
          >
            {selected ? "Selected for compare" : "Add to compare"}
          </button>
          <span className="meta ml-auto hidden sm:inline">
            {u.application} · {fieldLabel}
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
  countryId,
  shortName,
}: {
  universityId: string;
  alt: string;
  className?: string;
  countryId?: string;
  shortName?: string;
}) {
  return (
    <CampusMedia
      universityId={universityId}
      countryId={countryId}
      shortName={shortName ?? universityId}
      alt={alt}
      className={className}
      sizes="120px"
    />
  );
}

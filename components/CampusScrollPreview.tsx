"use client";

import { useEffect, useState } from "react";
import { CampusMedia } from "@/components/CampusMedia";
import { cn } from "@/lib/cn";
import type { RankedUniversity } from "@/lib/types";

/**
 * Sticky campus stage — crossfades the active university photo
 * as recommendation cards enter the scroll viewport.
 */
export function CampusScrollPreview({
  rows,
  activeId,
  onSelect,
}: {
  rows: RankedUniversity[];
  activeId: string | null;
  onSelect?: (row: RankedUniversity) => void;
}) {
  const active = rows.find((r) => r.university.id === activeId) ?? rows[0] ?? null;
  const [displayId, setDisplayId] = useState<string | null>(active?.university.id ?? null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [wipeDir, setWipeDir] = useState<"down" | "up">("down");

  useEffect(() => {
    const next = active?.university.id ?? null;
    if (!next || next === displayId) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = rows.findIndex((r) => r.university.id === displayId);
    const to = rows.findIndex((r) => r.university.id === next);
    setWipeDir(to >= from ? "down" : "up");

    if (reduce) {
      setDisplayId(next);
      setLeavingId(null);
      return;
    }

    setLeavingId(displayId);
    setDisplayId(next);
    const t = window.setTimeout(() => setLeavingId(null), 900);
    return () => window.clearTimeout(t);
  }, [active?.university.id, displayId, rows]);

  if (!rows.length || !active) return null;

  const rank = Math.max(1, rows.findIndex((r) => r.university.id === active.university.id) + 1);

  return (
    <>
      {/* Mobile / tablet strip */}
      <div className="campus-scroll-strip" aria-hidden={false}>
        <div key={active.university.id} className="campus-scroll-strip-media">
          <CampusMedia
            universityId={active.university.id}
            countryId={active.university.countryId}
            shortName={active.university.shortName}
            alt={`${active.university.name} campus`}
            className="absolute inset-0"
            sizes="100vw"
            overlay
            priority
          />
          <div className="campus-scroll-strip-copy">
            <p className="font-mono text-[10px] tracking-[0.14em] text-white/75">
              {String(rank).padStart(2, "0")} · {active.university.city}
            </p>
            <p className="campus-scroll-strip-name">{active.university.shortName}</p>
          </div>
        </div>
      </div>

      <aside className="campus-scroll-preview" aria-hidden={false}>
        <div className={cn("campus-scroll-stage", `wipe-${wipeDir}`)}>
          {rows.map((row) => {
            const id = row.university.id;
            const isCurrent = id === displayId;
            const isLeaving = id === leavingId;
            if (!isCurrent && !isLeaving) return null;
            return (
              <div
                key={id}
                className={cn(
                  "campus-scroll-layer",
                  isCurrent && "is-current",
                  isLeaving && "is-leaving",
                )}
              >
                <CampusMedia
                  universityId={id}
                  countryId={row.university.countryId}
                  shortName={row.university.shortName}
                  alt={`${row.university.name} campus`}
                  className="absolute inset-0"
                  sizes="(max-width: 1100px) 0px, 42vw"
                  priority={isCurrent}
                  overlay
                />
              </div>
            );
          })}

          <div key={displayId ?? "empty"} className="campus-scroll-meta">
            <p className="campus-scroll-rank font-mono">
              {String(rank).padStart(2, "0")} / {String(rows.length).padStart(2, "0")}
            </p>
            <h2 className="campus-scroll-name">{active.university.name}</h2>
            <p className="campus-scroll-place">
              {active.university.city} · {active.university.country}
            </p>
            <p className="campus-scroll-fit">Fit {active.fitIndex}</p>
            {onSelect ? (
              <button type="button" className="campus-scroll-open" onClick={() => onSelect(active)}>
                Open details
              </button>
            ) : null}
          </div>
        </div>
        <p className="campus-scroll-hint caption">Scroll the list — campus preview follows</p>
      </aside>
    </>
  );
}

/** Observe which recommendation is most centered in the viewport. */
export function useActiveCampus(
  ids: string[],
  enabled: boolean,
): [string | null, (id: string) => void] {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (!enabled || ids.length === 0) {
      setActiveId(null);
      return;
    }
    setActiveId((prev) => (prev && ids.includes(prev) ? prev : ids[0]!));

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.campusId;
          if (!id) continue;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId: string | null = null;
        let best = 0;
        for (const id of ids) {
          const r = ratios.get(id) ?? 0;
          if (r > best) {
            best = r;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      {
        // Prefer the card sitting in the middle band of the viewport.
        root: null,
        rootMargin: "-28% 0px -42% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    for (const id of ids) {
      const el = document.querySelector(`[data-campus-id="${id}"]`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids.join("|"), enabled]);

  return [activeId, setActiveId];
}

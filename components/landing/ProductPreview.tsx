"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import {
  SAMPLE_COUNTRIES,
  SAMPLE_DIAGNOSIS,
  SAMPLE_FIELD,
  SAMPLE_MATCHES,
  SAMPLE_NEXT,
  SAMPLE_PROFILE,
  sampleCampus,
  type StageId,
} from "./sample";

export function ProductPreview({
  stage,
  className,
  compact = false,
}: {
  stage: StageId;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "landing-preview relative overflow-hidden border border-border bg-surface shadow-[var(--shadow-panel)]",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          <span className="text-[12px] font-medium tracking-tight">Route · sample</span>
        </div>
        <span className="meta">Not your results</span>
      </div>

      <div className={cn("relative", compact ? "min-h-[22rem]" : "min-h-[26rem] sm:min-h-[28rem]")}>
        <PreviewFrame active={stage === "profile"}>
          <ProfilePanel />
        </PreviewFrame>
        <PreviewFrame active={stage === "understand"}>
          <UnderstandPanel />
        </PreviewFrame>
        <PreviewFrame active={stage === "explore"}>
          <ExplorePanel />
        </PreviewFrame>
        <PreviewFrame active={stage === "decide"}>
          <DecidePanel />
        </PreviewFrame>
        <PreviewFrame active={stage === "act"}>
          <ActPanel />
        </PreviewFrame>
      </div>
    </div>
  );
}

function PreviewFrame({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "landing-preview-frame absolute inset-0 p-4 sm:p-5",
        active ? "is-active" : "is-idle",
      )}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function ProfilePanel() {
  const rows = [
    ["Name", `${SAMPLE_PROFILE.firstName} ${SAMPLE_PROFILE.lastName}`],
    ["Home", SAMPLE_PROFILE.homeCountry],
    ["Curriculum", SAMPLE_PROFILE.curriculum.toUpperCase()],
    ["GPA", SAMPLE_PROFILE.gpa],
    ["Field", SAMPLE_FIELD],
    ["Aid", "Full need"],
    ["Budget", `$${Number(SAMPLE_PROFILE.annualBudget).toLocaleString()}/yr`],
    ["Countries", SAMPLE_COUNTRIES],
  ];

  return (
    <div className="flex h-full flex-col">
      <p className="label">Profile</p>
      <h3 className="text-h2 mt-2 tracking-tight">Admissions dossier</h3>
      <p className="caption mt-1.5 max-w-sm">
        Sample of what Route reads before ranking — your own answers replace this after onboarding.
      </p>
      <dl className="mt-5 grid flex-1 gap-0 border-t border-border sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 pr-3 text-[13px]"
          >
            <dt className="caption shrink-0">{k}</dt>
            <dd className="truncate text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function UnderstandPanel() {
  const strengths = SAMPLE_DIAGNOSIS.strengths.slice(0, 3);
  const constraint = SAMPLE_DIAGNOSIS.constraints[0];

  return (
    <div className="flex h-full flex-col">
      <p className="label">Understand</p>
      <h3 className="text-h2 mt-2 tracking-tight">{SAMPLE_DIAGNOSIS.title}</h3>
      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-secondary">
        {SAMPLE_DIAGNOSIS.summary}
      </p>

      <div className="mt-5 space-y-3">
        <p className="label">Strong signals</p>
        {strengths.map((s) => (
          <div key={s.label} className="border-l-2 border-[var(--signal)] pl-3">
            <p className="text-[13px] font-medium">{s.label}</p>
            <p className="caption mt-0.5 line-clamp-1">{s.evidence}</p>
          </div>
        ))}
        {constraint ? (
          <div className="border-l-2 border-[var(--warning)] pl-3">
            <p className="label">Constraint</p>
            <p className="mt-0.5 text-[13px] font-medium">{constraint.label}</p>
            <p className="caption mt-0.5 line-clamp-2">{constraint.evidence}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExplorePanel() {
  const row = SAMPLE_MATCHES[0];
  if (!row) return null;
  const u = row.university;
  const img = sampleCampus(u.id);

  return (
    <div className="flex h-full flex-col">
      <p className="label">Explore · 01</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
        <div className="relative aspect-[5/4] overflow-hidden bg-surface-muted sm:aspect-[4/5]">
          {img ? (
            <Image
              src={img.src}
              alt={img.caption}
              fill
              className="object-cover landing-preview-img"
              sizes="140px"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-h2 tracking-tight">{u.name}</h3>
              <p className="meta mt-1">
                {u.city} · {u.country} · Fit {row.fitIndex}
              </p>
            </div>
            <StatusBadge status="good" />
          </div>
          <div className="mt-3 border-l-2 border-[var(--signal)] pl-3">
            <p className="label">Match reasons</p>
            <p className="mt-1 text-[13px] leading-5 text-secondary line-clamp-3">{row.why}</p>
          </div>
          <div className="mt-3 border-l-2 border-border pl-3">
            <p className="label">Why this fits you</p>
            <p className="mt-1 text-[12.5px] leading-5 text-secondary line-clamp-2">
              Full-aid CS route with research signal on file — ranked against your constraints, not a
              guessed admissions chance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecidePanel() {
  const a = SAMPLE_MATCHES[0];
  const b = SAMPLE_MATCHES[1];
  if (!a || !b) return null;

  const rows: [string, string, string][] = [
    ["Aid", a.university.aid.summary, b.university.aid.summary],
    ["English", a.university.english, b.university.english],
    [
      "Deadline",
      a.university.deadlines[0]
        ? `${a.university.deadlines[0].label}: ${a.university.deadlines[0].date}`
        : "—",
      b.university.deadlines[0]
        ? `${b.university.deadlines[0].label}: ${b.university.deadlines[0].date}`
        : "—",
    ],
  ];

  return (
    <div className="flex h-full flex-col">
      <p className="label">Decide</p>
      <h3 className="text-h2 mt-2 tracking-tight">Tradeoffs, side by side</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 border-b border-border pb-3">
        {[a, b].map((row) => {
          const img = sampleCampus(row.university.id);
          return (
            <div key={row.university.id} className="min-w-0">
              <div className="relative mb-2 aspect-[2/1] overflow-hidden bg-surface-muted">
                {img ? (
                  <Image
                    src={img.src}
                    alt={img.caption}
                    fill
                    className="object-cover landing-preview-img"
                    sizes="200px"
                  />
                ) : null}
              </div>
              <p className="truncate text-[13px] font-medium">{row.university.shortName}</p>
              <p className="meta">Fit {row.fitIndex}</p>
            </div>
          );
        })}
      </div>
      <dl className="mt-1 space-y-0">
        {rows.map(([label, left, right]) => (
          <div
            key={label}
            className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 border-b border-border py-2.5 text-[12px]"
          >
            <dt className="caption pt-0.5">{label}</dt>
            <dd className="leading-5 text-secondary line-clamp-2">{left}</dd>
            <dd className="leading-5 text-secondary line-clamp-2">{right}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ActPanel() {
  if (!SAMPLE_NEXT) return null;

  return (
    <div className="flex h-full flex-col">
      <p className="label">Act</p>
      <p className="meta mt-3">Current route · sample</p>
      <p className="mt-1 text-[13px] font-medium">
        {SAMPLE_FIELD} · Full aid · {SAMPLE_COUNTRIES}
      </p>

      <div className="mt-5 flex-1 border border-border bg-surface-tint p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="mt-1 w-0.5 shrink-0 bg-[var(--signal)]" aria-hidden />
          <div className="min-w-0">
            <p className="label">Next action</p>
            <h3 className="text-h1 mt-2 max-w-md tracking-tight">{SAMPLE_NEXT.title}</h3>
            <p className="mt-2 text-[13px] leading-5 text-secondary line-clamp-3">
              {SAMPLE_NEXT.reason}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <div>
                <p className="caption">Deadline</p>
                <p className="text-[13px] font-medium">{SAMPLE_NEXT.deadline}</p>
              </div>
              <div>
                <p className="caption">Effort</p>
                <p className="text-[13px] font-medium">{SAMPLE_NEXT.effort}</p>
              </div>
              <div>
                <p className="caption">Status</p>
                <StatusBadge status="todo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

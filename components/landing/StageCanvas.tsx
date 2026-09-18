"use client";

import Image from "next/image";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import {
  JOURNEY_STAGES,
  SAMPLE_COUNTRIES,
  SAMPLE_DIAGNOSIS,
  SAMPLE_FIELD,
  SAMPLE_MATCHES,
  SAMPLE_NEXT,
  SAMPLE_PROFILE,
  sampleCampus,
  type StageId,
} from "./sample";

/** Large stage canvases — no SaaS “browser chrome” card wrapper. */
export function StageCanvas({
  stage,
  className,
}: {
  stage: StageId;
  className?: string;
}) {
  return (
    <div className={cn("locus-canvas", className)} aria-live="polite">
      <div className="locus-canvas-stage" data-active={stage === "profile" ? "true" : "false"}>
        <ProfileStage />
      </div>
      <div className="locus-canvas-stage" data-active={stage === "understand" ? "true" : "false"}>
        <UnderstandStage />
      </div>
      <div className="locus-canvas-stage" data-active={stage === "explore" ? "true" : "false"}>
        <ExploreStage />
      </div>
      <div className="locus-canvas-stage" data-active={stage === "decide" ? "true" : "false"}>
        <DecideStage />
      </div>
      <div className="locus-canvas-stage" data-active={stage === "act" ? "true" : "false"}>
        <ActStage />
      </div>
    </div>
  );
}

function ProfileStage() {
  const rows = [
    ["Name", `${SAMPLE_PROFILE.firstName} ${SAMPLE_PROFILE.lastName}`],
    ["Home", SAMPLE_PROFILE.homeCountry],
    ["Curriculum", SAMPLE_PROFILE.curriculum.toUpperCase()],
    ["GPA", SAMPLE_PROFILE.gpa],
    ["SAT", `${SAMPLE_PROFILE.satMath} M · ${SAMPLE_PROFILE.satEbrw} ERW`],
    ["Field", SAMPLE_FIELD],
    ["Aid", "Full need"],
    ["Budget", `$${Number(SAMPLE_PROFILE.annualBudget).toLocaleString()}/yr`],
    ["Countries", SAMPLE_COUNTRIES],
  ];
  return (
    <div className="locus-stage-inner">
      <p className="label">01 · Profile</p>
      <h3 className="locus-stage-title">The dossier LOCUS reads</h3>
      <p className="locus-stage-lede">
        Sample from Amira — your answers replace this after onboarding.
      </p>
      <dl className="locus-dossier">
        {rows.map(([k, v]) => (
          <div key={k} className="locus-dossier-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function UnderstandStage() {
  return (
    <div className="locus-stage-inner">
      <p className="label">02 · Understand</p>
      <h3 className="locus-stage-title">{SAMPLE_DIAGNOSIS.title}</h3>
      <p className="locus-stage-lede">{SAMPLE_DIAGNOSIS.summary}</p>
      <div className="locus-signal-stack">
        <p className="label">Strong signals</p>
        {SAMPLE_DIAGNOSIS.strengths.slice(0, 3).map((s) => (
          <div key={s.label} className="locus-signal is-strong">
            <p className="locus-signal-name">{s.label}</p>
            <p className="caption">{s.evidence}</p>
          </div>
        ))}
        {SAMPLE_DIAGNOSIS.constraints[0] ? (
          <div className="locus-signal is-constraint">
            <p className="label">Constraint</p>
            <p className="locus-signal-name">{SAMPLE_DIAGNOSIS.constraints[0].label}</p>
            <p className="caption">{SAMPLE_DIAGNOSIS.constraints[0].evidence}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExploreStage() {
  const row = SAMPLE_MATCHES[0];
  const [open, setOpen] = useState(false);
  if (!row) return null;
  const img = sampleCampus(row.university.id);

  return (
    <div className="locus-stage-inner locus-explore">
      <p className="label">03 · Explore</p>
      <div className="locus-explore-grid">
        <div className="locus-explore-media">
          {img ? (
            <Image
              src={img.src}
              alt={img.caption}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 42vw"
              priority
            />
          ) : null}
          <span className="locus-explore-index">01</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="locus-stage-title">{row.university.name}</h3>
              <p className="meta mt-1">
                {row.university.city} · {row.university.country} · Fit {row.fitIndex}
              </p>
            </div>
            <StatusBadge status="good" />
          </div>
          <div className="locus-why-rail mt-5">
            <p className="label">Match reasons</p>
            <p className="mt-1.5 text-[14px] leading-6 text-secondary">{row.why}</p>
          </div>
          <button
            type="button"
            className="locus-why-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide why this fits" : "Reveal why this fits you"}
          </button>
          <div className={cn("locus-why-panel", open && "is-open")}>
            <div className="locus-why-panel-inner">
              <p className="label">Why this fits you</p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-secondary">
                Research signal and full-aid constraint put {row.university.shortName} on this
                route — ranked against your facts, not a guessed admissions chance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecideStage() {
  const a = SAMPLE_MATCHES[0];
  const b = SAMPLE_MATCHES[1];
  if (!a || !b) return null;
  return (
    <div className="locus-stage-inner">
      <p className="label">04 · Decide</p>
      <h3 className="locus-stage-title">Tradeoffs that matter</h3>
      <div className="locus-compare">
        {[a, b].map((row) => {
          const img = sampleCampus(row.university.id);
          return (
            <div key={row.university.id} className="locus-compare-col">
              <div className="locus-compare-media">
                {img ? (
                  <Image src={img.src} alt={img.caption} fill className="object-cover" sizes="280px" />
                ) : null}
              </div>
              <p className="mt-3 text-[15px] font-medium tracking-tight">{row.university.shortName}</p>
              <p className="meta">Fit {row.fitIndex}</p>
            </div>
          );
        })}
      </div>
      <dl className="locus-compare-rows">
        {[
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
        ].map(([label, left, right]) => (
          <div key={label} className="locus-compare-row">
            <dt>{label}</dt>
            <dd>{left}</dd>
            <dd>{right}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ActStage() {
  if (!SAMPLE_NEXT) return null;
  return (
    <div className="locus-stage-inner">
      <p className="label">05 · Act</p>
      <p className="meta mt-2">
        {SAMPLE_FIELD} · Full aid · {SAMPLE_COUNTRIES}
      </p>
      <div className="locus-next">
        <span className="locus-next-rail" aria-hidden />
        <div>
          <p className="label">Next action</p>
          <h3 className="locus-stage-title mt-2">{SAMPLE_NEXT.title}</h3>
          <p className="locus-stage-lede">{SAMPLE_NEXT.reason}</p>
          <div className="locus-next-meta">
            <div>
              <p className="caption">Deadline</p>
              <p className="text-[13px] font-medium">{SAMPLE_NEXT.deadline}</p>
            </div>
            <div>
              <p className="caption">Effort</p>
              <p className="text-[13px] font-medium">{SAMPLE_NEXT.effort}</p>
            </div>
            <StatusBadge status="todo" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StageCopy({ stage }: { stage: StageId }) {
  const s = JOURNEY_STAGES.find((x) => x.id === stage)!;
  return (
    <div>
      <p className="meta text-[var(--signal)]">{s.n}</p>
      <h3 className="mt-2 text-[1.35rem] font-medium tracking-tight sm:text-[1.5rem]">{s.label}</h3>
      <p className="mt-1 text-[15px] font-medium tracking-tight text-primary">{s.title}</p>
      <p className="mt-2 max-w-sm text-[14px] leading-6 text-secondary">{s.detail}</p>
    </div>
  );
}

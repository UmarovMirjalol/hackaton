"use client";

import Image from "next/image";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import {
  SAMPLE_DIAGNOSIS,
  SAMPLE_MATCHES,
  SAMPLE_NEXT,
  sampleCampus,
} from "./sample";

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="landing-section scroll-mt-20" aria-labelledby="get-heading">
      <div className="route-frame">
        <div className="max-w-2xl">
          <p className="label">What you get</p>
          <h2 id="get-heading" className="text-h1 mt-3 tracking-tight">
            An actionable route — not a search page.
          </h2>
          <p className="body mt-3 max-w-xl text-secondary">
            Diagnosis, ranked campuses with reasons, side-by-side tradeoffs, and a Next Action you
            can start this week.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <article className="landing-card panel p-5 lg:col-span-5">
            <p className="label">Diagnosis</p>
            <h3 className="text-h2 mt-2 tracking-tight">{SAMPLE_DIAGNOSIS.title}</h3>
            <p className="mt-2 text-[13px] leading-5 text-secondary line-clamp-3">
              {SAMPLE_DIAGNOSIS.summary}
            </p>
            <ul className="mt-4 space-y-2.5">
              {SAMPLE_DIAGNOSIS.strengths.slice(0, 2).map((s) => (
                <li key={s.label} className="border-l-2 border-[var(--signal)] pl-3">
                  <p className="text-[13px] font-medium">{s.label}</p>
                  <p className="caption mt-0.5">{s.evidence}</p>
                </li>
              ))}
            </ul>
          </article>

          <RecommendationReveal className="lg:col-span-7" />

          <CompareTeaser className="lg:col-span-6" />

          <article className="landing-card panel overflow-hidden lg:col-span-6">
            <div className="border-l-[3px] border-[var(--signal)] p-5">
              <p className="label">Next action</p>
              <h3 className="text-h1 mt-2 tracking-tight">{SAMPLE_NEXT?.title}</h3>
              <p className="mt-2 text-[13px] leading-5 text-secondary">{SAMPLE_NEXT?.reason}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <p className="caption">Deadline</p>
                  <p className="text-[13px] font-medium">{SAMPLE_NEXT?.deadline}</p>
                </div>
                <div>
                  <p className="caption">Effort</p>
                  <p className="text-[13px] font-medium">{SAMPLE_NEXT?.effort}</p>
                </div>
                <StatusBadge status="todo" />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function RecommendationReveal({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const row = SAMPLE_MATCHES[0];
  if (!row) return null;
  const img = sampleCampus(row.university.id);

  return (
    <article className={cn("landing-card panel overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group grid w-full gap-4 p-5 text-left sm:grid-cols-[8rem_minmax(0,1fr)]"
        aria-expanded={open}
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-surface-muted sm:aspect-[4/5]">
          {img ? (
            <Image
              src={img.src}
              alt={img.caption}
              fill
              className="object-cover transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.03]"
              sizes="160px"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="label">Recommendation</p>
              <h3 className="text-h2 mt-1 tracking-tight">{row.university.name}</h3>
              <p className="meta mt-1">
                {row.university.city} · Fit {row.fitIndex}
              </p>
            </div>
            <StatusBadge status="good" />
          </div>
          <div className="mt-3 border-l-2 border-[var(--signal)] pl-3">
            <p className="label">Match reasons</p>
            <p className="mt-1 text-[13px] leading-5 text-secondary line-clamp-3">{row.why}</p>
          </div>
          <p className="mt-3 text-[12px] font-medium text-[var(--signal)]">
            {open ? "Hide why this fits" : "Show why this fits you"}
          </p>
        </div>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-[var(--duration-slow)] ease-[var(--ease)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 pb-5 pt-4">
            <p className="label">Why this fits you</p>
            <p className="mt-1.5 text-[13.5px] leading-6 text-secondary">
              Sample explanation: your research signal and full-aid constraint are the facts that
              put {row.university.shortName} on this list — not a guessed admissions chance.
            </p>
            <ul className="mt-2 space-y-1">
              {["Financial aid", "Research access", "Academic fit"].map((r) => (
                <li key={r} className="caption leading-5">
                  · {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompareTeaser({ className }: { className?: string }) {
  const a = SAMPLE_MATCHES[0];
  const b = SAMPLE_MATCHES[1];
  if (!a || !b) return null;

  return (
    <article className={cn("landing-card panel p-5", className)}>
      <p className="label">Compare</p>
      <h3 className="text-h2 mt-2 tracking-tight">Meaningful differences only</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-border pb-4">
        {[a, b].map((row) => {
          const img = sampleCampus(row.university.id);
          return (
            <div key={row.university.id} className="landing-uni min-w-0">
              <div className="relative mb-2 aspect-[2/1] overflow-hidden bg-surface-muted">
                {img ? (
                  <Image
                    src={img.src}
                    alt={img.caption}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                ) : null}
              </div>
              <p className="truncate text-[13px] font-medium">{row.university.shortName}</p>
              <p className="meta">Fit {row.fitIndex}</p>
            </div>
          );
        })}
      </div>
      <dl className="mt-1">
        {[
          ["Aid", a.university.aid.summary, b.university.aid.summary],
          ["English", a.university.english, b.university.english],
        ].map(([label, left, right]) => (
          <div
            key={label}
            className="grid grid-cols-[3.5rem_1fr_1fr] gap-2 border-b border-border py-2.5 text-[12px] last:border-0"
          >
            <dt className="caption">{label}</dt>
            <dd className="leading-5 text-secondary line-clamp-2">{left}</dd>
            <dd className="leading-5 text-secondary line-clamp-2">{right}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

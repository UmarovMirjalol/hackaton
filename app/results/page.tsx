"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CampusMedia } from "@/components/CampusMedia";
import {
  CampusScrollPreview,
  useActiveCampus,
} from "@/components/CampusScrollPreview";
import { MatchDetail } from "@/components/MatchDetail";
import { NextUp } from "@/components/NextUp";
import { StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useRecommendationExplanations } from "@/lib/ai/use-recommendation-explanations";
import type { RecommendationExplanation } from "@/lib/ai/recommendation-explanation-shared";
import { IMAGE_DISCLAIMER } from "@/lib/media";
import { profileReady } from "@/lib/onboarding";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field, RankedUniversity } from "@/lib/types";
import { Alert, EmptyState } from "@/components/ui/States";
import { DEMO_DATA_NOTICE } from "@/lib/journey";
import { FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";
import "./results.css";

export default function ResultsPage() {
  const router = useRouter();
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds, hydrated } = useRoute();
  const { diagnosis, recs } = useDerived();
  const [detail, setDetail] = useState<RankedUniversity | null>(null);

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

  const { byUniversityId: explanations, contexts: explanationContexts, getExplanation } =
    useRecommendationExplanations(profile, visible, hydrated && profileReady(profile));

  useEffect(() => {
    if (hydrated && !profileReady(profile)) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  const goCompare = (extraId?: string) => {
    const ids = [...compareIds];
    if (extraId && !ids.includes(extraId) && ids.length < 3) {
      ids.push(extraId);
      flushSync(() => setCompareIds(ids));
    }
    if (ids.length < 2) return;
    flushSync(() => setCompareIds(ids));
    router.push("/compare");
  };

  const canCompare = compareIds.length >= 2;

  const campusIds = useMemo(() => visible.map((r) => r.university.id), [visible]);
  const [activeCampusId] = useActiveCampus(
    campusIds,
    hydrated && profileReady(profile) && visible.length > 0,
  );

  return (
    <AppShell
      eyebrow="Your admissions route"
      title={`${profile.firstName || "Your"} personalized options`}
      lede={diagnosis.summary}
      action={
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
          <Button variant="signal" onClick={() => goCompare()} disabled={!canCompare}>
            Compare selected
          </Button>
          {!canCompare ? (
            <p className="caption text-right">
              {compareIds.length === 0
                ? "Select 2 universities to compare"
                : "Select one more university to compare"}
            </p>
          ) : null}
        </div>
      }
      footer={
        <NextUp
          title={
            canCompare
              ? "Compare your shortlist"
              : compareIds.length === 1
                ? "Select one more campus to compare"
                : "Select two campuses, then compare"
          }
          detail={`${compareIds.length} selected · ${visible.length} recommendations`}
          href="/compare"
          cta="Open compare"
          onClick={() => goCompare()}
          disabled={!canCompare}
        />
      }
    >
      <section className="mb-12 grid gap-8 border-b border-border pb-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">Profile read</p>
          <h2 className="text-h1 mt-2">{diagnosis.title}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <SignalList
              title="Strengths"
              items={diagnosis.strengths.map((s) => ({ title: s.label, body: s.evidence }))}
              empty="Add GPA or scores to surface strengths."
            />
            <SignalList
              title="Gaps"
              items={[
                ...diagnosis.constraints.map((c) => ({ title: c.label, body: c.evidence })),
                ...diagnosis.gaps.map((g) => ({ title: "Gap", body: g })),
              ]}
              empty="No major gaps flagged."
              tone="watch"
            />
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="panel p-5">
            <p className="label">On file</p>
            <p className="mt-2 text-h2 tracking-tight">
              {profile.firstName} {profile.lastName}
            </p>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <Row k="Field" v={profile.field ? fieldLabels[profile.field] : "—"} />
              <Row k="Aid" v={profile.aidNeed || "—"} />
              <Row k="Countries" v={profile.countries.map((c) => countryLabels[c]).join(", ")} />
              <Row k="Budget" v={`$${Number(profile.annualBudget || 0).toLocaleString()}/yr`} />
              {profile.satStatus === "done" ? (
                <Row k="SAT" v={`${profile.satMath} / ${profile.satEbrw}`} />
              ) : (
                <Row k="SAT" v={profile.satStatus} />
              )}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button href="/onboarding" variant="secondary" size="sm">
                Edit profile
              </Button>
              <Button href="/roadmap" variant="ghost" size="sm">
                Jump to roadmap
              </Button>
            </div>
          </div>
        </aside>
      </section>

      <section className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="enter">
          <p className="label">Recommendations</p>
          <p className="mt-1 text-[14px] text-secondary">
            Change an input — the list reorders from your profile, not from a static list.
          </p>
        </div>
        <div className="results-filters flex flex-wrap gap-4 enter enter-delay-1">
          <ChipGroup
            label="Field"
            value={profile.field}
            onChange={(v) => setProfile({ field: v as Field })}
            options={[
              ["cs", "CS"],
              ["engineering", "Eng"],
              ["economics", "Econ"],
              ["biology", "Bio"],
              ["undecided", "Open"],
            ]}
          />
          <ChipGroup
            label="Aid"
            value={profile.aidNeed}
            onChange={(v) => setProfile({ aidNeed: v as AidNeed })}
            options={[
              ["full", "Full"],
              ["substantial", "Substantial"],
              ["some", "Some"],
              ["none", "Can pay"],
            ]}
          />
        </div>
      </section>

      <div className="results-chips mb-4 flex flex-wrap gap-1.5 enter enter-delay-2">
        {(Object.keys(countryLabels) as CountryId[]).map((id) => {
          const on = profile.countries.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                const next = on
                  ? profile.countries.filter((c) => c !== id)
                  : [...profile.countries, id];
                if (!next.length) return;
                setProfile({ countries: next });
              }}
              className={cn(
                "h-8 border px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors duration-[var(--duration)]",
                on
                  ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                  : "border-border text-secondary hover:border-border-strong hover:text-primary",
              )}
            >
              {countryLabels[id]}
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-[12px] text-secondary">
          Budget ${Number(profile.annualBudget || 0).toLocaleString()}
          <input
            type="range"
            min={0}
            max={70000}
            step={1000}
            value={Number(profile.annualBudget || 0)}
            onChange={(e) => setProfile({ annualBudget: e.target.value })}
            className="w-28"
          />
        </label>
      </div>

      <div className="results-stage">
        <CampusScrollPreview
          rows={visible}
          activeId={activeCampusId}
          onSelect={(row) => setDetail(row)}
        />

        <ul className="results-list space-y-0">
          {visible.map((row, i) => {
            const context = explanationContexts[i];
            const resolved = context
              ? getExplanation(row.university.id, context)
              : {
                  explanation: explanations[row.university.id]?.explanation ?? null,
                  pending: explanations[row.university.id]?.pending ?? false,
                };
            const isActive = activeCampusId === row.university.id;
            return (
              <li
                key={`${row.university.id}-${row.fitIndex}-${row.why.slice(0, 24)}`}
                className={cn("results-item", isActive && "is-active-campus")}
                data-campus-id={row.university.id}
                style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }}
              >
                <ResultCard
                  row={row}
                  rank={i + 1}
                  featured={i === 0}
                  active={isActive}
                  selected={compareIds.includes(row.university.id)}
                  onToggle={() => toggleCompare(row.university.id)}
                  onOpen={() => setDetail(row)}
                  explanation={resolved.explanation}
                  explanationPending={resolved.pending}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {!visible.length ? (
        <EmptyState
          className="mt-2"
          title="No campuses match your country filters"
          detail="Widen countries in your profile, or adjust field and aid filters above."
          action={
            <Button href="/onboarding" variant="secondary">
              Adjust profile
            </Button>
          }
        />
      ) : null}

      <Alert tone="info" className="mt-8" title="Demo catalog">
        {DEMO_DATA_NOTICE}
      </Alert>
      <p className="caption mt-3">{FIT_METHODOLOGY}</p>
      <p className="caption mt-1">{IMAGE_DISCLAIMER}</p>

      <MatchDetail
        row={detail}
        profile={profile}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        inCompare={detail ? compareIds.includes(detail.university.id) : false}
        onCompare={() => detail && toggleCompare(detail.university.id)}
        onOpenCompare={() => detail && goCompare(detail.university.id)}
      />
    </AppShell>
  );
}

function ResultCard({
  row,
  rank,
  featured,
  active,
  selected,
  onToggle,
  onOpen,
  explanation,
  explanationPending,
}: {
  row: RankedUniversity;
  rank: number;
  featured?: boolean;
  active?: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  explanation: RecommendationExplanation | null;
  explanationPending: boolean;
}) {
  const u = row.university;
  const nextDeadline = u.deadlines[0];

  return (
    <article
      className={cn(
        "result-card group grid gap-5 py-8",
        featured && "featured-card border-b-0 py-6 sm:py-7",
        !featured && "border-b border-border",
        active && "is-active",
        "result-card-split sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-7",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="result-card-thumb relative aspect-[4/5] overflow-hidden text-left outline-none focus-visible:shadow-[var(--shadow-focus)]"
      >
        <CampusMedia
          universityId={u.id}
          countryId={u.countryId}
          shortName={u.shortName}
          alt={`${u.name} campus`}
          className="absolute inset-0"
          priority={rank < 2}
          sizes="140px"
          overlay
        />
        <span className="absolute left-2.5 top-2.5 z-[1] font-mono text-[10px] tracking-[0.14em] text-white">
          {String(rank).padStart(2, "0")}
        </span>
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-h2 tracking-tight transition-colors duration-[var(--duration)] group-hover:text-[var(--signal)]">
              {u.name}
            </h3>
            <p className="meta mt-1">
              {u.city} · {u.country} · Fit {row.fitIndex}
            </p>
          </div>
          <StatusBadge status={row.factors.find((f) => f.key === "aid")?.tone ?? "mixed"} />
        </div>

        <div className="mt-4 border-l-2 border-[var(--signal)] pl-4 signal-rail">
          <p className="label">Match reasons</p>
          <p className="body mt-1.5 text-secondary">{row.why}</p>
        </div>

        <div
          className={cn(
            "mt-4 border-l-2 border-border pl-4 transition-opacity duration-[var(--duration)]",
            explanationPending && "opacity-80",
          )}
          aria-busy={explanationPending}
        >
          <p className="label">Why this fits you</p>
          {explanation ? (
            <>
              <p className="mt-1.5 text-[13.5px] leading-6 text-secondary">{explanation.whyItFits}</p>
              {explanation.keyReasons.length ? (
                <ul className="mt-2 space-y-1">
                  {explanation.keyReasons.map((reason) => (
                    <li key={reason} className="caption leading-5">
                      · {reason}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="meta mt-2">Preparing explanation…</p>
          )}
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="caption">Program signal</dt>
            <dd className="mt-0.5 text-[13px] font-medium">
              {row.factors.find((f) => f.key === "academic")?.value ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="caption">Aid</dt>
            <dd className="mt-0.5 text-[13px] font-medium leading-5">{u.aid.summary}</dd>
          </div>
          <div>
            <dt className="caption">Key requirement</dt>
            <dd className="mt-0.5 text-[13px] font-medium leading-5">{u.english}</dd>
          </div>
          <div>
            <dt className="caption">Next deadline</dt>
            <dd className="mt-0.5 text-[13px] font-medium">
              {nextDeadline ? `${nextDeadline.label}: ${nextDeadline.date}` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" onClick={onOpen}>
            Open details
          </Button>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "text-[13px] font-medium transition-colors duration-[var(--duration)]",
              selected ? "text-[var(--signal)]" : "text-secondary hover:text-primary",
            )}
          >
            {selected ? "Selected for compare" : "Add to compare"}
          </button>
          <span className="meta ml-auto">{u.application}</span>
        </div>
      </div>
    </article>
  );
}

function SignalList({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: { title: string; body: string }[];
  empty: string;
  tone?: "watch";
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <p className="text-h3">{title}</p>
        {tone ? <StatusBadge status="watch" /> : <StatusBadge status="good" />}
      </div>
      {items.length ? (
        <ul className="space-y-3">
          {items.slice(0, 3).map((item) => (
            <li key={item.title + item.body}>
              <p className="text-[13px] font-medium">{item.title}</p>
              <p className="text-[13px] text-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-secondary">{empty}</p>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <p className="caption mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "h-8 border px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors duration-[var(--duration)]",
              value === v
                ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                : "border-border bg-surface text-secondary hover:border-border-strong hover:text-primary",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-tertiary">{k}</dt>
      <dd className="text-right font-medium capitalize">{v}</dd>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MatchDetail } from "@/components/MatchDetail";
import { NextUp } from "@/components/NextUp";
import { StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { campusImage, IMAGE_DISCLAIMER } from "@/lib/media";
import { profileReady } from "@/lib/onboarding";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field, RankedUniversity } from "@/lib/types";
import { Alert, EmptyState } from "@/components/ui/States";
import { DEMO_DATA_NOTICE } from "@/lib/journey";
import { FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";

export default function ResultsPage() {
  const router = useRouter();
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds, hydrated } = useRoute();
  const { diagnosis, recs } = useDerived();
  const [detail, setDetail] = useState<RankedUniversity | null>(null);

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

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
          <div className="border border-border bg-surface p-5">
            <p className="label">On file</p>
            <p className="mt-2 text-[22px] font-medium tracking-tight">
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
        <div>
          <p className="label">Recommendations</p>
          <p className="mt-1 text-[14px] text-secondary">
            Change an input — the list reorders from your profile, not from a static list.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
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

      <div className="mb-4 flex flex-wrap gap-1.5">
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
                "h-8 border px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)]",
                on
                  ? "border-primary bg-primary text-white"
                  : "border-border text-secondary hover:text-primary",
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

      <ul className="space-y-0">
        {visible.map((row, i) => (
          <li key={`${row.university.id}-${row.fitIndex}`}>
            <ResultCard
              row={row}
              rank={i + 1}
              selected={compareIds.includes(row.university.id)}
              onToggle={() => toggleCompare(row.university.id)}
              onOpen={() => setDetail(row)}
            />
          </li>
        ))}
      </ul>

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
  selected,
  onToggle,
  onOpen,
}: {
  row: RankedUniversity;
  rank: number;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const img = campusImage(row.university.id);
  const u = row.university;
  const nextDeadline = u.deadlines[0];

  return (
    <article className="grid gap-5 border-b border-border py-8 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[4/5] overflow-hidden bg-surface-muted"
      >
        {img ? (
          <Image
            src={img.src}
            alt={img.caption}
            fill
            className="object-cover"
            sizes="160px"
            priority={rank < 2}
          />
        ) : null}
        <span className="absolute left-2 top-2 font-mono text-[10px] text-white mix-blend-difference">
          {String(rank).padStart(2, "0")}
        </span>
      </button>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-medium tracking-tight">{u.name}</h3>
            <p className="meta mt-1">
              {u.city} · {u.country} · Fit {row.fitIndex}
            </p>
          </div>
          <StatusBadge status={row.factors.find((f) => f.key === "aid")?.tone ?? "mixed"} />
        </div>

        <div className="mt-4 border-l-2 border-[var(--signal)] pl-4">
          <p className="label">Why this fits you</p>
          <p className="mt-1.5 text-[15px] leading-6 text-secondary">{row.why}</p>
        </div>

        <dl className="mt-5 grid gap-3 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-tertiary">Program signal</dt>
            <dd className="font-medium">
              {row.factors.find((f) => f.key === "academic")?.value ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-tertiary">Aid</dt>
            <dd className="font-medium">{u.aid.summary}</dd>
          </div>
          <div>
            <dt className="text-tertiary">Key requirement</dt>
            <dd className="font-medium">{u.english}</dd>
          </div>
          <div>
            <dt className="text-tertiary">Next deadline</dt>
            <dd className="font-medium">
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
              "text-[13px] font-medium",
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
              "h-8 border px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)]",
              value === v
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-secondary hover:text-primary",
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

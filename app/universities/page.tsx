"use client";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Choices";
import { cn } from "@/lib/cn";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field } from "@/lib/types";
import { CATALOG_NOTE, FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";
import { useMemo } from "react";

export default function UniversitiesPage() {
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds } = useRoute();
  const { recs } = useDerived();

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

  return (
    <AppShell
      eyebrow="03 · Universities"
      title="A shortlist with reasons."
      lede="Change the field, the aid constraint, or a country. The order and the paragraphs should move. Nothing here is an admissions probability."
      action={
        <div className="flex flex-wrap gap-2.5">
          <Button
            href="/compare"
            onClick={() => {
              if (compareIds.length < 2) {
                setCompareIds(visible.slice(0, 3).map((r) => r.university.id));
              }
            }}
          >
            Compare for me
          </Button>
          <Button href="/roadmap" variant="secondary">
            Skip to roadmap
          </Button>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-14">
            <p className="label mb-2.5">Adjust the facts</p>
            <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-secondary">Field</p>
                <Segmented<Field>
                  value={profile.field}
                  onChange={(v) => setProfile({ field: v })}
                  options={[
                    { value: "cs", label: "CS" },
                    { value: "engineering", label: "Eng" },
                    { value: "economics", label: "Econ" },
                    { value: "biology", label: "Bio" },
                    { value: "undecided", label: "Open" },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-secondary">Aid</p>
                <Segmented<AidNeed>
                  value={profile.aidNeed}
                  onChange={(v) => setProfile({ aidNeed: v })}
                  options={[
                    { value: "full", label: "Full" },
                    { value: "substantial", label: "Substantial" },
                    { value: "some", label: "Some" },
                    { value: "none", label: "Can pay" },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-secondary">Countries</p>
                <div className="flex flex-wrap gap-1.5">
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
                          if (next.length === 0) return;
                          setProfile({ countries: next });
                        }}
                        className={cn(
                          "rounded-[var(--radius-sm)] border px-2 py-1 text-[12px] font-medium transition-colors",
                          on
                            ? "border-accent bg-accent-subtle text-accent"
                            : "border-border bg-surface text-secondary hover:text-primary",
                        )}
                      >
                        {countryLabels[id]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] leading-5 text-tertiary">{FIT_METHODOLOGY}</p>
            <p className="mt-2 text-[11.5px] leading-5 text-tertiary">{CATALOG_NOTE}</p>
          </div>
        </aside>

        <section className="lg:col-span-8">
          {visible.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-5 py-10">
              <p className="text-[18px] font-semibold tracking-tight">No campus matches this country list.</p>
              <p className="mt-2 max-w-md text-[13.5px] text-secondary">
                Add a country back, or loosen aid. Route will not invent universities outside the catalog.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
              {visible.map((row, i) => (
                <li key={row.university.id} className="enter px-4 py-5 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="meta">
                        {String(i + 1).padStart(2, "0")} · {row.university.city},{" "}
                        {row.university.country}
                      </p>
                      <h2 className="mt-1 text-[20px] font-semibold tracking-tight">
                        {row.university.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="label">Fit index</p>
                      <p className="font-mono text-[20px] font-medium tabular-nums">{row.fitIndex}</p>
                    </div>
                  </div>

                  <p className="mt-3 max-w-2xl text-[14px] leading-6 text-secondary">{row.why}</p>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {row.factors.map((f) => (
                      <div key={f.key} className="min-w-0">
                        <dt className="flex items-center gap-2 text-[12px] text-tertiary">
                          {f.label}
                          <StatusBadge status={f.tone} />
                        </dt>
                        <dd className="mt-0.5 text-[13.5px] font-medium text-primary">{f.value}</dd>
                        <dd className="mt-0.5 text-[12px] leading-5 text-tertiary">{f.detail}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCompare(row.university.id)}
                      className={cn(
                        "text-[13px] font-medium underline decoration-border underline-offset-4",
                        compareIds.includes(row.university.id)
                          ? "text-accent"
                          : "text-secondary hover:text-primary",
                      )}
                    >
                      {compareIds.includes(row.university.id)
                        ? "In comparison"
                        : "Add to comparison (max 3)"}
                    </button>
                    <span className="meta">
                      {row.university.application} · {fieldLabels[profile.field]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

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
      eyebrow="03 — Universities"
      title="A shortlist with reasons."
      lede="Change the field, the aid constraint, or a country. The order and the paragraphs should move. Nothing here is an admissions probability."
      action={
        <div className="flex flex-wrap gap-3">
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
      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <p className="label mb-3">Adjust the facts</p>
            <div className="space-y-5 border border-border bg-surface p-4">
              <div>
                <p className="mb-2 text-[13px] font-medium">Field</p>
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
                <p className="mb-2 text-[13px] font-medium">Aid</p>
                <Segmented<AidNeed>
                  value={profile.aidNeed}
                  onChange={(v) => setProfile({ aidNeed: v })}
                  options={[
                    { value: "full", label: "Full aid" },
                    { value: "substantial", label: "Substantial" },
                    { value: "some", label: "Some" },
                    { value: "none", label: "Can pay" },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium">Countries</p>
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
                          "border px-2 py-1 text-[12px]",
                          on ? "border-primary bg-primary text-surface" : "border-border text-secondary",
                        )}
                      >
                        {countryLabels[id]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-5 text-tertiary">{FIT_METHODOLOGY}</p>
            <p className="mt-3 text-[12px] leading-5 text-tertiary">{CATALOG_NOTE}</p>
          </div>
        </aside>

        <section className="lg:col-span-8">
          {visible.length === 0 ? (
            <div className="border border-dashed border-border px-5 py-10">
              <p className="font-serif text-[22px]">No campus matches this country list.</p>
              <p className="mt-2 max-w-md text-[14px] text-secondary">
                Add a country back, or loosen aid. Route will not invent universities outside the catalog.
              </p>
            </div>
          ) : (
            <ul className="space-y-10">
              {visible.map((row, i) => (
                <li key={row.university.id} className="enter border-t border-border pt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="meta">
                        {String(i + 1).padStart(2, "0")} · {row.university.city}, {row.university.country}
                      </p>
                      <h2 className="mt-1 font-serif text-[28px] leading-tight">{row.university.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="label">Fit index</p>
                      <p className="font-mono text-[22px]">{row.fitIndex}</p>
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-secondary">{row.why}</p>

                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    {row.factors.map((f) => (
                      <div key={f.key}>
                        <dt className="flex items-center gap-2 text-[12px] text-tertiary">
                          {f.label}
                          <StatusBadge status={f.tone} />
                        </dt>
                        <dd className="mt-1 text-[14px] text-primary">{f.value}</dd>
                        <dd className="mt-0.5 text-[12px] leading-5 text-tertiary">{f.detail}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleCompare(row.university.id)}
                      className={cn(
                        "text-[13px] underline decoration-border underline-offset-4",
                        compareIds.includes(row.university.id) ? "text-accent" : "text-secondary hover:text-primary",
                      )}
                    >
                      {compareIds.includes(row.university.id) ? "In comparison" : "Add to comparison (max 3)"}
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

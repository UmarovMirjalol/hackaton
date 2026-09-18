"use client";

import { AppShell } from "@/components/AppShell";
import { UniversityCard } from "@/components/UniversityCard";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Choices";
import { cn } from "@/lib/cn";
import { IMAGE_DISCLAIMER } from "@/lib/media";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field, Profile } from "@/lib/types";
import { CATALOG_NOTE, FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";
import { useMemo, useState } from "react";

export default function UniversitiesPage() {
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds } = useRoute();
  const { recs } = useDerived();
  const [flash, setFlash] = useState(false);

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

  const filterSig = `${profile.field}|${profile.aidNeed}|${profile.countries.join(",")}`;

  const bumpFilters = (patch: Partial<Profile>) => {
    setProfile(patch);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 420);
  };

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
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="label">Adjust the facts</p>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition-opacity duration-300",
                  flash ? "opacity-100" : "opacity-0",
                )}
              >
                List updated
              </span>
            </div>
            <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5">
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-secondary">Field</p>
                <Segmented<Field>
                  value={profile.field}
                  onChange={(v) => bumpFilters({ field: v })}
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
                  onChange={(v) => bumpFilters({ aidNeed: v })}
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
                          bumpFilters({ countries: next });
                        }}
                        className={cn(
                          "rounded-[var(--radius-sm)] border px-2 py-1 text-[12px] font-medium transition-[background-color,border-color,color,transform] duration-150",
                          on
                            ? "scale-[1.02] border-accent bg-accent-subtle text-accent"
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
            <p className="mt-2 text-[11.5px] leading-5 text-tertiary">{IMAGE_DISCLAIMER}</p>
          </div>
        </aside>

        <section className="lg:col-span-8" key={filterSig}>
          {visible.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-5 py-10">
              <p className="text-[18px] font-semibold tracking-tight">
                No campus matches this country list.
              </p>
              <p className="mt-2 max-w-md text-[13.5px] text-secondary">
                Add a country back, or loosen aid. Route will not invent universities outside the
                catalog.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {visible.map((row, i) => (
                <li
                  key={`${filterSig}-${row.university.id}`}
                  className="stagger-in"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <UniversityCard
                    row={row}
                    rank={i + 1}
                    selected={compareIds.includes(row.university.id)}
                    onToggleCompare={() => toggleCompare(row.university.id)}
                    fieldLabel={fieldLabels[profile.field]}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

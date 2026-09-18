"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MatchDetail } from "@/components/MatchDetail";
import { NextUp } from "@/components/NextUp";
import { UniversityCard } from "@/components/UniversityCard";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Choices";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/cn";
import { IMAGE_DISCLAIMER } from "@/lib/media";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field, Profile, RankedUniversity } from "@/lib/types";
import { FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";
import { useMemo, type ReactNode } from "react";

export default function UniversitiesPage() {
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds } = useRoute();
  const { recs } = useDerived();
  const { toast } = useToast();
  const [flash, setFlash] = useState(false);
  const [detail, setDetail] = useState<RankedUniversity | null>(null);

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

  const filterSig = `${profile.field}|${profile.aidNeed}|${profile.countries.join(",")}`;

  const bumpFilters = (patch: Partial<Profile>) => {
    setProfile(patch);
    setFlash(true);
    toast("Shortlist updated");
    window.setTimeout(() => setFlash(false), 420);
  };

  const compareRemaining = Math.max(0, 2 - compareIds.length);

  return (
    <AppShell
      eyebrow="Matches"
      title="Curated for your constraints."
      lede="Each campus is here for a reason. Open a match to see tradeoffs — not a probability."
      action={
        <Button
          href="/compare"
          onClick={() => {
            if (compareIds.length < 2) {
              setCompareIds(visible.slice(0, 2).map((r) => r.university.id));
            }
          }}
        >
          Compare matches
        </Button>
      }
      footer={
        <NextUp
          title={compareIds.length >= 2 ? "Compare your shortlist" : "Add two campuses to compare"}
          detail={
            compareIds.length >= 2
              ? `${compareIds.length} selected`
              : `${compareRemaining} more to compare side by side`
          }
          href="/compare"
          cta="Compare"
        />
      }
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="mb-2 flex items-center justify-between">
              <p className="label">Adjust profile facts</p>
              <span
                className={cn(
                  "meta text-accent transition-opacity",
                  flash ? "opacity-100" : "opacity-0",
                )}
              >
                Updated
              </span>
            </div>
            <div className="space-y-4 border-y border-border py-4">
              <FilterBlock label="Field">
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
              </FilterBlock>
              <FilterBlock label="Aid">
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
              </FilterBlock>
              <FilterBlock label="Countries">
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
                          "rounded-[var(--radius-sm)] border px-2 py-1 text-[12px] font-medium transition-all duration-150",
                          on
                            ? "border-accent bg-accent-subtle text-accent"
                            : "border-border text-secondary hover:text-primary",
                        )}
                      >
                        {countryLabels[id]}
                      </button>
                    );
                  })}
                </div>
              </FilterBlock>
            </div>
            <p className="caption mt-3">{FIT_METHODOLOGY}</p>
            <p className="caption mt-1">{IMAGE_DISCLAIMER}</p>
          </div>
        </aside>

        <section className="lg:col-span-8" key={filterSig}>
          {visible.length === 0 ? (
            <p className="body text-secondary">No campuses match this country list.</p>
          ) : (
            <ul className="space-y-6">
              {visible.map((row, i) => (
                <li
                  key={`${filterSig}-${row.university.id}`}
                  className="stagger-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <UniversityCard
                    row={row}
                    rank={i + 1}
                    featured={i === 0}
                    selected={compareIds.includes(row.university.id)}
                    onToggleCompare={() => {
                      toggleCompare(row.university.id);
                      toast(
                        compareIds.includes(row.university.id)
                          ? "Removed from compare"
                          : "Added to compare",
                      );
                    }}
                    onViewMatch={() => setDetail(row)}
                    fieldLabel={fieldLabels[profile.field]}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <MatchDetail
        row={detail}
        profile={profile}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        inCompare={detail ? compareIds.includes(detail.university.id) : false}
        onCompare={() => {
          if (detail) {
            toggleCompare(detail.university.id);
            toast("Compare list updated");
          }
        }}
      />
    </AppShell>
  );
}

function FilterBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="small mb-2 font-medium text-secondary">{label}</p>
      {children}
    </div>
  );
}

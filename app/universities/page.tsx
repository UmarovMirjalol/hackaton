"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MatchDetail } from "@/components/MatchDetail";
import { NextUp } from "@/components/NextUp";
import { UniversityCard } from "@/components/UniversityCard";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Choices";
import { cn } from "@/lib/cn";
import { IMAGE_DISCLAIMER } from "@/lib/media";
import { useDerived, useRoute } from "@/lib/store";
import type { AidNeed, CountryId, Field, RankedUniversity } from "@/lib/types";
import { FIT_METHODOLOGY, countryLabels, fieldLabels } from "@/lib/universities";

export default function UniversitiesPage() {
  const router = useRouter();
  const { profile, setProfile, compareIds, toggleCompare, setCompareIds } = useRoute();
  const { recs } = useDerived();
  const [detail, setDetail] = useState<RankedUniversity | null>(null);

  const visible = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );

  const filterSig = `${profile.field}|${profile.aidNeed}|${profile.annualBudget}|${profile.countries.join(",")}|${profile.satMath}-${profile.satEbrw}`;

  const goCompare = (extraId?: string) => {
    const ids = [...compareIds];
    if (extraId && !ids.includes(extraId) && ids.length < 3) ids.push(extraId);
    if (ids.length < 2) {
      for (const row of visible) {
        if (ids.length >= 2) break;
        if (!ids.includes(row.university.id)) ids.push(row.university.id);
      }
    }
    flushSync(() => setCompareIds(ids));
    router.push("/compare");
  };

  return (
    <AppShell
      eyebrow="Matches"
      title="Curated for your constraints"
      lede="Each campus explains why it appears. Change field, aid, countries, or budget — the list reorders immediately."
      action={
        <Button onClick={() => goCompare()}>
          Compare {compareIds.length >= 2 ? `(${compareIds.length})` : "selected"}
        </Button>
      }
      footer={
        <NextUp
          title={
            compareIds.length >= 2
              ? "Compare your selections side by side"
              : "Select two campuses to compare"
          }
          detail={`${compareIds.length} selected · ${visible.length} in view`}
          href="/compare"
          cta="Compare"
          onClick={() => goCompare()}
        />
      }
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <aside className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
          <p className="label mb-4">Live inputs</p>
          <div className="space-y-6">
            <div>
              <p className="small mb-2 font-medium text-secondary">Field</p>
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
              <p className="small mb-2 font-medium text-secondary">Aid</p>
              <Segmented<AidNeed>
                value={profile.aidNeed}
                onChange={(v) => setProfile({ aidNeed: v })}
                options={[
                  { value: "full", label: "Full" },
                  { value: "substantial", label: "Sub." },
                  { value: "some", label: "Some" },
                  { value: "none", label: "Pay" },
                ]}
              />
            </div>
            <div>
              <p className="small mb-2 font-medium text-secondary">Countries</p>
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
                        "border px-2 py-1 text-[12px] font-medium transition-colors rounded-[var(--radius-sm)]",
                        on
                          ? "border-primary bg-primary text-white"
                          : "border-border text-secondary hover:border-border-strong hover:text-primary",
                      )}
                    >
                      {countryLabels[id]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="small mb-2 font-medium text-secondary">
                Budget ${Number(profile.annualBudget || 0).toLocaleString()}/yr
              </p>
              <input
                type="range"
                min={0}
                max={70000}
                step={1000}
                value={Number(profile.annualBudget || 0)}
                onChange={(e) => setProfile({ annualBudget: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <p className="caption mt-6 border-t border-border pt-4">{FIT_METHODOLOGY}</p>
          <p className="caption mt-2">{IMAGE_DISCLAIMER}</p>
        </aside>

        <section className="lg:col-span-9" key={filterSig}>
          {visible.length === 0 ? (
            <div className="border border-dashed border-border px-5 py-12 text-center">
              <p className="text-[16px] font-medium">No campuses in your country list</p>
              <p className="body mt-2 text-secondary">
                Enable at least one country in the filters to see matches.
              </p>
            </div>
          ) : (
            <ul className="space-y-0">
              {visible.map((row, i) => (
                <li key={`${row.university.id}-${row.fitIndex}`} className="py-7 first:pt-0">
                  <UniversityCard
                    row={row}
                    rank={i + 1}
                    featured={i === 0}
                    selected={compareIds.includes(row.university.id)}
                    onToggleCompare={() => toggleCompare(row.university.id)}
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
        onCompare={() => detail && toggleCompare(detail.university.id)}
        onOpenCompare={() => detail && goCompare(detail.university.id)}
      />
    </AppShell>
  );
}

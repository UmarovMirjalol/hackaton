"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { CampusThumb } from "@/components/UniversityCard";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { IMAGE_DISCLAIMER } from "@/lib/media";
import { useDerived, useRoute } from "@/lib/store";
import { CATALOG_NOTE, fieldLabels } from "@/lib/universities";

const ROWS = [
  { key: "aid", label: "Financial aid" },
  { key: "research", label: "Research" },
  { key: "academic", label: "Programme fit" },
  { key: "location", label: "Location" },
  { key: "selectivity", label: "Selectivity" },
] as const;

export default function ComparePage() {
  const { profile } = useRoute();
  const { compare } = useDerived();
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  return (
    <AppShell
      eyebrow="Compare"
      title="Tradeoffs, side by side"
      lede={`${compare.length} campuses against your ${profile.aidNeed === "full" ? "full-aid" : "aid"} need and ${fieldLabels[profile.field] ?? profile.field} direction. No overall winner — only differences that matter.`}
      action={
        compare.length >= 2 ? (
          <Button href="/roadmap" variant="signal">
            Build roadmap
          </Button>
        ) : undefined
      }
      footer={
        compare.length >= 2 ? (
          <NextUp
            title="Turn the shortlist into a monthly timeline"
            detail="Tasks skip exams you already completed."
            href="/roadmap"
            cta="Open roadmap"
          />
        ) : undefined
      }
    >
      {compare.length < 2 ? (
        <div className="border border-dashed border-border px-6 py-14 text-center">
          <p className="text-[18px] font-medium tracking-tight">Pick at least two campuses</p>
          <p className="body mt-2 text-secondary">
            Use “Add to compare” on the matches list, then return here.
          </p>
          <Button href="/results" className="mt-6" variant="signal">
            Back to results
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr>
                  <th className="w-[16%] border-b border-border pb-4 pr-4 text-[12px] font-medium text-tertiary">
                    Dimension
                  </th>
                  {compare.map((c) => (
                    <th
                      key={c.university.id}
                      className={cn(
                        "border-b border-border px-4 pb-4 align-bottom transition-colors duration-150",
                        hoverCol === c.university.id && "bg-accent-subtle/50",
                      )}
                      onMouseEnter={() => setHoverCol(c.university.id)}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      <CampusThumb
                        universityId={c.university.id}
                        alt={c.university.shortName}
                        className="mb-3 h-16 w-full"
                      />
                      <div className="text-[16px] font-medium tracking-tight">
                        {c.university.shortName}
                      </div>
                      <div className="meta mt-1">Fit {c.fitIndex}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "align-top transition-colors duration-150",
                      hoverRow === row.key && "bg-surface-muted/60",
                    )}
                    onMouseEnter={() => setHoverRow(row.key)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    <th className="border-b border-border py-4 pr-4 text-[12.5px] font-medium text-secondary">
                      {row.label}
                    </th>
                    {compare.map((c) => {
                      const f = c.factors.find((x) => x.key === row.key)!;
                      const lit = hoverCol === c.university.id || hoverRow === row.key;
                      return (
                        <td
                          key={c.university.id}
                          className={cn(
                            "border-b border-border px-4 py-4 transition-colors duration-150",
                            lit && "bg-accent-subtle/40",
                          )}
                          onMouseEnter={() => setHoverCol(c.university.id)}
                          onMouseLeave={() => setHoverCol(null)}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{f.value}</span>
                            <StatusBadge status={f.tone} />
                          </div>
                          <p className="mt-1.5 text-[12px] leading-5 text-tertiary">{f.detail}</p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="align-top">
                  <th className="border-b border-border py-4 pr-4 text-[12.5px] font-medium text-secondary">
                    Deadlines
                  </th>
                  {compare.map((c) => (
                    <td key={c.university.id} className="border-b border-border px-4 py-4">
                      <ul className="space-y-1.5">
                        {c.university.deadlines.map((d) => (
                          <li key={d.label} className="flex justify-between gap-3">
                            <span>{d.label}</span>
                            <span className="meta shrink-0">{d.date}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr className="align-top">
                  <th className="py-4 pr-4 text-[12.5px] font-medium text-secondary">Sources</th>
                  {compare.map((c) => (
                    <td key={c.university.id} className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {c.university.sources.map((s) => (
                          <SourceCitation key={s.url} {...s} />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-8 md:hidden">
            {compare.map((c) => (
              <article key={c.university.id} className="border-b border-border pb-8">
                <CampusThumb
                  universityId={c.university.id}
                  alt={c.university.name}
                  className="aspect-[2/1] w-full"
                />
                <h2 className="mt-4 text-[18px] font-medium tracking-tight">{c.university.name}</h2>
                <p className="meta mt-1">Fit {c.fitIndex}</p>
                <p className="mt-3 text-[14px] leading-6 text-secondary">{c.why}</p>
                <dl className="mt-5 space-y-3 border-t border-border pt-4">
                  {c.factors.map((f) => (
                    <div key={f.key}>
                      <dt className="flex items-center gap-2 text-[12px] text-tertiary">
                        {f.label}
                        <StatusBadge status={f.tone} />
                      </dt>
                      <dd className="mt-0.5 text-[14px] font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <p className="mt-6 caption">{CATALOG_NOTE}</p>
          <p className="mt-1 caption">{IMAGE_DISCLAIMER}</p>
        </>
      )}
    </AppShell>
  );
}

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
import { CATALOG_NOTE } from "@/lib/universities";
import { fieldLabels } from "@/lib/universities";

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
      title="Tradeoffs, side by side."
      lede={`${compare.length} campuses against your ${profile.aidNeed === "full" ? "full-aid" : "aid"} and ${fieldLabels[profile.field] ?? profile.field} direction. No overall winner — only differences that matter to you.`}
      action={<Button href="/roadmap">Build route</Button>}
      footer={
        <NextUp
          title="Turn the shortlist into a timeline"
          detail="Tasks skip exams you already completed."
          href="/roadmap"
          cta="Open route"
        />
      }
    >
      {compare.length < 2 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-5 py-10">
          <p className="text-[18px] font-semibold tracking-tight">Pick at least two campuses first.</p>
          <p className="mt-2 text-[13.5px] text-secondary">
            Use “Add to comparison” on the universities list.
          </p>
          <Button href="/universities" className="mt-5">
            Back to universities
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-border md:block">
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="w-[18%] border-b border-border px-4 py-3 text-[12px] font-medium text-tertiary">
                    For you
                  </th>
                  {compare.map((c) => (
                    <th
                      key={c.university.id}
                      className={cn(
                        "border-b border-border px-4 py-3 transition-colors duration-150",
                        hoverCol === c.university.id && "bg-accent-subtle/60",
                      )}
                      onMouseEnter={() => setHoverCol(c.university.id)}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      <div className="flex items-center gap-3">
                        <CampusThumb
                          universityId={c.university.id}
                          alt={c.university.shortName}
                          className="h-10 w-14 rounded-[var(--radius-sm)]"
                        />
                        <div>
                          <div className="text-[16px] font-semibold tracking-tight">
                            {c.university.shortName}
                          </div>
                          <div className="meta mt-0.5">Fit {c.fitIndex}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface">
                {ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "align-top transition-colors duration-150",
                      hoverRow === row.key && "bg-surface-muted/70",
                    )}
                    onMouseEnter={() => setHoverRow(row.key)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    <th className="border-b border-border px-4 py-3.5 text-[12.5px] font-medium text-secondary">
                      {row.label}
                    </th>
                    {compare.map((c) => {
                      const f = c.factors.find((x) => x.key === row.key)!;
                      const lit =
                        hoverCol === c.university.id || hoverRow === row.key;
                      return (
                        <td
                          key={c.university.id}
                          className={cn(
                            "border-b border-border px-4 py-3.5 transition-colors duration-150",
                            lit && "bg-accent-subtle/40",
                          )}
                          onMouseEnter={() => setHoverCol(c.university.id)}
                          onMouseLeave={() => setHoverCol(null)}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{f.value}</span>
                            <StatusBadge status={f.tone} />
                          </div>
                          <p
                            className={cn(
                              "mt-1 text-[12px] leading-5 text-tertiary transition-opacity duration-150",
                              lit ? "opacity-100" : "opacity-80",
                            )}
                          >
                            {f.detail}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="align-top">
                  <th className="border-b border-border px-4 py-3.5 text-[12.5px] font-medium text-secondary">
                    Deadlines
                  </th>
                  {compare.map((c) => (
                    <td key={c.university.id} className="border-b border-border px-4 py-3.5">
                      <ul className="space-y-1">
                        {c.university.deadlines.map((d) => (
                          <li key={d.label}>
                            <span className="text-primary">{d.label}</span>
                            <span className="meta ml-2">{d.date}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11.5px] text-tertiary">Demo catalog — verify on site.</p>
                    </td>
                  ))}
                </tr>
                <tr className="align-top">
                  <th className="px-4 py-3.5 text-[12.5px] font-medium text-secondary">Sources</th>
                  {compare.map((c) => (
                    <td key={c.university.id} className="px-4 py-3.5">
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

          <div className="space-y-6 md:hidden">
            {compare.map((c) => (
              <article
                key={c.university.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
              >
                <CampusThumb
                  universityId={c.university.id}
                  alt={c.university.name}
                  className="aspect-[2/1] w-full"
                />
                <div className="p-4">
                  <h2 className="text-[18px] font-semibold tracking-tight">{c.university.name}</h2>
                  <p className="meta mt-1">Fit {c.fitIndex}</p>
                  <p className="mt-3 text-[13.5px] leading-6 text-secondary">{c.why}</p>
                  <dl className="mt-4 space-y-3 border-t border-border pt-3">
                    {c.factors.map((f) => (
                      <div key={f.key}>
                        <dt className="flex items-center gap-2 text-[12px] text-tertiary">
                          {f.label}
                          <StatusBadge status={f.tone} />
                        </dt>
                        <dd className="text-[13.5px] font-medium">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-5 text-[11.5px] leading-5 text-tertiary">{CATALOG_NOTE}</p>
          <p className="mt-2 text-[11.5px] leading-5 text-tertiary">{IMAGE_DISCLAIMER}</p>
        </>
      )}
    </AppShell>
  );
}

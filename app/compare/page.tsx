"use client";

import { AppShell } from "@/components/AppShell";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { useDerived, useRoute } from "@/lib/store";
import { CATALOG_NOTE } from "@/lib/universities";

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

  return (
    <AppShell
      eyebrow="04 — Compare"
      title="How these options differ for you."
      lede={`Not a spreadsheet of rankings. The columns are read against ${profile.aidNeed === "full" ? "a full-aid constraint" : "your aid setting"} and ${profile.field === "cs" ? "computer science" : profile.field}.`}
      action={<Button href="/roadmap">Build the roadmap</Button>}
    >
      {compare.length < 2 ? (
        <div className="border border-dashed border-border px-5 py-10">
          <p className="font-serif text-[22px]">Pick at least two campuses first.</p>
          <p className="mt-2 text-[14px] text-secondary">
            Use “Add to comparison” on the universities list.
          </p>
          <Button href="/universities" className="mt-5">
            Back to universities
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden border border-border md:block">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="bg-surface">
                <tr>
                  <th className="w-[18%] border-b border-border px-4 py-3 font-medium text-tertiary">
                    For you
                  </th>
                  {compare.map((c) => (
                    <th key={c.university.id} className="border-b border-border px-4 py-3">
                      <div className="font-serif text-[22px] font-normal">{c.university.shortName}</div>
                      <div className="meta mt-1">Fit {c.fitIndex}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="align-top">
                    <th className="border-b border-border px-4 py-4 text-[13px] font-medium text-secondary">
                      {row.label}
                    </th>
                    {compare.map((c) => {
                      const f = c.factors.find((x) => x.key === row.key)!;
                      return (
                        <td key={c.university.id} className="border-b border-border px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span>{f.value}</span>
                            <StatusBadge status={f.tone} />
                          </div>
                          <p className="mt-1 text-[12px] leading-5 text-tertiary">{f.detail}</p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="align-top">
                  <th className="border-b border-border px-4 py-4 text-[13px] font-medium text-secondary">
                    Deadlines
                  </th>
                  {compare.map((c) => (
                    <td key={c.university.id} className="border-b border-border px-4 py-4">
                      <ul className="space-y-1">
                        {c.university.deadlines.map((d) => (
                          <li key={d.label}>
                            <span className="text-primary">{d.label}</span>
                            <span className="meta ml-2">{d.date}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[12px] text-tertiary">Demo catalog — verify on site.</p>
                    </td>
                  ))}
                </tr>
                <tr className="align-top">
                  <th className="px-4 py-4 text-[13px] font-medium text-secondary">Sources</th>
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
              <article key={c.university.id} className="border-t border-border pt-5">
                <h2 className="font-serif text-[26px]">{c.university.name}</h2>
                <p className="meta mt-1">Fit {c.fitIndex}</p>
                <p className="mt-3 text-[14px] leading-6 text-secondary">{c.why}</p>
                <dl className="mt-4 space-y-3">
                  {c.factors.map((f) => (
                    <div key={f.key}>
                      <dt className="text-[12px] text-tertiary">{f.label}</dt>
                      <dd className="text-[14px]">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <p className="mt-6 text-[12px] leading-5 text-tertiary">{CATALOG_NOTE}</p>
        </>
      )}
    </AppShell>
  );
}

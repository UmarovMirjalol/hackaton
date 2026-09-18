"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { useDerived, useRoute } from "@/lib/store";
import { CATALOG_NOTE } from "@/lib/universities";

export default function DiagnosisPage() {
  const { profile } = useRoute();
  const { diagnosis } = useDerived();
  const named = profile.firstName || "the student";

  return (
    <AppShell
      eyebrow="02 · Diagnosis"
      title={diagnosis.title}
      lede={diagnosis.summary}
      action={<Button href="/universities">See universities</Button>}
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="space-y-8 lg:col-span-8">
          <Block title="Strengths" empty="Not enough academic evidence yet — add a GPA or a test score.">
            {diagnosis.strengths.map((s) => (
              <Evidence key={s.label} k={s.label} v={s.evidence} />
            ))}
          </Block>
          <Block title="Constraints">
            {diagnosis.constraints.map((s) => (
              <Evidence key={s.label} k={s.label} v={s.evidence} />
            ))}
          </Block>
          <Block title="Goals">
            {diagnosis.goals.map((s) => (
              <Evidence key={s.label} k={s.label} v={s.evidence} />
            ))}
          </Block>
        </section>
        <aside className="lg:col-span-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="label">What Route still does not know</p>
            {diagnosis.gaps.length === 0 ? (
              <p className="mt-3 text-[13.5px] leading-6 text-secondary">
                Enough to rank a shortlist for {named}. Missing nuance still exists — this is not a
                counsellor.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {diagnosis.gaps.map((g) => (
                  <li key={g} className="text-[13px] leading-5 text-secondary">
                    {g}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[11.5px] leading-5 text-tertiary">{CATALOG_NOTE}</p>
            <Button href="/profile" variant="secondary" className="mt-4 w-full">
              Edit profile
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Block({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: string;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  return (
    <div>
      <h2 className="label mb-3">{title}</h2>
      <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface px-4">
        {items.length ? (
          children
        ) : (
          <p className="py-4 text-[13.5px] text-secondary">{empty}</p>
        )}
      </div>
    </div>
  );
}

function Evidence({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-12 sm:items-baseline sm:gap-4">
      <div className="text-[14px] font-medium sm:col-span-5">{k}</div>
      <p className="text-[13.5px] leading-6 text-secondary sm:col-span-7">{v}</p>
    </div>
  );
}

"use client";

import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badges";
import { useDerived, useRoute } from "@/lib/store";
import { CATALOG_NOTE } from "@/lib/universities";

export default function DiagnosisPage() {
  const { profile } = useRoute();
  const { diagnosis } = useDerived();
  const named = profile.firstName || "You";

  const strategy = [
    ...diagnosis.goals.map((g) => ({ text: g.evidence, tone: "good" as const })),
    ...(diagnosis.constraints.some((c) => c.label.toLowerCase().includes("aid"))
      ? [{ text: "Prioritize campuses where aid policy matches your contribution level.", tone: "mixed" as const }]
      : []),
    ...(diagnosis.gaps.length
      ? [{ text: diagnosis.gaps[0], tone: "watch" as const }]
      : [{ text: "Build a balanced list: reach, fit, and one funding-safe option.", tone: "mixed" as const }]),
  ].slice(0, 4);

  return (
    <AppShell
      eyebrow="Insights"
      title={diagnosis.title}
      lede={diagnosis.summary}
      action={<Button href="/universities">See matches</Button>}
      footer={
        <NextUp
          title="Review your matches"
          detail="Each recommendation includes why it fits your profile."
          href="/universities"
          cta="Open matches"
        />
      }
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <Section title="Strong fits" tone="good">
            {diagnosis.strengths.length ? (
              diagnosis.strengths.map((s) => <InsightRow key={s.label} title={s.label} body={s.evidence} />)
            ) : (
              <p className="body text-secondary">Add a GPA or test score to surface strengths.</p>
            )}
          </Section>

          <Section title="Watchouts" tone="watch">
            {diagnosis.constraints.length || diagnosis.gaps.length ? (
              <>
                {diagnosis.constraints.map((s) => (
                  <InsightRow key={s.label} title={s.label} body={s.evidence} />
                ))}
                {diagnosis.gaps.map((g) => (
                  <InsightRow key={g} title="Gap on file" body={g} />
                ))}
              </>
            ) : (
              <p className="body text-secondary">No major constraints flagged yet.</p>
            )}
          </Section>

          <Section title="Strategy" tone="mixed">
            {strategy.map((s, i) => (
              <div key={i} className="flex gap-3 border-b border-border py-3 last:border-0">
                <StatusBadge status={s.tone} />
                <p className="body flex-1 text-secondary">{s.text}</p>
              </div>
            ))}
          </Section>
        </div>

        <aside className="lg:col-span-4">
          <div className="border-l border-border pl-5 lg:sticky lg:top-28">
            <p className="label">Snapshot</p>
            <p className="text-h3 mt-2">{named}</p>
            <dl className="mt-4 space-y-2 small">
              <div className="flex justify-between gap-4">
                <dt className="text-tertiary">Field</dt>
                <dd className="font-medium">{profile.field}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tertiary">Aid</dt>
                <dd className="font-medium">{profile.aidNeed}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tertiary">Countries</dt>
                <dd className="font-medium">{profile.countries.length}</dd>
              </div>
            </dl>
            <p className="caption mt-4">{CATALOG_NOTE}</p>
            <Button href="/profile" variant="secondary" className="mt-4 w-full">
              Edit profile
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "good" | "watch" | "mixed";
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-h3">{title}</h2>
        <StatusBadge status={tone} />
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function InsightRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-5 sm:gap-4">
      <p className="small font-medium sm:col-span-2">{title}</p>
      <p className="body text-secondary sm:col-span-3">{body}</p>
    </div>
  );
}

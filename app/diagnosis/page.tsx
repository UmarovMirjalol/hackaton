"use client";

import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badges";
import { useDerived, useRoute } from "@/lib/store";
import { CATALOG_NOTE, countryLabels, fieldLabels } from "@/lib/universities";

export default function DiagnosisPage() {
  const { profile } = useRoute();
  const { diagnosis } = useDerived();
  const named = profile.firstName || "You";

  const strategy = [
    ...diagnosis.goals.map((g) => ({ text: g.evidence, tone: "good" as const })),
    ...(diagnosis.constraints.some((c) => c.label.toLowerCase().includes("aid"))
      ? [
          {
            text: "Prioritize campuses where aid policy matches your contribution level.",
            tone: "mixed" as const,
          },
        ]
      : []),
    ...(diagnosis.gaps.length
      ? [{ text: diagnosis.gaps[0], tone: "watch" as const }]
      : [
          {
            text: "Build a balanced list: reach, fit, and one funding-safe option.",
            tone: "mixed" as const,
          },
        ]),
  ].slice(0, 4);

  return (
    <AppShell
      eyebrow="Insights"
      title={diagnosis.title}
      lede={diagnosis.summary}
      action={<Button href="/universities">See matches</Button>}
      footer={
        <NextUp
          title="Review campuses ranked for your constraints"
          detail="Each recommendation includes why it fits your profile."
          href="/universities"
          cta="Open matches"
        />
      }
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <Section title="Strong signals" tone="good" empty="Add a GPA or test score to surface strengths.">
            {diagnosis.strengths.map((s) => (
              <InsightRow key={s.label} title={s.label} body={s.evidence} />
            ))}
          </Section>

          <Section
            title="Constraints & gaps"
            tone="watch"
            empty="No major constraints flagged yet."
          >
            {diagnosis.constraints.map((s) => (
              <InsightRow key={s.label} title={s.label} body={s.evidence} />
            ))}
            {diagnosis.gaps.map((g) => (
              <InsightRow key={g} title="Gap on file" body={g} />
            ))}
          </Section>

          <section>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-h2">Strategy</h2>
              <StatusBadge status="mixed" />
            </div>
            <ol className="space-y-0 border-t border-border">
              {strategy.map((s, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[2rem_1fr] gap-3 border-b border-border py-3.5"
                >
                  <span className="font-mono text-[11px] text-tertiary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[14px] leading-6 text-secondary">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="border border-border bg-surface p-5 lg:sticky lg:top-28">
            <p className="label">Candidate snapshot</p>
            <p className="mt-2 text-[22px] font-medium tracking-tight">{named}</p>
            <dl className="mt-5 space-y-3 text-[13px]">
              <Snap k="Field" v={fieldLabels[profile.field]} />
              <Snap k="Aid" v={profile.aidNeed} />
              <Snap
                k="Countries"
                v={profile.countries.map((c) => countryLabels[c]).join(", ")}
              />
              {profile.satStatus === "done" ? (
                <Snap k="SAT" v={`${profile.satMath} / ${profile.satEbrw}`} />
              ) : (
                <Snap k="SAT" v={profile.satStatus} />
              )}
              {profile.englishExam !== "none" ? (
                <Snap
                  k="English"
                  v={`${profile.englishExam.toUpperCase()} ${profile.englishScore || ""}`.trim()}
                />
              ) : null}
            </dl>
            <p className="caption mt-5">{CATALOG_NOTE}</p>
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
  empty,
}: {
  title: string;
  tone: "good" | "watch" | "mixed";
  children: React.ReactNode;
  empty: string;
}) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-h2">{title}</h2>
        <StatusBadge status={tone} />
      </div>
      {items.length ? (
        <div className="border-t border-border">{items}</div>
      ) : (
        <p className="body text-secondary">{empty}</p>
      )}
    </section>
  );
}

function InsightRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3.5 sm:grid-cols-5 sm:gap-6">
      <p className="text-[13px] font-medium sm:col-span-2">{title}</p>
      <p className="text-[14px] leading-6 text-secondary sm:col-span-3">{body}</p>
    </div>
  );
}

function Snap({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2.5 last:border-0">
      <dt className="text-tertiary">{k}</dt>
      <dd className="text-right font-medium capitalize">{v}</dd>
    </div>
  );
}

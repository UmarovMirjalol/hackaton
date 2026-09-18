"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, EmptyState, LoadingBlock } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { synthesize } from "@/lib/diagnosis";
import { JOURNEY, profileCompleteness } from "@/lib/journey";
import { recommended } from "@/lib/matching";
import { profileReady } from "@/lib/onboarding";
import { buildRoadmap } from "@/lib/roadmap";
import { useRoute } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";
import "./analyze.css";

/** Meaningful staging — mirrors real work already done in-memory, not fake AI. */
const STAGES = [
  {
    id: "collected",
    label: "Profile collected",
    detail: (p: Profile) =>
      `${p.firstName || "Applicant"} · Class of ${p.gradYear} · ${p.homeCountry || "Home unset"}`,
  },
  {
    id: "academic",
    label: "Academic profile understood",
    detail: (p: Profile) =>
      `${p.curriculum.toUpperCase()} · ${p.gpa ? `GPA ${p.gpa}` : "GPA pending"} · SAT ${p.satStatus}`,
  },
  {
    id: "preferences",
    label: "Preferences mapped",
    detail: (p: Profile) =>
      `${p.field ? fieldLabels[p.field] : "Field unset"} · ${p.countries.length} countries · aid ${p.aidNeed || "unset"}`,
  },
  {
    id: "prepared",
    label: "Route prepared",
    detail: () => "Diagnosis ready — recommendations ranked against your constraints",
  },
] as const;

function profileEvidence(p: Profile): string[] {
  const items: string[] = [];
  if (p.firstName.trim()) items.push(`${p.firstName} ${p.lastName}`.trim());
  if (p.homeCountry.trim()) items.push(`${p.homeCountry} · Class of ${p.gradYear}`);
  if (p.gpa.trim()) {
    items.push(
      p.gpaScale === "ib" ? `IB ${p.gpa}` : p.gpaScale === "100" ? `${p.gpa}/100` : `GPA ${p.gpa}`,
    );
  }
  items.push(`${p.curriculum.toUpperCase()} curriculum`);
  if (p.satStatus === "done" && p.satMath.trim()) {
    items.push(`SAT ${p.satMath}${p.satEbrw.trim() ? ` / ${p.satEbrw}` : ""}`);
  } else if (p.satStatus === "planned") {
    items.push("SAT planned");
  } else if (p.satStatus === "skip") {
    items.push("No SAT");
  }
  if (p.englishExam !== "none" && p.englishScore.trim()) {
    items.push(`${p.englishExam.toUpperCase()} ${p.englishScore}`);
  }
  if (p.field) items.push(fieldLabels[p.field]);
  if (p.interests.length) {
    items.push(p.interests.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(" · "));
  }
  if (p.countries.length) {
    items.push(p.countries.map((c) => countryLabels[c]).join(", "));
  }
  if (p.aidNeed) {
    items.push(
      Number(p.annualBudget || 0) > 0
        ? `Aid ${p.aidNeed} · $${Number(p.annualBudget).toLocaleString()}/yr`
        : `Aid · ${p.aidNeed}`,
    );
  }
  if (p.researchExperience) items.push("Research experience");
  return items;
}

function searchPriorities(p: Profile): string[] {
  const list: string[] = ["Strong academic fit"];
  if (p.aidNeed === "full" || p.aidNeed === "substantial") {
    list.push("Financial feasibility");
  } else if (p.aidNeed === "some") {
    list.push("Aid and net-cost balance");
  }
  if (p.field) list.push(`Your intended field · ${fieldLabels[p.field]}`);
  if (p.countries.length) list.push("Geographic preferences you selected");
  if (p.interests.includes("research")) list.push("Undergraduate research access");
  if (p.interests.includes("building")) list.push("Builder / maker pathways");
  return list.slice(0, 5);
}

export default function AnalyzePage() {
  const { profile, hydrated } = useRoute();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const timersRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);

  const diagnosis = useMemo(() => synthesize(profile), [profile]);
  const recs = useMemo(() => recommended(profile, 6), [profile]);
  const visibleRecs = useMemo(
    () => recs.filter((r) => profile.countries.includes(r.university.countryId)),
    [recs, profile.countries],
  );
  const roadmap = useMemo(
    () => buildRoadmap(profile, visibleRecs.slice(0, 3)),
    [profile, visibleRecs],
  );
  const evidence = useMemo(() => profileEvidence(profile), [profile]);
  const priorities = useMemo(() => searchPriorities(profile), [profile]);
  const pct = profileCompleteness(profile);
  const ready = profileReady(profile);

  useEffect(() => {
    cancelledRef.current = false;
    const clearAll = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((t) => t !== id);
        if (cancelledRef.current) return;
        fn();
      }, ms);
      timersRef.current.push(id);
    };

    if (!hydrated) return clearAll;

    if (!ready) {
      router.replace("/onboarding");
      return clearAll;
    }

    setPhase("loading");
    setStage(0);
    let i = 0;
    const tick = () => {
      if (cancelledRef.current) return;
      i += 1;
      if (i < STAGES.length) {
        setStage(i);
        schedule(tick, 480);
      } else {
        setPhase("ready");
      }
    };
    schedule(tick, 420);
    return () => {
      cancelledRef.current = true;
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    ready,
    profile.firstName,
    profile.field,
    profile.aidNeed,
    profile.countries.join(","),
    router,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingBlock label="Opening Understand…" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="route-frame py-16">
        <EmptyState
          title="Profile incomplete"
          detail="Finish the required profile chapters before Route can build a diagnosis."
          action={
            <Button href="/onboarding" variant="signal">
              Continue profile
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="az-shell">
      <header className="az-top">
        <div className="route-frame flex items-center justify-between gap-3 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight"
          >
            Route
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          </Link>
          <p className="meta tabular-nums">{pct}% profile · saved locally</p>
        </div>
        <div className="border-t border-border bg-surface/70">
          <div className="route-frame flex items-center gap-1 overflow-x-auto">
            <p className="label mr-3 shrink-0 py-2.5">Your route</p>
            {JOURNEY.map((step, i) => {
              const profileDone = i === 0;
              const current = step.id === "analyze";
              const upcoming = i > 1;
              return (
                <span
                  key={step.id}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-[12.5px] font-medium",
                    current && "text-primary",
                    profileDone && !current && "text-secondary",
                    upcoming && "text-tertiary",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      current && "bg-[var(--signal)] shadow-[0_0_0_3px_var(--signal-subtle)]",
                      profileDone && !current && "bg-[var(--signal)]",
                      upcoming && "border border-border-strong bg-transparent",
                    )}
                    aria-hidden
                  />
                  {profileDone && !current ? (
                    <span className="text-[var(--signal)]">✓ </span>
                  ) : null}
                  {step.label}
                  {current ? (
                    <span
                      className="absolute inset-x-3 -bottom-px h-0.5 bg-[var(--signal)]"
                      aria-hidden
                    />
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
      </header>

      <main className="route-frame az-main">
        {phase === "loading" ? (
          <section className="az-loading enter" aria-busy="true" aria-live="polite">
            <p className="label">Understand</p>
            <h1 className="text-h1 mt-2 max-w-xl">Understanding your profile</h1>
            <p className="body mt-3 max-w-lg text-secondary">
              Connecting your academics, interests, preferences, and constraints into a clear
              admissions picture — then preparing what to explore next.
            </p>

            <ol className="az-stages mt-10">
              {STAGES.map((s, i) => {
                const complete = i < stage;
                const active = i === stage;
                const shown = i <= stage;
                return (
                  <li
                    key={s.id}
                    className={cn("az-stage", shown ? "is-shown" : "", complete && "is-done", active && "is-active")}
                  >
                    <span className="az-stage-dot" aria-hidden />
                    <div>
                      <p className="az-stage-label">{s.label}</p>
                      {shown ? <p className="meta mt-1">{s.detail(profile)}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <div className="az-result enter">
            <div className="az-result-grid">
              <article className="az-narrative">
                <p className="label">Understand</p>
                <h1 className="text-h1 mt-2">{diagnosis.title}</h1>
                <p className="body mt-3 max-w-2xl text-secondary">{diagnosis.summary}</p>

                <section className="az-block">
                  <h2 className="label">Strong signals</h2>
                  {diagnosis.strengths.length ? (
                    <ul className="az-signal-list">
                      {diagnosis.strengths.map((s) => (
                        <li key={s.label} className="az-signal">
                          <p className="az-signal-title">{s.label}</p>
                          <p className="az-signal-evidence">
                            <span className="caption">Supported by</span>
                            <span>{s.evidence}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="body mt-3 text-secondary">
                      Add GPA, scores, or activities to surface stronger academic signals.
                    </p>
                  )}
                </section>

                <section className="az-block">
                  <h2 className="label">Constraints</h2>
                  <p className="caption mt-1">Not weaknesses — search rules your route should respect.</p>
                  {diagnosis.constraints.length || diagnosis.gaps.length ? (
                    <ul className="az-signal-list">
                      {diagnosis.constraints.map((c) => (
                        <li key={c.label} className="az-signal is-constraint">
                          <p className="az-signal-title">{c.label}</p>
                          <p className="az-signal-evidence">
                            <span className="caption">Why it matters</span>
                            <span>{c.evidence}</span>
                          </p>
                        </li>
                      ))}
                      {diagnosis.gaps.map((g) => (
                        <li key={g} className="az-signal is-constraint">
                          <p className="az-signal-title">Watch item</p>
                          <p className="az-signal-evidence">
                            <span className="caption">Why it matters</span>
                            <span>{g}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="body mt-3 text-secondary">No hard constraints flagged from this profile.</p>
                  )}
                </section>

                <section className="az-block">
                  <h2 className="label">What this means</h2>
                  <p className="body mt-2 max-w-xl text-secondary">
                    Your search will prioritize campuses that respect these facts — not a guessed
                    admissions chance.
                  </p>
                  <ol className="az-priorities">
                    {priorities.map((item, i) => (
                      <li key={item}>
                        <span className="meta">{String(i + 1).padStart(2, "0")}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                  {diagnosis.goals.length ? (
                    <div className="az-goals mt-5">
                      <p className="caption">Direction on file</p>
                      <ul className="mt-2 space-y-1.5">
                        {diagnosis.goals.map((g) => (
                          <li key={g.label} className="text-[14px]">
                            <span className="font-medium">{g.label}</span>
                            <span className="text-secondary"> — {g.evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              </article>

              <aside className="az-aside" aria-label="Profile evidence">
                <p className="label">Based on your profile</p>
                <ul className="az-evidence mt-3">
                  {evidence.map((item) => (
                    <li key={item}>
                      <span className="text-[var(--signal)]" aria-hidden>
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Alert tone="info" className="mt-6" title="How this works">
                  Route synthesizes your saved answers into this diagnosis, then ranks the demo
                  catalog against those constraints — not a black-box score.
                </Alert>
              </aside>

              <section className="az-next panel">
                <p className="label">Understand → Explore</p>
                <h2 className="text-h2 mt-2">Ready to explore</h2>
                <p className="body mt-2 max-w-lg text-secondary">
                  We’ll use this profile to surface universities that match your priorities — with
                  reasons you can inspect.
                </p>
                <p className="meta mt-3">
                  {visibleRecs.length} campuses ready · {roadmap.length} roadmap tasks prepared
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button href="/results" variant="signal" size="lg">
                    Explore recommendations
                  </Button>
                  <Button href="/onboarding" variant="secondary">
                    Edit profile
                  </Button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { synthesize } from "@/lib/diagnosis";
import { recommended } from "@/lib/matching";
import { profileReady } from "@/lib/onboarding";
import { buildRoadmap } from "@/lib/roadmap";
import { useRoute } from "@/lib/store";
import { fieldLabels } from "@/lib/universities";
import Link from "next/link";

const STAGES = [
  {
    id: "academic",
    label: "Understanding your academic profile",
    detail: (p: ReturnType<typeof useRoute>["profile"]) =>
      `${p.curriculum.toUpperCase()} · ${p.gpa || "GPA pending"} · Class of ${p.gradYear}`,
  },
  {
    id: "activities",
    label: "Reading activities & achievements",
    detail: (p: ReturnType<typeof useRoute>["profile"]) =>
      p.activities || p.achievements
        ? "Using the activities you provided"
        : "No activities listed — matching on academics and goals",
  },
  {
    id: "match",
    label: "Matching universities to your constraints",
    detail: (p: ReturnType<typeof useRoute>["profile"]) =>
      `${p.field ? fieldLabels[p.field] : "Field unset"} · ${p.aidNeed || "aid unset"} · ${p.countries.length} countries`,
  },
  {
    id: "requirements",
    label: "Checking application requirements",
    detail: (p: ReturnType<typeof useRoute>["profile"]) =>
      `SAT ${p.satStatus} · English ${p.englishExam === "none" ? "not on file" : p.englishExam.toUpperCase()}`,
  },
  {
    id: "roadmap",
    label: "Building your personal roadmap",
    detail: () => "Tasks skip exams you already completed",
  },
] as const;

export default function AnalyzePage() {
  const { profile, hydrated } = useRoute();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const timersRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);
  const navigatedRef = useRef(false);

  const diagnosis = useMemo(() => synthesize(profile), [profile]);
  const recs = useMemo(() => recommended(profile, 6), [profile]);
  const roadmap = useMemo(
    () =>
      buildRoadmap(
        profile,
        recs.filter((r) => profile.countries.includes(r.university.countryId)).slice(0, 3),
      ),
    [profile, recs],
  );

  useEffect(() => {
    cancelledRef.current = false;
    navigatedRef.current = false;

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

    if (!profileReady(profile)) {
      router.replace("/onboarding");
      return clearAll;
    }

    let i = 0;
    const tick = () => {
      if (cancelledRef.current) return;
      i += 1;
      if (i < STAGES.length) {
        setStage(i);
        schedule(tick, 520);
      } else {
        setDone(true);
        schedule(() => {
          if (cancelledRef.current || navigatedRef.current) return;
          navigatedRef.current = true;
          router.push("/results");
        }, 480);
      }
    };

    schedule(tick, 520);

    return () => {
      cancelledRef.current = true;
      clearAll();
    };
    // Intentionally omit `profile` object identity churn — only re-run when ready/hydrated flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile.firstName, profile.field, profile.aidNeed, profile.countries.join(","), router]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface/80 px-[var(--space-page)] py-3 backdrop-blur-md">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: "40rem" }}>
          <Link href="/" className="text-[15px] font-semibold">
            Route
          </Link>
          <span className="meta">Analyzing profile</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-[var(--space-page)] py-14 sm:py-20">
        <p className="label">Profile → analysis</p>
        <h1 className="text-h1 mt-2">Building your admissions route</h1>
        <p className="body mt-3 text-secondary">
          Route runs a deterministic match on your saved profile — not a black-box score, and not a
          fake wait.
        </p>

        <ol className="mt-10 space-y-0 border-t border-border">
          {STAGES.map((s, i) => {
            const active = i === stage && !done;
            const complete = i < stage || done;
            const shown = i <= stage;
            return (
              <li
                key={s.id}
                className={cn(
                  "grid grid-cols-[1.5rem_1fr] gap-3 border-b border-border py-4 transition-opacity duration-300",
                  shown ? "opacity-100" : "opacity-30",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 rounded-full",
                    complete
                      ? "bg-[var(--signal)]"
                      : active
                        ? "bg-primary animate-pulse"
                        : "bg-border-strong",
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-[14px] font-medium",
                      active || complete ? "text-primary" : "text-tertiary",
                    )}
                  >
                    {s.label}
                  </p>
                  {shown ? <p className="meta mt-1">{s.detail(profile)}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>

        {stage >= 2 ? (
          <div className="enter mt-8 border border-border bg-surface p-4">
            <p className="label">Live output</p>
            <p className="mt-2 text-[15px] font-medium">{diagnosis.title}</p>
            <p className="caption mt-1">
              {recs.length} campuses ranked · {roadmap.length} roadmap tasks prepared
            </p>
          </div>
        ) : null}

        {done ? <p className="meta mt-6">Opening your results…</p> : null}
      </main>
    </div>
  );
}

"use client";

import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { CampusThumb } from "@/components/UniversityCard";
import { cn } from "@/lib/cn";
import { useDerived, useRoute } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";

const PHASES = [
  { id: "now", label: "Now", months: ["SEPTEMBER"] },
  { id: "prep", label: "Prepare", months: ["OCTOBER"] },
  { id: "essays", label: "Essays & early", months: ["NOVEMBER"] },
  { id: "submit", label: "Submit", months: ["DECEMBER", "JANUARY"] },
  { id: "later", label: "Later", months: ["MARCH"] },
] as const;

export default function RoadmapPage() {
  const { taskStatus, setTaskStatus, profile } = useRoute();
  const { roadmap, next, roadmapPicks } = useDerived();
  const doneCount = roadmap.filter((t) => taskStatus[t.id] === "done").length;
  const progress = roadmap.length ? Math.round((doneCount / roadmap.length) * 100) : 0;

  return (
    <AppShell
      eyebrow="Personal roadmap"
      title="Your application route"
      lede={
        profile.satStatus === "done" || profile.englishExam !== "none"
          ? "Generated from your shortlist and profile. Completed exams are already removed from the path."
          : "A monthly path from your profile and recommendations — every task is actionable."
      }
      footer={
        next ? (
          <NextUp
            title={next.title}
            detail={`${doneCount}/${roadmap.length} complete · ${progress}%`}
            href="/roadmap"
            cta="Focus next"
            onClick={() =>
              document.getElementById("next")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : roadmap.length > 0 ? (
          <NextUp
            title="All roadmap tasks are complete"
            detail={`${doneCount}/${roadmap.length} complete · ${progress}%`}
            href="/results"
            cta="Back to results"
          />
        ) : undefined
      }
    >
      {roadmapPicks.length > 0 ? (
        <section className="mb-10 border-b border-border pb-8">
          <div className="mb-3 flex items-end justify-between">
            <p className="label">Shortlist driving this route</p>
            <p className="meta">{progress}% complete</p>
          </div>
          <div className="h-0.5 bg-surface-muted">
            <div
              className="h-full bg-[var(--signal)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
            {roadmapPicks.slice(0, 3).map((c) => (
              <div
                key={c.university.id}
                className="flex min-w-[11.5rem] shrink-0 gap-3 sm:min-w-[13rem]"
              >
                <CampusThumb
                  universityId={c.university.id}
                  alt={c.university.shortName}
                  className="h-12 w-16 shrink-0"
                />
                <div className="min-w-0 self-center">
                  <p className="text-[13px] font-medium leading-snug break-words">
                    {c.university.shortName}
                  </p>
                  <p className="meta mt-0.5 leading-snug break-words">
                    {c.university.city} · Fit {c.fitIndex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Visual phase spine */}
      <div className="mb-10 flex gap-2 overflow-x-auto pb-1">
        {PHASES.map((phase, i) => {
          const tasks = roadmap.filter((t) => (phase.months as readonly string[]).includes(t.month));
          const phaseDone =
            tasks.length > 0 && tasks.every((t) => taskStatus[t.id] === "done");
          const phaseActive = tasks.some((t) => (taskStatus[t.id] ?? "todo") !== "done");
          if (!tasks.length) return null;
          return (
            <div key={phase.id} className="flex items-center gap-2">
              {i > 0 ? <span className="text-tertiary">→</span> : null}
              <a
                href={`#phase-${phase.id}`}
                className={cn(
                  "whitespace-nowrap border px-3 py-1.5 text-[12px] font-medium rounded-[var(--radius-sm)]",
                  phaseDone
                    ? "border-[var(--signal)] bg-[var(--signal-subtle)] text-[var(--signal)]"
                    : phaseActive
                      ? "border-primary bg-primary text-white"
                      : "border-border text-secondary",
                )}
              >
                {phase.label}
              </a>
            </div>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {roadmap.length === 0 ? (
            <div className="border border-dashed border-border px-5 py-12 text-center">
              <p className="text-[16px] font-medium">No tasks yet</p>
              <p className="body mt-2 text-secondary">Complete analysis to generate a route.</p>
              <Button href="/results" className="mt-5" variant="signal">
                Open results
              </Button>
            </div>
          ) : (
            PHASES.map((phase) => {
              const tasks = roadmap.filter((t) =>
                (phase.months as readonly string[]).includes(t.month),
              );
              if (!tasks.length) return null;
              return (
                <div key={phase.id} id={`phase-${phase.id}`} className="mb-12">
                  <h2 className="label mb-5 flex items-center gap-3">
                    <span>{phase.label}</span>
                    <span className="h-px flex-1 bg-border" />
                    <span className="meta normal-case tracking-normal">
                      {tasks.filter((t) => taskStatus[t.id] === "done").length}/{tasks.length}
                    </span>
                  </h2>
                  <ul>
                    {tasks.map((task) => {
                      const status = taskStatus[task.id] ?? "todo";
                      return (
                        <li
                          key={task.id}
                          className={cn(
                            "border-b border-border py-5 transition-opacity",
                            status === "done" && "opacity-45",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-medium">{task.title}</h3>
                            <StatusBadge status={status} />
                          </div>
                          <p className="body mt-1.5 max-w-xl text-secondary">{task.reason}</p>
                          <p className="meta mt-2">
                            {task.deadline} · {task.effort}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <Button
                              size="sm"
                              variant={status === "todo" ? "signal" : "secondary"}
                              onClick={() => setTaskStatus(task.id, nextStatus(status))}
                            >
                              {status === "todo"
                                ? "Mark started"
                                : status === "started"
                                  ? "Mark done"
                                  : "Reopen"}
                            </Button>
                            {task.source ? <SourceCitation {...task.source} /> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </section>

        <aside className="lg:col-span-4" id="next">
          <div className="border-l-2 border-[var(--signal)] pl-5 lg:sticky lg:top-28">
            <p className="label">Next action</p>
            {next ? (
              <>
                <h2 className="text-h1 mt-2">{next.title}</h2>
                <p className="body mt-3 text-secondary">{next.reason}</p>
                <dl className="mt-5 text-[13px]">
                  <div className="flex justify-between border-t border-border py-2.5">
                    <dt className="text-tertiary">Deadline</dt>
                    <dd className="font-medium">{next.deadline}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border py-2.5">
                    <dt className="text-tertiary">Effort</dt>
                    <dd className="font-medium">{next.effort}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-5 w-full"
                  variant="signal"
                  onClick={() =>
                    setTaskStatus(next.id, nextStatus(taskStatus[next.id] ?? "todo"))
                  }
                >
                  {(taskStatus[next.id] ?? "todo") === "todo"
                    ? "Mark as started"
                    : (taskStatus[next.id] ?? "todo") === "started"
                      ? "Mark done"
                      : "Reopen"}
                </Button>
              </>
            ) : roadmap.length > 0 ? (
              <>
                <h2 className="text-h1 mt-2">Route complete</h2>
                <p className="body mt-3 text-secondary">
                  Every task on this roadmap is marked done. There are no remaining actions in the
                  current plan.
                </p>
                <p className="meta mt-4">
                  {doneCount}/{roadmap.length} tasks complete
                </p>
              </>
            ) : (
              <p className="body mt-3 text-secondary">No tasks yet.</p>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function nextStatus(s: TaskStatus): TaskStatus {
  if (s === "todo") return "started";
  if (s === "started") return "done";
  return "todo";
}

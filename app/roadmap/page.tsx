"use client";

import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { CampusThumb } from "@/components/UniversityCard";
import { cn } from "@/lib/cn";
import { useDerived, useRoute } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";

export default function RoadmapPage() {
  const { taskStatus, setTaskStatus, profile } = useRoute();
  const { roadmap, next, roadmapPicks } = useDerived();
  const months = [...new Set(roadmap.map((t) => t.month))];
  const doneCount = roadmap.filter((t) => taskStatus[t.id] === "done").length;
  const progress = roadmap.length ? Math.round((doneCount / roadmap.length) * 100) : 0;

  return (
    <AppShell
      eyebrow="Route"
      title="Your admissions route"
      lede={
        profile.englishExam !== "none"
          ? `Exams on file: ${profile.englishExam.toUpperCase()}${profile.englishScore ? ` ${profile.englishScore}` : ""}${profile.satStatus === "done" ? " · SAT scored" : ""}. Tasks skip work already done.`
          : "Generated from your shortlist and profile — not a generic senior-year calendar."
      }
      footer={
        next ? (
          <NextUp
            title={next.title}
            detail={`${doneCount}/${roadmap.length} tasks · ${progress}%`}
            href="/roadmap"
            cta="Focus next task"
            onClick={() =>
              document.getElementById("next")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : undefined
      }
    >
      {roadmapPicks.length > 0 ? (
        <section aria-label="Shortlist for this route" className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <p className="label">This route is built for</p>
            <p className="meta">{progress}% complete</p>
          </div>
          <div className="h-0.5 overflow-hidden bg-surface-muted">
            <div
              className="h-full bg-accent transition-[width] duration-300 ease-[var(--ease)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
            {roadmapPicks.slice(0, 3).map((c) => (
              <div key={c.university.id} className="flex min-w-[220px] shrink-0 gap-3">
                <CampusThumb
                  universityId={c.university.id}
                  alt={c.university.shortName}
                  className="h-14 w-[4.75rem] shrink-0"
                />
                <div className="min-w-0 self-center">
                  <p className="truncate text-[13px] font-medium">{c.university.shortName}</p>
                  <p className="caption truncate">{c.university.city}</p>
                  <p className="meta mt-0.5">Fit {c.fitIndex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {months.length === 0 ? (
            <div className="border border-dashed border-border px-5 py-12 text-center">
              <p className="text-[16px] font-medium">No tasks yet</p>
              <p className="body mt-2 text-secondary">
                Complete your profile and pick matches to generate a route.
              </p>
              <Button href="/universities" className="mt-5">
                Open matches
              </Button>
            </div>
          ) : (
            months.map((month) => (
              <div key={month} className="mb-10">
                <h2 className="label mb-5 flex items-center gap-3">
                  <span>{month}</span>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                </h2>
                <ul className="space-y-0">
                  {roadmap
                    .filter((t) => t.month === month)
                    .map((task) => {
                      const status = taskStatus[task.id] ?? "todo";
                      return (
                        <li
                          key={task.id}
                          className={cn(
                            "group grid gap-3 border-b border-border py-5 transition-opacity duration-200 sm:grid-cols-[1fr_auto]",
                            status === "done" && "opacity-45 task-done-pop",
                          )}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[15px] font-medium">{task.title}</h3>
                              <StatusBadge status={status} />
                            </div>
                            <p className="body mt-1.5 max-w-xl text-secondary">{task.reason}</p>
                            <p className="meta mt-2">
                              {task.deadline} · {task.effort}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <Button
                                size="sm"
                                variant={status === "todo" ? "primary" : "secondary"}
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
                          </div>
                          <div
                            className={cn(
                              "hidden h-2 w-2 self-start rounded-full sm:block",
                              status === "done"
                                ? "bg-accent"
                                : status === "started"
                                  ? "bg-warning"
                                  : "bg-border-strong",
                            )}
                            aria-hidden
                          />
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))
          )}
        </section>

        <aside className="lg:col-span-4" id="next">
          <div className="border-l-2 border-accent pl-5 lg:sticky lg:top-28">
            <p className="label">Next up</p>
            {next ? (
              <>
                <h2 className="text-h1 mt-2">{next.title}</h2>
                <p className="body mt-3 text-secondary">{next.reason}</p>
                <dl className="mt-5 space-y-0 text-[13px]">
                  <div className="flex justify-between gap-4 border-t border-border py-2.5">
                    <dt className="text-tertiary">Deadline</dt>
                    <dd className="font-medium">{next.deadline}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border py-2.5">
                    <dt className="text-tertiary">Effort</dt>
                    <dd className="font-medium">{next.effort}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-5 w-full"
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
            ) : (
              <p className="body mt-3 text-secondary">All tasks complete. Review sources and deadlines.</p>
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

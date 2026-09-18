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

  return (
    <AppShell
      eyebrow="Route"
      title="Your admissions route."
      lede={
        profile.englishExam !== "none"
          ? `Exams on file: ${profile.englishExam.toUpperCase()}${profile.englishScore ? ` ${profile.englishScore}` : ""}${profile.satStatus === "done" ? " · SAT scored" : ""}. Tasks skip work already done.`
          : "Generated from your shortlist and profile — not a generic senior-year calendar."
      }
      footer={
        next ? (
          <NextUp
            title={next.title}
            detail={`${doneCount}/${roadmap.length} tasks complete`}
            href="/roadmap"
            cta="Focus next task"
            onClick={() =>
              document.getElementById("next")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : undefined
      }
    >
      <div className="mb-8 flex gap-2 overflow-x-auto">
        {roadmapPicks.slice(0, 3).map((c) => (
          <div key={c.university.id} className="flex min-w-[180px] items-center gap-2 py-1">
            <CampusThumb
              universityId={c.university.id}
              alt={c.university.shortName}
              className="h-10 w-14 rounded-[var(--radius-sm)]"
            />
            <div className="min-w-0">
              <p className="small truncate font-medium">{c.university.shortName}</p>
              <p className="caption truncate">{c.university.city}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {months.map((month) => (
            <div key={month} className="mb-8 border-l border-border pl-5">
              <h2 className="label -ml-5 mb-4 bg-background pl-5">{month}</h2>
              <ul className="space-y-4">
                {roadmap
                  .filter((t) => t.month === month)
                  .map((task) => {
                    const status = taskStatus[task.id] ?? "todo";
                    return (
                      <li
                        key={task.id}
                        className={cn(
                          "group relative pl-4 transition-opacity duration-200",
                          status === "done" && "opacity-50 task-done-pop",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-background",
                            status === "done"
                              ? "border-accent bg-accent"
                              : status === "started"
                                ? "border-accent"
                                : "border-border",
                          )}
                        />
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="small font-medium">{task.title}</h3>
                            <p className="body mt-1 max-w-xl text-secondary">{task.reason}</p>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <p className="meta mt-2">
                          {task.deadline} · {task.effort}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 opacity-100 transition-opacity md:opacity-70 md:group-hover:opacity-100">
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
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </section>

        <aside className="lg:col-span-4" id="next">
          <div className="border-l-2 border-primary pl-4 lg:sticky lg:top-28">
            <p className="label">Next up</p>
            {next ? (
              <>
                <h2 className="text-h2 mt-2">{next.title}</h2>
                <p className="body mt-2 text-secondary">{next.reason}</p>
                <dl className="mt-4 space-y-2 small">
                  <div className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-tertiary">Deadline</dt>
                    <dd className="font-medium">{next.deadline}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-tertiary">Effort</dt>
                    <dd className="font-medium">{next.effort}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    setTaskStatus(next.id, nextStatus(taskStatus[next.id] ?? "todo"))
                  }
                >
                  {(taskStatus[next.id] ?? "todo") === "todo" ? "Mark as started" : "Advance"}
                </Button>
              </>
            ) : null}
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

"use client";

import { AppShell } from "@/components/AppShell";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { CampusThumb } from "@/components/UniversityCard";
import { cn } from "@/lib/cn";
import { useDerived, useRoute } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";

export default function RoadmapPage() {
  const { taskStatus, setTaskStatus, profile } = useRoute();
  const { roadmap, next, compare } = useDerived();
  const months = [...new Set(roadmap.map((t) => t.month))];

  return (
    <AppShell
      eyebrow="05 · Roadmap"
      title="What to do with the shortlist."
      lede={
        profile.englishExam !== "none"
          ? "IELTS/TOEFL is already on file, so it is not a mandatory task. The SAT appears only if you still need it for a U.S. campus."
          : "Tasks are generated from the current shortlist and exam status — not a generic senior-year calendar."
      }
    >
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {compare.slice(0, 3).map((c) => (
          <div
            key={c.university.id}
            className="flex min-w-[200px] flex-1 items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-2 transition-colors hover:border-primary/30"
          >
            <CampusThumb
              universityId={c.university.id}
              alt={c.university.shortName}
              className="h-12 w-16 rounded-[var(--radius-sm)]"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{c.university.shortName}</p>
              <p className="meta truncate">{c.university.city}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {months.map((month) => (
            <div key={month} className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-mono text-[12px] font-medium tracking-[0.08em] text-tertiary">
                  {month}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="space-y-2">
                {roadmap
                  .filter((t) => t.month === month)
                  .map((task) => {
                    const status = taskStatus[task.id] ?? "todo";
                    return (
                      <li
                        key={task.id}
                        className={cn(
                          "group rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 transition-[border-color,box-shadow,opacity] duration-200",
                          "hover:border-primary/25 hover:shadow-[0_6px_18px_-12px_rgba(17,19,24,0.2)]",
                          status === "done" && "opacity-55",
                          status === "done" && "task-done-pop",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[14.5px] font-medium">{task.title}</h3>
                              <StatusBadge status={status} />
                            </div>
                            <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-secondary">
                              {task.reason}
                            </p>
                            <p className="meta mt-2 max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-8 group-hover:opacity-100">
                              Effort · {task.effort}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="meta">{task.deadline}</p>
                            <p className="mt-1 text-[11.5px] text-tertiary opacity-70 transition-opacity group-hover:opacity-100">
                              {task.effort}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant={status === "todo" ? "primary" : "secondary"}
                            onClick={() => setTaskStatus(task.id, nextStatus(status))}
                          >
                            {status === "todo"
                              ? "Mark as started"
                              : status === "started"
                                ? "Mark as done"
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

        <aside className="lg:col-span-4">
          <div
            className={cn(
              "rounded-[var(--radius-lg)] border-2 border-primary bg-surface p-4 transition-[box-shadow,transform] duration-200 lg:sticky lg:top-14",
              (taskStatus[next?.id ?? ""] ?? "todo") !== "todo" && "border-accent",
            )}
          >
            <p className="label">Next up</p>
            {next ? (
              <>
                <h2 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">
                  {next.title}
                </h2>
                <p className="mt-2.5 text-[13.5px] leading-6 text-secondary">{next.reason}</p>
                <dl className="mt-4 space-y-0 text-[13px]">
                  <div className="flex justify-between gap-4 border-t border-border py-2">
                    <dt className="text-tertiary">Deadline</dt>
                    <dd className="text-right font-medium">{next.deadline}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border py-2">
                    <dt className="text-tertiary">Effort</dt>
                    <dd className="text-right font-medium">{next.effort}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-3 w-full"
                  onClick={() =>
                    setTaskStatus(next.id, nextStatus(taskStatus[next.id] ?? "todo"))
                  }
                >
                  {(taskStatus[next.id] ?? "todo") === "todo"
                    ? "Mark as started"
                    : (taskStatus[next.id] ?? "todo") === "started"
                      ? "Mark as done"
                      : "Reopen"}
                </Button>
                {(taskStatus[next.id] ?? "todo") !== "todo" ? (
                  <p className="mt-2 text-center font-mono text-[11px] text-accent">
                    {(taskStatus[next.id] ?? "todo") === "done"
                      ? "Completed — next task is ready"
                      : "Started — keep going"}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-[13.5px] text-secondary">The list is empty.</p>
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

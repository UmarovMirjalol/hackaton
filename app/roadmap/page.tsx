"use client";

import { AppShell } from "@/components/AppShell";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useDerived, useRoute } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";

export default function RoadmapPage() {
  const { taskStatus, setTaskStatus, profile } = useRoute();
  const { roadmap, next } = useDerived();
  const months = [...new Set(roadmap.map((t) => t.month))];

  return (
    <AppShell
      eyebrow="05 — Roadmap"
      title="What to do with the shortlist."
      lede={
        profile.englishExam !== "none"
          ? "IELTS/TOEFL is already on file, so it is not a mandatory task. The SAT appears only if you still need it for a U.S. campus."
          : "Tasks are generated from the current shortlist and exam status — not a generic senior-year calendar."
      }
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {months.map((month) => (
            <div key={month} className="mb-10">
              <h2 className="label mb-4">{month}</h2>
              <ul className="space-y-3">
                {roadmap
                  .filter((t) => t.month === month)
                  .map((task) => {
                    const status = taskStatus[task.id] ?? "todo";
                    return (
                      <li
                        key={task.id}
                        className={cn(
                          "border border-border bg-surface p-4 transition-colors",
                          status === "done" && "opacity-60",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[16px]">{task.title}</h3>
                              <StatusBadge status={status} />
                            </div>
                            <p className="mt-2 max-w-xl text-[13px] leading-6 text-secondary">{task.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="meta">{task.deadline}</p>
                            <p className="mt-1 text-[12px] text-tertiary">{task.effort}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant={status === "todo" ? "primary" : "secondary"}
                            onClick={() =>
                              setTaskStatus(task.id, nextStatus(status))
                            }
                          >
                            {status === "todo" ? "Mark as started" : status === "started" ? "Mark as done" : "Reopen"}
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
          <div className="border border-primary bg-surface p-5 lg:sticky lg:top-6">
            <p className="label">Next up</p>
            {next ? (
              <>
                <h2 className="mt-2 font-serif text-[26px] leading-tight">{next.title}</h2>
                <p className="mt-3 text-[14px] leading-6 text-secondary">{next.reason}</p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-tertiary">Deadline</dt>
                    <dd>{next.deadline}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-tertiary">Effort</dt>
                    <dd>{next.effort}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-5 w-full"
                  onClick={() => setTaskStatus(next.id, nextStatus(taskStatus[next.id] ?? "todo"))}
                >
                  {(taskStatus[next.id] ?? "todo") === "todo" ? "Mark as started" : "Advance this task"}
                </Button>
              </>
            ) : (
              <p className="mt-3 text-[14px] text-secondary">The list is empty.</p>
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

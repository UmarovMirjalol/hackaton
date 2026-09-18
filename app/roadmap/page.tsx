"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { SourceCitation, StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { profileReady } from "@/lib/onboarding";
import { taskConsequence } from "@/lib/roadmap";
import { useDerived, useRoute } from "@/lib/store";
import type { RoadmapTask, TaskStatus } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";
import "./roadmap.css";

export default function RoadmapPage() {
  const router = useRouter();
  const { taskStatus, setTaskStatus, profile, hydrated } = useRoute();
  const { roadmap, next, roadmapPicks } = useDerived();
  const ready = profileReady(profile);

  const doneCount = roadmap.filter((t) => taskStatus[t.id] === "done").length;
  const openCount = roadmap.length - doneCount;

  const upcoming = useMemo(
    () =>
      roadmap.filter(
        (t) => taskStatus[t.id] !== "done" && (!next || t.id !== next.id),
      ),
    [roadmap, taskStatus, next],
  );
  const completed = useMemo(
    () => roadmap.filter((t) => taskStatus[t.id] === "done"),
    [roadmap, taskStatus],
  );

  const nextConsequence = next ? taskConsequence(next, roadmapPicks) : null;

  const contextLine = useMemo(() => {
    const parts: string[] = [];
    if (profile.field) parts.push(fieldLabels[profile.field]);
    if (profile.aidNeed) {
      parts.push(
        profile.aidNeed === "full"
          ? "Full aid"
          : profile.aidNeed === "substantial"
            ? "Substantial aid"
            : profile.aidNeed === "some"
              ? "Some aid"
              : "Self-funded",
      );
    }
    if (profile.countries.length) {
      parts.push(profile.countries.map((c) => countryLabels[c]).join(" · "));
    }
    return parts.join(" · ");
  }, [profile.field, profile.aidNeed, profile.countries]);

  useEffect(() => {
    if (hydrated && !ready) router.replace("/onboarding");
  }, [hydrated, ready, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingBlock label="Opening Act…" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="route-frame py-16">
        <EmptyState
          title="Profile incomplete"
          detail="Finish the profile chapters before Route can build an application timeline."
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
    <AppShell
      eyebrow="Act"
      title="Your application route"
      lede={
        roadmapPicks.length
          ? `A timeline against ${roadmapPicks
              .slice(0, 3)
              .map((p) => p.university.shortName)
              .join(", ")} — ordered by what your profile still needs.`
          : "A monthly path from your profile and recommendations — every task is actionable."
      }
      footer={
        next ? (
          <NextUp
            label="Next action"
            title={next.title}
            detail={
              openCount > 0
                ? `${doneCount} of ${roadmap.length} done · ${next.deadline}`
                : next.deadline
            }
            href="/roadmap"
            cta={
              (taskStatus[next.id] ?? "todo") === "started" ? "Mark done" : "Start this"
            }
            onClick={() =>
              setTaskStatus(next.id, nextStatus(taskStatus[next.id] ?? "todo"))
            }
          />
        ) : roadmap.length > 0 ? (
          <NextUp
            label="Act"
            title="This route’s checklist is complete"
            detail={`${doneCount} of ${roadmap.length} done`}
            href="/results"
            cta="Back to results"
          />
        ) : undefined
      }
    >
      {/* A. Current route context */}
      <section className="rm-context">
        <div className="rm-context-top">
          <div className="min-w-0">
            <p className="label">Current route</p>
            <p className="rm-context-line mt-2">{contextLine || "Profile on file"}</p>
          </div>
          {roadmap.length > 0 ? (
            <p className="meta shrink-0 tabular-nums">
              {doneCount} of {roadmap.length} done
            </p>
          ) : null}
        </div>

        {roadmap.length > 0 ? (
          <div className="rm-progress" aria-hidden>
            <div
              className="rm-progress-fill"
              style={{
                width: `${roadmap.length ? (doneCount / roadmap.length) * 100 : 0}%`,
              }}
            />
          </div>
        ) : null}

        {roadmapPicks.length > 0 ? (
          <ul className="rm-shortlist">
            {roadmapPicks.slice(0, 3).map((c) => (
              <li key={c.university.id}>
                <span className="rm-shortlist-name">{c.university.shortName}</span>
                <span className="meta">
                  {c.university.country} · Fit {c.fitIndex}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="body mt-4 text-secondary">
            No shortlist yet. Explore recommendations first, then return here.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/results" variant="secondary" size="sm">
            Explore results
          </Button>
          <Button href="/compare" variant="ghost" size="sm">
            Open compare
          </Button>
        </div>
      </section>

      {roadmap.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No tasks on this route yet"
          detail="Complete analysis and keep at least one campus in your country filters so Route can build a timeline."
          action={
            <Button href="/results" variant="signal">
              Open results
            </Button>
          }
        />
      ) : (
        <div className="rm-stack">
          {/* B. Next action */}
          <section id="next" className="rm-next" aria-labelledby="next-action-heading">
            <p className="label">Next action</p>
            {next ? (
              <>
                <h2 id="next-action-heading" className="rm-next-title">
                  {next.title}
                </h2>
                <p className="body mt-3 max-w-2xl text-secondary">{next.reason}</p>
                {nextConsequence ? (
                  <p className="rm-unlock mt-3">
                    <span className="caption">Why this is next</span>
                    <span>{nextConsequence}</span>
                  </p>
                ) : null}
                <dl className="rm-next-meta">
                  <div>
                    <dt className="caption">Deadline</dt>
                    <dd>{next.deadline}</dd>
                  </div>
                  <div>
                    <dt className="caption">Effort</dt>
                    <dd>{next.effort}</dd>
                  </div>
                  <div>
                    <dt className="caption">Status</dt>
                    <dd>
                      <StatusBadge status={taskStatus[next.id] ?? "todo"} />
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    variant="signal"
                    size="lg"
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
                  {next.source ? <SourceCitation {...next.source} /> : null}
                </div>
              </>
            ) : (
              <>
                <h2 id="next-action-heading" className="rm-next-title">
                  Route complete
                </h2>
                <p className="body mt-3 max-w-xl text-secondary">
                  Every task on this timeline is marked done. Reopen a task below if something
                  still needs attention, or return to results if the shortlist changed.
                </p>
              </>
            )}
          </section>

          {/* C. Upcoming */}
          {upcoming.length > 0 ? (
            <section className="rm-section" aria-labelledby="upcoming-heading">
              <div className="rm-section-head">
                <h2 id="upcoming-heading" className="label">
                  Upcoming
                </h2>
                <p className="meta">{upcoming.length}</p>
              </div>
              <ul className="rm-task-list">
                {upcoming.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    status={taskStatus[task.id] ?? "todo"}
                    consequence={taskConsequence(task, roadmapPicks)}
                    onAdvance={() =>
                      setTaskStatus(task.id, nextStatus(taskStatus[task.id] ?? "todo"))
                    }
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {/* D. Completed */}
          {completed.length > 0 ? (
            <section className="rm-section rm-section-done" aria-labelledby="done-heading">
              <div className="rm-section-head">
                <h2 id="done-heading" className="label">
                  Done
                </h2>
                <p className="meta">{completed.length}</p>
              </div>
              <ul className="rm-task-list">
                {completed.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    status="done"
                    consequence={null}
                    onAdvance={() => setTaskStatus(task.id, "todo")}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

function TaskRow({
  task,
  status,
  consequence,
  onAdvance,
}: {
  task: RoadmapTask;
  status: TaskStatus;
  consequence: string | null;
  onAdvance: () => void;
}) {
  return (
    <li className={cn("rm-task", status === "done" && "is-done")}>
      <div className="rm-task-main">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="rm-task-title">{task.title}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="rm-task-reason">{task.reason}</p>
        {consequence && status !== "done" ? (
          <p className="rm-task-unlock">{consequence}</p>
        ) : null}
        <p className="meta mt-2">
          {task.month} · {task.deadline} · {task.effort}
        </p>
      </div>
      <div className="rm-task-actions">
        <Button size="sm" variant={status === "todo" ? "secondary" : "ghost"} onClick={onAdvance}>
          {status === "todo" ? "Start" : status === "started" ? "Done" : "Reopen"}
        </Button>
        {task.source && status !== "done" ? <SourceCitation {...task.source} /> : null}
      </div>
    </li>
  );
}

function nextStatus(s: TaskStatus): TaskStatus {
  if (s === "todo") return "started";
  if (s === "started") return "done";
  return "todo";
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useRoute } from "@/lib/store";

const STEPS = [
  { href: "/profile", id: "profile", label: "Profile" },
  { href: "/diagnosis", id: "diagnosis", label: "Diagnosis" },
  { href: "/universities", id: "universities", label: "Universities" },
  { href: "/compare", id: "compare", label: "Compare" },
  { href: "/roadmap", id: "roadmap", label: "Roadmap" },
] as const;

export function StepNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const { profile } = useRoute();
  const ready = Boolean(profile.firstName && profile.homeCountry);
  const current = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <nav
      aria-label="Route progress"
      className={cn("flex items-center gap-0 overflow-x-auto", compact && "text-[12px]")}
    >
      {STEPS.map((step, i) => {
        const active = pathname.startsWith(step.href);
        const locked = i > 0 && !ready && step.id !== "profile";
        const done = current > i && ready;
        return (
          <span key={step.id} className="flex items-center">
            {i > 0 ? (
              <span
                className={cn("mx-1.5 hidden h-px w-3 sm:block", done ? "bg-accent/40" : "bg-border")}
                aria-hidden
              />
            ) : null}
            <Link
              href={locked ? "/profile" : step.href}
              aria-current={active ? "step" : undefined}
              className={cn(
                "whitespace-nowrap rounded-[var(--radius-sm)] px-1 py-1 text-[12px] font-medium sm:text-[13px]",
                active
                  ? "text-primary"
                  : locked
                    ? "text-tertiary"
                    : "text-secondary hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "mr-1.5 hidden font-mono text-[10px] sm:inline",
                  active ? "text-accent" : "text-tertiary",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.label}
            </Link>
          </span>
        );
      })}
      <span className="sr-only">
        Step {Math.max(current, 0) + 1} of {STEPS.length}
      </span>
    </nav>
  );
}

export function AppShell({
  children,
  eyebrow,
  title,
  lede,
  action,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  lede?: string;
  action?: ReactNode;
}) {
  const { hydrated } = useRoute();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Route
          </Link>
          <StepNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        {!hydrated ? <p className="meta mb-5">Loading the saved route…</p> : null}
        {(eyebrow || title) && (
          <div className="mb-7 max-w-2xl enter">
            {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
            {title ? <h1 className="page-title text-[28px] sm:text-[34px]">{title}</h1> : null}
            {lede ? (
              <p className="mt-2.5 max-w-xl text-[14.5px] leading-6 text-secondary">{lede}</p>
            ) : null}
            {action ? <div className="mt-4">{action}</div> : null}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

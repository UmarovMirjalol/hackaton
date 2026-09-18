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
    <nav aria-label="Route progress" className={cn("flex items-center gap-0 overflow-x-auto", compact && "text-[12px]")}>
      {STEPS.map((step, i) => {
        const active = pathname.startsWith(step.href);
        const locked = i > 0 && !ready && step.id !== "profile";
        return (
          <span key={step.id} className="flex items-center">
            {i > 0 ? (
              <span className="mx-2 hidden h-px w-4 bg-border sm:block" aria-hidden />
            ) : null}
            <Link
              href={locked ? "/profile" : step.href}
              aria-current={active ? "step" : undefined}
              className={cn(
                "whitespace-nowrap py-1 text-[12px] tracking-wide sm:text-[13px]",
                active
                  ? "border-b border-accent text-primary"
                  : locked
                    ? "text-tertiary"
                    : "text-secondary hover:text-primary",
              )}
            >
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
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-serif text-[20px] tracking-tight">
            Route
          </Link>
          <StepNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {!hydrated ? (
          <p className="meta mb-6">Loading the saved route…</p>
        ) : null}
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl enter">
            {eyebrow ? <p className="label mb-3">{eyebrow}</p> : null}
            {title ? <h1 className="page-title text-[32px] sm:text-[40px]">{title}</h1> : null}
            {lede ? <p className="mt-3 max-w-2xl text-[15px] leading-7 text-secondary">{lede}</p> : null}
            {action ? <div className="mt-5">{action}</div> : null}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

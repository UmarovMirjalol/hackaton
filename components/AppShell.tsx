"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { JOURNEY, profileCompleteness, profileReady, stepComplete } from "@/lib/journey";
import { useRoute } from "@/lib/store";

const NAV = [
  { href: "/universities", label: "Matches" },
  { href: "/compare", label: "Compare" },
  { href: "/roadmap", label: "Route" },
] as const;

export function JourneyRail() {
  const pathname = usePathname();
  const { profile } = useRoute();
  const ready = profileReady(profile);

  return (
    <div className="hidden border-b border-border md:block">
      <div
        className="mx-auto flex max-w-[var(--content)] items-center gap-0 px-[var(--space-page)]"
        style={{ maxWidth: "var(--content)" }}
      >
        {JOURNEY.map((step, i) => {
          const active = pathname.startsWith(step.href);
          const done = stepComplete(step.id, pathname, profile);
          const locked = i > 0 && !ready && step.id !== "profile";
          return (
            <Link
              key={step.id}
              href={locked ? "/profile" : step.href}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium transition-colors",
                active ? "text-primary" : done ? "text-secondary" : "text-tertiary hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  active ? "text-accent" : "text-tertiary",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.label}
              {active ? (
                <span className="absolute inset-x-3 -bottom-px h-px bg-accent" aria-hidden />
              ) : null}
            </Link>
          );
        })}
        <span className="ml-auto meta hidden lg:inline py-2.5">
          {profileCompleteness(profile)}% · saved locally
        </span>
      </div>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/profile", label: "Profile" },
    ...NAV,
  ] as const;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-accent" : "text-tertiary",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "h-0.5 w-4 rounded-full transition-colors",
                  active ? "bg-accent" : "bg-transparent",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  eyebrow,
  title,
  lede,
  action,
  footer,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  lede?: string;
  action?: ReactNode;
  footer?: ReactNode;
}) {
  const { hydrated, profile } = useRoute();
  const pathname = usePathname();

  return (
    <div className="min-h-dvh pb-16 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
        <div
          className="mx-auto flex items-center justify-between gap-4 px-[var(--space-page)] py-3"
          style={{ maxWidth: "var(--content)" }}
        >
          <Link href="/" className="text-[15px] font-semibold tracking-[-0.02em]">
            Route
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Product">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-primary"
                    : "text-secondary hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/profile"
            className={cn(
              "text-[13px] font-medium transition-colors",
              pathname.startsWith("/profile") ? "text-accent" : "text-secondary hover:text-primary",
            )}
          >
            {profile.firstName || "Profile"}
          </Link>
        </div>
        <JourneyRail />
      </header>

      <main
        className="mx-auto px-[var(--space-page)] py-7 sm:py-10"
        style={{ maxWidth: "var(--content)" }}
      >
        {!hydrated ? (
          <div className="mb-6 space-y-2" aria-live="polite">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-7 w-64 max-w-full" />
            <div className="skeleton h-4 w-96 max-w-full" />
          </div>
        ) : null}
        {(eyebrow || title) && (
          <header className="mb-6 enter sm:mb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
                {title ? <h1 className="page-title text-h1">{title}</h1> : null}
                {lede ? <p className="body mt-2.5 max-w-xl text-secondary">{lede}</p> : null}
              </div>
              {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
            </div>
          </header>
        )}
        <div className="enter-delay">{children}</div>
      </main>

      {footer}
      <MobileNav />
    </div>
  );
}

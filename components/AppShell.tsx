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
    <div className="hidden border-b border-border/80 bg-surface/50 md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2 sm:px-6">
        {JOURNEY.map((step, i) => {
          const active = pathname.startsWith(step.href);
          const done = stepComplete(step.id, pathname, profile);
          const locked = i > 0 && !ready && step.id !== "profile";
          return (
            <span key={step.id} className="flex items-center">
              {i > 0 ? <span className="mx-1 h-px w-3 bg-border" aria-hidden /> : null}
              <Link
                href={locked ? "/profile" : step.href}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] font-medium transition-colors",
                  active ? "text-primary" : done ? "text-secondary" : "text-tertiary hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border text-[9px]",
                    done && !active
                      ? "border-accent/40 bg-accent-subtle text-accent"
                      : active
                        ? "border-accent bg-accent text-white"
                        : "border-border text-tertiary",
                  )}
                >
                  {done && !active ? "✓" : i + 1}
                </span>
                {step.label}
              </Link>
            </span>
          );
        })}
        <span className="ml-auto meta hidden lg:inline">
          {profileCompleteness(profile)}% profile · saved locally
        </span>
      </div>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2.5 text-[11px] font-medium",
                active ? "text-accent" : "text-tertiary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center py-2.5 text-[11px] font-medium",
            pathname.startsWith("/profile") ? "text-accent" : "text-tertiary",
          )}
        >
          Profile
        </Link>
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
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Route
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Product">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  pathname.startsWith(item.href) ? "text-primary" : "text-secondary hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/profile"
            className={cn(
              "text-[13px] font-medium",
              pathname.startsWith("/profile") ? "text-accent" : "text-secondary hover:text-primary",
            )}
          >
            {profile.firstName ? profile.firstName : "Profile"}
          </Link>
        </div>
        <JourneyRail />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {!hydrated ? <p className="meta mb-4">Loading your route…</p> : null}
        {(eyebrow || title) && (
          <header className="mb-6 max-w-2xl enter">
            {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
            {title ? <h1 className="page-title text-h1">{title}</h1> : null}
            {lede ? <p className="body mt-2 text-secondary">{lede}</p> : null}
            {action ? <div className="mt-4 flex flex-wrap gap-2">{action}</div> : null}
          </header>
        )}
        {children}
      </main>

      {footer}
      <MobileNav />
    </div>
  );
}

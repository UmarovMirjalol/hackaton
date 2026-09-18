"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  JOURNEY,
  journeyState,
  profileCompleteness,
  profileReady,
} from "@/lib/journey";
import { useRoute } from "@/lib/store";

const NAV = [
  { href: "/results", label: "Explore" },
  { href: "/compare", label: "Decide" },
  { href: "/roadmap", label: "Act" },
] as const;

export function JourneyRail({
  alwaysShow = false,
  /** When false, omit trailing completeness meta (host chrome already shows it). */
  showStatus = true,
}: {
  alwaysShow?: boolean;
  showStatus?: boolean;
}) {
  const pathname = usePathname();
  const { profile } = useRoute();
  const ready = profileReady(profile);
  const pct = profileCompleteness(profile);

  return (
    <div
      className={cn(
        "border-b border-border bg-surface/60",
        alwaysShow ? "block" : "hidden md:block",
      )}
    >
      <div className="route-frame flex items-center gap-1 overflow-x-auto py-0">
        <p className="label mr-3 shrink-0 py-2.5">Your route</p>
        {JOURNEY.map((step) => {
          const state = journeyState(step.id, pathname, profile);
          const locked = state === "locked";
          const active = state === "current";
          const done = state === "done";
          return (
            <Link
              key={step.id}
              href={locked ? "/onboarding" : step.href}
              aria-current={active ? "step" : undefined}
              title={step.purpose}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-[12.5px] font-medium transition-[color,transform] duration-[var(--duration)] ease-[var(--ease-out)]",
                active && "text-primary",
                done && "text-secondary",
                !active && !done && "text-tertiary hover:text-primary hover:-translate-y-px",
                locked && "opacity-55",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,box-shadow,transform] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
                  active && "scale-110 bg-[var(--signal)] shadow-[0_0_0_3px_var(--signal-subtle)]",
                  done && "bg-[var(--signal)]",
                  !active && !done && "border border-border-strong bg-transparent",
                )}
                aria-hidden
              />
              {step.label}
              {active ? (
                <span
                  className="flow-rail absolute inset-x-3 -bottom-px h-0.5 bg-[var(--signal)]"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
        {showStatus ? (
          <span className="meta ml-auto hidden items-center gap-2 py-2.5 lg:inline-flex">
            {!ready ? (
              <span>Finish profile to unlock route</span>
            ) : (
              <span>{pct}% profile · saved locally</span>
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/onboarding", label: "Profile" },
    { href: "/results", label: "Explore" },
    { href: "/compare", label: "Decide" },
    { href: "/roadmap", label: "Act" },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active =
            pathname.startsWith(item.href) ||
            (item.href === "/onboarding" && pathname.startsWith("/profile")) ||
            (item.href === "/results" &&
              (pathname.startsWith("/diagnosis") || pathname.startsWith("/universities")));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-[var(--signal)]" : "text-tertiary",
              )}
            >
              {item.label}
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
    <div className={cn("min-h-dvh", footer ? "pb-52 md:pb-28" : "pb-16 md:pb-0")}>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-md backdrop-saturate-150">
        <div className="route-frame flex items-center justify-between gap-4 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-[17px] italic tracking-[0.06em]"
          >
            LOCUS
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_0_3px_var(--signal-subtle)]" aria-hidden />
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Product">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-flow text-[13px] font-medium",
                  pathname.startsWith(item.href) ? "text-primary" : "text-secondary hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/onboarding"
            className={cn(
              "text-[13px] font-medium transition-colors duration-[var(--duration)]",
              pathname.startsWith("/onboarding") || pathname.startsWith("/profile")
                ? "text-[var(--signal)]"
                : "text-secondary hover:text-primary",
            )}
          >
            {profile.firstName || "Profile"}
          </Link>
        </div>
        <JourneyRail />
      </header>

      <main className="route-frame py-7 sm:py-10">
        {!hydrated ? (
          <div className="mb-6 space-y-2" aria-busy="true" aria-label="Loading profile">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-8 w-72 max-w-full" />
          </div>
        ) : null}
        {(eyebrow || title) && (
          <header className="mb-8 enter">
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
        {children}
      </main>

      {footer}
      <MobileNav />
    </div>
  );
}

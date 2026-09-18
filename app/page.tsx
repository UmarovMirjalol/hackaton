"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { WhatYouGet } from "@/components/landing/WhatYouGet";
import { JOURNEY_STAGES, type StageId } from "@/components/landing/sample";
import { profileReady } from "@/lib/onboarding";
import { useRoute } from "@/lib/store";
import { cn } from "@/lib/cn";
import "./landing.css";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#what-you-get", label: "What you get" },
  { href: "#your-route", label: "Your route" },
] as const;

export default function LandingPage() {
  const { loadDemo, profile, hydrated } = useRoute();
  const router = useRouter();
  const ready = profileReady(profile);
  const [heroStage, setHeroStage] = useState<StageId>("explore");
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Gentle hero stage cycle — paused when reduced motion
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const order = JOURNEY_STAGES.map((s) => s.id);
    const id = window.setInterval(() => {
      setHeroStage((cur) => {
        const i = order.indexOf(cur);
        return order[(i + 1) % order.length]!;
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="landing min-h-dvh bg-background">
      <header
        className={cn(
          "landing-header sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--duration)]",
          scrolled
            ? "border-border bg-background/90 backdrop-blur-md"
            : "border-transparent bg-background/70",
        )}
      >
        <div className="route-frame flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight"
          >
            Route
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Landing">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="small text-secondary transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {ready ? (
              <Link
                href="/results"
                className="small hidden text-secondary transition-colors hover:text-primary sm:inline"
              >
                Continue as {profile.firstName}
              </Link>
            ) : null}
            <Button href="/onboarding" size="sm" variant="signal" className="hidden sm:inline-flex">
              Build my route
            </Button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border bg-surface md:hidden rounded-[var(--radius-md)]"
              aria-expanded={navOpen}
              aria-controls="landing-mobile-nav"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    "block h-px w-4 bg-primary transition-transform",
                    navOpen && "translate-y-[3.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-4 bg-primary transition-transform",
                    navOpen && "-translate-y-[3.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {navOpen ? (
          <div
            id="landing-mobile-nav"
            className="border-t border-border bg-surface px-[var(--space-page)] py-3 md:hidden"
          >
            <div className="mx-auto flex max-w-[var(--content)] flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="py-2.5 text-[14px] font-medium"
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button href="/onboarding" variant="signal" className="mt-2 w-full">
                Build my route
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        {/* ——— Hero ——— */}
        <section className="landing-hero route-frame pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="landing-reveal lg:col-span-5">
              <p className="label">Admissions route</p>
              <h1 className="text-display mt-4 max-w-lg">
                Your profile becomes a route.
              </h1>
              <p className="body mt-5 max-w-md text-secondary">
                Route turns a student’s profile, goals, academic context, budget, countries, and
                exams into a personalized admissions path — with reasons you can verify, not a
                search list to scroll forever.
              </p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button href="/onboarding" size="lg" variant="signal">
                  Build my route
                </Button>
                <Button href="#how-it-works" size="lg" variant="secondary">
                  See how it works
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  disabled={!hydrated}
                  onClick={() => {
                    loadDemo();
                    router.push("/analyze");
                  }}
                  className="small text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-primary disabled:opacity-40"
                >
                  Try demo profile
                </button>
                <span className="caption hidden sm:inline">Saved locally · no account</span>
              </div>

              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Journey stages">
                {JOURNEY_STAGES.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setHeroStage(s.id)}
                      className={cn(
                        "border px-2.5 py-1 text-[11px] font-medium rounded-[var(--radius-sm)] transition-colors duration-[var(--duration)]",
                        heroStage === s.id
                          ? "border-[var(--signal)] bg-[var(--signal-subtle)] text-[var(--signal)]"
                          : "border-border text-tertiary hover:border-border-strong hover:text-primary",
                      )}
                      aria-pressed={heroStage === s.id}
                    >
                      {s.n} {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="landing-reveal landing-reveal-delay lg:col-span-7">
              <ProductPreview stage={heroStage} />
            </div>
          </div>
        </section>

        <HowItWorks />

        <WhatYouGet />

        {/* ——— Your route ——— */}
        <section id="your-route" className="landing-section scroll-mt-20" aria-labelledby="route-heading">
          <div className="route-frame">
            <div className="landing-cta panel relative overflow-hidden px-6 py-12 sm:px-10 sm:py-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.55]"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(ellipse 70% 80% at 100% 0%, var(--signal-subtle), transparent 55%)",
                }}
              />
              <div className="relative max-w-xl">
                <p className="label">Your route</p>
                <h2 id="route-heading" className="text-h1 mt-3 tracking-tight">
                  Your route starts with your profile.
                </h2>
                <p className="body mt-3 text-secondary">
                  Answer what Route needs to know — then move from diagnosis to campuses to the next
                  action on your timeline.
                </p>
                <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                  <Button href="/onboarding" size="lg" variant="signal">
                    Build my route
                  </Button>
                  <Button href="#how-it-works" size="lg" variant="secondary">
                    Review the journey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="route-frame border-t border-border py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-[13px] font-medium">
            Route
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          </p>
          <p className="caption max-w-md sm:text-right">
            Demo catalog for LOCUS Hackathon 2026. Deadlines and aid rules must be verified on each
            campus site.
          </p>
        </div>
      </footer>
    </div>
  );
}

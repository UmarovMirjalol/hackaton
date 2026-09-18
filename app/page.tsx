"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProductStory } from "@/components/landing/ProductStory";
import { RouteTheater } from "@/components/landing/RouteTheater";
import { StageCanvas } from "@/components/landing/StageCanvas";
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const order = JOURNEY_STAGES.map((s) => s.id);
    const id = window.setInterval(() => {
      setHeroStage((cur) => order[(order.indexOf(cur) + 1) % order.length]!);
    }, 4800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="landing min-h-dvh">
      {/* ——— Header ——— */}
      <header className={cn("locus-header", scrolled && "is-scrolled")}>
        <div className="route-frame locus-header-inner">
          <Link href="/" className="locus-brand">
            LOCUS
            <span className="locus-brand-dot" aria-hidden />
          </Link>

          <nav className="locus-nav" aria-label="Landing">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="locus-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="locus-header-actions">
            {ready ? (
              <Link href="/results" className="locus-nav-link hidden sm:inline">
                Continue as {profile.firstName}
              </Link>
            ) : null}
            <Button href="/onboarding" size="sm" variant="signal" className="hidden sm:inline-flex">
              Build my route
            </Button>
            <button
              type="button"
              className="locus-menu-btn md:hidden"
              aria-expanded={navOpen}
              aria-controls="locus-mobile-nav"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span aria-hidden className={cn("locus-menu-icon", navOpen && "is-open")} />
            </button>
          </div>
        </div>

        {navOpen ? (
          <div id="locus-mobile-nav" className="locus-mobile-nav md:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="locus-mobile-link"
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button href="/onboarding" variant="signal" className="mt-3 w-full">
              Build my route
            </Button>
          </div>
        ) : null}
      </header>

      <main>
        {/* ——— Hero: typography + route band + large canvas ——— */}
        <section className="locus-hero">
          <div className="route-frame">
            <div className="locus-hero-top">
              <p className="locus-brand-mark">LOCUS</p>
              <h1 className="locus-display locus-hero-title">
                <span className="locus-line">
                  <span className="locus-line-inner">Your profile</span>
                </span>
                <span className="locus-line">
                  <span className="locus-line-inner">
                    <em>becomes a route.</em>
                  </span>
                </span>
              </h1>
              <p className="locus-hero-lede">
                Turn academics, budget, countries, and goals into a personalized admissions path —
                with reasons you can verify, not a match percentage to chase.
              </p>
              <div className="locus-hero-cta">
                <Button href="/onboarding" size="lg" variant="signal">
                  Build my route
                </Button>
                <Button href="#how-it-works" size="lg" variant="secondary">
                  See how it works
                </Button>
              </div>
              <div className="locus-hero-aside">
                <button
                  type="button"
                  disabled={!hydrated}
                  className="locus-text-link"
                  onClick={() => {
                    loadDemo();
                    router.push("/analyze");
                  }}
                >
                  Try demo profile
                </button>
                <span className="caption">Saved locally · no account</span>
              </div>
            </div>

            {/* Horizontal route as visual centerpiece */}
            <div
              className="locus-hero-route"
              role="tablist"
              aria-label="Sample route stages"
              style={{
                ["--route-i" as string]: JOURNEY_STAGES.findIndex((s) => s.id === heroStage),
                ["--route-n" as string]: JOURNEY_STAGES.length,
              }}
            >
              {JOURNEY_STAGES.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={heroStage === step.id}
                  className={cn("locus-hero-node", heroStage === step.id && "is-active")}
                  onClick={() => setHeroStage(step.id)}
                >
                  <span className="locus-hero-node-dot" aria-hidden />
                  <span className="meta">{step.n}</span>
                  <span className="locus-hero-node-label">{step.label}</span>
                  {i < JOURNEY_STAGES.length - 1 ? (
                    <span className="locus-hero-node-join" aria-hidden />
                  ) : null}
                </button>
              ))}
            </div>

            <StageCanvas stage={heroStage} className="locus-hero-canvas" />
          </div>
        </section>

        <RouteTheater />

        <ProductStory />

        {/* ——— Final CTA ——— */}
        <section id="your-route" className="locus-finale scroll-mt-20" aria-labelledby="finale-heading">
          <div className="route-frame">
            <div className="locus-finale-inner reveal is-in">
              <p className="label">Your route</p>
              <h2 id="finale-heading" className="locus-display-sm mt-4 max-w-2xl">
                Your route starts with your profile.
              </h2>
              <p className="body mt-4 max-w-lg text-secondary">
                Answer what LOCUS needs to know — then move from diagnosis to campuses to the next
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
        </section>
      </main>

      <footer className="locus-footer">
        <div className="route-frame locus-footer-inner">
          <p className="locus-brand">
            LOCUS
            <span className="locus-brand-dot" aria-hidden />
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

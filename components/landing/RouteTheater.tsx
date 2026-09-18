"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { StageCanvas, StageCopy } from "./StageCanvas";
import { JOURNEY_STAGES, type StageId } from "./sample";
import { cn } from "@/lib/cn";

/**
 * Memorable interaction: a vertical route spine.
 * Click or scroll-scrub stages — the canvas morphs with the inked path.
 */
export function RouteTheater() {
  const [active, setActive] = useState<StageId>("profile");
  const [manual, setManual] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Record<string, HTMLElement | null>>({});

  const select = useCallback((id: StageId, fromUser = false) => {
    setActive(id);
    if (fromUser) {
      setManual(true);
      panelRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    if (manual) return;
    const root = scrollerRef.current;
    if (!root) return;
    const nodes = JOURNEY_STAGES.map((s) => panelRefs.current[s.id]).filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top) return;
        const id = (top.target as HTMLElement).dataset.stage as StageId | undefined;
        if (id) setActive(id);
      },
      { root, rootMargin: "-20% 0px -35% 0px", threshold: [0.25, 0.55, 0.8] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [manual]);

  const activeIndex = JOURNEY_STAGES.findIndex((s) => s.id === active);

  return (
    <section id="how-it-works" className="locus-theater scroll-mt-20" aria-labelledby="theater-heading">
      <div className="route-frame">
        <Reveal className="locus-theater-intro">
          <p className="label">How LOCUS works</p>
          <h2 id="theater-heading" className="locus-display-sm mt-3">
            One spine. Five stages.
          </h2>
          <p className="body mt-3 max-w-xl text-secondary">
            Select a stage — or scroll the path — and watch the product state change. This is the
            same journey you enter after onboarding.
          </p>
        </Reveal>

        <div className="locus-theater-layout">
          {/* Spine */}
          <aside className="locus-spine" aria-label="Route stages">
            <div className="locus-spine-track" aria-hidden>
              <div
                className="locus-spine-ink"
                style={{
                  height: `${((activeIndex + 0.5) / JOURNEY_STAGES.length) * 100}%`,
                }}
              />
            </div>
            <ol className="locus-spine-list">
              {JOURNEY_STAGES.map((step, i) => {
                const isActive = step.id === active;
                const isPast = i < activeIndex;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      className={cn(
                        "locus-spine-node",
                        isActive && "is-active",
                        isPast && "is-past",
                      )}
                      aria-pressed={isActive}
                      onClick={() => select(step.id, true)}
                    >
                      <span className="locus-spine-dot" aria-hidden />
                      <span className="locus-spine-meta">
                        <span className="meta">{step.n}</span>
                        <span className="locus-spine-label">{step.label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* Sticky canvas + mobile stage copy */}
          <div className="locus-theater-stage">
            <div className="locus-theater-sticky">
              <StageCopy stage={active} />
              <StageCanvas stage={active} className="mt-6" />
            </div>
          </div>

          {/* Scroll scrubber panels (desktop drives IO; mobile uses chips) */}
          <div className="locus-theater-scrub" ref={scrollerRef}>
            {JOURNEY_STAGES.map((step) => (
              <article
                key={step.id}
                data-stage={step.id}
                ref={(el) => {
                  panelRefs.current[step.id] = el;
                }}
                className="locus-scrub-panel"
              >
                <p className="meta">{step.n}</p>
                <h3 className="mt-2 text-[1.25rem] font-medium tracking-tight">{step.label}</h3>
                <p className="mt-1 text-[15px] font-medium">{step.title}</p>
                <p className="mt-2 max-w-md text-[14px] leading-6 text-secondary">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Mobile stage chips */}
        <div
          className="locus-theater-chips"
          role="tablist"
          aria-label="Journey stages"
        >
          {JOURNEY_STAGES.map((step) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={active === step.id}
              className={cn("locus-chip", active === step.id && "is-active")}
              onClick={() => select(step.id, true)}
            >
              {step.n} {step.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

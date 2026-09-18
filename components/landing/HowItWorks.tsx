"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductPreview } from "./ProductPreview";
import { JOURNEY_STAGES, type StageId } from "./sample";
import { cn } from "@/lib/cn";

export function HowItWorks() {
  const [active, setActive] = useState<StageId>("profile");
  const [manual, setManual] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  const select = useCallback((id: StageId, fromUser = false) => {
    setActive(id);
    if (fromUser) setManual(true);
  }, []);

  useEffect(() => {
    if (manual) return;
    const nodes = JOURNEY_STAGES.map((s) => stepRefs.current[s.id]).filter(
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
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.4, 0.7],
      },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [manual]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="landing-section scroll-mt-20"
      aria-labelledby="how-heading"
    >
      <div className="route-frame">
        <div className="max-w-2xl">
          <p className="label">How it works</p>
          <h2 id="how-heading" className="text-h1 mt-3 tracking-tight">
            One route. Five stages.
          </h2>
          <p className="body mt-3 max-w-xl text-secondary">
            Scroll the stages — or select one — to see how Route turns a profile into diagnosis,
            recommendations, comparison, and a next action.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <ol className="space-y-2 lg:col-span-5">
            {JOURNEY_STAGES.map((step) => {
              const isActive = active === step.id;
              return (
                <li
                  key={step.id}
                  data-stage={step.id}
                  ref={(el) => {
                    stepRefs.current[step.id] = el;
                  }}
                >
                  <button
                    type="button"
                    onClick={() => select(step.id, true)}
                    className={cn(
                      "landing-stage group w-full border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-[var(--duration)] rounded-[var(--radius-lg)]",
                      isActive
                        ? "border-[var(--signal)] bg-surface shadow-[var(--shadow-panel)]"
                        : "border-transparent bg-transparent hover:border-border hover:bg-surface/70",
                    )}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className={cn(
                          "meta transition-colors",
                          isActive ? "text-[var(--signal)]" : "text-tertiary",
                        )}
                      >
                        {step.n}
                      </span>
                      <span
                        className={cn(
                          "text-[15px] font-medium tracking-tight transition-colors",
                          isActive ? "text-primary" : "text-secondary group-hover:text-primary",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-9 text-[14px] font-medium tracking-tight">{step.title}</p>
                    <p
                      className={cn(
                        "mt-1.5 pl-9 text-[13px] leading-5 text-secondary transition-opacity duration-[var(--duration)]",
                        isActive ? "opacity-100" : "opacity-80",
                      )}
                    >
                      {step.detail}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <ProductPreview stage={active} />
            {/* Mobile stage chips when sticky preview is awkward */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" role="tablist" aria-label="Journey stages">
              {JOURNEY_STAGES.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={active === step.id}
                  onClick={() => select(step.id, true)}
                  className={cn(
                    "shrink-0 border px-3 py-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors duration-[var(--duration)]",
                    active === step.id
                      ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                      : "border-border bg-surface text-secondary",
                  )}
                >
                  {step.n} {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

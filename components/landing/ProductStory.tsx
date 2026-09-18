"use client";

import Image from "next/image";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import {
  SAMPLE_DIAGNOSIS,
  SAMPLE_MATCHES,
  SAMPLE_NEXT,
  sampleCampus,
} from "./sample";

/** Editorial product story — not a four-card grid. */
export function ProductStory() {
  const [whyOpen, setWhyOpen] = useState(false);
  const top = SAMPLE_MATCHES[0];
  const second = SAMPLE_MATCHES[1];
  const img = top ? sampleCampus(top.university.id) : null;

  return (
    <section id="what-you-get" className="locus-story scroll-mt-20" aria-labelledby="story-heading">
      <div className="route-frame">
        <div className="locus-story-head">
          <p className="label">What you get</p>
          <h2 id="story-heading" className="locus-display mt-4 max-w-3xl">
            Not a list of universities.
            <br />
            <em className="text-[color:var(--signal-deep)]">A route.</em>
          </h2>
          <p className="body mt-5 max-w-xl text-secondary">
            LOCUS turns your facts into diagnosis, ranked campuses with reasons, a side-by-side
            decision, and one next action — in that order.
          </p>
        </div>

        {/* Step 1 — Diagnosis as typographic block */}
        <div className="locus-story-block">
          <div className="locus-story-index">
            <span className="meta">01</span>
            <span className="locus-story-line" aria-hidden />
            <span className="label">Diagnosis</span>
          </div>
          <div className="locus-story-body">
            <h3 className="locus-story-title">{SAMPLE_DIAGNOSIS.title}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-secondary">
              {SAMPLE_DIAGNOSIS.summary}
            </p>
            <ul className="locus-story-signals">
              {SAMPLE_DIAGNOSIS.strengths.slice(0, 2).map((s) => (
                <li key={s.label}>
                  <span className="font-medium">{s.label}</span>
                  <span className="text-secondary"> — {s.evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step 2 — Recommendation as full-bleed visual moment */}
        {top ? (
          <div className="locus-story-block locus-story-reco">
            <div className="locus-story-index">
              <span className="meta">02</span>
              <span className="locus-story-line" aria-hidden />
              <span className="label">Recommendation</span>
            </div>
            <div className="locus-story-body">
              <div className="locus-reco-shell">
                <div className="locus-reco-media">
                  {img ? (
                    <Image
                      src={img.src}
                      alt={img.caption}
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 55vw"
                    />
                  ) : null}
                  <div className="locus-reco-media-fade" aria-hidden />
                  <div className="locus-reco-media-caption">
                    <p className="font-mono text-[10px] tracking-[0.12em] text-white/70">
                      01 · {top.university.city.toUpperCase()}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-[1.45rem] tracking-tight text-white sm:text-[1.75rem]">
                      {top.university.name}
                    </p>
                  </div>
                </div>
                <div className="locus-reco-copy">
                  <div className="flex items-center justify-between gap-3">
                    <p className="meta">Fit {top.fitIndex}</p>
                    <StatusBadge status="good" />
                  </div>
                  <div className="locus-why-rail mt-4">
                    <p className="label">Match reasons</p>
                    <p className="mt-1.5 text-[14px] leading-6 text-secondary">{top.why}</p>
                  </div>
                  <button
                    type="button"
                    className="locus-why-toggle"
                    aria-expanded={whyOpen}
                    onClick={() => setWhyOpen((v) => !v)}
                  >
                    {whyOpen ? "Hide explanation" : "Reveal why this fits you"}
                  </button>
                  <div className={cn("locus-why-panel", whyOpen && "is-open")}>
                    <div className="locus-why-panel-inner">
                      <p className="text-[13.5px] leading-6 text-secondary">
                        Sample explanation tied to the deterministic match — not a chatbot reply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 3 — Compare as editorial columns */}
        {top && second ? (
          <div className="locus-story-block">
            <div className="locus-story-index">
              <span className="meta">03</span>
              <span className="locus-story-line" aria-hidden />
              <span className="label">Compare</span>
            </div>
            <div className="locus-story-body">
              <h3 className="locus-story-title">Meaningful differences only</h3>
              <div className="locus-story-compare">
                {[top, second].map((row) => {
                  const cimg = sampleCampus(row.university.id);
                  return (
                    <div key={row.university.id}>
                      <div className="locus-story-compare-media">
                        {cimg ? (
                          <Image
                            src={cimg.src}
                            alt={cimg.caption}
                            fill
                            className="object-cover"
                            sizes="400px"
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 text-[15px] font-medium">{row.university.shortName}</p>
                      <p className="meta">Fit {row.fitIndex}</p>
                      <p className="mt-2 text-[13px] leading-5 text-secondary line-clamp-3">
                        {row.university.aid.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 4 — Next action focal */}
        {SAMPLE_NEXT ? (
          <div className="locus-story-block locus-story-act">
            <div className="locus-story-index">
              <span className="meta">04</span>
              <span className="locus-story-line" aria-hidden />
              <span className="label">Next action</span>
            </div>
            <div className="locus-story-body">
              <div className="locus-next locus-next-lg">
                <span className="locus-next-rail" aria-hidden />
                <div>
                  <h3 className="locus-display-sm">{SAMPLE_NEXT.title}</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-7 text-secondary">
                    {SAMPLE_NEXT.reason}
                  </p>
                  <div className="locus-next-meta mt-6">
                    <div>
                      <p className="caption">Deadline</p>
                      <p className="text-[14px] font-medium">{SAMPLE_NEXT.deadline}</p>
                    </div>
                    <div>
                      <p className="caption">Effort</p>
                      <p className="text-[14px] font-medium">{SAMPLE_NEXT.effort}</p>
                    </div>
                    <StatusBadge status="todo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

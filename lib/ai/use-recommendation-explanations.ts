"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildRecommendationExplanationContext,
  fallbackRecommendationExplanation,
  recommendationExplanationCacheKey,
  type RecommendationExplanation,
  type RecommendationExplanationContext,
} from "@/lib/ai/recommendation-explanation-shared";
import type { Profile, RankedUniversity } from "@/lib/types";

type ExplanationEntry = {
  cacheKey: string;
  explanation: RecommendationExplanation;
  pending: boolean;
};

const BATCH_SIZE = 2;

/**
 * Progressive recommendation explanations.
 * Seeds deterministic fallbacks immediately, then upgrades in small batches.
 * Aborts and rebuilds when the ranked set / profile context changes.
 * Stale async responses cannot overwrite a newer route context.
 */
export function useRecommendationExplanations(
  profile: Profile,
  rows: RankedUniversity[],
  enabled: boolean,
) {
  const contexts = useMemo(
    () => rows.map((row) => buildRecommendationExplanationContext(profile, row)),
    [profile, rows],
  );

  const listKey = useMemo(
    () => contexts.map((c) => recommendationExplanationCacheKey(c)).join("|"),
    [contexts],
  );

  const [byUniversityId, setByUniversityId] = useState<Record<string, ExplanationEntry>>(
    {},
  );
  const generationRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setByUniversityId({});
      return;
    }

    const generation = ++generationRef.current;
    const seed: Record<string, ExplanationEntry> = {};
    for (const context of contexts) {
      const cacheKey = recommendationExplanationCacheKey(context);
      seed[context.university.id] = {
        cacheKey,
        explanation: fallbackRecommendationExplanation(context),
        pending: true,
      };
    }
    setByUniversityId(seed);

    const ac = new AbortController();

    (async () => {
      for (let i = 0; i < contexts.length; i += BATCH_SIZE) {
        if (ac.signal.aborted || generationRef.current !== generation) return;
        const chunk = contexts.slice(i, i + BATCH_SIZE);
        const chunkKeys = chunk.map((c) => recommendationExplanationCacheKey(c));
        try {
          const res = await fetch("/api/ai/recommendation-explanation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contexts: chunk }),
            signal: ac.signal,
          });
          const data = (await res.json()) as {
            results?: {
              explanation?: RecommendationExplanation;
            }[];
          };
          if (ac.signal.aborted || generationRef.current !== generation) return;

          setByUniversityId((prev) => {
            if (generationRef.current !== generation) return prev;
            const next = { ...prev };
            chunk.forEach((context, index) => {
              const cacheKey = chunkKeys[index];
              const current = next[context.university.id];
              // Drop updates that no longer match the seeded context for this campus.
              if (current && current.cacheKey !== cacheKey) return;

              const explanation = data.results?.[index]?.explanation;
              if (
                explanation &&
                typeof explanation.whyItFits === "string" &&
                Array.isArray(explanation.keyReasons)
              ) {
                next[context.university.id] = {
                  cacheKey,
                  explanation,
                  pending: false,
                };
              } else {
                next[context.university.id] = {
                  cacheKey,
                  explanation: fallbackRecommendationExplanation(context),
                  pending: false,
                };
              }
            });
            return next;
          });
        } catch {
          if (ac.signal.aborted || generationRef.current !== generation) return;
          setByUniversityId((prev) => {
            if (generationRef.current !== generation) return prev;
            const next = { ...prev };
            for (const context of chunk) {
              const cacheKey = recommendationExplanationCacheKey(context);
              const current = next[context.university.id];
              if (current && current.cacheKey !== cacheKey) continue;
              next[context.university.id] = {
                cacheKey,
                explanation: fallbackRecommendationExplanation(context),
                pending: false,
              };
            }
            return next;
          });
        }
      }
    })();

    return () => {
      ac.abort();
    };
    // listKey captures profile + recommendation identity; rebuild when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, listKey]);

  const getExplanation = (universityId: string, context: RecommendationExplanationContext) => {
    const cacheKey = recommendationExplanationCacheKey(context);
    const entry = byUniversityId[universityId];
    if (entry && entry.cacheKey === cacheKey) {
      return { explanation: entry.explanation, pending: entry.pending };
    }
    return {
      explanation: fallbackRecommendationExplanation(context),
      pending: true,
    };
  };

  return { byUniversityId, contexts, getExplanation, listKey };
}

export type { RecommendationExplanation, RecommendationExplanationContext };

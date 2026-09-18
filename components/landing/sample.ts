/**
 * Presentation-only sample for the landing preview.
 * Reads existing demo engines — does not change matching/roadmap/AI.
 */
import { synthesize } from "@/lib/diagnosis";
import { recommended } from "@/lib/matching";
import { campusImage } from "@/lib/media";
import { buildRoadmap } from "@/lib/roadmap";
import { demoProfile } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";

export const SAMPLE_PROFILE = demoProfile;

export const SAMPLE_DIAGNOSIS = synthesize(demoProfile);

export const SAMPLE_MATCHES = recommended(demoProfile, 3);

export const SAMPLE_ROADMAP = buildRoadmap(demoProfile, SAMPLE_MATCHES);

export const SAMPLE_NEXT = SAMPLE_ROADMAP[0];

export const SAMPLE_FIELD = fieldLabels[demoProfile.field] ?? "Computer science";

export const SAMPLE_COUNTRIES = demoProfile.countries
  .map((id) => countryLabels[id] ?? id)
  .join(" · ");

export function sampleCampus(id: string) {
  return campusImage(id);
}

export const JOURNEY_STAGES = [
  {
    id: "profile" as const,
    n: "01",
    label: "Profile",
    title: "Build the dossier",
    detail:
      "Academics, exams you already finished, interests, aid need, budget, and countries — the facts the route will respect.",
  },
  {
    id: "understand" as const,
    n: "02",
    label: "Understand",
    title: "Read the signals",
    detail:
      "Strong signals and constraints become a transparent diagnosis — not a black-box score.",
  },
  {
    id: "explore" as const,
    n: "03",
    label: "Explore",
    title: "See why campuses fit",
    detail:
      "Each recommendation leads with match reasons, then a quieter “Why this fits you” explanation.",
  },
  {
    id: "decide" as const,
    n: "04",
    label: "Decide",
    title: "Compare tradeoffs",
    detail:
      "Put two or more campuses side by side on aid, requirements, and deadlines that matter.",
  },
  {
    id: "act" as const,
    n: "05",
    label: "Act",
    title: "Follow the next action",
    detail:
      "A monthly roadmap with one clear Next Action — exams already done stay off the list.",
  },
] as const;

export type StageId = (typeof JOURNEY_STAGES)[number]["id"];

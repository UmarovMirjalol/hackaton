import type { Profile } from "./types";

export type OnboardingStepId =
  | "academic"
  | "testing"
  | "activities"
  | "interests"
  | "place"
  | "aid"
  | "goals";

export type OnboardingStep = {
  id: OnboardingStepId;
  number: number;
  label: string;
  title: string;
  purpose: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "academic",
    number: 1,
    label: "Academics",
    title: "Your academic profile",
    purpose: "Who you are, your curriculum, and the grades Route will use.",
  },
  {
    id: "testing",
    number: 2,
    label: "Testing",
    title: "Exams on file",
    purpose: "Finished tests leave the roadmap. Planned ones become tasks.",
  },
  {
    id: "activities",
    number: 3,
    label: "Activities",
    title: "Activities & achievements",
    purpose: "Optional context for research and builder fit — never invented rankings.",
  },
  {
    id: "interests",
    number: 4,
    label: "Interests",
    title: "Academic interests",
    purpose: "What you want to study, and what a campus should be good at.",
  },
  {
    id: "place",
    number: 5,
    label: "Places",
    title: "Countries & preferences",
    purpose: "Where you will apply. Unchecked countries leave the shortlist.",
  },
  {
    id: "aid",
    number: 6,
    label: "Aid",
    title: "Financial & aid preferences",
    purpose: "Aid policy is the most common reason a campus should drop off.",
  },
  {
    id: "goals",
    number: 7,
    label: "Goals",
    title: "Goals & readiness",
    purpose: "Letters, research experience, and a final check before analysis.",
  },
];

export function validateStep(stepId: OnboardingStepId, p: Profile): string | null {
  switch (stepId) {
    case "academic":
      if (!p.firstName.trim()) return "Enter a first name to continue.";
      if (!p.homeCountry.trim()) return "Enter your home country.";
      return null;
    case "testing":
      if (p.satStatus === "done" && !p.satMath.trim()) {
        return "Add your SAT Math score, or change SAT status.";
      }
      if (p.englishExam !== "none" && !p.englishScore.trim()) {
        return "Add your English exam score, or choose None yet.";
      }
      return null;
    case "activities":
      return null;
    case "interests":
      if (!p.field) return "Select a field of study.";
      if (!p.interests.length) return "Pick at least one campus strength.";
      return null;
    case "place":
      if (!p.countries.length) return "Select at least one country.";
      return null;
    case "aid":
      if (!p.aidNeed) return "Select an aid preference.";
      return null;
    case "goals":
      if (!p.firstName.trim() || !p.field || !p.countries.length || !p.aidNeed || !p.interests.length) {
        return "Finish earlier steps before analyzing.";
      }
      return null;
    default:
      return null;
  }
}

export function profileReady(p: Profile) {
  return Boolean(
    p.firstName.trim() &&
      p.homeCountry.trim() &&
      p.field &&
      p.countries.length &&
      p.aidNeed &&
      p.interests.length,
  );
}

export function clampOnboardingStep(step: number) {
  const max = ONBOARDING_STEPS.length - 1;
  if (!Number.isFinite(step)) return 0;
  return Math.min(max, Math.max(0, Math.floor(step)));
}

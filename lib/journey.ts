import type { Profile } from "./types";
import { profileReady } from "./onboarding";

export const JOURNEY = [
  { href: "/onboarding", id: "profile", label: "Profile" },
  { href: "/analyze", id: "analyze", label: "Analyze" },
  { href: "/results", id: "results", label: "Results" },
  { href: "/compare", id: "compare", label: "Compare" },
  { href: "/roadmap", id: "route", label: "Roadmap" },
] as const;

export { profileReady };

export function profileCompleteness(p: Profile) {
  const checks = [
    p.firstName,
    p.homeCountry,
    p.gpa,
    p.countries.length,
    p.field,
    p.englishExam !== "none" ? p.englishScore : true,
    p.satStatus === "done" ? p.satMath : true,
    p.interests.length,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function journeyIndex(pathname: string) {
  if (pathname.startsWith("/profile")) return 0;
  if (pathname.startsWith("/diagnosis") || pathname.startsWith("/universities")) return 2;
  const i = JOURNEY.findIndex((s) => pathname.startsWith(s.href));
  return i === -1 ? 0 : i;
}

export function stepComplete(id: string, pathname: string, profile: Profile) {
  const idx = journeyIndex(pathname);
  const stepIdx = JOURNEY.findIndex((s) => s.id === id);
  if (stepIdx < idx) return true;
  if (id === "profile") return profileReady(profile);
  return false;
}

import type { Profile } from "./types";

export const JOURNEY = [
  { href: "/profile", id: "profile", label: "Profile" },
  { href: "/diagnosis", id: "insights", label: "Insights" },
  { href: "/universities", id: "matches", label: "Matches" },
  { href: "/compare", id: "compare", label: "Compare" },
  { href: "/roadmap", id: "route", label: "Route" },
] as const;

export function profileReady(p: Profile) {
  return Boolean(p.firstName && p.homeCountry && p.field);
}

export function profileCompleteness(p: Profile) {
  const checks = [
    p.firstName,
    p.homeCountry,
    p.gpa,
    p.countries.length,
    p.field,
    p.englishExam !== "none" ? p.englishScore : true,
    p.satStatus === "done" ? p.satMath : true,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function journeyIndex(pathname: string) {
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

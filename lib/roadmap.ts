import type { Profile, RankedUniversity, RoadmapTask } from "./types";

export function buildRoadmap(
  profile: Profile,
  picks: RankedUniversity[],
): RoadmapTask[] {
  const tasks: RoadmapTask[] = [];
  const hasUS = picks.some((p) => p.university.countryId === "us");
  const hasUK = picks.some((p) => p.university.countryId === "uk");
  const hasCA = picks.some((p) => p.university.countryId === "ca");
  const needsAid = profile.aidNeed === "full" || profile.aidNeed === "substantial";
  const junior = profile.gradYear === 2028;

  if (profile.satStatus === "planned" && hasUS) {
    tasks.push({
      id: "sat",
      month: junior ? "MARCH" : "OCTOBER",
      title: junior ? "Sit a first SAT while you still have a spare sitting" : "Register for the October SAT",
      reason:
        "Your U.S. shortlist still treats a score as useful, and you marked the SAT as planned — not done.",
      deadline: junior ? "March 2027 test date" : "September registration · October test",
      effort: "4–8 hours to register and lock a prep block",
      source: { label: "College Board SAT dates", url: "https://satsuite.collegeboard.org/sat/dates" },
    });
  }

  if (profile.englishExam === "none" && (hasUK || hasCA || picks.some((p) => ["nl", "de", "ch"].includes(p.university.countryId)))) {
    tasks.push({
      id: "english",
      month: "OCTOBER",
      title: "Book IELTS Academic or TOEFL",
      reason:
        "No English-proficiency exam is on file, and at least one campus on this route still asks for one.",
      deadline: "Sit by December so scores arrive before January deadlines",
      effort: "One Saturday + 2 weeks of light prep",
    });
  }

  tasks.push({
    id: "shortlist",
    month: "SEPTEMBER",
    title: "Lock a working shortlist of 6–8 campuses",
    reason: `Start from the ${picks.length} Route recommendations, then add one safer academic fit and one that is only about funding.`,
    deadline: "End of September",
    effort: "2 evenings",
    universityIds: picks.map((p) => p.university.id),
  });

  if (!profile.recLettersStarted) {
    tasks.push({
      id: "recs",
      month: "SEPTEMBER",
      title: "Ask two teachers for recommendations",
      reason:
        "U.S. files and some Canadian/UK references take weeks. You have not marked letters as started.",
      deadline: "Ask by 30 September",
      effort: "One thoughtful email each",
    });
  }

  if (needsAid && hasUS) {
    tasks.push({
      id: "css",
      month: "OCTOBER",
      title: "Complete CSS Profile / institutional aid forms",
      reason:
        "You need substantial or full aid. Several U.S. campuses in this catalog will not read a file without financial documents.",
      deadline: "Often as early as November; confirm per campus",
      effort: "One weekend with a parent or guardian",
      source: { label: "CSS Profile", url: "https://cssprofile.collegeboard.org/" },
    });
  }

  if (hasUK) {
    tasks.push({
      id: "ucas",
      month: "OCTOBER",
      title: "Draft the UCAS personal statement",
      reason: "UK campuses on this route share one statement. It should be written around the subject, not around activities.",
      deadline: "Mid-January equal-consideration (Oxbridge/medicine earlier — not on this shortlist)",
      effort: "3 focused drafts",
      source: { label: "UCAS undergraduate", url: "https://www.ucas.com/" },
    });
  }

  tasks.push({
    id: "essays",
    month: "NOVEMBER",
    title: "Finish the personal essay and two supplements",
    reason: "The diagnosis already has a point of view. The essay should evidence it, not invent a new one.",
    deadline: "Before the earliest November deadline on the shortlist",
    effort: "2–3 weeks, not a single night",
  });

  const early = picks.find((p) =>
    p.university.deadlines.some((d) => d.label.toLowerCase().includes("early")),
  );
  if (early && !junior) {
    tasks.push({
      id: "early",
      month: "NOVEMBER",
      title: `Decide whether to use ${early.university.shortName}'s early round`,
      reason:
        "Early only helps if the campus is a genuine first choice and the aid policy is still acceptable. It is not automatically smarter.",
      deadline: early.university.deadlines.find((d) => d.label.toLowerCase().includes("early"))?.date ?? "Nov 1",
      effort: "One family conversation",
      universityIds: [early.university.id],
      source: early.university.sources[0],
    });
  }

  if (hasCA) {
    tasks.push({
      id: "ouac",
      month: "DECEMBER",
      title: "Submit OUAC / Canadian applications",
      reason: "Waterloo and Toronto are on a different form than Common App. Do not leave them as an afterthought.",
      deadline: "Mid-January for many programmes",
      effort: "One dedicated afternoon plus predicted grades",
    });
  }

  tasks.push({
    id: "regular",
    month: "JANUARY",
    title: "Submit remaining applications",
    reason: "Regular deadlines in this catalog cluster in early January. Build a checklist per campus, not a single pile.",
    deadline: "6 January typical U.S. regular / 14–15 January UCAS & OUAC",
    effort: "Administrative, if essays are already done",
  });

  if (junior) {
    return tasks.map((t) => ({
      ...t,
      month: t.month === "SEPTEMBER" ? "JANUARY" : t.month,
      reason: `${t.reason} You graduate in 2028, so this is a junior-year version of the same route.`,
    }));
  }

  const order = ["SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER", "JANUARY", "MARCH"];
  return tasks.sort((a, b) => order.indexOf(a.month) - order.indexOf(b.month));
}

export function nextTask(tasks: RoadmapTask[], status: Record<string, string>) {
  return tasks.find((t) => status[t.id] !== "done") ?? tasks[0];
}

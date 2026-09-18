import type {
  AidNeed,
  Factor,
  FactorKey,
  Profile,
  RankedUniversity,
  University,
} from "./types";
import { fieldLabels, universities } from "./universities";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseScore(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function academicScore(profile: Profile, uni: University) {
  let score = uni.programs.includes(profile.field) ? 86 : 28;
  if (profile.field === "undecided" && uni.programs.includes("undecided")) score = 78;
  if (profile.field === "economics" && uni.id === "lse") score = 96;
  if (profile.field === "cs" && (uni.id === "mit" || uni.id === "waterloo" || uni.id === "gatech")) {
    score = 94;
  }
  const gpa = parseScore(profile.gpa);
  if (profile.gpaScale === "4.0" && gpa !== null) {
    if (gpa >= 3.8) score += 6;
    else if (gpa >= 3.5) score += 2;
    else score -= 12;
  }
  if (profile.gpaScale === "ib" && gpa !== null) {
    if (gpa >= 38) score += 6;
    else if (gpa < 32) score -= 10;
  }
  return clamp(score);
}

function aidScore(profile: Profile, uni: University) {
  const need = profile.aidNeed;
  const budget = parseScore(profile.annualBudget) ?? 0;

  if (need === "none" || budget >= 50000) {
    if (uni.aid.kind === "low-tuition") return 78;
    return 72;
  }

  if (need === "full") {
    switch (uni.aid.kind) {
      case "meets-full-need":
        return 94;
      case "generous-need":
        return 90;
      case "need-aware-intl":
        return 70;
      case "low-tuition":
        return budget >= 15000 || uni.tuitionIntlUsd <= 18000 ? 82 : 60;
      case "limited-intl":
        return uni.tuitionIntlUsd <= 20000 ? 48 : 22;
    }
  }

  if (need === "substantial") {
    switch (uni.aid.kind) {
      case "meets-full-need":
      case "generous-need":
        return 88;
      case "need-aware-intl":
        return 74;
      case "low-tuition":
        return 86;
      case "limited-intl":
        return uni.tuitionIntlUsd <= 35000 ? 50 : 34;
    }
  }

  // some need
  switch (uni.aid.kind) {
    case "meets-full-need":
    case "generous-need":
      return 80;
    case "low-tuition":
      return 88;
    case "need-aware-intl":
      return 68;
    case "limited-intl":
      return 55;
  }
}

function locationScore(profile: Profile, uni: University) {
  if (profile.countries.includes(uni.countryId)) return 92;
  return 18;
}

function researchScore(profile: Profile, uni: University) {
  const wantsResearch = profile.interests.includes("research");
  if (!wantsResearch) return uni.research === "high" ? 64 : 70;
  if (uni.research === "high") {
    return profile.researchExperience ? 92 : 84;
  }
  return 52;
}

function testingScore(profile: Profile, uni: University) {
  let score = 70;
  const math = parseScore(profile.satMath);
  const ebrw = parseScore(profile.satEbrw);
  if (uni.countryId === "us") {
    if (profile.satStatus === "done" && math !== null) {
      score = math >= 750 ? 90 : math >= 700 ? 78 : 58;
      if (ebrw !== null && ebrw < 650) score -= 8;
    } else if (profile.satStatus === "skip") {
      score = 62;
    } else {
      score = 68;
    }
  }
  if (uni.countryId === "uk" || uni.countryId === "nl" || uni.countryId === "ca") {
    if (profile.englishExam === "ielts") {
      const ielts = parseScore(profile.englishScore);
      if (ielts !== null) score = ielts >= 7 ? 90 : ielts >= 6.5 ? 78 : 50;
    } else if (profile.englishExam === "toefl") {
      const toefl = parseScore(profile.englishScore);
      if (toefl !== null) score = toefl >= 100 ? 88 : toefl >= 90 ? 74 : 50;
    } else if (profile.homeCountry && ["United States", "United Kingdom", "Canada", "Ireland", "Australia"].includes(profile.homeCountry)) {
      score = 86;
    } else {
      score = 55;
    }
  }
  if (uni.id === "tum" || uni.id === "eth") {
    score = Math.min(score, 58);
  }
  return clamp(score);
}

function aidTone(profile: Profile, uni: University, score: number): Factor["tone"] {
  if (profile.aidNeed === "full" && uni.aid.kind === "limited-intl") return "watch";
  if (score >= 75) return "good";
  if (score >= 50) return "mixed";
  return "watch";
}

function factorDetail(
  key: FactorKey,
  profile: Profile,
  uni: University,
  score: number,
): Factor {
  if (key === "aid") {
    return {
      key,
      label: "Financial aid",
      value:
        score >= 80
          ? "Plausible path"
          : score >= 50
            ? "Possible, not guaranteed"
            : "Weak aid path",
      detail: uni.aid.summary,
      tone: aidTone(profile, uni, score),
    };
  }
  if (key === "research") {
    return {
      key,
      label: "Research",
      value: uni.research === "high" ? "Undergraduate research is normal here" : "More course-driven",
      detail: uni.notes,
      tone: score >= 75 ? "good" : "mixed",
    };
  }
  if (key === "academic") {
    const overlap = uni.programs.includes(profile.field);
    return {
      key,
      label: "Academic fit",
      value: overlap
        ? `Offers ${fieldLabels[profile.field]}`
        : `${fieldLabels[profile.field]} is not a core programme`,
      detail: overlap
        ? `Listed against ${uni.shortName}'s undergraduate strengths.`
        : "This campus stays in the list only if other constraints still make it useful to investigate.",
      tone: overlap ? "good" : "watch",
    };
  }
  if (key === "location") {
    const wanted = profile.countries.includes(uni.countryId);
    return {
      key,
      label: "Location",
      value: wanted ? `Inside your country list` : `Outside your country list`,
      detail: `${uni.city}, ${uni.country}.`,
      tone: wanted ? "good" : "watch",
    };
  }
  return {
    key,
    label: "Selectivity",
    value:
      uni.selectivity === "extremely"
        ? "Extremely selective"
        : uni.selectivity === "very"
          ? "Very selective"
          : "Selective, not extreme",
    detail:
      "Selectivity describes the pool, not your chance. Route does not estimate admit probability.",
    tone: "mixed",
  };
}

function whyText(profile: Profile, uni: University, scores: Record<FactorKey, number>) {
  const field = fieldLabels[profile.field].toLowerCase();
  const aidNeed: Record<AidNeed, string> = {
    none: "you can fund the degree without institutional aid",
    some: "you will likely need some institutional help",
    substantial: "you need substantial aid or a low-tuition system",
    full: "you need a realistic full-aid or low-tuition path",
  };

  const aidClause =
    scores.aid >= 80
      ? `${uni.shortName}'s funding model is one of the few in this catalog that can coexist with ${aidNeed[profile.aidNeed]}.`
      : scores.aid >= 50
        ? `Aid is uncertain here — ${uni.aid.summary}`
        : `Treat this as a stretch on money: ${uni.aid.summary}`;

  const academicClause = uni.programs.includes(profile.field)
    ? `It stays on the list because ${field} is a real undergraduate path here`
    : `Academic overlap with ${field} is thin`;

  const researchClause = profile.interests.includes("research")
    ? uni.research === "high"
      ? "and research is structurally available to undergraduates."
      : "though research access is less central than at some peers."
    : "and it matches a more course- or career-led plan.";

  return `${academicClause} ${researchClause} ${aidClause}`;
}

export function rankUniversities(profile: Profile): RankedUniversity[] {
  return universities
    .map((university) => {
      const testing = testingScore(profile, university);
      const scores: Record<FactorKey, number> = {
        academic: academicScore(profile, university),
        aid: aidScore(profile, university),
        location: locationScore(profile, university),
        research: researchScore(profile, university),
        selectivity: university.selectivity === "moderately" ? 70 : university.selectivity === "very" ? 58 : 46,
      };
      const fitIndex = clamp(
        scores.academic * 0.3 +
          scores.aid * 0.25 +
          scores.location * 0.2 +
          scores.research * 0.15 +
          testing * 0.1,
      );
      return {
        university,
        fitIndex,
        why: whyText(profile, university, scores),
        factors: (["aid", "research", "academic", "location", "selectivity"] as FactorKey[]).map(
          (key) => factorDetail(key, profile, university, scores[key]),
        ),
        scores: { ...scores, selectivity: scores.selectivity },
      };
    })
    .filter((row) => row.scores.location >= 18)
    .sort((a, b) => b.fitIndex - a.fitIndex);
}

export function recommended(profile: Profile, limit = 5) {
  const ranked = rankUniversities(profile);
  const inCountry = ranked.filter((r) => profile.countries.includes(r.university.countryId));
  const pool = inCountry.length >= 3 ? inCountry : ranked;
  return pool.slice(0, limit);
}

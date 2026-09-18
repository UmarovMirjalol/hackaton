import type { Diagnosis, Profile } from "./types";
import { fieldLabels } from "./universities";

function satLine(profile: Profile) {
  if (profile.satStatus === "done" && profile.satMath) {
    return `${profile.satMath} Math SAT${profile.satEbrw ? ` / ${profile.satEbrw} ERW` : ""}`;
  }
  if (profile.satStatus === "planned") return "SAT is planned, not yet on file";
  return "No SAT on this route";
}

function englishLine(profile: Profile) {
  if (profile.englishExam === "none") return "No English-proficiency exam on file";
  const name = profile.englishExam.toUpperCase();
  return profile.englishScore ? `${name} ${profile.englishScore}` : `${name} listed without a score`;
}

function gpaLine(profile: Profile) {
  if (!profile.gpa) return "GPA not provided";
  if (profile.gpaScale === "ib") return `IB ${profile.gpa}`;
  if (profile.gpaScale === "100") return `${profile.gpa} / 100`;
  return `${profile.gpa} / 4.0`;
}

function parseFinite(value: string): number | null {
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/** GPA only counts when it fits the declared scale — blocks junk like "123123". */
function validGpa(profile: Profile): number | null {
  const gpa = parseFinite(profile.gpa);
  if (gpa === null) return null;
  if (profile.gpaScale === "4.0") return gpa >= 0 && gpa <= 4.33 ? gpa : null;
  if (profile.gpaScale === "100") return gpa >= 0 && gpa <= 100 ? gpa : null;
  if (profile.gpaScale === "ib") return gpa >= 0 && gpa <= 45 ? gpa : null;
  return null;
}

/** SAT section scores are 200–800. */
function validSatSection(value: string): number | null {
  const n = parseFinite(value);
  if (n === null) return null;
  return n >= 200 && n <= 800 ? n : null;
}

function validEnglishScore(profile: Profile): number | null {
  const n = parseFinite(profile.englishScore);
  if (n === null) return null;
  if (profile.englishExam === "ielts") return n >= 0 && n <= 9 ? n : null;
  if (profile.englishExam === "toefl") return n >= 0 && n <= 120 ? n : null;
  if (profile.englishExam === "duolingo") return n >= 10 && n <= 160 ? n : null;
  return null;
}

/**
 * Free-text only becomes a strength when it looks like a real note —
 * not empty, not digits-only, not a few random characters.
 */
export function isSubstantiveProfileText(value: string): boolean {
  const text = value.trim();
  if (text.length < 8) return false;
  if (!/[A-Za-z\u00C0-\u024F]/.test(text)) return false;
  const letters = text.replace(/[^A-Za-z\u00C0-\u024F]/g, "");
  if (letters.length < 4) return false;
  // Reject mostly-numeric noise like "123123 abc"
  const digits = text.replace(/\D/g, "");
  if (digits.length >= 6 && digits.length >= letters.length) return false;
  return true;
}

export function synthesize(profile: Profile): Diagnosis {
  const field = profile.field ? fieldLabels[profile.field] : "Undeclared field";
  const research = profile.interests.includes("research");
  const building = profile.interests.includes("building");

  const title =
    research && building
      ? "Research-oriented builder"
      : research
        ? "Research-first applicant"
        : building
          ? "Builder looking for a technical path"
          : profile.field === "economics"
            ? "Quantitatively inclined social scientist"
            : "Focused undergraduate applicant";

  const strengths: Diagnosis["strengths"] = [];
  const math = validSatSection(profile.satMath);
  const gpa = validGpa(profile);

  if (profile.satStatus === "done" && math !== null && math >= 740) {
    strengths.push({
      label: "Strong quantitative preparation",
      evidence: satLine(profile),
    });
  } else if (gpa !== null && profile.gpaScale === "4.0" && gpa >= 3.7) {
    strengths.push({
      label: "Consistently high school record",
      evidence: gpaLine(profile),
    });
  } else if (gpa !== null && profile.gpaScale === "ib" && gpa >= 38) {
    strengths.push({
      label: "Consistently high school record",
      evidence: gpaLine(profile),
    });
  } else if (gpa !== null && profile.gpaScale === "100" && gpa >= 90) {
    strengths.push({
      label: "Consistently high school record",
      evidence: gpaLine(profile),
    });
  }

  if (profile.researchExperience) {
    strengths.push({
      label: "Prior research experience",
      evidence:
        "You marked undergraduate-style research as already done — that belongs in the diagnosis, not just the form.",
    });
  }

  if (isSubstantiveProfileText(profile.activities)) {
    strengths.push({
      label: "Activities on file",
      evidence: profile.activities.trim(),
    });
  }

  if (isSubstantiveProfileText(profile.achievements)) {
    strengths.push({
      label: "Achievements on file",
      evidence: profile.achievements.trim(),
    });
  }

  if (profile.englishExam !== "none" && validEnglishScore(profile) !== null) {
    strengths.push({
      label: "English-proficiency exam already complete",
      evidence: englishLine(profile),
    });
  }

  if (profile.curriculum === "ib") {
    strengths.push({
      label: `${profile.curriculum.toUpperCase()} curriculum`,
      evidence: "IB is widely understood by the universities in this catalog.",
    });
  }

  const constraints: Diagnosis["constraints"] = [];
  if (profile.aidNeed === "full") {
    constraints.push({
      label: "Full financial aid required",
      evidence: profile.annualBudget
        ? `Family contribution around $${Number(profile.annualBudget).toLocaleString()}/year`
        : "You asked for a full-need path.",
    });
  } else if (profile.aidNeed === "substantial") {
    constraints.push({
      label: "Substantial aid required",
      evidence: "Recommendations prefer low-tuition systems or colleges that still meet need.",
    });
  }

  if (profile.countries.length > 0 && profile.countries.length <= 2) {
    constraints.push({
      label: `Country list is tight (${profile.countries.length})`,
      evidence: "A short country list makes aid policy at each campus more decisive.",
    });
  }

  const goals: Diagnosis["goals"] = [
    {
      label: field,
      evidence: `Primary academic direction: ${field.toLowerCase()}.`,
    },
  ];
  if (research) {
    goals.push({
      label: "Undergraduate research",
      evidence: "Campuses where research is structurally available are ranked higher.",
    });
  }

  const gaps: string[] = [];
  if (!profile.gpa.trim()) {
    gaps.push("No GPA yet — academic strength is inferred from tests and curriculum only.");
  } else if (validGpa(profile) === null) {
    gaps.push("GPA value does not match the selected scale, so it is not counted as an academic strength.");
  }
  if (profile.satStatus === "done" && profile.satMath.trim() && validSatSection(profile.satMath) === null) {
    gaps.push("SAT Math is outside the 200–800 range, so it is not counted as a strength.");
  }
  if (profile.satStatus === "planned") {
    gaps.push("SAT is planned. U.S. recommendations assume a score will exist by application time.");
  }
  if (
    profile.englishExam === "none" &&
    !["United States", "United Kingdom", "Canada", "Ireland", "Australia"].includes(profile.homeCountry)
  ) {
    gaps.push("No English exam on file. UK, Dutch, and many Canadian programmes will still ask for one.");
  }
  if (!profile.researchExperience && research) {
    gaps.push(
      "You want research, but have not logged prior research. That is fine — the roadmap will treat it as something to show, not as a fact.",
    );
  }
  const hasActivityText = Boolean(profile.activities.trim() || profile.achievements.trim());
  const hasSubstantiveActivity =
    isSubstantiveProfileText(profile.activities) || isSubstantiveProfileText(profile.achievements);
  if (!hasActivityText) {
    gaps.push("No activities or achievements text yet — matching relies more on academics and interests.");
  } else if (!hasSubstantiveActivity) {
    gaps.push(
      "Activities/achievements need a short real description (roles, projects, awards) — placeholders are not counted as strengths.",
    );
  }
  if (!profile.firstName) gaps.push("Name is empty. The route still runs; documents will use a placeholder.");

  const aidPhrase =
    profile.aidNeed === "full"
      ? "a full-aid constraint"
      : profile.aidNeed === "none"
        ? "no aid constraint"
        : profile.aidNeed
          ? "a partial aid constraint"
          : "aid preference still unset";

  const summary = `${profile.firstName || "This student"} is a ${profile.gradYear} applicant from ${profile.homeCountry || "an unspecified country"}, aiming at ${field.toLowerCase()} with ${aidPhrase}. Route is ranking campuses against those facts — not against a guessed admissions chance.`;

  return { title, summary, strengths, constraints, goals, gaps };
}

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

export function synthesize(profile: Profile): Diagnosis {
  const field = fieldLabels[profile.field];
  const research = profile.interests.includes("research");
  const building = profile.interests.includes("building");

  const title = research && building
    ? "Research-oriented builder"
    : research
      ? "Research-first applicant"
      : building
        ? "Builder looking for a technical path"
        : profile.field === "economics"
          ? "Quantitatively inclined social scientist"
          : "Focused undergraduate applicant";

  const strengths: Diagnosis["strengths"] = [];
  const math = Number(profile.satMath);
  if (profile.satStatus === "done" && Number.isFinite(math) && math >= 740) {
    strengths.push({
      label: "Strong quantitative preparation",
      evidence: satLine(profile),
    });
  } else if (profile.gpa && Number(profile.gpa) >= 3.7 && profile.gpaScale === "4.0") {
    strengths.push({
      label: "Consistently high school record",
      evidence: gpaLine(profile),
    });
  } else if (profile.gpa) {
    strengths.push({
      label: "Academic record on file",
      evidence: gpaLine(profile),
    });
  }

  if (profile.researchExperience) {
    strengths.push({
      label: "Prior research experience",
      evidence: "You marked undergraduate-style research as already done — that belongs in the diagnosis, not just the form.",
    });
  }

  if (profile.englishExam !== "none" && profile.englishScore) {
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

  if (profile.countries.length <= 2) {
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
  if (!profile.gpa) gaps.push("No GPA yet — academic strength is inferred from tests and curriculum only.");
  if (profile.satStatus === "planned") gaps.push("SAT is planned. U.S. recommendations assume a score will exist by application time.");
  if (profile.englishExam === "none" && !["United States", "United Kingdom", "Canada", "Ireland", "Australia"].includes(profile.homeCountry)) {
    gaps.push("No English exam on file. UK, Dutch, and many Canadian programmes will still ask for one.");
  }
  if (!profile.researchExperience && research) {
    gaps.push("You want research, but have not logged prior research. That is fine — the roadmap will treat it as something to show, not as a fact.");
  }
  if (!profile.firstName) gaps.push("Name is empty. The route still runs; documents will use a placeholder.");

  const summary = `${profile.firstName || "This student"} is a ${profile.gradYear} applicant from ${profile.homeCountry || "an unspecified country"}, aiming at ${field.toLowerCase()} with ${profile.aidNeed === "full" ? "a full-aid constraint" : profile.aidNeed === "none" ? "no aid constraint" : "a partial aid constraint"}. Route is ranking campuses against those facts — not against a guessed admissions chance.`;

  return { title, summary, strengths, constraints, goals, gaps };
}

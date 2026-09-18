/**
 * One-off catalog stress check for Pass 10.6.
 * Run: npx tsx scripts/catalog-stress.ts
 */
import { recommended } from "../lib/matching";
import { universities, countryLabels, fieldLabels } from "../lib/universities";
import { campusImage } from "../lib/media";
import { buildRoadmap } from "../lib/roadmap";
import { demoProfile, type Profile, type CountryId, type Field, type AidNeed } from "../lib/types";

const validCountries = new Set(Object.keys(countryLabels));
const validFields = new Set(Object.keys(fieldLabels));
const validAid = new Set([
  "meets-full-need",
  "need-aware-intl",
  "limited-intl",
  "low-tuition",
  "generous-need",
]);

function base(overrides: Partial<Profile>): Profile {
  return {
    ...demoProfile,
    firstName: "Test",
    lastName: "Student",
    activities: "Research lab · robotics club",
    achievements: "Science fair winner",
    researchExperience: true,
    interests: ["research", "building"],
    ...overrides,
  };
}

const profiles: { name: string; profile: Profile }[] = [
  {
    name: "A — US + substantial aid + CS",
    profile: base({
      countries: ["us"],
      aidNeed: "substantial",
      annualBudget: "12000",
      field: "cs",
    }),
  },
  {
    name: "B — UK + can pay + CS",
    profile: base({
      countries: ["uk"],
      aidNeed: "none",
      annualBudget: "60000",
      field: "cs",
      interests: ["building"],
      researchExperience: false,
    }),
  },
  {
    name: "C — UAE + substantial aid + CS",
    profile: base({
      countries: ["ae"],
      aidNeed: "substantial",
      annualBudget: "10000",
      field: "cs",
    }),
  },
  {
    name: "D — US + substantial aid + Biology",
    profile: base({
      countries: ["us"],
      aidNeed: "substantial",
      annualBudget: "12000",
      field: "biology",
      interests: ["research"],
    }),
  },
  {
    name: "E — US + can pay + Economics",
    profile: base({
      countries: ["us"],
      aidNeed: "none",
      annualBudget: "70000",
      field: "economics",
      interests: ["policy", "entrepreneurship"],
      researchExperience: false,
      activities: "Debate · economics club",
      achievements: "",
    }),
  },
  {
    name: "F — Canada + research STEM",
    profile: base({
      countries: ["ca"],
      aidNeed: "some",
      annualBudget: "25000",
      field: "cs",
      interests: ["research", "building"],
      researchExperience: true,
    }),
  },
  {
    name: "G — Hong Kong + can pay + CS",
    profile: base({
      countries: ["hk"],
      aidNeed: "none",
      annualBudget: "55000",
      field: "cs",
      interests: ["building", "research"],
    }),
  },
];

function assertCatalog() {
  const ids = universities.map((u) => u.id);
  const names = universities.map((u) => u.name);
  const issues: string[] = [];

  if (new Set(ids).size !== ids.length) issues.push("duplicate ids");
  if (new Set(names).size !== names.length) issues.push("duplicate names");

  for (const u of universities) {
    if (!validCountries.has(u.countryId)) issues.push(`${u.id}: bad country ${u.countryId}`);
    if (!validAid.has(u.aid.kind)) issues.push(`${u.id}: bad aid ${u.aid.kind}`);
    for (const p of u.programs) {
      if (!validFields.has(p)) issues.push(`${u.id}: bad program ${p}`);
    }
    if (!u.sources.length) issues.push(`${u.id}: missing sources`);
    if (!u.deadlines.length) issues.push(`${u.id}: missing deadlines`);
  }

  return issues;
}

const issues = assertCatalog();
console.log("=== CATALOG ===");
console.log("count", universities.length);
console.log(
  "by country",
  Object.fromEntries(
    [...validCountries].map((c) => [
      c,
      universities.filter((u) => u.countryId === c).length,
    ]),
  ),
);
console.log(
  "by aid",
  Object.fromEntries(
    [...validAid].map((k) => [k, universities.filter((u) => u.aid.kind === k).length]),
  ),
);
console.log(
  "images present",
  universities.filter((u) => campusImage(u.id)).length,
  "/",
  universities.length,
);
console.log("validation issues", issues.length ? issues : "none");

console.log("\n=== PROFILE SHORTLISTS (top 6) ===");
const sets: string[][] = [];
for (const { name, profile } of profiles) {
  const recs = recommended(profile, 6);
  const ids = recs.map((r) => r.university.id);
  sets.push(ids);
  const roadmap = buildRoadmap(profile, recs.slice(0, 3));
  console.log("\n" + name);
  console.log(
    recs
      .map((r) => `${r.university.shortName} (${r.university.countryId}, ${r.university.aid.kind}, fit ${r.fitIndex})`)
      .join("\n  "),
  );
  console.log("roadmap tasks", roadmap.length, "next:", roadmap[0]?.title);
}

// Diversity: pairwise Jaccard of top-3 should not all be identical
const top3 = sets.map((s) => s.slice(0, 3).join("|"));
const uniqueTop3 = new Set(top3);
console.log("\n=== DIVERSITY ===");
console.log("unique top-3 signatures", uniqueTop3.size, "/", top3.length);
console.log(top3);
if (uniqueTop3.size < 4) {
  console.error("FAIL: recommendation sets collapsed too much");
  process.exit(1);
}
if (issues.length) {
  console.error("FAIL: catalog validation");
  process.exit(1);
}
console.log("\nPASS");

"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { ChoiceGrid, Segmented } from "@/components/ui/Choices";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { useRoute } from "@/lib/store";
import {
  demoProfile,
  type AidNeed,
  type CountryId,
  type Curriculum,
  type EnglishExam,
  type Field as StudyField,
  type GradYear,
  type Interest,
  type Profile,
} from "@/lib/types";
import { countryLabels } from "@/lib/universities";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const STEPS = [
  { id: "about", label: "About you", why: "So the route is addressed to a person, not a blank form." },
  { id: "academic", label: "Academic profile", why: "Tests and curriculum change which systems are even worth opening." },
  { id: "exams", label: "Languages & exams", why: "If IELTS is already done, the roadmap will not tell you to sit it." },
  { id: "place", label: "Countries & budget", why: "Aid policy is the most common reason a campus should drop off a list." },
  { id: "goals", label: "Goals", why: "Subject and research intent move the shortlist more than a slogan would." },
] as const;

export default function ProfilePage() {
  const { profile, setProfile, replaceProfile } = useRoute();
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const complete = useMemo(() => completeness(profile), [profile]);

  return (
    <AppShell
      eyebrow="01 — Profile"
      title="What is actually true about you."
      lede="Five short groups. Answer what you know. Leave blanks — Route will mark them as gaps instead of inventing a story."
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "w-full border-l-2 py-1 pl-3 text-left",
                    i === step ? "border-accent" : "border-transparent",
                  )}
                >
                  <div className={cn("text-[13px]", i === step ? "text-primary" : "text-secondary")}>
                    {s.label}
                  </div>
                  {i === step ? <p className="mt-1 text-[12px] leading-5 text-tertiary">{s.why}</p> : null}
                </button>
              </li>
            ))}
          </ol>
          <p className="meta mt-8">{complete}% of the fields that change recommendations</p>
          <button
            type="button"
            className="mt-4 text-[13px] text-secondary underline decoration-border underline-offset-4 hover:text-primary"
            onClick={() => {
              replaceProfile(demoProfile);
              setStep(0);
            }}
          >
            Fill with the demo student
          </button>
        </aside>

        <section className="lg:col-span-8 enter">
          {current.id === "about" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <Input value={profile.firstName} onChange={(e) => setProfile({ firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input value={profile.lastName} onChange={(e) => setProfile({ lastName: e.target.value })} />
              </Field>
              <Field label="Home country" hint="Used for English-exam exemptions and aid context.">
                <Input
                  value={profile.homeCountry}
                  onChange={(e) => setProfile({ homeCountry: e.target.value })}
                  placeholder="Kenya"
                />
              </Field>
              <Field label="Graduation year">
                <Segmented<`${GradYear}`>
                  value={`${profile.gradYear}`}
                  onChange={(v) => setProfile({ gradYear: Number(v) as GradYear })}
                  options={[
                    { value: "2026", label: "2026" },
                    { value: "2027", label: "2027" },
                    { value: "2028", label: "2028" },
                  ]}
                />
              </Field>
            </div>
          )}

          {current.id === "academic" && (
            <div className="space-y-5">
              <Field label="Curriculum">
                <Segmented<Curriculum>
                  value={profile.curriculum}
                  onChange={(v) => setProfile({ curriculum: v })}
                  options={[
                    { value: "ib", label: "IB" },
                    { value: "ap", label: "AP / US" },
                    { value: "alevel", label: "A-level" },
                    { value: "national", label: "National" },
                  ]}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={profile.gpaScale === "ib" ? "IB points" : "GPA"} hint="Leave blank if you do not have a number yet.">
                  <Input
                    inputMode="decimal"
                    value={profile.gpa}
                    onChange={(e) => setProfile({ gpa: e.target.value })}
                  />
                </Field>
                <Field label="Scale">
                  <Segmented
                    value={profile.gpaScale}
                    onChange={(v) => setProfile({ gpaScale: v })}
                    options={[
                      { value: "4.0", label: "4.0" },
                      { value: "100", label: "100" },
                      { value: "ib", label: "IB 45" },
                    ]}
                  />
                </Field>
              </div>
              <Field label="SAT status" hint="If it is already done, the roadmap will not assign it.">
                <Segmented
                  value={profile.satStatus}
                  onChange={(v) => setProfile({ satStatus: v })}
                  options={[
                    { value: "done", label: "Score in hand" },
                    { value: "planned", label: "Planning to sit" },
                    { value: "skip", label: "Not using SAT" },
                  ]}
                />
              </Field>
              {profile.satStatus === "done" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="SAT Math">
                    <Input value={profile.satMath} onChange={(e) => setProfile({ satMath: e.target.value })} />
                  </Field>
                  <Field label="SAT ERW">
                    <Input value={profile.satEbrw} onChange={(e) => setProfile({ satEbrw: e.target.value })} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {current.id === "exams" && (
            <div className="space-y-5">
              <Field label="English-proficiency exam">
                <Segmented<EnglishExam>
                  value={profile.englishExam}
                  onChange={(v) => setProfile({ englishExam: v })}
                  options={[
                    { value: "none", label: "None yet" },
                    { value: "ielts", label: "IELTS" },
                    { value: "toefl", label: "TOEFL" },
                    { value: "duolingo", label: "Duolingo" },
                  ]}
                />
              </Field>
              {profile.englishExam !== "none" && (
                <Field label="Score" hint="IELTS is typically 0–9. TOEFL iBT is 0–120.">
                  <Input
                    value={profile.englishScore}
                    onChange={(e) => setProfile({ englishScore: e.target.value })}
                  />
                </Field>
              )}
              <Field label="Recommendation letters">
                <Segmented
                  value={profile.recLettersStarted ? "yes" : "no"}
                  onChange={(v) => setProfile({ recLettersStarted: v === "yes" })}
                  options={[
                    { value: "no", label: "Not asked yet" },
                    { value: "yes", label: "Already asked" },
                  ]}
                />
              </Field>
            </div>
          )}

          {current.id === "place" && (
            <div className="space-y-6">
              <Field label="Countries you will apply in" hint="Uncheck a country and it leaves the shortlist.">
                <ChoiceGrid<CountryId>
                  multiple
                  value={profile.countries}
                  onChange={(v) => setProfile({ countries: v as CountryId[] })}
                  options={(Object.keys(countryLabels) as CountryId[]).map((id) => ({
                    value: id,
                    label: countryLabels[id],
                  }))}
                />
              </Field>
              <Field label="Aid you actually need">
                <ChoiceGrid<AidNeed>
                  value={profile.aidNeed}
                  onChange={(v) => setProfile({ aidNeed: v as AidNeed })}
                  options={[
                    { value: "full", label: "Full aid required", hint: "Little or no family contribution" },
                    { value: "substantial", label: "Substantial aid", hint: "Some contribution, not full fees" },
                    { value: "some", label: "Some help", hint: "Merit or a partial package would matter" },
                    { value: "none", label: "Can fund without aid", hint: "Still useful to compare net cost" },
                  ]}
                />
              </Field>
              <Field
                label={`Annual family contribution: $${Number(profile.annualBudget || 0).toLocaleString()}`}
                hint="A slider belongs here because the number is a range, not a category."
              >
                <input
                  type="range"
                  min={0}
                  max={70000}
                  step={1000}
                  value={Number(profile.annualBudget || 0)}
                  onChange={(e) => setProfile({ annualBudget: e.target.value })}
                  className="mt-2 w-full"
                />
              </Field>
            </div>
          )}

          {current.id === "goals" && (
            <div className="space-y-6">
              <Field label="Intended field">
                <ChoiceGrid<StudyField>
                  value={profile.field}
                  onChange={(v) => setProfile({ field: v as StudyField })}
                  options={[
                    { value: "cs", label: "Computer science" },
                    { value: "engineering", label: "Engineering" },
                    { value: "economics", label: "Economics" },
                    { value: "biology", label: "Biology / life sciences" },
                    { value: "undecided", label: "Undeclared" },
                  ]}
                />
              </Field>
              <Field label="What should the campus actually be good at?">
                <ChoiceGrid<Interest>
                  multiple
                  value={profile.interests}
                  onChange={(v) => setProfile({ interests: v as Interest[] })}
                  options={[
                    { value: "research", label: "Research", hint: "Labs, UROP, faculty work" },
                    { value: "building", label: "Building things", hint: "Software, hardware, making" },
                    { value: "policy", label: "Public policy" },
                    { value: "entrepreneurship", label: "Starting companies" },
                    { value: "arts", label: "Arts / writing" },
                  ]}
                />
              </Field>
              <Field label="Have you already done research?">
                <Segmented
                  value={profile.researchExperience ? "yes" : "no"}
                  onChange={(v) => setProfile({ researchExperience: v === "yes" })}
                  options={[
                    { value: "no", label: "Not yet" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              </Field>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={() => router.push("/diagnosis")}>See diagnosis</Button>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function completeness(p: Profile) {
  const checks = [
    p.firstName,
    p.homeCountry,
    p.gpa,
    p.countries.length,
    p.field,
    p.englishExam !== "none" ? p.englishScore : true,
    p.satStatus === "done" ? p.satMath : true,
  ];
  const n = checks.filter(Boolean).length;
  return Math.round((n / checks.length) * 100);
}

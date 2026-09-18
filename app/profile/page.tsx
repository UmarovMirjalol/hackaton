"use client";

import { AppShell } from "@/components/AppShell";
import { NextUp } from "@/components/NextUp";
import { Button } from "@/components/ui/Button";
import { ChoiceGrid, Segmented } from "@/components/ui/Choices";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { profileCompleteness } from "@/lib/journey";
import { useRoute } from "@/lib/store";
import {
  type AidNeed,
  type CountryId,
  type Curriculum,
  type EnglishExam,
  type Field as StudyField,
  type GradYear,
  type Interest,
} from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";
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
  const { profile, setProfile, loadDemo } = useRoute();
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const complete = useMemo(() => profileCompleteness(profile), [profile]);

  return (
    <AppShell
      eyebrow="Profile"
      title={complete >= 65 ? "Your candidate snapshot." : "Build your profile."}
      lede={
        complete >= 65
          ? "This is what Route uses for matches and your admissions route. Edit any section."
          : "One group at a time. Skip what you do not know — gaps stay visible."
      }
      footer={
        complete >= 40 ? (
          <NextUp
            title="See how Route reads your profile"
            detail={`${complete}% complete`}
            href="/diagnosis"
            cta="View insights"
          />
        ) : undefined
      }
    >
      <div className="mb-4 lg:mb-6">
        <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
          <p className="label">
            Step {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            className="text-[12px] text-secondary underline decoration-border underline-offset-2"
            onClick={() => {
              loadDemo();
              setStep(0);
            }}
          >
            Try demo profile
          </button>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[13px] font-medium lg:hidden">{current.label}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="hidden lg:col-span-4 lg:block">
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "w-full rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors",
                    i === step ? "bg-accent-subtle" : "hover:bg-surface-muted",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        i === step ? "text-accent" : "text-tertiary",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        i === step ? "text-primary" : "text-secondary",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i === step ? (
                    <p className="mt-1 pl-6 text-[12px] leading-5 text-tertiary">{s.why}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
          <p className="meta mt-5">{complete}% of the fields that change recommendations</p>
          <button
            type="button"
            className="mt-4 text-[13px] text-secondary underline decoration-border underline-offset-4 hover:text-primary"
            onClick={() => {
              loadDemo();
              setStep(0);
            }}
          >
            Fill with the demo student
          </button>
        </aside>

        <section className="enter lg:col-span-8">
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
            <div className="space-y-8">
              <div>
                <p className="caption mb-2">Academic direction</p>
                <h2 className="text-h2">What are you planning to study?</h2>
                <div className="mt-4">
                  <ChoiceGrid<StudyField>
                    value={profile.field}
                    onChange={(v) => setProfile({ field: v as StudyField })}
                    options={[
                      { value: "cs", label: "Computer science" },
                      { value: "engineering", label: "Engineering" },
                      { value: "economics", label: "Economics" },
                      { value: "biology", label: "Biology / life sciences" },
                      { value: "undecided", label: "I'm still exploring" },
                    ]}
                  />
                </div>
              </div>
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

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-4">
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
              <Button onClick={() => router.push("/diagnosis")}>View insights</Button>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

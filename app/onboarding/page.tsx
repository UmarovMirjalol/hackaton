"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChoiceGrid, Segmented } from "@/components/ui/Choices";
import { Field, Input, TextArea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import {
  ONBOARDING_STEPS,
  clampOnboardingStep,
  validateStep,
  type OnboardingStepId,
} from "@/lib/onboarding";
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
import Link from "next/link";

export default function OnboardingPage() {
  const { profile, setProfile, loadDemo, hydrated, onboardingStep, setOnboardingStep } = useRoute();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const stepIndex = clampOnboardingStep(onboardingStep);
  const step = ONBOARDING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const setStep = (i: number) => setOnboardingStep(clampOnboardingStep(i));

  const goNext = () => {
    const err = validateStep(step.id, profile);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (stepIndex >= ONBOARDING_STEPS.length - 1) {
      router.push("/analyze");
      return;
    }
    setStep(stepIndex + 1);
  };

  const goBack = () => {
    setError(null);
    if (stepIndex === 0) {
      router.push("/");
      return;
    }
    setStep(stepIndex - 1);
  };

  const summary = useMemo(
    () =>
      [
        profile.firstName && `${profile.firstName} ${profile.lastName}`.trim(),
        profile.homeCountry,
        profile.field ? fieldLabels[profile.field] : null,
        profile.countries.length
          ? profile.countries.map((c) => countryLabels[c]).join(", ")
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    [profile],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="skeleton h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface/80 backdrop-blur-md">
        <div
          className="mx-auto flex items-center justify-between gap-4 px-[var(--space-page)] py-3"
          style={{ maxWidth: "var(--content)" }}
        >
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Route
          </Link>
          <p className="meta hidden sm:block">{summary || "Building your profile"}</p>
          <button
            type="button"
            className="text-[12px] font-medium text-secondary underline decoration-border underline-offset-4 hover:text-primary"
            onClick={() => {
              loadDemo();
              router.push("/analyze");
            }}
          >
            Try demo profile
          </button>
        </div>
        <div className="h-0.5 bg-surface-muted">
          <div
            key={step.id}
            className="progress-bar h-full bg-[var(--signal)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main
        className="mx-auto grid gap-10 px-[var(--space-page)] py-8 lg:grid-cols-12 lg:gap-12 lg:py-12"
        style={{ maxWidth: "var(--content)" }}
      >
        <aside className="hidden lg:col-span-4 lg:block">
          <p className="label">Build your profile</p>
          <ol className="mt-6 space-y-0">
            {ONBOARDING_STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(i);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 border-l-2 py-2.5 pl-4 text-left transition-colors",
                      active
                        ? "border-[var(--signal)] text-primary"
                        : done
                          ? "border-border-strong text-secondary"
                          : "border-transparent text-tertiary hover:text-secondary",
                    )}
                  >
                    <span className="meta w-5 shrink-0">{String(s.number).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-[13px] font-medium">{s.label}</span>
                      {active ? (
                        <span className="mt-1 block text-[12px] leading-5 text-tertiary">
                          {s.purpose}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="enter lg:col-span-8">
          <p className="meta lg:hidden">
            Step {step.number} of {ONBOARDING_STEPS.length} · {step.label}
          </p>
          <h1 className="text-h1 mt-2 max-w-xl">{step.title}</h1>
          <p className="body mt-2 max-w-lg text-secondary">{step.purpose}</p>

          <div className="mt-8 max-w-2xl">{renderStep(step.id, profile, setProfile)}</div>

          {error ? (
            <p role="alert" className="mt-5 text-[13px] font-medium text-error">
              {error}
            </p>
          ) : null}

          <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-5">
            <Button variant="ghost" onClick={goBack}>
              {stepIndex === 0 ? "Home" : "Back"}
            </Button>
            <Button variant="signal" onClick={goNext}>
              {stepIndex >= ONBOARDING_STEPS.length - 1 ? "Analyze profile" : "Continue"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function renderStep(
  id: OnboardingStepId,
  profile: ReturnType<typeof useRoute>["profile"],
  setProfile: ReturnType<typeof useRoute>["setProfile"],
) {
  switch (id) {
    case "academic":
      return (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name">
              <Input
                autoFocus
                value={profile.firstName}
                onChange={(e) => setProfile({ firstName: e.target.value })}
              />
            </Field>
            <Field label="Last name">
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile({ lastName: e.target.value })}
              />
            </Field>
            <Field label="Home country">
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
            <Field
              label={profile.gpaScale === "ib" ? "IB points" : "GPA"}
              hint="Optional if you do not have a number yet."
            >
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
        </div>
      );
    case "testing":
      return (
        <div className="space-y-6">
          <Field label="SAT status">
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
          {profile.satStatus === "done" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="SAT Math">
                <Input
                  value={profile.satMath}
                  onChange={(e) => setProfile({ satMath: e.target.value })}
                />
              </Field>
              <Field label="SAT ERW">
                <Input
                  value={profile.satEbrw}
                  onChange={(e) => setProfile({ satEbrw: e.target.value })}
                />
              </Field>
            </div>
          ) : null}
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
          {profile.englishExam !== "none" ? (
            <Field label="Score">
              <Input
                value={profile.englishScore}
                onChange={(e) => setProfile({ englishScore: e.target.value })}
              />
            </Field>
          ) : null}
        </div>
      );
    case "activities":
      return (
        <div className="space-y-6">
          <Field
            label="Activities"
            hint="Clubs, projects, work, volunteering — short phrases are enough."
          >
            <TextArea
              value={profile.activities}
              onChange={(e) => setProfile({ activities: e.target.value })}
              placeholder="Robotics captain · coding club · family business weekends"
            />
          </Field>
          <Field label="Achievements" hint="Optional awards, olympiads, publications.">
            <TextArea
              value={profile.achievements}
              onChange={(e) => setProfile({ achievements: e.target.value })}
              placeholder="National olympiad shortlist · research fair winner"
            />
          </Field>
          <Field label="Have you done research?">
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
      );
    case "interests":
      return (
        <div className="space-y-8">
          <div>
            <p className="small mb-3 font-medium text-secondary">Intended field</p>
            <ChoiceGrid<StudyField>
              value={profile.field}
              onChange={(v) => setProfile({ field: v as StudyField })}
              options={[
                { value: "cs", label: "Computer science" },
                { value: "engineering", label: "Engineering" },
                { value: "economics", label: "Economics" },
                { value: "biology", label: "Biology / life sciences" },
                { value: "undecided", label: "Still exploring" },
              ]}
            />
          </div>
          <div>
            <p className="small mb-3 font-medium text-secondary">Campus strengths that matter</p>
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
          </div>
        </div>
      );
    case "place":
      return (
        <ChoiceGrid<CountryId>
          multiple
          value={profile.countries}
          onChange={(v) => setProfile({ countries: v as CountryId[] })}
          options={(Object.keys(countryLabels) as CountryId[]).map((id) => ({
            value: id,
            label: countryLabels[id],
          }))}
        />
      );
    case "aid":
      return (
        <div className="space-y-7">
          <ChoiceGrid<AidNeed>
            value={profile.aidNeed}
            onChange={(v) => setProfile({ aidNeed: v as AidNeed })}
            options={[
              { value: "full", label: "Full aid required", hint: "Little or no family contribution" },
              {
                value: "substantial",
                label: "Substantial aid",
                hint: "Some contribution, not full fees",
              },
              { value: "some", label: "Some help", hint: "Merit or a partial package would matter" },
              { value: "none", label: "Can fund without aid", hint: "Still useful to compare net cost" },
            ]}
          />
          <Field
            label={`Annual family contribution: $${Number(profile.annualBudget || 0).toLocaleString()}`}
          >
            <input
              type="range"
              min={0}
              max={70000}
              step={1000}
              value={Number(profile.annualBudget || 0)}
              onChange={(e) => setProfile({ annualBudget: e.target.value })}
              className="mt-3 w-full"
            />
          </Field>
        </div>
      );
    case "goals":
      return (
        <div className="space-y-6">
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
          <div className="border border-border bg-surface p-5">
            <p className="label">Ready to analyze</p>
            <p className="mt-2 text-[18px] font-medium tracking-tight">
              {profile.firstName} {profile.lastName}
            </p>
            <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="text-tertiary">Field</dt>
                <dd className="font-medium">{profile.field ? fieldLabels[profile.field] : "—"}</dd>
              </div>
              <div>
                <dt className="text-tertiary">Aid</dt>
                <dd className="font-medium capitalize">{profile.aidNeed || "—"}</dd>
              </div>
              <div>
                <dt className="text-tertiary">Countries</dt>
                <dd className="font-medium">
                  {profile.countries.map((c) => countryLabels[c]).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-tertiary">Budget</dt>
                <dd className="font-medium">
                  ${Number(profile.annualBudget || 0).toLocaleString()}/yr
                </dd>
              </div>
            </dl>
          </div>
        </div>
      );
  }
}

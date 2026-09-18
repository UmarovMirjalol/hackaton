"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ObButton,
  ObCountryGrid,
  ObField,
  ObInput,
  ObOptionRows,
  ObRange,
  ObSegmented,
  ObSelectList,
  ObTextArea,
} from "@/components/onboarding/Controls";
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
import "./onboarding.css";

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
      ]
        .filter(Boolean)
        .join(" · "),
    [profile],
  );

  if (!hydrated) {
    return (
      <div className="ob-shell flex min-h-dvh items-center justify-center">
        <p className="font-mono text-[12px] tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
          Loading profile
        </p>
      </div>
    );
  }

  return (
    <div className="ob-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] backdrop-blur-md">
        <div className="ob-frame flex items-center justify-between gap-4 py-3.5">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] transition-opacity hover:opacity-70"
            >
              Route
            </Link>
            <span className="hidden text-[12px] text-[var(--text-tertiary)] sm:inline">
              Admissions profile
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <p className="font-mono text-[11px] tracking-[0.04em] text-[var(--text-tertiary)] tabular-nums">
              Step {step.number} of {ONBOARDING_STEPS.length}
            </p>
            <ObButton
              variant="text"
              onClick={() => {
                loadDemo();
                router.push("/analyze");
              }}
            >
              Try demo
            </ObButton>
          </div>
        </div>
        <div className="ob-progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="ob-frame grid gap-10 py-8 lg:grid-cols-[var(--ob-rail)_minmax(0,1fr)] lg:gap-16 lg:py-12 xl:gap-20">
        <aside className="ob-rail hidden lg:block">
          <p className="mb-5 font-mono text-[10px] tracking-[0.12em] text-[var(--text-tertiary)] uppercase">
            Profile build
          </p>
          <ol>
            {ONBOARDING_STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    data-active={active}
                    data-done={done}
                    className="ob-step-btn"
                    onClick={() => {
                      setError(null);
                      setStep(i);
                    }}
                  >
                    <span className="font-mono text-[11px] tabular-nums opacity-70">
                      {String(s.number).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium leading-5">{s.label}</span>
                      {active ? (
                        <span className="mt-1 block text-[12px] leading-5 text-[var(--text-tertiary)]">
                          {s.purpose}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {summary ? (
            <p className="mt-8 border-t border-[var(--border)] pt-5 text-[12px] leading-5 text-[var(--text-tertiary)]">
              {summary}
            </p>
          ) : null}
        </aside>

        <section key={step.id} className="ob-main min-w-0">
          <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-[var(--text-tertiary)] uppercase lg:hidden">
            {step.label} · {step.number}/{ONBOARDING_STEPS.length}
          </p>

          <h1 className="ob-question">{step.title}</h1>
          <p className="ob-purpose">{step.purpose}</p>

          <div className="ob-body mt-9 max-w-xl xl:max-w-2xl">
            {renderStep(step.id, profile, setProfile)}
          </div>

          {error ? (
            <p role="alert" className="ob-error">
              {error}
            </p>
          ) : null}

          <div className="ob-footer">
            <div className="flex items-center justify-between gap-3">
              <ObButton variant="ghost" onClick={goBack}>
                {stepIndex === 0 ? "Home" : "Back"}
              </ObButton>
              <ObButton variant="primary" onClick={goNext}>
                {stepIndex >= ONBOARDING_STEPS.length - 1 ? "Analyze profile" : "Continue"}
              </ObButton>
            </div>
          </div>
        </section>
      </div>
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
        <div className="space-y-8">
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <ObField label="First name">
              <ObInput
                autoFocus
                value={profile.firstName}
                onChange={(e) => setProfile({ firstName: e.target.value })}
                placeholder="Amira"
              />
            </ObField>
            <ObField label="Last name">
              <ObInput
                value={profile.lastName}
                onChange={(e) => setProfile({ lastName: e.target.value })}
                placeholder="Hassan"
              />
            </ObField>
            <ObField label="Home country">
              <ObInput
                value={profile.homeCountry}
                onChange={(e) => setProfile({ homeCountry: e.target.value })}
                placeholder="Kenya"
              />
            </ObField>
            <ObField label="Graduation year">
              <ObSegmented<`${GradYear}`>
                value={`${profile.gradYear}`}
                onChange={(v) => setProfile({ gradYear: Number(v) as GradYear })}
                options={[
                  { value: "2026", label: "2026" },
                  { value: "2027", label: "2027" },
                  { value: "2028", label: "2028" },
                ]}
              />
            </ObField>
          </div>

          <div className="ob-divider" />

          <ObField label="Curriculum">
            <ObSegmented<Curriculum>
              value={profile.curriculum}
              onChange={(v) => setProfile({ curriculum: v })}
              options={[
                { value: "ib", label: "IB" },
                { value: "ap", label: "AP / US" },
                { value: "alevel", label: "A-level" },
                { value: "national", label: "National" },
              ]}
            />
          </ObField>

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <ObField
              label={profile.gpaScale === "ib" ? "IB points" : "GPA"}
              hint="Optional if you do not have a number yet."
            >
              <ObInput
                inputMode="decimal"
                value={profile.gpa}
                onChange={(e) => setProfile({ gpa: e.target.value })}
                placeholder={profile.gpaScale === "ib" ? "38" : "3.8"}
              />
            </ObField>
            <ObField label="Scale">
              <ObSegmented
                value={profile.gpaScale}
                onChange={(v) => setProfile({ gpaScale: v })}
                options={[
                  { value: "4.0", label: "4.0" },
                  { value: "100", label: "100" },
                  { value: "ib", label: "IB 45" },
                ]}
              />
            </ObField>
          </div>
        </div>
      );

    case "testing":
      return (
        <div className="space-y-9">
          <div>
            <p className="ob-section-label">SAT</p>
            <ObOptionRows
              value={profile.satStatus}
              onChange={(v) => setProfile({ satStatus: v })}
              options={[
                { value: "done", label: "Score in hand", hint: "We’ll use Math and ERW in the match." },
                { value: "planned", label: "Planning to sit", hint: "Becomes a dated task on your roadmap." },
                { value: "skip", label: "Not using SAT", hint: "Test-optional and non-SAT paths stay open." },
              ]}
            />
            {profile.satStatus === "done" ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <ObField label="SAT Math">
                  <ObInput
                    autoFocus
                    inputMode="numeric"
                    value={profile.satMath}
                    onChange={(e) => setProfile({ satMath: e.target.value })}
                    placeholder="760"
                  />
                </ObField>
                <ObField label="SAT ERW">
                  <ObInput
                    inputMode="numeric"
                    value={profile.satEbrw}
                    onChange={(e) => setProfile({ satEbrw: e.target.value })}
                    placeholder="710"
                  />
                </ObField>
              </div>
            ) : null}
          </div>

          <div>
            <p className="ob-section-label">English proficiency</p>
            <ObSegmented<EnglishExam>
              value={profile.englishExam}
              onChange={(v) => setProfile({ englishExam: v })}
              options={[
                { value: "none", label: "None yet" },
                { value: "ielts", label: "IELTS" },
                { value: "toefl", label: "TOEFL" },
                { value: "duolingo", label: "Duolingo" },
              ]}
            />
            {profile.englishExam !== "none" ? (
              <div className="mt-6 max-w-xs">
                <ObField label="Score">
                  <ObInput
                    value={profile.englishScore}
                    onChange={(e) => setProfile({ englishScore: e.target.value })}
                    placeholder={
                      profile.englishExam === "ielts"
                        ? "7.5"
                        : profile.englishExam === "toefl"
                          ? "105"
                          : "130"
                    }
                  />
                </ObField>
              </div>
            ) : null}
          </div>
        </div>
      );

    case "activities":
      return (
        <div className="space-y-10">
          <ObField
            label="What you spend time on"
            hint="Clubs, projects, work, volunteering — short phrases are enough."
          >
            <ObTextArea
              autoFocus
              value={profile.activities}
              onChange={(e) => setProfile({ activities: e.target.value })}
              placeholder="Robotics captain · coding club · family business weekends"
            />
          </ObField>
          <ObField label="Achievements" hint="Optional awards, olympiads, publications.">
            <ObTextArea
              value={profile.achievements}
              onChange={(e) => setProfile({ achievements: e.target.value })}
              placeholder="National olympiad shortlist · research fair winner"
            />
          </ObField>
          <div>
            <p className="ob-section-label">Research experience</p>
            <ObSegmented
              value={profile.researchExperience ? "yes" : "no"}
              onChange={(v) => setProfile({ researchExperience: v === "yes" })}
              options={[
                { value: "no", label: "Not yet" },
                { value: "yes", label: "Yes" },
              ]}
            />
          </div>
        </div>
      );

    case "interests":
      return (
        <div className="space-y-10">
          <div>
            <p className="ob-section-label">Intended field</p>
            <ObSelectList<StudyField>
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
            <p className="ob-section-label">Campus strengths that matter</p>
            <ObSelectList<Interest>
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
        <div>
          <p className="ob-section-label">Where you will apply</p>
          <ObCountryGrid<CountryId>
            value={profile.countries}
            onChange={(v) => setProfile({ countries: v })}
            options={(Object.keys(countryLabels) as CountryId[]).map((cid) => ({
              value: cid,
              label: countryLabels[cid],
            }))}
          />
          <p className="mt-5 text-[12.5px] leading-5 text-[var(--text-tertiary)]">
            {profile.countries.length
              ? `${profile.countries.length} selected — unchecked countries leave the shortlist.`
              : "Select every region you are willing to apply to."}
          </p>
        </div>
      );

    case "aid":
      return (
        <div className="space-y-10">
          <div>
            <p className="ob-section-label">Aid need</p>
            <ObOptionRows<AidNeed>
              value={profile.aidNeed}
              onChange={(v) => setProfile({ aidNeed: v })}
              options={[
                {
                  value: "full",
                  label: "Full aid required",
                  hint: "Little or no family contribution",
                },
                {
                  value: "substantial",
                  label: "Substantial aid",
                  hint: "Some contribution, not full fees",
                },
                {
                  value: "some",
                  label: "Some help",
                  hint: "Merit or a partial package would matter",
                },
                {
                  value: "none",
                  label: "Can fund without aid",
                  hint: "Still useful to compare net cost",
                },
              ]}
            />
          </div>
          <ObRange
            label="Annual family contribution"
            value={Number(profile.annualBudget || 0)}
            onChange={(n) => setProfile({ annualBudget: String(n) })}
            min={0}
            max={70000}
            step={1000}
            display={`$${Number(profile.annualBudget || 0).toLocaleString()}`}
          />
        </div>
      );

    case "goals":
      return (
        <div className="space-y-10">
          <div>
            <p className="ob-section-label">Recommendation letters</p>
            <ObSegmented
              value={profile.recLettersStarted ? "yes" : "no"}
              onChange={(v) => setProfile({ recLettersStarted: v === "yes" })}
              options={[
                { value: "no", label: "Not asked yet" },
                { value: "yes", label: "Already asked" },
              ]}
            />
          </div>

          <div className="ob-dossier-wrap">
            <p className="ob-section-label">Profile ready for analysis</p>
            <p className="mt-1 text-[22px] font-medium tracking-tight">
              {profile.firstName || "—"} {profile.lastName}
            </p>
            <dl className="ob-dossier mt-6 sm:grid-cols-2">
              <div>
                <dt>Field</dt>
                <dd>{profile.field ? fieldLabels[profile.field] : "—"}</dd>
              </div>
              <div>
                <dt>Aid</dt>
                <dd className="capitalize">{profile.aidNeed || "—"}</dd>
              </div>
              <div>
                <dt>Countries</dt>
                <dd>
                  {profile.countries.length
                    ? profile.countries.map((c) => countryLabels[c]).join(", ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>${Number(profile.annualBudget || 0).toLocaleString()}/yr</dd>
              </div>
              <div>
                <dt>Home</dt>
                <dd>{profile.homeCountry || "—"}</dd>
              </div>
              <div>
                <dt>Grad year</dt>
                <dd>{profile.gradYear}</dd>
              </div>
            </dl>
          </div>
        </div>
      );
  }
}

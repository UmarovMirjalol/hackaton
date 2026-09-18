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
  type Profile,
} from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";
import "./onboarding.css";

/** Real profile completeness from answered fields — not step index. */
function profileCompletionPercent(p: Profile): number {
  const checks: boolean[] = [
    Boolean(p.firstName.trim()),
    Boolean(p.lastName.trim()),
    Boolean(p.homeCountry.trim()),
    Boolean(p.curriculum),
    Boolean(p.gpa.trim()),
    p.satStatus === "done" ? Boolean(p.satMath.trim()) : p.satStatus === "skip" || p.satStatus === "planned",
    p.englishExam === "none" ? true : Boolean(p.englishScore.trim()),
    Boolean(p.activities.trim()) || Boolean(p.achievements.trim()) || p.researchExperience,
    Boolean(p.field),
    p.interests.length > 0,
    p.countries.length > 0,
    Boolean(p.aidNeed),
    Number(p.annualBudget || 0) > 0 || p.aidNeed === "full" || p.aidNeed === "none",
    p.recLettersStarted,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function fact(value: string | null | undefined) {
  const v = (value ?? "").trim();
  return v || null;
}

export default function OnboardingPage() {
  const { profile, setProfile, loadDemo, hydrated, onboardingStep, setOnboardingStep } = useRoute();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const stepIndex = clampOnboardingStep(onboardingStep);
  const step = ONBOARDING_STEPS[stepIndex];
  const nextStep = ONBOARDING_STEPS[stepIndex + 1];
  const completion = profileCompletionPercent(profile);

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

  const displayName = useMemo(() => {
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    return name || null;
  }, [profile.firstName, profile.lastName]);

  const dossierFacts = useMemo(
    () => [
      {
        label: "Home",
        value: fact(profile.homeCountry)
          ? `${profile.homeCountry}${profile.gradYear ? ` · Class of ${profile.gradYear}` : ""}`
          : null,
      },
      {
        label: "Academics",
        value: fact(profile.gpa)
          ? `${profile.gpa}${profile.gpaScale === "ib" ? " IB" : profile.gpaScale === "100" ? "/100" : " GPA"} · ${profile.curriculum.toUpperCase()}`
          : profile.curriculum
            ? `${profile.curriculum.toUpperCase()} curriculum`
            : null,
      },
      {
        label: "Testing",
        value:
          profile.satStatus === "done" && profile.satMath
            ? `SAT ${profile.satMath}${profile.satEbrw ? ` / ${profile.satEbrw}` : ""}`
            : profile.satStatus === "skip"
              ? "No SAT"
              : profile.satStatus === "planned"
                ? "SAT planned"
                : null,
      },
      {
        label: "Field",
        value: profile.field ? fieldLabels[profile.field] : null,
      },
      {
        label: "Campus fit",
        value: profile.interests.length
          ? profile.interests
              .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
              .join(", ")
          : null,
      },
      {
        label: "Places",
        value: profile.countries.length
          ? profile.countries.map((c) => countryLabels[c]).join(", ")
          : null,
      },
      {
        label: "Aid",
        value: profile.aidNeed
          ? `${profile.aidNeed}${Number(profile.annualBudget || 0) > 0 ? ` · $${Number(profile.annualBudget).toLocaleString()}/yr` : ""}`
          : null,
      },
    ],
    [profile],
  );

  if (!hydrated) {
    return (
      <div className="ob-shell flex min-h-dvh items-center justify-center">
        <p className="font-mono text-[12px] tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
          Opening profile builder
        </p>
      </div>
    );
  }

  const isLast = stepIndex >= ONBOARDING_STEPS.length - 1;

  return (
    <div className="ob-shell">
      <header className="ob-top">
        <div className="ob-frame flex items-center justify-between gap-4 py-3.5">
          <div className="flex min-w-0 items-baseline gap-4">
            <Link href="/" className="ob-brand">
              <span className="ob-brand-mark">Route</span>
            </Link>
            <p className="hidden truncate text-[13px] text-[var(--text-secondary)] sm:block">
              Build your admissions profile
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <div className="ob-complete" aria-label={`Profile ${completion}% complete`}>
              <div className="ob-complete-meter" aria-hidden>
                <span style={{ width: `${completion}%` }} />
              </div>
              <span className="ob-complete-label">Profile {completion}%</span>
            </div>
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
      </header>

      <div className="ob-frame ob-workspace">
        <nav className="ob-journey" aria-label="Profile journey">
          <p className="ob-journey-kicker">Your route</p>
          <div className="ob-journey-list">
            {ONBOARDING_STEPS.map((s, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
              return (
                <button
                  key={s.id}
                  type="button"
                  data-state={state}
                  className="ob-journey-item"
                  onClick={() => {
                    setError(null);
                    setStep(i);
                  }}
                >
                  <span className="ob-journey-dot" aria-hidden />
                  <span className="ob-journey-name">{s.label}</span>
                </button>
              );
            })}
          </div>
          <p className="ob-journey-foot">
            Each answer strengthens the profile Route will map into universities.
          </p>
        </nav>

        <section className="ob-stage">
          <div className="ob-stage-meta">
            <p className="ob-stage-step">
              {step.label} · {step.number} of {ONBOARDING_STEPS.length}
            </p>
            <p className="ob-stage-next">
              {nextStep ? `Next: ${nextStep.label}` : "Ready to analyze"}
            </p>
          </div>

          <h1 className="ob-question">{step.title}</h1>
          <p className="ob-purpose">{step.purpose}</p>

          <div key={step.id} className="ob-body">
            {renderStep(step.id, profile, setProfile)}
          </div>

          {error ? (
            <p role="alert" className="ob-error">
              {error}
            </p>
          ) : null}

          <div className="ob-actions">
            <ObButton variant="ghost" onClick={goBack}>
              {stepIndex === 0 ? "Leave" : "Back"}
            </ObButton>
            <ObButton variant="primary" onClick={goNext}>
              {isLast ? "Analyze my profile" : "Continue building"}
            </ObButton>
          </div>
        </section>

        <aside className="ob-dossier" aria-label="Live profile">
          <p className="ob-dossier-kicker">Live profile</p>
          <p className="ob-dossier-name" data-empty={!displayName}>
            {displayName ?? "Student profile"}
          </p>
          <p className="ob-dossier-sub">
            {completion === 0
              ? "Answers appear here as you build."
              : completion < 50
                ? "Profile taking shape."
                : completion < 85
                  ? "Strong enough to start mapping."
                  : "Ready for analysis."}
          </p>

          <div className="ob-dossier-progress">
            <div className="ob-dossier-progress-row">
              <span>Completeness</span>
              <span>{completion}%</span>
            </div>
            <div className="ob-dossier-bar" aria-hidden>
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>

          <dl className="ob-dossier-facts">
            {dossierFacts.map((f) => (
              <div key={f.label} className="ob-fact">
                <dt>{f.label}</dt>
                <dd data-empty={!f.value}>{f.value ?? "Not set yet"}</dd>
              </div>
            ))}
          </dl>

          <p className="ob-dossier-hint">
            {nextStep
              ? `After ${step.label.toLowerCase()}, you’ll add ${nextStep.label.toLowerCase()} — then Route can shortlist with reasons.`
              : "Analyze to turn this profile into a university route with explanations."}
          </p>
        </aside>
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
        <div className="space-y-7">
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
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

          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
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
        <div className="space-y-8">
          <div>
            <p className="ob-section-label">SAT</p>
            <ObOptionRows
              value={profile.satStatus}
              onChange={(v) => setProfile({ satStatus: v })}
              options={[
                { value: "done", label: "Score in hand", hint: "Math and ERW feed the match." },
                { value: "planned", label: "Planning to sit", hint: "Becomes a dated roadmap task." },
                { value: "skip", label: "Not using SAT", hint: "Test-optional paths stay open." },
              ]}
            />
            {profile.satStatus === "done" ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
              <div className="mt-5 max-w-xs">
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
        <div className="space-y-7">
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
        <div className="space-y-8">
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
          <p className="mt-4 text-[12.5px] leading-5 text-[var(--text-tertiary)]">
            {profile.countries.length
              ? `${profile.countries.length} in profile — unchecked countries leave the shortlist.`
              : "Select every region you are willing to apply to."}
          </p>
        </div>
      );

    case "aid":
      return (
        <div className="space-y-8">
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
        <div className="space-y-7">
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

          <div className="ob-goals-sheet">
            <p className="ob-section-label">Profile ready for analysis</p>
            <p className="mt-1 text-[22px] font-medium tracking-tight">
              {profile.firstName || "—"} {profile.lastName}
            </p>
            <dl className="ob-goals-grid">
              <div className="ob-fact">
                <dt>Field</dt>
                <dd data-empty={!profile.field}>
                  {profile.field ? fieldLabels[profile.field] : "—"}
                </dd>
              </div>
              <div className="ob-fact">
                <dt>Aid</dt>
                <dd className="capitalize" data-empty={!profile.aidNeed}>
                  {profile.aidNeed || "—"}
                </dd>
              </div>
              <div className="ob-fact">
                <dt>Countries</dt>
                <dd data-empty={!profile.countries.length}>
                  {profile.countries.length
                    ? profile.countries.map((c) => countryLabels[c]).join(", ")
                    : "—"}
                </dd>
              </div>
              <div className="ob-fact">
                <dt>Budget</dt>
                <dd>${Number(profile.annualBudget || 0).toLocaleString()}/yr</dd>
              </div>
            </dl>
          </div>
        </div>
      );
  }
}

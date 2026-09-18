"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProfileRange } from "@/components/onboarding/Controls";
import { Button } from "@/components/ui/Button";
import { ChoiceGrid, OptionRows, Segmented } from "@/components/ui/Choices";
import { Field, Input, TextArea } from "@/components/ui/Field";
import { Alert, LoadingBlock } from "@/components/ui/States";
import { isSubstantiveProfileText } from "@/lib/diagnosis";
import { JOURNEY, profileCompleteness } from "@/lib/journey";
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

type Signal = { id: string; text: string };

function profileSignals(p: Profile): Signal[] {
  const out: Signal[] = [];
  const name = `${p.firstName} ${p.lastName}`.trim();
  if (name) out.push({ id: "name", text: name });
  if (p.homeCountry.trim()) {
    out.push({
      id: "home",
      text: `Home · ${p.homeCountry}${p.gradYear ? ` · ${p.gradYear}` : ""}`,
    });
  }
  if (p.gpa.trim()) {
    out.push({
      id: "gpa",
      text:
        p.gpaScale === "ib"
          ? `IB ${p.gpa}`
          : p.gpaScale === "100"
            ? `${p.gpa}/100`
            : `GPA ${p.gpa}`,
    });
  } else if (p.curriculum) {
    out.push({ id: "curr", text: `${p.curriculum.toUpperCase()} curriculum` });
  }
  if (p.satStatus === "done" && p.satMath.trim()) {
    out.push({
      id: "sat",
      text: `SAT ${p.satMath}${p.satEbrw.trim() ? ` / ${p.satEbrw}` : ""}`,
    });
  } else if (p.satStatus === "planned") {
    out.push({ id: "sat", text: "SAT planned" });
  } else if (p.satStatus === "skip") {
    out.push({ id: "sat", text: "No SAT" });
  }
  if (p.englishExam !== "none" && p.englishScore.trim()) {
    out.push({
      id: "eng",
      text: `${p.englishExam.toUpperCase()} ${p.englishScore}`,
    });
  }
  if (p.field) out.push({ id: "field", text: fieldLabels[p.field] });
  if (p.interests.length) {
    out.push({
      id: "int",
      text: p.interests.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(" · "),
    });
  }
  if (p.countries.length) {
    out.push({
      id: "place",
      text: p.countries.map((c) => countryLabels[c]).join(", "),
    });
  }
  if (p.aidNeed) {
    out.push({
      id: "aid",
      text:
        Number(p.annualBudget || 0) > 0
          ? `Aid ${p.aidNeed} · $${Number(p.annualBudget).toLocaleString()}/yr`
          : `Aid · ${p.aidNeed}`,
    });
  }
  if (
    p.researchExperience ||
    isSubstantiveProfileText(p.activities) ||
    isSubstantiveProfileText(p.achievements)
  ) {
    out.push({
      id: "act",
      text: p.researchExperience ? "Research experience" : "Activities on file",
    });
  }
  return out;
}

export default function OnboardingPage() {
  const { profile, setProfile, loadDemo, hydrated, onboardingStep, setOnboardingStep } = useRoute();
  const [error, setError] = useState<string | null>(null);
  const [signalsOpen, setSignalsOpen] = useState(false);
  const router = useRouter();
  const stepIndex = clampOnboardingStep(onboardingStep);
  const step = ONBOARDING_STEPS[stepIndex];
  const nextChapter = ONBOARDING_STEPS[stepIndex + 1];
  const completion = profileCompleteness(profile);
  const signals = useMemo(() => profileSignals(profile), [profile]);
  const isLast = stepIndex >= ONBOARDING_STEPS.length - 1;

  const setStep = (i: number) => setOnboardingStep(clampOnboardingStep(i));

  const goNext = () => {
    const err = validateStep(step.id, profile);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (isLast) {
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

  if (!hydrated) {
    return (
      <div className="ob-shell flex min-h-dvh items-center justify-center">
        <LoadingBlock label="Opening profile…" />
      </div>
    );
  }

  return (
    <div className="ob-shell">
      <header className="ob-top">
        <div className="route-frame flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-primary"
            >
              Route
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
            </Link>
            <span className="hidden text-[13px] text-secondary sm:inline">
              Building your admissions profile
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <p className="meta hidden tabular-nums sm:block">{completion}% on file</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadDemo();
                router.push("/analyze");
              }}
            >
              Try demo
            </Button>
          </div>
        </div>
      </header>

      <div className="route-frame ob-layout">
        {/* Mobile chapter progress */}
        <div className="ob-mobile-chapters lg:hidden" aria-label="Profile chapters">
          {ONBOARDING_STEPS.map((s, i) => {
            const state =
              i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
            return (
              <button
                key={s.id}
                type="button"
                data-state={state}
                className="ob-mobile-chip"
                onClick={() => {
                  setError(null);
                  setStep(i);
                }}
              >
                {state === "done" ? "✓" : null}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* LEFT — product journey + profile chapters */}
        <aside className="ob-rail" aria-label="Admissions route progress">
          <p className="label mb-3">Your route</p>
          <ol className="ob-route-stages">
            {JOURNEY.map((j) => {
              const isProfile = j.id === "profile";
              return (
                <li
                  key={j.id}
                  className={
                    isProfile
                      ? "ob-route-stage is-active"
                      : "ob-route-stage is-upcoming"
                  }
                >
                  <span className="ob-route-dot" aria-hidden />
                  <span>
                    <span className="ob-route-label">{j.label}</span>
                    {isProfile ? (
                      <span className="ob-route-meta">
                        {String(step.number).padStart(2, "0")} /{" "}
                        {String(ONBOARDING_STEPS.length).padStart(2, "0")} · {step.label}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="ob-chapters">
            <p className="label mb-2">Profile chapters</p>
            <div className="ob-chapter-list">
              {ONBOARDING_STEPS.map((s, i) => {
                const state =
                  i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-state={state}
                    className="ob-chapter"
                    onClick={() => {
                      setError(null);
                      setStep(i);
                    }}
                  >
                    <span className="ob-chapter-mark" aria-hidden>
                      {state === "done" ? "✓" : String(s.number).padStart(2, "0")}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER — current chapter */}
        <section className="ob-stage">
          <div className="ob-stage-head">
            <p className="label">
              Profile · {String(step.number).padStart(2, "0")} /{" "}
              {String(ONBOARDING_STEPS.length).padStart(2, "0")}
            </p>
            {!isLast && nextChapter ? (
              <p className="caption hidden sm:block">Next · {nextChapter.label}</p>
            ) : (
              <p className="caption hidden text-[var(--signal)] sm:block">Then · Understand</p>
            )}
          </div>

          <h1 className="ob-question text-h1">{step.title}</h1>
          <p className="ob-lede body text-secondary">{step.purpose}</p>

          <div key={step.id} className="ob-body enter">
            {renderStep(step.id, profile, setProfile, isLast)}
          </div>

          {error ? (
            <Alert tone="error" className="mt-5">
              {error}
            </Alert>
          ) : null}

          <div className="ob-actions">
            <Button variant="secondary" onClick={goBack}>
              {stepIndex === 0 ? "Leave" : "Back"}
            </Button>
            <Button variant="signal" size="lg" onClick={goNext}>
              {isLast ? "Build my route" : "Continue"}
            </Button>
          </div>
        </section>

        {/* RIGHT — profile signals */}
        <aside className="ob-signals" aria-label="Profile signals">
          <button
            type="button"
            className="ob-signals-toggle md:hidden"
            aria-expanded={signalsOpen}
            onClick={() => setSignalsOpen((v) => !v)}
          >
            <span className="label">Profile signals</span>
            <span className="meta">
              {signals.length ? `${signals.length} on file` : "Empty"} · {signalsOpen ? "Hide" : "Show"}
            </span>
          </button>

          <div className={signalsOpen ? "ob-signals-panel is-open" : "ob-signals-panel"}>
            <p className="label mb-3 hidden md:block">Profile signals</p>
            {signals.length === 0 ? (
              <p className="text-[13px] leading-5 text-tertiary">
                Answers appear here as you build — so you can see the profile taking shape.
              </p>
            ) : (
              <ul className="ob-signal-list">
                {signals.map((s) => (
                  <li key={s.id} className="ob-signal enter">
                    <span className="ob-signal-check" aria-hidden>
                      ✓
                    </span>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="ob-signals-note">
              {isLast
                ? "Next we turn this profile into a diagnosis — then campus options with reasons."
                : "You give the important pieces. Route turns them into a mapped admissions path."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function renderStep(
  id: OnboardingStepId,
  profile: ReturnType<typeof useRoute>["profile"],
  setProfile: ReturnType<typeof useRoute>["setProfile"],
  isLast: boolean,
) {
  switch (id) {
    case "academic":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input
                autoFocus
                value={profile.firstName}
                onChange={(e) => setProfile({ firstName: e.target.value })}
                placeholder="Amira"
              />
            </Field>
            <Field label="Last name">
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile({ lastName: e.target.value })}
                placeholder="Hassan"
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

          <div className="hairline" />

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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={profile.gpaScale === "ib" ? "IB points" : "GPA"}
              hint="Optional if you do not have a number yet."
            >
              <Input
                inputMode="decimal"
                value={profile.gpa}
                onChange={(e) => setProfile({ gpa: e.target.value })}
                placeholder={profile.gpaScale === "ib" ? "38" : "3.8"}
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
        <div className="space-y-8">
          <div>
            <p className="label mb-3">SAT</p>
            <OptionRows
              value={profile.satStatus}
              onChange={(v) => setProfile({ satStatus: v })}
              options={[
                { value: "done", label: "Score in hand", hint: "Math and ERW feed the match." },
                { value: "planned", label: "Planning to sit", hint: "Becomes a dated roadmap task." },
                { value: "skip", label: "Not using SAT", hint: "Test-optional paths stay open." },
              ]}
            />
            {profile.satStatus === "done" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="SAT Math">
                  <Input
                    autoFocus
                    inputMode="numeric"
                    value={profile.satMath}
                    onChange={(e) => setProfile({ satMath: e.target.value })}
                    placeholder="760"
                  />
                </Field>
                <Field label="SAT ERW">
                  <Input
                    inputMode="numeric"
                    value={profile.satEbrw}
                    onChange={(e) => setProfile({ satEbrw: e.target.value })}
                    placeholder="710"
                  />
                </Field>
              </div>
            ) : null}
          </div>
          <div>
            <p className="label mb-3">English proficiency</p>
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
            {profile.englishExam !== "none" ? (
              <div className="mt-4 max-w-xs">
                <Field label="Score">
                  <Input
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
                </Field>
              </div>
            ) : null}
          </div>
        </div>
      );

    case "activities":
      return (
        <div className="space-y-6">
          <Field
            label="What you spend time on"
            hint="Clubs, projects, work, volunteering — short phrases are enough."
          >
            <TextArea
              autoFocus
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
          <div>
            <p className="label mb-3">Research experience</p>
            <Segmented
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
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="label">Intended field</p>
              <p className="caption">Choose one</p>
            </div>
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
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="label">Campus strengths that matter</p>
              <p className="caption">
                {profile.interests.length
                  ? `${profile.interests.length} selected`
                  : "Select at least one"}
              </p>
            </div>
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
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="label">Countries</p>
            <p className="caption">
              {profile.countries.length
                ? `${profile.countries.length} selected`
                : "Select at least one"}
            </p>
          </div>
          <ChoiceGrid<CountryId>
            multiple
            value={profile.countries}
            onChange={(v) => setProfile({ countries: v as CountryId[] })}
            options={(Object.keys(countryLabels) as CountryId[]).map((cid) => ({
              value: cid,
              label: countryLabels[cid],
            }))}
          />
        </div>
      );

    case "aid":
      return (
        <div className="space-y-7">
          <div>
            <p className="label mb-3">Aid need</p>
            <OptionRows<AidNeed>
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
          <ProfileRange
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
            <p className="label mb-3">Recommendation letters</p>
            <Segmented
              value={profile.recLettersStarted ? "yes" : "no"}
              onChange={(v) => setProfile({ recLettersStarted: v === "yes" })}
              options={[
                { value: "no", label: "Not asked yet" },
                { value: "yes", label: "Already asked" },
              ]}
            />
          </div>

          <div className="ob-complete-panel">
            <p className="label">Profile complete</p>
            <p className="mt-2 text-[22px] font-medium tracking-tight">
              {profile.firstName || "—"} {profile.lastName}
            </p>
            <p className="body mt-2 text-secondary">
              {isLast
                ? "Your profile is ready. Next, we’ll turn it into a concise admissions diagnosis."
                : "Finish earlier chapters before analyzing."}
            </p>
            <dl className="ob-complete-grid mt-5">
              <div>
                <dt className="caption">Field</dt>
                <dd className="text-[14px] font-medium">
                  {profile.field ? fieldLabels[profile.field] : "—"}
                </dd>
              </div>
              <div>
                <dt className="caption">Aid</dt>
                <dd className="text-[14px] font-medium capitalize">{profile.aidNeed || "—"}</dd>
              </div>
              <div>
                <dt className="caption">Countries</dt>
                <dd className="text-[14px] font-medium">
                  {profile.countries.length
                    ? profile.countries.map((c) => countryLabels[c]).join(", ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="caption">Budget</dt>
                <dd className="text-[14px] font-medium">
                  ${Number(profile.annualBudget || 0).toLocaleString()}/yr
                </dd>
              </div>
            </dl>
          </div>
        </div>
      );
  }
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { campusImage } from "@/lib/media";
import { profileReady } from "@/lib/onboarding";
import { useRoute } from "@/lib/store";

export default function LandingPage() {
  const { loadDemo, profile, hydrated } = useRoute();
  const router = useRouter();
  const mit = campusImage("mit");
  const ready = profileReady(profile);

  return (
    <div className="min-h-dvh bg-background">
      <header
        className="mx-auto flex items-center justify-between px-[var(--space-page)] py-4"
        style={{ maxWidth: "var(--content)" }}
      >
        <span className="text-[15px] font-semibold tracking-tight">Route</span>
        <Link
          href={ready ? "/results" : "/onboarding"}
          className="small text-secondary hover:text-primary"
        >
          {ready ? `Continue as ${profile.firstName}` : "Resume profile"}
        </Link>
      </header>

      <main
        className="mx-auto grid items-end gap-12 px-[var(--space-page)] pb-20 pt-8 lg:grid-cols-12 lg:gap-10 lg:pt-16"
        style={{ maxWidth: "var(--content)" }}
      >
        <div className="enter lg:col-span-5">
          <p className="label">Admissions navigation</p>
          <h1 className="text-display mt-4">
            Profile in.
            <br />
            Route out.
          </h1>
          <p className="body mt-5 max-w-md text-secondary">
            Build a profile, run a transparent analysis, see why each campus fits, then follow a
            monthly application roadmap — with exams you already finished removed.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button href="/onboarding" size="lg" variant="signal">
              Build your profile
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={!hydrated}
              onClick={() => {
                loadDemo();
                router.push("/analyze");
              }}
            >
              Try demo profile
            </Button>
          </div>

          <ol className="mt-12 space-y-3 border-t border-border pt-6">
            {[
              ["01", "Build profile", "Academics, tests, interests, aid"],
              ["02", "Analyze", "Deterministic match on your constraints"],
              ["03", "Act", "Compare campuses · follow the roadmap"],
            ].map(([n, t, d]) => (
              <li key={n} className="grid grid-cols-[2rem_1fr] gap-3 text-[13px]">
                <span className="meta">{n}</span>
                <span>
                  <span className="font-medium">{t}</span>
                  <span className="text-secondary"> — {d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="enter lg:col-span-7">
          <div className="overflow-hidden border border-border bg-surface shadow-[var(--shadow-panel)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-[12px] font-medium">Results preview</span>
              <span className="meta">Why-first recommendations</span>
            </div>
            {mit ? (
              <div className="relative aspect-[2.1/1] bg-surface-muted">
                <Image
                  src={mit.src}
                  alt={mit.caption}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 720px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-mono text-[10px] tracking-[0.1em] text-white/70">
                    01 · CAMBRIDGE, US
                  </p>
                  <p className="mt-1 text-[22px] font-medium tracking-tight">
                    Massachusetts Institute of Technology
                  </p>
                  <p className="mt-2 max-w-lg text-[13px] leading-5 text-white/90">
                    Why it fits: quantitative CS path + need-based aid that can meet full
                    demonstrated need for a full-aid applicant.
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid sm:grid-cols-3">
              {[
                ["Next", "Compare two campuses"],
                ["Then", "Open your roadmap"],
                ["Always", "Edit profile live"],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-border px-4 py-3 sm:border-r sm:last:border-r-0">
                  <p className="label">{k}</p>
                  <p className="mt-1 text-[13px] font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

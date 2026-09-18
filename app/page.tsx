"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { campusImage } from "@/lib/media";
import { useRoute } from "@/lib/store";

export default function LandingPage() {
  const { loadDemo, profile } = useRoute();
  const router = useRouter();
  const mit = campusImage("mit");
  const hasSaved = Boolean(profile.firstName);

  return (
    <div className="min-h-dvh bg-background">
      <header
        className="mx-auto flex items-center justify-between px-[var(--space-page)] py-4"
        style={{ maxWidth: "var(--content)" }}
      >
        <span className="text-[15px] font-semibold tracking-[-0.02em]">Route</span>
        <Link
          href={hasSaved ? "/universities" : "/profile"}
          className="small text-secondary transition-colors hover:text-primary"
        >
          {hasSaved ? `Continue as ${profile.firstName}` : "Open saved profile"}
        </Link>
      </header>

      <main
        className="mx-auto grid gap-10 px-[var(--space-page)] pb-20 pt-6 lg:grid-cols-12 lg:gap-8 lg:pt-12"
        style={{ maxWidth: "var(--content)" }}
      >
        <div className="enter lg:col-span-5 lg:pt-4">
          <p className="label">International admissions</p>
          <h1 className="text-display mt-3">
            Map the route.
            <br />
            <span className="text-secondary">Know the why.</span>
          </h1>
          <p className="body mt-5 max-w-sm text-secondary">
            Profile → insights → matches → compare → monthly route. Built for applicants who need
            reasons, not match percentages.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button href="/profile">Start profile</Button>
            <Button
              variant="secondary"
              onClick={() => {
                loadDemo();
                router.push("/diagnosis");
              }}
            >
              Try demo profile
            </Button>
          </div>
          <ol className="mt-10 space-y-2 border-t border-border pt-6">
            {[
              "Constraints reshape the shortlist live",
              "Every campus shows why it appears",
              "The route skips exams you already finished",
            ].map((line, i) => (
              <li key={line} className="flex gap-3 text-[13px] text-secondary">
                <span className="font-mono text-[11px] text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>

        <div className="enter-delay lg:col-span-7">
          <div className="overflow-hidden border border-border bg-surface shadow-[var(--shadow-panel)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                <span className="text-[12px] font-medium">Matches</span>
              </div>
              <span className="meta">Demo preview</span>
            </div>
            {mit ? (
              <div className="relative aspect-[2.2/1] bg-surface-muted">
                <Image
                  src={mit.src}
                  alt={mit.caption}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 640px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
                  <p className="font-mono text-[10px] tracking-[0.08em] text-white/70">
                    01 · CAMBRIDGE, US
                  </p>
                  <p className="mt-1 text-[20px] font-medium tracking-tight sm:text-[22px]">
                    Massachusetts Institute of Technology
                  </p>
                  <p className="mt-2 max-w-md text-[13px] leading-5 text-white/85">
                    Why this appears: quantitative CS path + need-based aid that can meet full
                    demonstrated need.
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <PreviewMeta k="Fit index" v="94" />
              <PreviewMeta k="Aid signal" v="Meets full need" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PreviewMeta({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-4 py-3">
      <p className="label">{k}</p>
      <p className="mt-1 text-[14px] font-medium">{v}</p>
    </div>
  );
}

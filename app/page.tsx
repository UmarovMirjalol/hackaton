"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useRoute } from "@/lib/store";

export default function LandingPage() {
  const { loadDemo } = useRoute();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-[15px] font-medium tracking-tight">Route</span>
        <Link href="/profile" className="small text-secondary hover:text-primary">
          Open saved profile
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-10">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="max-w-md">
            <h1 className="text-display">Your admissions route, with reasons.</h1>
            <p className="body mt-4 text-secondary">
              Build a profile once. See why each campus fits, compare tradeoffs, and get a monthly
              route that skips work you have already done.
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
          </div>

          <div className="border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="label">Live product</span>
              <span className="meta">Matches</span>
            </div>
            <div className="divide-y divide-border">
              <PreviewRow
                rank="01"
                name="MIT"
                place="Cambridge, US"
                why="CS strength + need-based aid that can meet full demonstrated need for your profile."
                fit="94"
              />
              <PreviewRow
                rank="02"
                name="Brown"
                place="Providence, US"
                why="Open curriculum + research culture aligned with your interests and aid requirement."
                fit="91"
              />
            </div>
            <p className="border-t border-border px-4 py-3 caption">
              Demo preview — your list is generated from your profile.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function PreviewRow({
  rank,
  name,
  place,
  why,
  fit,
}: {
  rank: string;
  name: string;
  place: string;
  why: string;
  fit: string;
}) {
  return (
    <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="meta">
          {rank} · {place}
        </p>
        <p className="mt-1 text-[15px] font-medium">{name}</p>
        <p className="mt-2 text-[13px] leading-5 text-secondary">{why}</p>
      </div>
      <p className="font-mono text-[13px] text-secondary sm:text-right">Fit {fit}</p>
    </div>
  );
}

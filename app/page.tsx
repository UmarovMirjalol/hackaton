"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { demoProfile } from "@/lib/types";
import { useRoute } from "@/lib/store";

export default function LandingPage() {
  const { replaceProfile } = useRoute();
  const router = useRouter();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-serif text-[22px] tracking-tight">Route</span>
        <Link href="/profile" className="text-[13px] text-secondary hover:text-primary">
          Continue a saved route
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:pt-10">
        <section className="lg:col-span-5">
          <p className="label mb-4">University applications</p>
          <h1 className="page-title text-[40px] sm:text-[52px]">
            Your application,
            <br />
            mapped out.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-7 text-secondary">
            Enter a school record, a budget, and the countries you will actually apply in.
            Route returns a shortlist with reasons, a comparison against your constraints,
            and a month-by-month plan. It does not invent an admissions chance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/profile">Build my route</Button>
            <Button
              variant="secondary"
              onClick={() => {
                replaceProfile(demoProfile);
                router.push("/diagnosis");
              }}
            >
              Open the demo student
            </Button>
          </div>
          <p className="mt-4 max-w-sm text-[12px] leading-5 text-tertiary">
            Demo student: Amira Hassan, IB, Kenya, CS, SAT already sat, IELTS 7.5, full aid required.
            Change any of those later and the list updates.
          </p>
        </section>

        <aside className="lg:col-span-7">
          <RoutePreview />
        </aside>
      </main>
    </div>
  );
}

function RoutePreview() {
  return (
    <div className="border border-border bg-surface p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="label">Working route</p>
          <p className="mt-1 font-serif text-[24px]">Amira Hassan · 2027</p>
        </div>
        <p className="meta hidden sm:block">CS · full aid · US / CA / AE</p>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="label mb-2">Why NYU Abu Dhabi is first</p>
          <p className="text-[14px] leading-6 text-secondary">
            Quantitative interests, existing research, and a full-aid constraint. NYUAD is one of the few
            campuses in this catalog where those three can coexist.
          </p>
        </div>
        <div className="space-y-2">
          <PreviewRow k="Financial aid" v="Need-aware, substantial packages" />
          <PreviewRow k="Research" v="Undergraduate research is normal" />
          <PreviewRow k="Academic fit" v="Computer science offered" />
        </div>
      </div>

      <div className="mt-7 border-t border-border pt-5">
        <p className="label mb-3">September</p>
        <ul className="space-y-2 text-[14px]">
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" />
            Ask two teachers for recommendations
          </li>
          <li className="flex gap-3 text-secondary">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-border" />
            SAT skipped — score already on file
          </li>
        </ul>
      </div>
    </div>
  );
}

function PreviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-1.5 text-[13px]">
      <span className="text-tertiary">{k}</span>
      <span className="text-right text-primary">{v}</span>
    </div>
  );
}

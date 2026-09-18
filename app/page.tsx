"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { campusImage } from "@/lib/media";
import { demoProfile } from "@/lib/types";
import { useRoute } from "@/lib/store";

export default function LandingPage() {
  const { replaceProfile } = useRoute();
  const router = useRouter();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-[15px] font-semibold tracking-tight">Route</span>
        <Link href="/profile" className="text-[13px] text-secondary hover:text-primary">
          Continue a saved route
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-8">
        <section className="flex flex-col justify-center lg:col-span-5">
          <p className="label mb-3">University applications</p>
          <h1 className="text-display">
            Your application,
            <br />
            mapped out.
          </h1>
          <p className="body mt-4 max-w-md text-secondary">
            For students applying internationally. Route turns your record, budget, and country list
            into matches with reasons, a comparison, and a month-by-month admissions route.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
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
            Demo: Amira Hassan · IB · Kenya · CS · SAT done · IELTS 7.5 · full aid.
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
  const mit = campusImage("mit");
  const nyuad = campusImage("nyuad");
  const brown = campusImage("brown");

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[0_1px_0_rgba(17,19,24,0.04)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-2 font-mono text-[11px] text-tertiary">route · working preview</span>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border">
        {[mit, nyuad, brown].map((img, i) =>
          img ? (
            <div key={img.src} className="group relative aspect-[4/3] overflow-hidden bg-surface-muted">
              <Image
                src={img.src}
                alt={img.caption}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-2 left-2 font-mono text-[10px] text-white/90">
                {i === 0 ? "MIT" : i === 1 ? "Abu Dhabi" : "Brown"}
              </p>
            </div>
          ) : null,
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="label">Working route</p>
            <p className="mt-1 text-[20px] font-semibold tracking-tight">Amira Hassan · 2027</p>
          </div>
          <p className="meta">CS · full aid · US / CA / AE</p>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label mb-2">Why NYU Abu Dhabi is first</p>
            <p className="text-[13.5px] leading-6 text-secondary">
              Quantitative interests, existing research, and a full-aid constraint. NYUAD is one of
              the few campuses in this catalog where those three can coexist.
            </p>
          </div>
          <div className="space-y-0">
            <PreviewRow k="Financial aid" v="Need-aware, substantial packages" />
            <PreviewRow k="Research" v="Undergraduate research is normal" />
            <PreviewRow k="Academic fit" v="Computer science offered" />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="label mb-3">September</p>
          <ul className="space-y-2 text-[13.5px]">
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Ask two teachers for recommendations
            </li>
            <li className="flex gap-2.5 text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
              SAT skipped — score already on file
            </li>
          </ul>
          <p className="mt-4 text-[10.5px] leading-4 text-tertiary">
            Preview photos from Wikimedia Commons — demo imagery, not official partnerships.
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-[13px] last:border-0">
      <span className="text-tertiary">{k}</span>
      <span className="text-right font-medium text-primary">{v}</span>
    </div>
  );
}

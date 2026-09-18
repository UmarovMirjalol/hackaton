"use client";

import Image from "next/image";
import { StatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { campusImage } from "@/lib/media";
import type { Profile, RankedUniversity } from "@/lib/types";
import { fieldLabels } from "@/lib/universities";

export function MatchDetail({
  row,
  profile,
  open,
  onClose,
  onCompare,
  inCompare,
}: {
  row: RankedUniversity | null;
  profile: Profile;
  open: boolean;
  onClose: () => void;
  onCompare: () => void;
  inCompare: boolean;
}) {
  if (!open || !row) return null;
  const img = campusImage(row.university.id);
  const u = row.university;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/25" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-[-8px_0_32px_-12px_rgba(0,0,0,0.12)] enter">
        <div className="relative h-40 shrink-0 bg-surface-muted">
          {img ? (
            <Image src={img.src} alt={img.caption} fill className="object-cover" sizes="512px" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-[var(--radius-sm)] bg-black/40 px-2 py-1 text-[12px] text-white"
          >
            Close
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="caption text-white/70">{u.city}, {u.country}</p>
            <h2 className="text-h2 mt-0.5 text-white">{u.name}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="label">Why this match</p>
          <p className="body mt-2 text-secondary">{row.why}</p>

          <div className="mt-6 space-y-4">
            {row.factors.map((f) => (
              <div key={f.key} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{f.label}</span>
                  <StatusBadge status={f.tone} />
                </div>
                <p className="mt-1 text-[14px]">{f.value}</p>
                <p className="caption mt-1">{f.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 border-t border-border pt-5 text-[13px]">
            <Row k="Program" v={fieldLabels[profile.field]} />
            <Row k="Intl tuition (demo)" v={`$${u.tuitionIntlUsd.toLocaleString()}/yr`} />
            <Row k="Aid" v={u.aid.summary} />
            <Row k="Application" v={u.application} />
            <Row k="English" v={u.english} />
            {u.deadlines.map((d) => (
              <Row key={d.label} k={d.label} v={d.date} />
            ))}
          </div>

          <p className="caption mt-4">{u.tuitionNote}</p>
          <div className="mt-2 flex flex-col gap-1">
            {u.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="caption underline decoration-border underline-offset-2 hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t border-border p-4">
          <Button className="flex-1" variant="secondary" onClick={onCompare}>
            {inCompare ? "In comparison" : "Add to compare"}
          </Button>
          <Button className="flex-1" href="/compare">
            Open compare
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-tertiary">{k}</span>
      <span className="text-primary">{v}</span>
    </div>
  );
}

"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { campusImage } from "@/lib/media";

const PLACE_TONES: Record<string, [string, string]> = {
  us: ["#1a3a4a", "#0d6e6a"],
  ca: ["#1e3a5f", "#2a6f97"],
  uk: ["#2c2438", "#5c4a6e"],
  nl: ["#1f3d36", "#3d7a6a"],
  de: ["#2a2e24", "#5a6b45"],
  ch: ["#2a2430", "#6e4a5c"],
  ae: ["#2a2218", "#8a6a3a"],
  hk: ["#1a2438", "#3a5a8a"],
};

export function CampusMedia({
  universityId,
  countryId,
  shortName,
  alt,
  className,
  priority,
  sizes = "(max-width: 640px) 100vw, 280px",
  overlay,
}: {
  universityId: string;
  countryId?: string;
  shortName: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Dark gradient for text legibility */
  overlay?: boolean;
}) {
  const img = campusImage(universityId);
  const tone = PLACE_TONES[countryId ?? ""] ?? ["#1c2430", "#0d6e6a"];
  // `cn` does not twMerge — never ship both relative and absolute or Image fill collapses to 0 height.
  const fillFrame = /\babsolute\b/.test(className ?? "");

  return (
    <div
      className={cn(
        "campus-media overflow-hidden bg-surface-muted",
        fillFrame ? "h-full w-full" : "relative",
        className,
      )}
    >
      {img ? (
        <Image
          src={img.src}
          alt={alt || img.caption}
          fill
          sizes={sizes}
          priority={priority}
          className="campus-media-img object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${tone[0]} 0%, ${tone[1]} 100%)`,
          }}
          aria-hidden
        >
          <div className="absolute inset-0 opacity-30 mix-blend-overlay campus-media-grain" />
          <span className="absolute bottom-3 left-3 font-mono text-[11px] tracking-[0.14em] text-white/80">
            {shortName.toUpperCase()}
          </span>
        </div>
      )}
      {overlay ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

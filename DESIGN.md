# Route — Design System (Foundation)

Premium editorial admissions product for LOCUS Hackathon 2026 · Case 02.

## Product journey

| Stage | Route | Purpose |
| --- | --- | --- |
| **Profile** | `/onboarding` | Build the admissions dossier |
| **Understand** | `/analyze` | Transparent staged analysis (real engine) |
| **Explore** | `/results` | Diagnosis + why-first recommendations |
| **Decide** | `/compare` | Shortlist tradeoffs (requires ≥2 picks) |
| **Act** | `/roadmap` | Monthly tasks + next action |

Legacy redirects: `/profile` → onboarding, `/diagnosis` & `/universities` → results.

## Visual principles

- Editorial, calm, precise — stone canvas + **signal teal**, not generic AI SaaS
- Display type: **Instrument Serif** for LOCUS brand + page titles; IBM Plex Sans/Mono for UI
- Accent: **signal teal** for progress, CTAs, “why” rails — never parchment/cream + terracotta
- Hairlines, soft panel shadows, and purposeful motion over decorative card grids
- No purple gradients, glassmorphism chrome, glow borders, or fake match %

## Tokens (`app/globals.css`)

| Token | Role |
| --- | --- |
| `--background` / `--surface` / `--surface-muted` | Canvas & work surfaces |
| `--text-primary` / `--secondary` / `--tertiary` | Hierarchy |
| `--signal` (+ hover / subtle) | Brand progress & product CTAs |
| `--success` / `--warning` / `--error` / `--info` | Semantic feedback |
| `--space-1`…`--space-12`, `--space-page`, `--space-section` | Spacing scale |
| `--radius-sm/md/lg/xl` | Tight chrome |
| `--duration-fast/duration/duration-slow`, `--ease` | Motion |
| `--content` / `--content-wide` / `--content-narrow` | Layout widths |

Typography utilities: `.text-display`, `.text-h1`–`.text-h3`, `.body`, `.label`, `.meta`, `.caption`.

Layout helpers: `.route-frame`, `.panel`, `.panel-muted`, `.hairline`, `.enter`, `.skeleton`.

## Shared components

| Path | Role |
| --- | --- |
| `components/ui/Button.tsx` | primary / secondary / ghost / signal / danger · sizes · loading |
| `components/ui/Field.tsx` | Input, Select, TextArea, Field |
| `components/ui/Choices.tsx` | Segmented, ChoiceGrid |
| `components/ui/Badges.tsx` | StatusBadge, SourceCitation |
| `components/ui/States.tsx` | Alert, EmptyState, LoadingBlock |
| `components/AppShell.tsx` | Product chrome + **Your route** journey rail + mobile nav |
| `components/NextUp.tsx` | Sticky next-action bar |
| `components/onboarding/Controls.tsx` | Onboarding-scoped controls (local visual language) |

## State & data

- Persist: `lib/persist.ts` · key `route.admissions.v3` · `useSyncExternalStore`
- Match / diagnosis / roadmap: deterministic `lib/matching.ts`, `lib/diagnosis.ts`, `lib/roadmap.ts`
- Completeness: `profileCompleteness()` in `lib/journey.ts` (real fields, not fake scores)
- Catalog transparency: `DEMO_DATA_NOTICE` · campus images via Wikimedia + `IMAGE_DISCLAIMER`
- No backend · no fabricated AI results

## Interaction states

Interactive primitives must support: default · hover · focus-visible · active · selected · disabled · loading · error (where applicable).

Motion: purposeful only (enter, progress width, skeleton). Respect `prefers-reduced-motion`.

## Responsiveness

Design from ~390px up. AppShell uses bottom nav &lt; md; journey rail ≥ md. Avoid horizontal overflow for core content.

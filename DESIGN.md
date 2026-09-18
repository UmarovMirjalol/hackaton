# Route — Design System

## Product flow

Landing → Onboarding (7 steps) → Analyze → Results → Compare → Roadmap

## Visual system

| Token | Value | Role |
| --- | --- | --- |
| Background | `#F4F5F7` | Cool stone |
| Surface | `#FFFFFF` | Work surfaces |
| Ink / primary CTA | `#0B0D12` | Strong actions |
| Signal | `#0D6E6A` | Progress, primary product CTAs, “why” rails |
| Type | IBM Plex Sans + Mono | Distinctive, professional |
| Radius | 3 / 5 / 8px | Tight product chrome |
| Structure | Hairlines + typography | No card grids as decoration |

**Avoid:** purple gradients, cream+terracotta clusters, glassmorphism, fake AI waiters, decorative card stacks.

## Architecture

- Single profile source of truth: `lib/persist.ts` + `useSyncExternalStore`
- Match / diagnosis / roadmap: deterministic `lib/matching.ts`, `lib/diagnosis.ts`, `lib/roadmap.ts`
- Analyze UI stages the real computation — does not invent results

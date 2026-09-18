# Route — Design System

Original visual language. Principles inspired by Linear / Stripe / Notion restraint — not clones.

## System tokens

| Token | Value | Role |
| --- | --- | --- |
| Background | `#F6F7F8` | Cool stone canvas (not warm cream) |
| Surface | `#FFFFFF` | Work surfaces |
| Surface muted | `#ECECE7` | Nested chrome |
| Text | `#111110` / `#5C5C57` / `#8B8B84` | Hierarchy from tone |
| Accent | `#0C2D48` deep navy | Single signal for CTAs; cool, trustworthy, not terracotta/purple |
| Borders | `#E0E0DA` | Structure from lines, not elevation |
| Radius | 2 / 4 / 6px | Tight product controls |
| Type | IBM Plex Sans + IBM Plex Mono | Distinctive professional sans |
| Motion | 150–220ms ease | State feedback only |

**Avoid:** purple/teal AI gradients, glassmorphism, glow, giant cards, fake stats, emoji UI, cream+terracotta+serif clusters.

## Components

- Buttons: primary (accent fill), secondary (border), ghost
- Inputs: 40px height, accent ring on focus
- Segmented / ChoiceGrid: hairline borders, inset accent bar when selected
- Status badges: soft semantic fills (no rainbow borders)
- Navigation: numbered journey rail + underline active mark
- NextUp: sticky bottom bar with one clear CTA

## Screens

1. **Landing** — Product interface first (campus photo + why). Brand + one CTA pair.
2. **Profile** — Guided questions, progress segments, dossier when complete.
3. **Insights** — Analytical signals from real profile data + snapshot panel.
4. **Matches** — Editorial list with live filters; every row explains fit.
5. **Compare** — Side-by-side tradeoffs with hover highlight.
6. **Route** — Timeline with shortlist strip, progress, focused next task.

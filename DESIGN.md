# Route — Design System Brief

Visual language is original. References below are for **principles only** — not layout, color, branding, or component clones.

## Diagnosis of the current UI

What already works:
- Coherent end-to-end journey and progress trail
- Stepped profile groups, live recommendation controls, sourced demo data
- Borders over shadows; one primary action per screen

What hurts quality (and will be replaced):
- Warm cream + terracotta + serif display = the common “AI editorial SaaS” cluster
- Uppercase micro-labels + serif titles read as template, not product
- Some panels feel like decorative cards rather than decision surfaces

## Original system (synthesis)

| Token | Direction | Why |
| --- | --- | --- |
| Background | Cool stone `#F4F5F7` | Stripe/Notion calm canvas — not warm cream |
| Surface | `#FFFFFF` | Clear work surfaces on a soft field |
| Surface muted | `#EBEDF0` | Linear-style nested chrome without dark mode |
| Text | Near-black `#111318`, secondary `#5C6370`, tertiary `#8B929E` | Hierarchy from tone, not size jumps |
| Accent | Deep teal `#0B6E6A` | One strong accent; readable in grayscale as weight/contrast; not purple, not terracotta |
| Borders | `#D8DCE3` hairlines | Structure from lines, not elevation |
| Radius | 6px controls · 8px panels · 2px chips | Intentional variation; no pill-everything |
| Type | Geist Sans + Geist Mono | Product personality without Inter default or display serif |
| Spacing | 4px base · 8 / 12 / 16 / 24 / 32 / 48 | Linear/Stripe rhythm |
| Motion | 120–200ms opacity/color only | State, not spectacle |

**Deliberately avoid:** purple gradients, glassmorphism, glow, giant rounded cards, fake match %, stock photos, emoji decoration, broadsheet hairline newspaper layouts, cream+terracotta+serif.

---

## Per-screen references

### 1. Landing

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Vercel** | Product-first hero: short claim + product surface, not lifestyle art | Judges understand the tool in one glance | Left: brand + claim + primary CTA. Right: live route preview (diagnosis snippet + factors + September tasks) | Marketing feature grids, “AI-powered” copy |
| **Linear (marketing)** | Screenshot/panel as proof, not illustration | Credibility from the actual UI | Preview uses real demo student data | Floating blobs, abstract 3D |
| **Stripe docs / product** | Plain language of outcomes | Trust through specificity | “What you get” in one paragraph; no fake stats | Fake testimonials |
| **Notion** | Empty-state calm: start working immediately | Low ceremony for a tool | Secondary: continue saved / open demo | Multi-section SaaS landing |
| **shadcn blocks (marketing restraint)** | Tight CTA pair, sparse chrome | Focus | Primary + secondary buttons only | Hero overlays, badge stickers |

### 2. Profile / questionnaire

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **shadcn Field / ToggleGroup** | Label + control + description; 2–7 options as segmented toggles | Fast, accessible, dense | Keep stepped groups; segmented for SAT/curriculum; choice grid for countries/aid | Giant radio cards for every option |
| **Stripe Checkout** | One job per step, sticky progress, clear back/continue | Reduces abandonment | Left step list with “why this matters”; footer Back/Continue | 25 fields on one page |
| **Typeform (adapted)** | Progressive disclosure | Cognitive ease | Groups, not one-question theatre | Full-screen single question drama |
| **Radix Toggle / Radio** | Selected = inverted fill or strong border | State is obvious | Selected = ink fill on segment; border emphasis on multi-select | Soft purple selected pills |
| **Common App (restraint)** | Serious academic form tone | Fits admissions context | Neutral language, helper text for *why* | Gamified progress confetti |

### 3. Diagnosis

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Linear issue detail** | Title as synthesis; properties as evidence rows | Feels like understanding, not a form echo | Profile title (“Research-oriented builder”) + strength/constraint/goal rows | Dashboard KPI tiles |
| **Notion page properties** | Label | value rows | Scannable evidence | Two-column evidence list | Property chips everywhere |
| **Stripe Customer view** | Summary + gaps / risk callouts | Honest about missing data | “What Route still does not know” panel | Fake completeness |
| **Apple Health / summary cards** | Sparse sections with clear headings | Calm clinical clarity without medical branding | Section labels for Strengths / Constraints / Goals | Colorful health rings |
| **Material “detail + supporting”** | Primary narrative, secondary metadata | Hierarchy | Title + lede; evidence below | Card stacks of repeated answers |

### 4. University recommendations

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Linear issue list** | Dense rows, rank, title, one-line context | High information without cards | Numbered list entries with fit index + why paragraph | Logo + ranking + “95% match” cards |
| **Stripe Payments list + filters** | Sticky filter rail that changes the list | Personalization becomes visible | Sticky field/aid/country controls | Hidden filters in a modal |
| **Airbnb listing “why”** | Explanation before amenities | Trust | Why first, then 3–5 factors | Decorative campus photos |
| **Ramp expense list** | Status tone (good/mixed/watch) sparingly | Decision cues | Tone badges on factors only | Color coding every cell |
| **College Board / Common App** | Sourced, cautious claims | Admissions ethics | Fit methodology + demo catalog note | Invented admit odds |

### 5. Comparison

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Stripe DataTable** | Fixed first column, aligned cells, sparse chrome | Compare on user jobs | Rows = aid / research / fit / location / selectivity / deadlines | Spreadsheet of rankings |
| **Notion database table** | Readable headers, wrap on mobile | Familiar structure | Desktop table; mobile stacked sections | Horizontal scroll on phones |
| **Wirecutter compare** | Criteria that answer a decision | “Differ for YOU” | Column headers = short names; cells = value + short detail | Spec dump without priorities |
| **G2 / product compare (light)** | Side-by-side attributes | Quick scan | Max 3 campuses | Feature checkmark grids |
| **Material data table patterns** | Responsive transform | Usable mobile | Stacked articles per campus on `< md` | Shrinking desktop table |

### 6. Roadmap

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Linear cycles / project timeline** | Month groups + task rows + status | Chronology without calendar chrome | SEPTEMBER / OCTOBER… with task panels | Full calendar grid |
| **GitHub milestones** | Task + reason + due | Actionable | Title, reason, deadline, effort, source | Decorative timeline graphics |
| **Notion timeline (simple)** | Vertical month rhythm | Scannable | Vertical list, not Gantt | Parallax timeline |
| **Stripe onboarding checklist** | Completable items with clear state | Progress feels real | todo → started → done | Confetti / gamification |
| **Todoist / Things** | One clear next item | Reduces paralysis | Sticky “Next up” rail | Five equal CTAs |

### 7. Next action

| Reference | Pattern borrowed | Why it works | Our adaptation | Avoid |
| --- | --- | --- | --- | --- |
| **Ramp “needs attention”** | Single elevated action panel | Priority is obvious | Bordered primary panel (ink border, not color flood) | Floating action blobs |
| **Linear issue CTA** | One primary button | Decision speed | “Mark as started” only | Secondary action soup |
| **Gmail Priority / Focus** | Why it matters + when | Context without clutter | Deadline + effort rows | Fake urgency countdowns |
| **iOS Focus / Reminders** | Minimal chrome around the next item | Human, calm | Short title in sans; meta in mono | Chatbot “Ask AI what to do” |
| **Material snackbar / banner (pattern only)** | Persistent but not modal | Always available while scrolling | Sticky on desktop roadmap | Blocking modals |

---

## Component strategy

Reuse existing `Button`, `Field`, `Segmented`, `ChoiceGrid`, `StatusBadge`, `SourceCitation`, `AppShell`.

Refine (do not reinvent):
- Tokens + type (remove serif display)
- Button radius / hover (Vercel/Linear compact)
- Segmented as ToggleGroup-like control
- List rows for universities (not cards)
- Comparison table + mobile stack
- Timeline task row + Next-up panel

Prefer established patterns over invented widgets when uncertain.

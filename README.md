# Route

A small admissions product that turns a high-school profile — academics, exams, countries, budget, and goals — into a university **application route**: a diagnosis, a reasoned shortlist, a comparison, and a month-by-month plan.

This is a hackathon-ready demo. Rankings use a transparent **fit index**, not an invented admissions probability. Deadlines and aid notes are a **demo catalog** and must be confirmed on each university site.

Visual system principles and per-screen references live in [`DESIGN.md`](./DESIGN.md). Campus photo credits are in [`ATTRIBUTION.md`](./ATTRIBUTION.md).

## What you get

1. **Profile** — five short groups, not a 25-field wall.
2. **Diagnosis** — a synthesis with strengths, constraints, and explicit gaps.
3. **Universities** — explanations plus live controls (field / aid / countries) that reorder the list.
4. **Compare** — two or three campuses against *your* constraints.
5. **Roadmap** — tasks that skip work already done (for example, IELTS already on file).

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4567](http://127.0.0.1:4567).

Use **Open the demo student** on the landing page to walk the full path as Amira Hassan (IB, Kenya, CS, SAT done, IELTS 7.5, full aid).

State is stored in `localStorage` (`route.admissions.v1`). No backend and no API keys.

## Fit index

Weighted sum (0–100): academic overlap 30%, aid feasibility 25%, location 20%, research alignment 15%, testing/language 10%. Documented in the product next to the list.

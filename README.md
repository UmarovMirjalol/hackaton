# Route

Admissions navigation: **profile → analysis → personalized results → compare → roadmap**.

Deterministic matching on your constraints (not a black-box AI score). Demo catalog deadlines must be verified on each campus site.

## Flow

1. **Landing** — start or try demo
2. **Onboarding** (`/onboarding`) — 7 guided steps with validation
3. **Analyze** (`/analyze`) — staged run of the real match engine
4. **Results** (`/results`) — why-first recommendations + live filters
5. **Compare** — side-by-side tradeoffs
6. **Roadmap** — actionable monthly tasks with completion state

Legacy paths `/profile`, `/diagnosis`, `/universities` redirect into the new flow.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4567](http://127.0.0.1:4567).

**Try demo profile** loads Amira Hassan and runs analysis immediately.

State: `localStorage` key `route.admissions.v3`. No backend.

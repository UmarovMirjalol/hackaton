# Route

Admissions navigation: **profile → analysis → personalized results → compare → roadmap**.

Deterministic matching on your constraints (not a black-box AI score). Demo catalog deadlines must be verified on each campus site.

## Flow

1. **Landing** — start or try demo
2. **Onboarding** (`/onboarding`) — 7 guided steps with validation
3. **Analyze** (`/analyze`) — deterministic diagnosis, Gemini profile evaluation (quality/readiness, not odds), plus an optional concise Gemini explanation of that diagnosis (falls back when AI is unavailable)
4. **Results** (`/results`) — why-first recommendations + live filters; each card can include a Gemini “Why this fits you” explanation of the deterministic match (falls back when AI is unavailable)
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

State: `localStorage` key `route.admissions.v3`. Matching stays local — no backend required.

### Optional Gemini (server-only)

Copy `.env.example` → `.env.local` and set `GEMINI_API_KEY`. Never use `NEXT_PUBLIC_GEMINI_API_KEY`.

- Connectivity check: `GET` / `POST` `/api/ai/ping`
- Profile evaluation: `POST` `/api/ai/profile-evaluation` (quality/readiness; flags placeholder text; does not change ranking)
- Diagnosis explanation: `POST` `/api/ai/diagnosis-explanation`
- Recommendation explanation: `POST` `/api/ai/recommendation-explanation` (`context` or `contexts[]`; structured JSON; deterministic fallback if the key is missing or the call fails)

Without a key, `/analyze` and `/results` still show full deterministic content plus local explanations.

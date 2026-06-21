# Carbon Pact 🌱

> A behavioral change platform that helps individuals understand and reduce their carbon footprint — through empathy, social accountability, and psychology-backed habit design.

---

## The Problem with Every Climate App You've Already Abandoned

Most carbon trackers fail the same way. They ask you to log everything — every meal, every commute, every purchase. Within a week, the cognitive load becomes exhausting. This is **Decision Fatigue**, and it is neurologically real. Users burn out not because they stopped caring about the planet, but because the app turned caring into a second job.

Carbon Pact was designed to break this pattern.

---

## The Approach

Carbon Pact asks you to log **just enough to maintain your status**. It is built around three psychological principles — each a deliberate countermeasure against the failure modes of traditional climate tech.

This is not a carbon calculator. It is a **behavioral change engine**.

---

## Core Features

### 🧠 Faces of Impact — Empathy Engine

Abstract CO₂ numbers do not change behavior. Human faces do.

Every week, the app surfaces a **Climate Persona** — a real-seeming individual from a climate-vulnerable region whose daily life is directly affected by the kind of choices the user is making. The persona's narrative updates in real time, tied to the user's logged activity and savings, making the impact feel personal rather than statistical.

The persona assignment is fully deterministic. `getPersonaForWeek()` uses `getISOWeekNumber()` to hash the current calendar week to one of eight personas — every user on the same week sees the same persona, and no user sees the same persona twice in consecutive weeks. Both functions are unit-tested.

---

### ⚡ Ripple Effect — Nudge OS

At the moment a user logs a high-emission activity, they receive a **Nudge Card** that translates the impact into relatable human terms and offers a lower-emission alternative.

> *Your Delhi to Mumbai flight = 147kg CO₂. That is 3 weeks of electricity for an average Indian home. The Vande Bharat Express covers this route in 8 hours and emits 91% less.*

Accepting the alternative triggers a GPU-composited CSS ripple animation and a smooth live counter that ticks the footprint value down in real time. The reward signal arrives at the exact moment of the good decision — the same hook used in every successful habit app.

---

### 🕸️ Carbon Pacts — The Tension Web

Groups of 3–5 users form **Pacts** around a shared monthly commitment. Every member starts at a **100% Trust Score** — this is Loss Aversion in action. People work harder to protect what they already have than to gain something new.

The Trust Score feeds a **live SVG Tension Web**. Each pact member is a node on a circle. The position of every node is calculated in real time by `computeNodePosition()` — a pure trigonometric function that maps trust score to a radius between 40% and 100% of the base circle. A member at full trust sits at the outer rim. A member who has broken commitments is pulled inward, visibly sagging, visibly dragging the edges connecting them to their peers.

This is not a static illustration. The geometry is mathematically computed on every render, verified by 18 unit tests that assert exact pixel coordinates at `trust=0`, `trust=50`, and `trust=100`.

The **pact joining flow is also fully functional**. A user creates a pact and shares an invite token. A second browser context can redeem that token, join the pact, and the Tension Web immediately recalculates and re-renders with the new member node in its correct position.

---

## What Phase 1 Solves End-to-End

| Concern | Status |
|---|---|
| Empathy Engine with deterministic weekly persona rotation | ✅ Built and unit-tested |
| Ripple Effect nudge cards with live counter animation | ✅ Built |
| Live SVG Tension Web with real trigonometric geometry | ✅ Built and unit-tested (18 tests) |
| Invite-token pact joining with multi-browser re-render | ✅ Built and E2E tested |
| Vitest unit suite for all pure logic functions | ✅ Passing |
| Playwright E2E suite covering all critical flows | ✅ Passing |
| WCAG 2.1 AA accessibility via `@axe-core/playwright` | ✅ Zero violations |
| `@tanstack/react-virtual` for O(V) list rendering | ✅ Implemented |

---

## Phase 2 Roadmap

The heavy frontend logic — geometry, persona algorithms, invite token flows, and test coverage — is completely solved. Phase 2 is about connecting it to a persistent network layer.

- **Backend persistence** — Supabase Auth (JWT + Row Level Security) and PostgreSQL to replace localStorage
- **Networked real-time sync** — move the working multi-browser local pact flow to genuine WebSocket connections via Supabase Realtime
- **Nudge expansion** — the current MVP covers a targeted set of high-impact activity types; Phase 2 extends to full category coverage

The Zustand slice interfaces are designed so this migration is additive — no component or logic rewrites required.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| State | Zustand + localStorage |
| Testing | Vitest · Playwright · React Testing Library · axe-core |
| Hosting | Vercel |

---

## Getting Started

```bash
git clone https://github.com/your-username/carbon-pact
cd carbon-pact
npm install
npm run dev
```

No environment variables or API keys are required to run the Phase 1 MVP.

```bash
npm run test        # Vitest unit + component suite
npm run test:e2e    # Playwright E2E + accessibility audit
```

---

## Project Structure

```
carbon-pact/
├── src/
│   ├── components/
│   │   ├── empathy/       # PersonaCard
│   │   ├── nudges/        # NudgeCard
│   │   └── pacts/         # TensionWeb, PactInvite
│   ├── hooks/             # useCounterAnimation
│   ├── lib/               # calculateEmission, trustScore,
│   │                      # tensionWebGeometry, personaNarrative,
│   │                      # getPersonaForWeek, getISOWeekNumber
│   ├── store/             # Zustand slices
│   └── styles/            # ripple.css, tensionWeb.css
├── tests/
│   ├── unit/              # Vitest
│   └── e2e/               # Playwright + axe-core
└── vercel.json
```

---

*Built for the Carbon Footprint Awareness Hackathon — June 2026. Solo submission.*

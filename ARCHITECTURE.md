# Architecture — Carbon Pact

## Design Philosophy: Solve the Hard Logic First

Carbon Pact was built with a deliberate priority order: get the **mathematical and algorithmic core fully correct and fully tested** before touching persistence. The result is a frontend where every behavioral mechanism — persona rotation, trust score geometry, pact joining — is completely solved and verified. Phase 2 connects this working logic to a network layer. It does not rewrite it.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Type safety, fast HMR, aggressive tree-shaking |
| State | Zustand (normalized slices) + localStorage | Offline-first; no login barrier for evaluation |
| Testing | Vitest · Playwright · React Testing Library · axe-core | Unit, E2E, and automated accessibility coverage |
| Hosting | Vercel | Zero-config deployment, automatic HTTPS, CDN |

---

## Route Map

| Route | Purpose | Loading |
|---|---|---|
| `/onboarding` | Habit quiz generating the user's baseline footprint profile | Eager |
| `/dashboard` | Weekly persona and live Tension Web status | Eager |
| `/nudges` | Activity logging with Ripple Effect nudge cards | Eager |
| `/pacts` | Create, join, and track group carbon commitments | Eager |
| `/insights` | Emissions Ancestry storytelling layer | Lazy (`React.lazy`) |
| `/profile` | Footprint history and Future Self Letter | Lazy |

---

## State Management: Normalized Zustand Slices

Each slice owns one concern. No data is duplicated. Derived values like `totalFootprintKg` are memoized selectors, not stored fields — a single source of truth that cannot drift out of sync with the raw log.

| Slice | Owns |
|---|---|
| `userSlice` | `userId`, `baselineFootprintKg`, `onboardingComplete` |
| `emissionsSlice` | `activityLog[]`, `totalFootprintKg` (memoized selector) |
| `nudgesSlice` | `nudgeHistory[]`, `dailyCount`, `lastResetDate` |
| `pactsSlice` | `pacts[]`, `trustScores` keyed by member ID |
| `personaSlice` | `currentPersonaId`, `rotationIndex` |

Slice interfaces are unchanged between Phase 1 and Phase 2. Migrating to Supabase only swaps the persistence adapter — no component or logic changes.

---

## Pillar 1: Deterministic Persona Rotation

The Empathy Engine uses a fully implemented, deterministic week-based algorithm — not a random assignment.

`getISOWeekNumber(date: Date): number` computes the ISO 8601 week number for any given date. `getPersonaForWeek(date: Date, personas: Persona[]): Persona` uses the week number as a hash index into the persona array. The result: every user on the same calendar week sees the same persona, and the persona rotates predictably every Monday. No user sees the same persona twice in consecutive weeks.

Both functions are pure, stateless, and covered by unit tests that verify the correct persona is returned for specific known dates — including edge cases at year boundaries where ISO week numbering diverges from the calendar year.

---

## Pillar 2: Live SVG Tension Web

The Tension Web is the most algorithmically complex component in the codebase. It is fully built.

### Trust Score — `lib/trustScore.ts`

`calculateTrustScore(commitmentsMet, totalCommitments, streakWeeks)` returns a score from 0 to 100. It includes a division-by-zero guard (returns 100 when `totalCommitments === 0`), a streak bonus capped at +20, and an explicit `Math.min` ceiling so the score never exceeds 100. O(1) arithmetic — no loops.

### Node Geometry — `lib/tensionWebGeometry.ts`

`computeNodePosition(memberIndex, totalMembers, trustScore)` places each pact member on a circle using standard polar-to-Cartesian conversion. The radius scales linearly with trust score between a minimum of 40% and a maximum of 100% of the base radius (100px). A member at full trust sits at the outer rim. A member at zero trust is pulled 60% of the way toward the center — visibly sagging, visibly warping the connecting edges.

```
radius = BASE_RADIUS × (0.4 + 0.6 × (trustScore / 100))
x = CENTER + radius × cos(angle)
y = CENTER + radius × sin(angle)
```

This is backed by **18 unit tests** asserting exact pixel coordinates at `trust=0`, `trust=50`, and `trust=100` for every valid group size (3–5 members). No coordinate is approximate — the tests use `toBeCloseTo` with one decimal place precision.

Edge rendering uses three additional pure functions:
- `trustToColor(trust)` — returns green above 75, amber above 40, red below
- `trustToStrokeWidth(minTrust)` — scales from 1px to 3px
- `trustToEdgeOpacity(minTrust)` — scales from 0.3 to 0.8

All derived from the minimum trust of the two connected nodes. No separate visual state to manage.

### Pact Joining Flow

The invite flow is fully functional. A user creates a pact; the app generates an invite token (the pact ID). A second browser context can navigate to the invite URL, redeem the token, and join the pact. The Tension Web immediately recalculates `computeNodePosition()` for the updated member count and re-renders with the new node in its correct geometric position. This is covered by a Playwright E2E test using a second browser context.

---

## Pillar 3: Ripple Effect UI

The Nudge OS delivers a decision-moment intervention at the point of logging a high-emission activity.

**Animation:** The accept button uses a pure CSS ripple — `transform: scale()` and `opacity` are the only animated properties. Both are GPU-composited and cause zero layout recalculation. No JavaScript animation library is used.

**Counter:** `useCounterAnimation(targetValue)` runs a single `requestAnimationFrame` loop with ease-out cubic easing. `cancelAnimationFrame` is called in the `useEffect` cleanup — no memory leaks on unmount. The `<output>` element carrying the displayed value has `aria-live="polite"` so screen readers announce the change.

**Nudge coverage:** The MVP covers a targeted set of high-impact activity types. Full category expansion is Phase 2.

---

## Performance

**Virtualized list rendering** via `@tanstack/react-virtual` in `components/shared/VirtualizedList`. Rendering cost is O(V) — proportional to the visible viewport, not the total log size. A user with 10,000 entries renders the same DOM node count as a user with 10.

**Portrait assets** are WebP files under 35kb each with explicit `width=480 height=480` to prevent Cumulative Layout Shift. Served with `Cache-Control: max-age=31536000, immutable` via Vercel CDN.

| Core Web Vital | Target | Mechanism |
|---|---|---|
| LCP | < 2.5s | Hero text is LCP element; portrait loads below the fold |
| CLS | < 0.1 | Explicit dimensions on all portrait `<img>` tags |
| INP | < 200ms | GPU-composited CSS only; counter hook isolated from parent render |

---

## Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|---|---|
| Dynamic persona narrative | `aria-live="polite"` on the narrative paragraph |
| Footprint counter | `<output aria-live="polite">` |
| Tension Web SVG | `role="img"` with `aria-label` listing all members and average trust |
| Portrait images | Descriptive `alt` text; initials fallback also has `role="img"` |
| Keyboard navigation | All elements reachable via Tab; focus rings visible |
| Motion sensitivity | All animations disabled under `prefers-reduced-motion: reduce` |
| Color contrast | All text ≥ 4.5:1; color is never the sole information carrier |

Compliance is verified by `@axe-core/playwright` running on every route in the CI pipeline. It is a hard gate — any WCAG 2.1 AA violation fails the build.

---

## Phase 2 Roadmap

The frontend logic is complete. Phase 2 is a persistence and networking layer built on top of what already works.

| Feature | What Phase 2 Adds |
|---|---|
| **Backend persistence** | Supabase Auth (JWT, 15-min access tokens, 7-day rotating refresh), PostgreSQL, Row Level Security on all user data |
| **Networked real-time sync** | Supabase Realtime (WebSockets) to push live trust score updates to all pact members — replacing the current local multi-browser flow |
| **Nudge expansion** | Full activity-type coverage across all emission categories |
| **Pact invite hardening** | HMAC-SHA256 signed tokens with 24-hour TTL and single-use enforcement, replacing the current pact-ID-as-token approach |

Because Zustand slice interfaces are fully abstracted, none of these changes require touching component or logic code.

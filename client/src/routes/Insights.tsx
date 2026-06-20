import { useMemo } from 'react';
import Layout from '../components/shared/Layout';
import { useEmissionsStore } from '../store/index';
import styles from '../styles/insights.module.css';

/* ── Narrative Map — exact-match entries for common types ──── */
const ANCESTRY_NARRATIVES: Record<
  string,
  { eyebrow: string; heading: string; narrative: string }
> = {
  car_petrol_medium_km: {
    eyebrow: 'TRANSPORT FOOTPRINT',
    heading: 'Your Daily Commute',
    narrative:
      'Your petrol car burns fuel refined from crude oil extracted thousands of miles away. The extraction, shipping, refining, and combustion chain produces over 0.192kg of CO2 per kilometer — before accounting for manufacturing the vehicle itself. Switching to public transit just twice a week reduces this category by up to 40%.',
  },
  beef_herd_kg: {
    eyebrow: 'DIETARY IMPACT',
    heading: 'Your Food Choices',
    narrative:
      'Beef production requires 20 times more land and produces 20 times more greenhouse gases than plant proteins per gram of protein. The methane from cattle digestion alone accounts for 14.5% of all global emissions. One meal swap per week from beef to lentils saves 27kg CO2 — equivalent to driving 140km.',
  },
  electricity_kwh_IN: {
    eyebrow: 'HOME ENERGY USE',
    heading: 'Your Electricity Consumption',
    narrative:
      "India's electricity grid is powered 70% by coal — one of the most carbon-intensive energy sources. Every kilowatt-hour you consume produces approximately 0.82kg of CO2 at the source. Air conditioning and water heating are the largest contributors. Shifting heavy appliance use to night hours and investing in ceiling fans can cut this category by 30%.",
  },
  flight_domestic_km: {
    eyebrow: 'AIR TRAVEL',
    heading: 'Your Domestic Flights',
    narrative:
      'Aviation emissions occur at altitude where they cause additional warming beyond CO2 alone. A domestic flight produces 0.255kg CO2 per kilometer — roughly 5x the emissions of the equivalent train journey. The Vande Bharat Express network now covers most major domestic routes in under 8 hours.',
  },
  chicken_poultry_kg: {
    eyebrow: 'DIETARY IMPACT',
    heading: 'Your Poultry Consumption',
    narrative:
      'Chicken produces significantly less emissions than beef but still requires land, water, and feed — all of which carry embedded carbon. At 6.9kg CO2 per kg of chicken, shifting two meals per week to legumes saves approximately 400kg CO2 per year.',
  },
};

/* ── Category fallback narratives ────────────────────────────
   FIX: Your emissionFactors.json has ~87 keys, but the exact-match
   map above only covers 5. Any logged activity type outside those 5
   used to return null from ANCESTRY_NARRATIVES[type] and the card
   was skipped entirely — if all 3 of a user's top types were
   uncovered, the WHOLE PAGE rendered blank.

   This fallback groups any unmapped activity type into one of four
   broad categories by matching keywords in the key name, so every
   single one of the 87 types now produces a real card instead of
   silently vanishing. */
const CATEGORY_FALLBACKS: {
  match: RegExp;
  eyebrow: string;
  heading: string;
  narrative: string;
}[] = [
  {
    match: /car|bus|train|transit|flight|bike|scooter|vehicle|km$/i,
    eyebrow: 'TRANSPORT FOOTPRINT',
    heading: 'Your Movement & Travel',
    narrative:
      'However you get from place to place leaves a trace. Fuel combustion, vehicle manufacturing, and infrastructure all carry embedded carbon. Choosing walking, cycling, or shared transit for short trips is one of the fastest ways to shrink this category.',
  },
  {
    match: /beef|chicken|meat|pork|lamb|dairy|cheese|milk|egg|food|diet|herd/i,
    eyebrow: 'DIETARY IMPACT',
    heading: 'Your Food Choices',
    narrative:
      'Every meal carries a hidden carbon cost — from land use and animal feed to transport and refrigeration. Animal-based foods generally carry a heavier footprint than plant-based ones. Small substitutions, made consistently, compound into meaningful reductions over a year.',
  },
  {
    match: /electricity|kwh|energy|heating|cooling|appliance|gas/i,
    eyebrow: 'HOME ENERGY USE',
    heading: 'Your Household Energy',
    narrative:
      'Power for lighting, heating, cooling, and appliances draws from a grid that is rarely 100% renewable. The exact carbon cost depends on your local energy mix. Reducing peak-hour usage and improving insulation are the most reliable ways to bring this number down.',
  },
  {
    match: /shop|goods|clothing|electronics|purchase|delivery|packaging/i,
    eyebrow: 'CONSUMPTION FOOTPRINT',
    heading: 'Your Shopping Habits',
    narrative:
      'Manufacturing, packaging, and shipping every product you buy adds carbon long before it reaches you. Buying less, buying durable, and choosing local where possible all reduce this category meaningfully over time.',
  },
];

function getNarrativeFor(type: string) {
  if (ANCESTRY_NARRATIVES[type]) return ANCESTRY_NARRATIVES[type];

  const fallback = CATEGORY_FALLBACKS.find((c) => c.match.test(type));
  if (fallback) {
    return {
      eyebrow: fallback.eyebrow,
      heading: fallback.heading,
      narrative: fallback.narrative,
    };
  }

  // Last-resort generic fallback — guarantees a card always renders
  return {
    eyebrow: 'YOUR FOOTPRINT',
    heading: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    narrative:
      'This activity contributes to your overall carbon footprint. Every choice, tracked consistently, builds a clearer picture of where your impact comes from and where small changes can have the biggest effect.',
  };
}

/* ── Component ───────────────────────────────────────────── */
export default function Insights() {
  const activityLog = useEmissionsStore((s) => s.activityLog);

  /* ── Derive Top 3 Emission Types ───────────────────────── */
  const { topTypes, totals } = useMemo(() => {
    if (activityLog.length === 0) {
      return {
        topTypes: ['car_petrol_medium_km', 'beef_herd_kg', 'electricity_kwh_IN'],
        totals: {} as Record<string, number>,
      };
    }

    const calculatedTotals: Record<string, number> = {};
    activityLog.forEach((a) => {
      calculatedTotals[a.activityType] =
        (calculatedTotals[a.activityType] ?? 0) + a.emissionKg;
    });

    const sortedTypes = Object.entries(calculatedTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    return { topTypes: sortedTypes, totals: calculatedTotals };
  }, [activityLog]);

  return (
    <Layout backgroundImage="/backgrounds/lichen-bark.jpg">
      <main className={styles.container} aria-label="Emissions ancestry">
        {/* ── Hero ────────────────────────────────────────── */}
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Where Your Carbon Begins.</h1>
          <p className={styles.heroSubtitle}>
            The origin story behind your top emissions.
          </p>
        </header>

        {/* ── Ancestry Cards List ─────────────────────────── */}
        <div className={styles.cardsList}>
          {topTypes.map((type) => {
            // FIX: getNarrativeFor() always returns a real object now —
            // exact match, category fallback, or generic fallback.
            // No more `if (!data) return null` skipping cards.
            const data = getNarrativeFor(type);
            const kgTotal = totals[type] ?? 0;

            return (
              <article
                key={type}
                className={styles.ancestryCard}
                aria-label={data.heading}
              >
                <div className={styles.accentBar} />

                <header className={styles.cardHeader}>
                  <p className={styles.eyebrow}>{data.eyebrow}</p>
                  <h2 className={styles.cardTitle}>{data.heading}</h2>
                </header>

                <div className={styles.statsRow}>
                  <p className={styles.totalKg}>
                    {kgTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                  </p>
                  <p className={styles.unit}>kg CO₂</p>
                </div>

                <p className={styles.narrative}>{data.narrative}</p>
              </article>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
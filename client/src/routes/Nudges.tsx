import { useState, useCallback } from 'react';
import Layout from '../components/shared/Layout';
import EmissionLogForm from '../components/shared/EmissionLogForm';
import { NudgeCard } from '../components/nudges/NudgeCard';
import type { NudgeData } from '../components/nudges/NudgeCard';
import { calculateEmission } from '../lib/calculateEmission';
import { shouldTriggerNudge } from '../lib/nudgeTrigger';
import { useEmissionsStore, useNudgesStore } from '../store/index';
import styles from '../styles/nudges.module.css';

/* ── Nudge definitions ───────────────────────────────────── */
const NUDGE_MAP: Record<string, Omit<NudgeData, 'id'>> = {
  flight_domestic_km: {
    message:
      'Your flight = significant CO₂. The train covers this route with 91% fewer emissions.',
    alternativeLabel: 'Take the train instead',
    co2SavedKg: 147,
  },
  car_petrol_medium_km: {
    message:
      'Your car trip adds up. Cycling or public transit cuts this to near zero.',
    alternativeLabel: 'Use transit or cycle',
    co2SavedKg: 4.2,
  },
  beef_herd_kg: {
    message:
      'Beef has the highest carbon footprint of any food. Lentils produce 97% less.',
    alternativeLabel: 'Choose lentils or legumes',
    co2SavedKg: 24.3,
  },
  electricity_kwh_IN: {
    message:
      "India's grid is coal-heavy. Shifting appliance use to off-peak hours reduces demand.",
    alternativeLabel: 'Use off-peak hours',
    co2SavedKg: 0.4,
  },
};

const EXEMPT_TYPES: string[] = [];

/**
 * FIX: builds a generic nudge for any activity type not explicitly
 * listed in NUDGE_MAP. Previously NUDGE_MAP[activityType] ?? null
 * meant 83 of your 87 activity types silently produced no nudge at all.
 * This guarantees every activity type produces a nudge card.
 */
function getFallbackNudge(
  activityType: string,
  emissionKg: number
): Omit<NudgeData, 'id'> {
  const readableType = activityType
    .replace(/_/g, ' ')
    .replace(/\b(km|kg|kwh|in)\b/gi, (m) => m.toUpperCase());

  return {
    message: `Your ${readableType} added ${emissionKg.toFixed(
      1
    )}kg CO₂. Small swaps add up over time.`,
    alternativeLabel: 'Try a lower-impact option',
    co2SavedKg: Number((emissionKg * 0.3).toFixed(1)), // generic 30% reduction estimate
  };
}

/* ── Component ───────────────────────────────────────────── */
export default function Nudges() {
  /* ── Store data ──────────────────────────────────────── */
  const addActivity = useEmissionsStore((s) => s.addActivity);
  const totalFootprintKg = useEmissionsStore((s) => s.totalFootprintKg);
  const dailyCount = useNudgesStore((s) => s.dailyCount);
  const lastResetDate = useNudgesStore((s) => s.lastResetDate);
  const incrementDailyCount = useNudgesStore((s) => s.incrementDailyCount);

  /* ── Local state ─────────────────────────────────────── */
  const [activeNudge, setActiveNudge] = useState<NudgeData | null>(null);

  /* ── Handle form submit ──────────────────────────────── */
  const handleActivitySubmit = useCallback(
    (activityType: string, quantity: number) => {
      const emissionKg = calculateEmission(activityType, quantity);

      addActivity({
        activityType,
        quantity,
        emissionKg,
        timestamp: new Date().toISOString(),
      });

      if (
        shouldTriggerNudge(dailyCount, lastResetDate, activityType, EXEMPT_TYPES)
      ) {
        // FIX: fall back to a generic nudge instead of null
        const nudgeTemplate =
          NUDGE_MAP[activityType] ?? getFallbackNudge(activityType, emissionKg);

        setActiveNudge({
          ...nudgeTemplate,
          id: crypto.randomUUID(),
        });
        incrementDailyCount();
      }
    },
    [addActivity, dailyCount, lastResetDate, incrementDailyCount]
  );

  /* ── Handle nudge accept / dismiss ───────────────────── */
  const handleAccept = useCallback(() => {
    setActiveNudge(null);
  }, []);

  const handleDismiss = useCallback(() => {
    setActiveNudge(null);
  }, []);

  return (
    <Layout backgroundImage="/backgrounds/bark-texture.jpg">
      <div className={styles.container} aria-label="Log a carbon activity" role="main">
        <div className={styles.grid}>
          {/* ═══ LEFT COLUMN — Emission Log Form ═════════ */}
          <div className={styles.leftCol}>
            <p className={styles.eyebrow}>LOG AN ACTIVITY</p>
            <EmissionLogForm onSubmit={handleActivitySubmit} />
          </div>

          {/* ═══ RIGHT COLUMN — NudgeCard or Placeholder ═ */}
          <div className={styles.rightCol}>
            {activeNudge ? (
              <div className={styles.nudgeEnter} key={activeNudge.id}>
                <NudgeCard
                  nudge={activeNudge}
                  currentFootprintKg={totalFootprintKg}
                  onAccept={handleAccept}
                  onDismiss={handleDismiss}
                />
              </div>
            ) : (
              <div className={styles.placeholder}>
                <p className={styles.placeholderText}>
                  Log an activity to see your ripple effect.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
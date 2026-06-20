import { useState, useCallback } from 'react';
import Layout from '../components/shared/Layout';
import EmissionLogForm from '../components/shared/EmissionLogForm';
import { NudgeCard } from '../components/nudges/NudgeCard';
import type { NudgeData } from '../components/nudges/NudgeCard';
import { calculateEmission } from '../lib/calculateEmission';
import { shouldTriggerNudge } from '../lib/nudgeTrigger';
import { useEmissionsStore, useNudgesStore } from '../store/index';
import styles from '../styles/nudges.module.css';

/* ── Hand-written nudges for specific high-impact activities ── */
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

// Below this emission threshold (kg), the activity is already low-impact —
// it should never be scolded with "try an alternative".
const LOW_IMPACT_THRESHOLD_KG = 1.0;

function humanizeActivityType(activityType: string): string {
  return activityType
    .replace(/_km$|_kg$|_kwh.*$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Builds a nudge for any activity type not in NUDGE_MAP.
 * Returns null for genuinely low-impact activities (walking, plant-based
 * meals, etc.) so the app never nags a user for making a good choice —
 * it instead shows quiet positive reinforcement.
 */
function buildFallbackNudge(
  activityType: string,
  emissionKg: number
): Omit<NudgeData, 'id'> {
  const label = humanizeActivityType(activityType);

  if (emissionKg < LOW_IMPACT_THRESHOLD_KG) {
    return {
      message: `Great choice — your ${label} activity added only ${emissionKg.toFixed(
        1
      )}kg CO₂. Keep it up.`,
      alternativeLabel: 'Nice work',
      co2SavedKg: 0,
    };
  }

  return {
    message: `Your ${label} activity added ${emissionKg.toFixed(
      1
    )}kg CO₂. Small swaps add up over time.`,
    alternativeLabel: 'Try a lower-impact option',
    co2SavedKg: Number((emissionKg * 0.3).toFixed(1)),
  };
}

/* ── Component ───────────────────────────────────────────── */
export default function Nudges() {
  const addActivity = useEmissionsStore((s) => s.addActivity);
  const totalFootprintKg = useEmissionsStore((s) => s.totalFootprintKg);
  const dailyCount = useNudgesStore((s) => s.dailyCount);
  const lastResetDate = useNudgesStore((s) => s.lastResetDate);
  const incrementDailyCount = useNudgesStore((s) => s.incrementDailyCount);

  const [activeNudge, setActiveNudge] = useState<NudgeData | null>(null);

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
        const nudgeTemplate =
          NUDGE_MAP[activityType] ??
          buildFallbackNudge(activityType, emissionKg);

        setActiveNudge({
          ...nudgeTemplate,
          id: crypto.randomUUID(),
        });
        incrementDailyCount();
      }
    },
    [addActivity, dailyCount, lastResetDate, incrementDailyCount]
  );

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
          <div className={styles.leftCol}>
            <p className={styles.eyebrow}>LOG AN ACTIVITY</p>
            <EmissionLogForm onSubmit={handleActivitySubmit} />
          </div>

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
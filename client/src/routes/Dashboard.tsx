import { useEffect, useMemo } from 'react';
import Layout from '../components/shared/Layout';
import PersonaCard from '../components/empathy/PersonaCard';
import { getPersonaForWeek, getISOWeekNumber } from '../components/empathy/PersonaRotation';
import PactDashboard from '../components/pacts/PactDashboard';
import { useUserStore, useEmissionsStore, usePersonaStore } from '../store/index';
import PERSONAS from '../lib/personaData';
import styles from '../styles/dashboard.module.css';

/* ── Category chips ──────────────────────────────────────── */
const CATEGORIES = ['Transport', 'Energy', 'Diet'] as const;

export default function Dashboard() {
  /* ── Store data ──────────────────────────────────────── */
  const userId = useUserStore((s) => s.userId);
  const totalFootprintKg = useEmissionsStore((s) => s.totalFootprintKg);
  const topEmissionType = useEmissionsStore((s) => s.topEmissionType);
  const currentPersonaId = usePersonaStore((s) => s.currentPersonaId);
  const setCurrentPersonaId = usePersonaStore((s) => s.setCurrentPersonaId);

  /* ── Persona rotation on mount ───────────────────────── */
  useEffect(() => {
    const weekNumber = getISOWeekNumber(new Date());
    const newPersonaId = getPersonaForWeek(userId, weekNumber);
    if (newPersonaId !== currentPersonaId) {
      setCurrentPersonaId(newPersonaId);
    }
  }, [userId, currentPersonaId, setCurrentPersonaId]);

  /* ── Persona object lookup ───────────────────────────── */
  const persona = PERSONAS[currentPersonaId];

  /* ── CO2 saved this week (placeholder until Phase 3) ── */
  const co2SavedThisWeek = 0;

  /* ── Derived stats ───────────────────────────────────── */
  const treesPreserved = useMemo(
    () => Math.floor(totalFootprintKg / 21.7),
    [totalFootprintKg]
  );

  const goalProgress = useMemo(
    () => Math.min((totalFootprintKg / 500) * 100, 100),
    [totalFootprintKg]
  );

  /* ── Guard against missing persona ───────────────────── */
  if (!persona) return null;

  return (
    <Layout backgroundImage="/backgrounds/forest-canopy.jpg">
      <div className={styles.container} aria-label="Your carbon dashboard" role="main">
        <div className={styles.grid}>
          {/* ═══ LEFT COLUMN — Persona Card ═══════════════ */}
          <section aria-label="Climate persona of the week">
            <PersonaCard
              persona={persona}
              userTopEmissionType={topEmissionType}
              co2SavedThisWeek={co2SavedThisWeek}
            />
          </section>

          {/* ═══ RIGHT COLUMN ════════════════════════════= */}
          <div className={styles.rightCol}>
            {/* ── Two stat cards side by side ──────────── */}
            <section className={styles.statRow} aria-label="Carbon statistics">
              {/* Card A: Carbon Offset */}
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.iconCircle}>
                    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
                      <path d="M8 12h8M12 8v8" />
                    </svg>
                  </div>
                  <span className={styles.periodChip}>This Month</span>
                </div>
                <p className={styles.statEyebrow}>CARBON OFFSET</p>
                <p
                  className={styles.statNumber}
                  aria-label={`${totalFootprintKg.toFixed(1)} kilograms of CO2 this month`}
                >
                  {totalFootprintKg.toFixed(1)}
                </p>
                <p className={styles.statSub}>kg CO2 this month</p>
              </div>

              {/* Card B: Trees Preserved */}
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.iconCircle}>
                    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2L7 10h3v4H6l6 8 6-8h-4v-4h3L12 2Z" />
                      <path d="M10 22h4" />
                    </svg>
                  </div>
                  <span className={styles.periodChip}>Lifetime</span>
                </div>
                <p className={styles.statEyebrow}>TREES PRESERVED</p>
                <p
                  className={styles.statNumber}
                  aria-label={`${treesPreserved} mature canopy trees equivalent`}
                >
                  {treesPreserved}
                </p>
                <p className={styles.statSub}>mature canopy trees equivalent</p>
              </div>
            </section>

            {/* ── Stewardship Goal card ────────────────── */}
            <section className={styles.goalCard} aria-label="Stewardship goal progress">
              <div className={styles.goalHeader}>
                <div className={styles.goalMeta}>
                  <h2 className={styles.goalTitle}>Stewardship Goal</h2>
                  <p className={styles.goalSubtitle}>
                    Your progress toward carbon neutrality.
                  </p>
                </div>
                <span className={styles.goalPercent}>
                  {goalProgress.toFixed(0)}%
                </span>
              </div>

              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={Math.round(goalProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Carbon goal progress"
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>

              <div className={styles.categoryChips}>
                {CATEGORIES.map((cat) => (
                  <span key={cat} className={styles.categoryChip}>
                    {cat}
                  </span>
                ))}
              </div>
            </section>

            {/* ── Pact Dashboard ───────────────────────── */}
            <section aria-label="Your pact">
              <PactDashboard />
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

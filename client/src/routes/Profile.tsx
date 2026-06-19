import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import VirtualizedList from '../components/shared/VirtualizedList';
import { useEmissionsStore, useUserStore } from '../store/index';
import styles from '../styles/profile.module.css';

export default function Profile() {
  const activityLog = useEmissionsStore((s) => s.activityLog);
  const totalFootprintKg = useEmissionsStore((s) => s.totalFootprintKg);
  const futureSelfLetter = useUserStore((s) => s.futureSelfLetter);
  const setFutureSelfLetter = useUserStore((s) => s.setFutureSelfLetter);

  const [letterText, setLetterText] = useState(futureSelfLetter ?? '');
  const [saved, setSaved] = useState(false);

  const handleSaveLetter = () => {
    setFutureSelfLetter(letterText);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <Layout backgroundImage="/backgrounds/botanical-stem.jpg">
      <main className={styles.container} aria-label="Your profile and history">
        <div className={styles.lifetimeStatContainer}>
          <div className={styles.lifetimeEyebrow}>YOUR LIFETIME FOOTPRINT</div>
          <div className={styles.lifetimeValue}>
            {totalFootprintKg.toFixed(1)}
          </div>
          <div className={styles.lifetimeSubtext}>kg CO2 total</div>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Future Self Letter */}
          <div className={styles.leftCol}>
            <div className={styles.futureSelfPanel}>
              <div className={styles.panelTopEdge}></div>
              <div className={styles.eyebrow}>A MESSAGE FROM 2050</div>
              <textarea
                className={styles.textarea}
                value={letterText}
                onChange={(e) => setLetterText(e.target.value)}
                placeholder="Dear future me..."
                aria-label="Write a letter to your future self"
              />
              <button
                className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
                onClick={handleSaveLetter}
              >
                {saved ? 'Saved ✓' : 'Save Letter'}
              </button>
            </div>
          </div>

          {/* Right Column: Footprint History */}
          <div className={styles.rightCol}>
            <h2 className={styles.historyHeading}>All Activity</h2>
            {activityLog.length === 0 ? (
              <div className={styles.emptyStatePanel}>
                <p className={styles.emptyStateText}>
                  No activities logged yet. Start by logging an activity.
                </p>
                <Link to="/nudges" className={styles.emptyStateLink}>
                  Log your first activity
                </Link>
              </div>
            ) : (
              <div
                className={styles.listContainer}
                aria-label="Full activity log"
              >
                <VirtualizedList
                  items={activityLog}
                  estimatedItemHeight={56}
                  renderItem={(activity) => (
                    <div
                      className={styles.activityRow}
                      key={activity.id}
                      aria-label={`${formatActivityType(
                        activity.activityType
                      )}, ${activity.quantity}, ${activity.emissionKg.toFixed(
                        1
                      )}kg CO2, ${new Date(
                        activity.timestamp
                      ).toLocaleDateString()}`}
                    >
                      <div className={styles.activityLeft}>
                        <div className={styles.activityName}>
                          {formatActivityType(activity.activityType)}
                        </div>
                        <div className={styles.activityDate}>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={styles.activityRight}>
                        {activity.emissionKg.toFixed(1)}kg CO2
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

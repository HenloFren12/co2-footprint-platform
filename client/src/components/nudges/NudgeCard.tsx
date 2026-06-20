import React, { useState } from 'react';
import { useCounterAnimation } from '../../hooks/useCounterAnimation';
import styles from './NudgeCard.module.css';

export interface NudgeData {
  id: string;
  message: string;
  co2SavedKg: number;
  alternativeLabel: string;
}

interface NudgeCardProps {
  nudge: NudgeData;
  currentFootprintKg: number;
  onAccept: (nudge: NudgeData) => void;
  onDismiss: () => void;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({
  nudge,
  currentFootprintKg,
  onAccept,
  onDismiss,
}) => {
  const [rippleActive, setRippleActive] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const targetFootprint = accepted
    ? Math.max(0, currentFootprintKg - nudge.co2SavedKg)
    : currentFootprintKg;

  const displayedFootprint = useCounterAnimation(targetFootprint);

  const handleAccept = () => {
    if (accepted) return;
    setAccepted(true);
    setRippleActive(true);
    onAccept(nudge);

    setTimeout(() => setRippleActive(false), 650);
  };

  return (
    <article
      role="region"
      aria-label="Carbon nudge suggestion"
      className={styles.card}
    >
      <p className={styles.message}>{nudge.message}</p>

      <output
        aria-live="polite"
        aria-label="Updated daily footprint in kilograms"
        className={styles.counter}
      >
        {displayedFootprint.toFixed(1)}kg CO₂ today
      </output>

      <div className={styles.actions}>
        <button
          className={`ripple-origin ${styles.acceptButton} ${
            accepted ? styles.accepted : ''
          } ${rippleActive ? 'ripple-active' : ''}`}
          onClick={handleAccept}
          aria-label={`Accept lower-emission alternative: ${nudge.alternativeLabel}`}
          disabled={accepted}
        >
          {accepted ? 'Accepted ✓' : `Accept: ${nudge.alternativeLabel}`}
        </button>

        <button
          onClick={onDismiss}
          aria-label="Dismiss this nudge"
          className={styles.dismissButton}
          disabled={accepted}
        >
          Maybe later
        </button>
      </div>
    </article>
  );
};
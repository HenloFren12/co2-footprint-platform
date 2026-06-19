// components/empathy/PersonaCard.tsx
import React, { useState } from 'react';
import {
  Persona,
  generatePersonaNarrative,
} from '../../lib/personaNarrative';
import styles from './PersonaCard.module.css';

interface PersonaCardProps {
  persona: Persona;
  userTopEmissionType: string;
  co2SavedThisWeek: number;
}

export default function PersonaCard({
  persona,
  userTopEmissionType,
  co2SavedThisWeek,
}: PersonaCardProps) {
  const [portraitError, setPortraitError] = useState(false);

  return (
    <article
      aria-label={`Climate persona: ${persona.name}`}
      className={styles.card}
    >
      {/* Portrait or Fallback */}
      <div className={styles.portraitWrapper}>
        {portraitError ? (
          <div
            role="img"
            aria-label={`${persona.name}, ${persona.occupation} from ${persona.location}`}
            className={styles.fallbackAvatar}
          >
            <span className={styles.fallbackInitial}>
              {persona.name.charAt(0)}
            </span>
          </div>
        ) : (
          <img
            src={`/personas/${persona.id}.webp`}
            alt={`${persona.name}, ${persona.occupation} from ${persona.location}`}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className={styles.portrait}
            onError={() => setPortraitError(true)}
          />
        )}

        {/* Gradient overlay on portrait */}
        <div
          className={styles.portraitOverlay}
          aria-hidden="true"
        />

        {/* Name on portrait */}
        <div className={styles.nameOverlay}>
          <p className={styles.eyebrow}>FACES OF IMPACT</p>
          <h2 className={styles.personaName}>
            {persona.name}
          </h2>
        </div>
      </div>

      {/* Narrative */}
      <div className={styles.narrativeSection}>
        <p
          aria-live="polite"
          className={styles.narrative}
        >
          {generatePersonaNarrative(
            persona,
            userTopEmissionType,
            co2SavedThisWeek
          )}
        </p>

        {/* Weekly Action Chip */}
        <div
          className={styles.actionChip}
          role="note"
          aria-label={`Suggested action: ${persona.weeklyAction}`}
        >
          {persona.weeklyAction}
        </div>
      </div>
    </article>
  );
}
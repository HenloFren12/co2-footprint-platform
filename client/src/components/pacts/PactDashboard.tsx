// components/pacts/PactDashboard.tsx
import React, { useMemo } from 'react';
import { usePactsStore, useUserStore } from '../../store/index';
import { calculateTrustScore } from '../../lib/trustScore';
import TensionWeb from './TensionWeb';
import styles from './PactDashboard.module.css';

export default function PactDashboard() {
  const pacts = usePactsStore((s) => s.pacts);
  const addPact = usePactsStore((s) => s.addPact);
  const currentUserId = useUserStore((s) => s.userId);

  const activePact = useMemo(
    () =>
      pacts.find(
        (p) =>
          p.memberIds.includes(currentUserId) &&
          p.status === 'active'
      ),
    [pacts, currentUserId]
  );

  // Derive trust scores using calculateTrustScore()
  const derivedTrustScores = useMemo(() => {
    if (!activePact) return {};
    const scores: Record<string, number> = {};
    activePact.members.forEach((member) => {
      const existing = activePact.trustScores[member.id] ?? 100;
      // calculateTrustScore(commitmentsMet, totalCommitments, streakWeeks)
      // Using existing score as base until Supabase integration
      scores[member.id] = calculateTrustScore(
        Math.round(existing),
        100,
        0
      );
    });
    return scores;
  }, [activePact]);

  // FIX: actually creates a pact and writes it to the store.
  // Previously this was just a <Link to="/pacts"> which navigated
  // nowhere useful and created nothing.
  const handleCreatePact = () => {
    if (!currentUserId) return;

    const newPact = {
      id: crypto.randomUUID(),
      name: 'My Carbon Pact',
      commitment: 'Reduce weekly emissions together',
      memberIds: [currentUserId],
      members: [{ id: currentUserId, name: 'You' }],
      trustScores: { [currentUserId]: 100 },
      status: 'active' as const,
    };

    addPact(newPact);
  };

  // Empty state
  if (!activePact) {
    return (
      <section
        className={styles.emptyState}
        aria-label="No active pact"
      >
        <p className={styles.emptyText}>
          You are not in a pact yet. Start one with friends to
          hold each other accountable.
        </p>
        <button
          type="button"
          onClick={handleCreatePact}
          className={styles.createLink}
        >
          Create a pact
        </button>
      </section>
    );
  }

  return (
    <section
      className={styles.pactSection}
      aria-label={`Active pact: ${activePact.name}`}
    >
      {/* Pact header */}
      <div className={styles.pactHeader}>
        <p className={styles.eyebrow}>ACTIVE PACT</p>
        <h2 className={styles.pactName}>{activePact.name}</h2>
        <p className={styles.commitment}>
          {activePact.commitment}
        </p>
      </div>

      {/* Tension Web visualization */}
      <div className={styles.webContainer}>
        <TensionWeb
          members={activePact.members}
          trustScores={derivedTrustScores}
          currentUserId={currentUserId}
        />
      </div>

      {/* Member check-in list */}
      <ul
        className={styles.memberList}
        aria-label="Member check-in status this week"
      >
        {activePact.members.map((member) => {
          const score = derivedTrustScores[member.id] ?? 100;
          const onTrack = score >= 75;
          return (
            <li
              key={member.id}
              className={styles.memberRow}
              aria-label={`${member.name}: ${onTrack ? 'On track' : 'Needs attention'}, trust score ${score}`}
            >
              <span className={styles.memberName}>
                {member.name}
              </span>
              <span
                className={
                  onTrack
                    ? styles.statusOnTrack
                    : styles.statusWarning
                }
              >
                {onTrack ? 'On track' : 'Needs attention'}
              </span>
              <span className={styles.trustScore}>
                {score}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

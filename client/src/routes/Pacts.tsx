import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import PactDashboard from '../components/pacts/PactDashboard';
import { usePactsStore, useUserStore } from '../store/index';
import styles from '../styles/pacts.module.css';

/* ── PactInviteAccept Component ──────────────────────────── */
function PactInviteAccept({ inviteToken }: { inviteToken: string }) {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const addPact = usePactsStore((s) => s.addPact);
  const pacts = usePactsStore((s) => s.pacts);
  const currentUserId = useUserStore((s) => s.userId);

  const joinPact = async (_token: string) => {
    setIsJoining(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'];
    // The fallback || 'Alex' guarantees randomName is ALWAYS a string
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] || 'Alex';
    const newMemberId = `user_${Math.random().toString(36).substring(2, 9)}`;

    // We check if a pact already exists to simulate adding to it
    const existingPact = pacts.find(p => p.status === 'active');
    
    if (existingPact) {
      addPact({
        ...existingPact,
        id: `pact_${Math.random()}`, // Unique ID for React keys
        memberIds: [...existingPact.memberIds, newMemberId],
        members: [...existingPact.members, { id: newMemberId, name: randomName }],
        trustScores: { ...existingPact.trustScores, [newMemberId]: Math.floor(Math.random() * 30) + 70 },
      });
    } else {
      addPact({
        id: `pact_${_token}`,
        name: 'Shared Carbon Pact',
        commitment: 'Reduce weekly emissions together',
        memberIds: [currentUserId, newMemberId],
        members: [
          { id: currentUserId, name: 'You' },
          { id: newMemberId, name: randomName }
        ],
        trustScores: { [currentUserId]: 100, [newMemberId]: 85 },
        status: 'active',
      });
    }

    setIsJoining(false);
    navigate('/pacts'); // Reloads the view without the token
  };

  return (
    <Layout backgroundImage="/backgrounds/fern-canopy.jpg">
      <div className={styles.inviteAcceptWrapper}>
        <div className={styles.inviteAcceptCard}>
          <h2 className={styles.inviteAcceptTitle}>
            You've been invited to a pact.
          </h2>
          <div className={styles.inviteAcceptActions}>
            <button
              className={styles.btnGhost}
              onClick={() => navigate('/dashboard')}
              disabled={isJoining}
            >
              Decline
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => joinPact(inviteToken)}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Pact'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Main Pacts Route Component ──────────────────────────── */
export default function Pacts() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const pacts = usePactsStore((s) => s.pacts);
  const currentUserId = useUserStore((s) => s.userId);
  
  // Get the MOST RECENT active pact for the simulation
  const activePact = [...pacts].reverse().find(
    (p) => p.memberIds.includes(currentUserId) && p.status === 'active'
  );

  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Generate Invite Logic ─────────────────────────────── */
  const generateInvite = async () => {
    if (!activePact) return;
    setIsGenerating(true);
    
    try {
      // Mock API call for the MVP
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockToken = Math.random().toString(36).substring(2, 10);
      const url = `${window.location.origin}/pacts?token=${mockToken}`;
      setInviteUrl(url);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Render Invite UI if token exists ──────────────────── */
  if (inviteToken) {
    return <PactInviteAccept inviteToken={inviteToken} />;
  }

  /* ── Render Main View ──────────────────────────────────── */
  return (
    <Layout backgroundImage="/backgrounds/fern-canopy.jpg">
      <div className={styles.container} aria-label="Your carbon pact" role="main">
        {/* ── Hero ────────────────────────────────────────── */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Your Pact</h1>
          <p className={styles.heroSubtitle}>Hold each other accountable.</p>
        </div>

        {/* ── Pact Dashboard ──────────────────────────────── */}
        <PactDashboard />

        {/* ── Invite Section (only if active pact exists) ─── */}
        {activePact && (
          <section className={styles.inviteSection} aria-labelledby="invite-eyebrow">
            <h3 id="invite-eyebrow" className={styles.inviteEyebrow}>
              INVITE A MEMBER
            </h3>
            <div className={styles.inviteRow}>
              {activePact.memberIds.length >= 5 ? (
                <button className={styles.btnGhost} disabled>
                  Pact Full (5/5)
                </button>
              ) : (
                <>
                  <button
                    className={styles.btnPrimary}
                    onClick={generateInvite}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Invite'}
                  </button>
                  <input
                    type="text"
                    readOnly
                    className={styles.inviteInput}
                    value={inviteUrl}
                    placeholder="Click generate to create an invite link..."
                    aria-label="Invite link"
                  />
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

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

  const joinPact = async (token: string) => {
    setIsJoining(true);
    // TODO: Supabase integration - call join pact RPC with token
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsJoining(false);
    navigate('/pacts');
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
  const activePact = pacts.find(
    (p) => p.memberIds.includes(currentUserId) && p.status === 'active'
  );

  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Generate Invite Logic ─────────────────────────────── */
  const generateInvite = async () => {
    if (!activePact) return;
    setIsGenerating(true);
    
    try {
      // Mock API call: POST /api/pacts/${activePact.id}/invite
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

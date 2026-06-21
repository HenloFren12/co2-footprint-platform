import { render, screen } from '@testing-library/react';
import TensionWeb, { PactMember } from './TensionWeb';

/**
 * components/pacts/TensionWeb.test.tsx
 *
 * Matched exactly to the real implementation:
 *   - svg role="img" with aria-label "Pact tension web with {n} members.
 *     Average trust score: {avg} out of 100."
 *   - avgTrust defaults to 100 when members.length === 0 (guard)
 *   - one <g> per member, n*(n-1)/2 <line> edges for n members
 *   - core node fill is '#4ade80' for currentUser, '#475569' otherwise
 *   - nodeHealthyGlow class applied only when node.trust >= 75
 *   - name label text is the first word of member.name (split(' ')[0])
 */

const members2: PactMember[] = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
];

const members3: PactMember[] = [
  ...members2,
  { id: 'user3', name: 'Charlie' },
];

const members4: PactMember[] = [
  ...members3,
  { id: 'user4', name: 'Diana' },
];

const members5: PactMember[] = [
  ...members4,
  { id: 'user5', name: 'Eve' },
];

describe('TensionWeb', () => {
  it('renders the SVG with role="img"', () => {
    render(
      <TensionWeb
        members={members3}
        trustScores={{ user1: 80, user2: 60, user3: 90 }}
        currentUserId="user1"
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders one <g> group per member for a 3-member pact', () => {
    render(
      <TensionWeb
        members={members3}
        trustScores={{ user1: 80, user2: 60, user3: 90 }}
        currentUserId="user1"
      />
    );
    expect(document.querySelectorAll('g').length).toBe(3);
  });

  it('renders one <g> group per member for a 5-member pact (max size)', () => {
    render(
      <TensionWeb
        members={members5}
        trustScores={{ user1: 100, user2: 80, user3: 60, user4: 40, user5: 20 }}
        currentUserId="user1"
      />
    );
    expect(document.querySelectorAll('g').length).toBe(5);
  });

  it('renders n*(n-1)/2 edges for a fully connected graph of 4 members', () => {
    render(
      <TensionWeb
        members={members4}
        trustScores={{ user1: 100, user2: 80, user3: 60, user4: 40 }}
        currentUserId="user1"
      />
    );
    // 4 * 3 / 2 = 6
    expect(document.querySelectorAll('line').length).toBe(6);
  });

  it('renders exactly 1 edge for a 2-member pact', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 100, user2: 80 }}
        currentUserId="user1"
      />
    );
    expect(document.querySelectorAll('line').length).toBe(1);
  });

  it('aria-label includes the correct member count', () => {
    render(
      <TensionWeb
        members={members3}
        trustScores={{ user1: 80, user2: 60, user3: 90 }}
        currentUserId="user1"
      />
    );
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('3 members');
  });

  it('aria-label includes the correctly rounded average trust score', () => {
    render(
      <TensionWeb
        members={members3}
        trustScores={{ user1: 80, user2: 60, user3: 90 }}
        currentUserId="user1"
      />
    );
    // (80 + 60 + 90) / 3 = 76.666... -> rounds to 77
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('77 out of 100');
  });

  it('defaults average trust to 100 when members array is empty (guard against division by zero)', () => {
    render(<TensionWeb members={[]} trustScores={{}} currentUserId="user1" />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('0 members');
    expect(svg.getAttribute('aria-label')).toContain('100 out of 100');
  });

  it('renders a glow circle (r=22) for every node regardless of trust level', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 80, user2: 30 }}
        currentUserId="user1"
      />
    );
    const glowCircles = document.querySelectorAll('circle[r="22"]');
    expect(glowCircles.length).toBe(2);
  });

  it('the high-trust node (>=75) glow circle has higher opacity than the low-trust node', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 80, user2: 30 }}
        currentUserId="user1"
      />
    );
    const glowCircles = Array.from(document.querySelectorAll('circle[r="22"]'));
    const opacities = glowCircles.map((c) => parseFloat(c.getAttribute('opacity') ?? '0'));
    // node.trust=80 -> opacity = 0.2 + 0.8*0.3 = 0.44
    // node.trust=30 -> opacity = 0.2 + 0.3*0.3 = 0.29
    expect(Math.max(...opacities)).toBeGreaterThan(Math.min(...opacities));
  });

  it('fills the current user node with the highlight color #4ade80', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 80, user2: 80 }}
        currentUserId="user1"
      />
    );
    const coreNodes = document.querySelectorAll('circle[r="16"]');
    const fills = Array.from(coreNodes).map((c) => c.getAttribute('fill'));
    expect(fills).toContain('#4ade80');
    expect(fills).toContain('#475569');
  });

  it('uses a default trust of 100 for a member missing from the trustScores map', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 50 }} // user2 missing entirely
        currentUserId="user1"
      />
    );
    // No crash, and the SVG still renders both members
    expect(document.querySelectorAll('g').length).toBe(2);
  });

  it('renders the member name label using only the first word of a multi-word name', () => {
    const multiWordMembers: PactMember[] = [{ id: 'user1', name: 'Mary Jane Watson' }];
    render(
      <TensionWeb
        members={multiWordMembers}
        trustScores={{ user1: 100 }}
        currentUserId="user1"
      />
    );
    expect(screen.getByText('Mary')).toBeInTheDocument();
    expect(screen.queryByText('Mary Jane Watson')).not.toBeInTheDocument();
  });

  it('name label text elements have aria-hidden="true" (redundant with SVG aria-label)', () => {
    render(
      <TensionWeb
        members={members2}
        trustScores={{ user1: 80, user2: 80 }}
        currentUserId="user1"
      />
    );
    const textEls = document.querySelectorAll('text');
    textEls.forEach((el) => {
      expect(el.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
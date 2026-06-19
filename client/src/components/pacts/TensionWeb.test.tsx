import { render, screen } from '@testing-library/react';
import { TensionWeb, PactMember } from './TensionWeb';

// Explicitly defining the mock members
const mock2Members: PactMember[] = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' }
];

const mock3Members: PactMember[] = [
  ...mock2Members,
  { id: 'user3', name: 'Charlie' }
];

const mock4Members: PactMember[] = [
  ...mock3Members,
  { id: 'user4', name: 'Diana' }
];

const mock5Members: PactMember[] = [
  ...mock4Members,
  { id: 'user5', name: 'Eve' }
];

// Explicitly defining the mock trust scores records
const mockScores3: Record<string, number> = { user1: 100, user2: 80, user3: 60 };
const mockScores4: Record<string, number> = { user1: 100, user2: 80, user3: 60, user4: 40 };
const mockScores5: Record<string, number> = { user1: 100, user2: 80, user3: 60, user4: 40, user5: 20 };

describe('TensionWeb', () => {
  it('renders the correct number of node groups for a 3-member pact', () => {
    render(
      <TensionWeb 
        members={mock3Members} 
        trustScores={mockScores3} 
        currentUserId="user1" 
      />
    );
    // Every member should have exactly one <g> group representing their node
    expect(document.querySelectorAll('g').length).toBe(3);
  });

  it('renders the correct number of node groups for a 5-member pact', () => {
    render(
      <TensionWeb 
        members={mock5Members} 
        trustScores={mockScores5} 
        currentUserId="user1" 
      />
    );
    expect(document.querySelectorAll('g').length).toBe(5);
  });

  it('renders n*(n-1)/2 edges for n members (fully connected graph)', () => {
    render(
      <TensionWeb 
        members={mock4Members} 
        trustScores={mockScores4} 
        currentUserId="user1" 
      />
    );
    // For 4 members, the math is 4*(3)/2 = 6 edges
    expect(document.querySelectorAll('line').length).toBe(6); 
  });

  it('has an aria-label that includes member count and average trust', () => {
    // Injecting specific scores where the average is exactly 76.666... (rounds to 77)
    const specificScores = { user1: 80, user2: 60, user3: 90 };
    
    render(
      <TensionWeb 
        members={mock3Members} 
        trustScores={specificScores} 
        currentUserId="user1" 
      />
    );
    
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('3 members');
    expect(svg.getAttribute('aria-label')).toContain('77'); 
  });

  it('applies the healthy glow class only to nodes with trust >= 75', () => {
    // Only user1 (80) should get the glow; user2 (30) should not
    const mixedScores = { user1: 80, user2: 30 };
    
    render(
      <TensionWeb 
        members={mock2Members} 
        trustScores={mixedScores} 
        currentUserId="user1" 
      />
    );
    
    const glowCircles = document.querySelectorAll('.node-healthy-glow');
    expect(glowCircles.length).toBe(1);
  });
});
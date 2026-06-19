import { calculateTrustScore } from './trustScore';

describe('calculateTrustScore', () => {
  it('returns 100 for zero total commitments (division guard)', () => {
    expect(calculateTrustScore(0, 0, 0)).toBe(100);
  });

  it('calculates base score correctly without streak', () => {
    expect(calculateTrustScore(3, 4, 0)).toBe(75);
    expect(calculateTrustScore(0, 5, 0)).toBe(0);
  });

  it('adds streak bonus correctly', () => {
    expect(calculateTrustScore(4, 5, 5)).toBe(90); // 80 base + 10 bonus
  });

  it('caps streak bonus at 20', () => {
    expect(calculateTrustScore(2, 4, 15)).toBe(70); // 50 base + 20 cap (not 30)
  });

  it('caps total score at 100', () => {
    expect(calculateTrustScore(5, 5, 10)).toBe(100); // 100 base + 20 bonus = 100 max
  });
});
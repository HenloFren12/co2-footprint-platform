import { calculateTrustScore } from './trustScore';

/**
 * lib/trustScore.test.ts
 *
 * Matched exactly to the real implementation:
 *   - division-by-zero guard returns 100 when totalCommitments === 0
 *   - baseScore = (commitmentsMet / totalCommitments) * 100
 *   - streakBonus = min(streakWeeks * 2, 20)
 *   - final score = min(round(baseScore + streakBonus), 100)
 */
describe('calculateTrustScore', () => {
  it('returns 100 when totalCommitments is 0 (division-by-zero guard)', () => {
    expect(calculateTrustScore(0, 0, 0)).toBe(100);
    expect(calculateTrustScore(5, 0, 3)).toBe(100); // guard fires regardless of other args
  });

  it('calculates base score correctly with zero streak bonus', () => {
    expect(calculateTrustScore(2, 4, 0)).toBe(50);
    expect(calculateTrustScore(4, 4, 0)).toBe(100);
    expect(calculateTrustScore(0, 4, 0)).toBe(0);
  });

  it('adds the streak bonus on top of the base score', () => {
    // base = 50, streakBonus = min(3*2, 20) = 6 -> 56
    expect(calculateTrustScore(2, 4, 3)).toBe(56);
  });

  it('caps the streak bonus at 20 even for very long streaks', () => {
    // base = 50, streakBonus would be 30 uncapped, but caps at 20 -> 70
    expect(calculateTrustScore(2, 4, 15)).toBe(70);
    expect(calculateTrustScore(2, 4, 100)).toBe(70);
  });

  it('caps the final score at 100 even when base + bonus exceeds it', () => {
    // base = 100, streakBonus = 20 -> would be 120, clamped to 100
    expect(calculateTrustScore(4, 4, 10)).toBe(100);
  });

  it('rounds the final score to the nearest integer', () => {
    // base = 33.33..., streakBonus = 0 -> rounds to 33
    expect(calculateTrustScore(1, 3, 0)).toBe(33);
  });

  it('returns 0 for zero commitments met out of a nonzero total with no streak', () => {
    expect(calculateTrustScore(0, 10, 0)).toBe(0);
  });

  it('never returns a value above 100 regardless of input combination', () => {
    for (let met = 0; met <= 10; met++) {
      for (let streak = 0; streak <= 20; streak++) {
        const score = calculateTrustScore(met, 10, streak);
        expect(score).toBeLessThanOrEqual(100);
        expect(score).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('is a pure function — identical inputs always produce identical outputs', () => {
    const a = calculateTrustScore(3, 5, 4);
    const b = calculateTrustScore(3, 5, 4);
    expect(a).toBe(b);
  });
});
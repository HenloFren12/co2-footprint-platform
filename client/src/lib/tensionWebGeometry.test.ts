import {
  computeNodePosition,
  trustToColor,
  trustToStrokeWidth,
  trustToEdgeOpacity,
} from './tensionWebGeometry';

/**
 * lib/tensionWebGeometry.test.ts
 *
 * Matched exactly to the real implementation:
 *   - CANVAS_CENTER = 150, BASE_RADIUS = 100, MIN_RADIUS_FACTOR = 0.4
 *   - angle starts at -PI/2 (12 o'clock) and distributes evenly
 *   - radius = BASE_RADIUS * (0.4 + 0.6 * (trust/100))
 *   - trustToColor thresholds: >=75 green, >=40 amber, else red
 *   - trustToStrokeWidth: 1 + (minTrust/100)*2  -> range [1, 3]
 *   - trustToEdgeOpacity: 0.3 + (minTrust/100)*0.5 -> range [0.3, 0.8]
 */
describe('computeNodePosition', () => {
  it('places a node at full base radius (100) from center when trust is 100', () => {
    const pos = computeNodePosition(0, 4, 100);
    const distance = Math.sqrt((pos.x - 150) ** 2 + (pos.y - 150) ** 2);
    expect(distance).toBeCloseTo(100, 1);
  });

  it('places a node at 40% of base radius (40) from center when trust is 0', () => {
    const pos = computeNodePosition(0, 4, 0);
    const distance = Math.sqrt((pos.x - 150) ** 2 + (pos.y - 150) ** 2);
    expect(distance).toBeCloseTo(40, 1);
  });

  it('places a node at 70% of base radius when trust is 50 (midpoint sag)', () => {
    const pos = computeNodePosition(0, 4, 50);
    const distance = Math.sqrt((pos.x - 150) ** 2 + (pos.y - 150) ** 2);
    // 0.4 + 0.6 * 0.5 = 0.70 -> 70
    expect(distance).toBeCloseTo(70, 1);
  });

  it('returns the canvas center exactly for memberIndex 0 at angle -PI/2 (top), full trust', () => {
    const pos = computeNodePosition(0, 4, 100);
    // angle = -PI/2 -> cos = 0, sin = -1 -> x = 150, y = 150 - 100 = 50
    expect(pos.x).toBeCloseTo(150, 1);
    expect(pos.y).toBeCloseTo(50, 1);
  });

  it('distributes members evenly around the circle (no overlapping coordinates)', () => {
    const positions = Array.from({ length: 5 }, (_, i) =>
      computeNodePosition(i, 5, 100)
    );
    const unique = new Set(
      positions.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    );
    expect(unique.size).toBe(5);
  });

  it('is deterministic — identical inputs return identical coordinates', () => {
    const a = computeNodePosition(2, 5, 80);
    const b = computeNodePosition(2, 5, 80);
    expect(a).toEqual(b);
  });

  it('handles totalMembers of 1 without dividing by zero', () => {
    const pos = computeNodePosition(0, 1, 100);
    expect(Number.isFinite(pos.x)).toBe(true);
    expect(Number.isFinite(pos.y)).toBe(true);
  });
});

describe('trustToColor', () => {
  it('returns green (#4ade80) for trust scores 75 and above', () => {
    expect(trustToColor(75)).toBe('#4ade80');
    expect(trustToColor(100)).toBe('#4ade80');
    expect(trustToColor(90)).toBe('#4ade80');
  });

  it('returns amber (#fbbf24) for trust scores between 40 and 74 inclusive', () => {
    expect(trustToColor(40)).toBe('#fbbf24');
    expect(trustToColor(74)).toBe('#fbbf24');
    expect(trustToColor(55)).toBe('#fbbf24');
  });

  it('returns red (#f87171) for trust scores below 40', () => {
    expect(trustToColor(39)).toBe('#f87171');
    expect(trustToColor(0)).toBe('#f87171');
  });

  it('handles the exact boundary values correctly (75 and 40 are inclusive lower bounds)', () => {
    expect(trustToColor(75)).toBe('#4ade80'); // boundary: green starts here
    expect(trustToColor(74.999)).toBe('#fbbf24'); // just below boundary
    expect(trustToColor(40)).toBe('#fbbf24'); // boundary: amber starts here
    expect(trustToColor(39.999)).toBe('#f87171'); // just below boundary
  });
});

describe('trustToStrokeWidth', () => {
  it('returns 1px (minimum) when minTrust is 0', () => {
    expect(trustToStrokeWidth(0)).toBe(1);
  });

  it('returns 3px (maximum) when minTrust is 100', () => {
    expect(trustToStrokeWidth(100)).toBe(3);
  });

  it('returns 2px at the midpoint (minTrust = 50)', () => {
    expect(trustToStrokeWidth(50)).toBe(2);
  });

  it('scales linearly with minTrust', () => {
    const a = trustToStrokeWidth(25);
    const b = trustToStrokeWidth(75);
    expect(b - a).toBeCloseTo(1, 5);
  });
});

describe('trustToEdgeOpacity', () => {
  it('returns 0.3 (minimum) when minTrust is 0', () => {
    expect(trustToEdgeOpacity(0)).toBeCloseTo(0.3, 5);
  });

  it('returns 0.8 (maximum) when minTrust is 100', () => {
    expect(trustToEdgeOpacity(100)).toBeCloseTo(0.8, 5);
  });

  it('returns 0.55 at the midpoint (minTrust = 50)', () => {
    expect(trustToEdgeOpacity(50)).toBeCloseTo(0.55, 5);
  });

  it('never returns a value outside the [0.3, 0.8] range for valid trust inputs', () => {
    for (let t = 0; t <= 100; t += 10) {
      const opacity = trustToEdgeOpacity(t);
      expect(opacity).toBeGreaterThanOrEqual(0.3);
      expect(opacity).toBeLessThanOrEqual(0.8);
    }
  });
});
import { computeNodePosition, trustToColor } from './tensionWebGeometry';

describe('computeNodePosition', () => {
  it('places a node at full base radius when trust score is 100', () => {
    const pos = computeNodePosition(0, 4, 100);
    const distanceFromCenter = Math.sqrt(
      Math.pow(pos.x - 150, 2) + Math.pow(pos.y - 150, 2)
    );
    expect(distanceFromCenter).toBeCloseTo(100, 1);
  });

it('does not produce overlapping coordinates for 5 members at equal trust', () => {
    // Tests that the trigonometric distribution properly separates all 5 nodes
    const positions = Array.from({ length: 5 }, (_, i) => computeNodePosition(i, 5, 100));
    
    // Convert coordinates to a string format to check for uniqueness in a Set
    const unique = new Set(positions.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
    
    expect(unique.size).toBe(5);
  });

  it('places a node at 40% of base radius when trust score is 0', () => {
    const pos = computeNodePosition(0, 4, 0);
    const distanceFromCenter = Math.sqrt(
      Math.pow(pos.x - 150, 2) + Math.pow(pos.y - 150, 2)
    );
    expect(distanceFromCenter).toBeCloseTo(40, 1);
  });

  it('returns deterministic coordinates', () => {
    expect(computeNodePosition(2, 5, 80)).toEqual(computeNodePosition(2, 5, 80));
  });
});

describe('trustToColor', () => {
  it('returns correct hex codes based on thresholds', () => {
    expect(trustToColor(100)).toBe('#4ade80');
    expect(trustToColor(75)).toBe('#4ade80');
    expect(trustToColor(74)).toBe('#fbbf24');
    expect(trustToColor(40)).toBe('#fbbf24');
    expect(trustToColor(39)).toBe('#f87171');
    expect(trustToColor(0)).toBe('#f87171');
  });
});
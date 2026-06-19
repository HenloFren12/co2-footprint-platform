const CANVAS_CENTER = 150;
const BASE_RADIUS = 100;
const MIN_RADIUS_FACTOR = 0.4; 

export function computeNodePosition(
  memberIndex: number,
  totalMembers: number,
  trustScore: number
): { x: number; y: number } {
  const angle = (2 * Math.PI * memberIndex) / totalMembers - Math.PI / 2;
  const sagFactor = trustScore / 100;
  const radius = BASE_RADIUS * (MIN_RADIUS_FACTOR + (1 - MIN_RADIUS_FACTOR) * sagFactor);

  return {
    x: CANVAS_CENTER + radius * Math.cos(angle),
    y: CANVAS_CENTER + radius * Math.sin(angle),
  };
}

export function trustToColor(trust: number): string {
  if (trust >= 75) return '#4ade80';
  if (trust >= 40) return '#fbbf24';
  return '#f87171';
}

export function trustToStrokeWidth(minTrust: number): number {
  return 1 + (minTrust / 100) * 2;
}

export function trustToEdgeOpacity(minTrust: number): number {
  return 0.3 + (minTrust / 100) * 0.5;
}
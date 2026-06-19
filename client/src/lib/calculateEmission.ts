import EMISSION_FACTORS from './emissionFactors.json';

export function calculateEmission(activityType: string, quantity: number): number {
  if (quantity < 0) {
    throw new RangeError('Quantity cannot be negative');
  }
  if (quantity === 0) return 0;

  const factor = (EMISSION_FACTORS as Record<string, number>)[activityType];
  
  if (factor === undefined) {
    throw new TypeError(`Unknown activity type: ${activityType}`);
  }

  const rawTotal = factor * quantity;
  return Math.min(rawTotal, Number.MAX_SAFE_INTEGER);
}
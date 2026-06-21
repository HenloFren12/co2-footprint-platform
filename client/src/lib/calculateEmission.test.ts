import { calculateEmission } from './calculateEmission';

/**
 * lib/calculateEmission.test.ts
 *
 * Matched exactly to the real implementation:
 *   - throws RangeError for negative quantity
 *   - returns 0 immediately for quantity === 0 (before factor lookup)
 *   - throws TypeError for unknown activityType
 *   - clamps to Number.MAX_SAFE_INTEGER
 *   - looks up factor from emissionFactors.json at module scope (O(1))
 */
describe('calculateEmission', () => {
  it('throws a RangeError when quantity is negative', () => {
    expect(() => calculateEmission('car_petrol_medium_km', -5)).toThrow(
      RangeError
    );
    expect(() => calculateEmission('car_petrol_medium_km', -1)).toThrow(
      'Quantity cannot be negative'
    );
  });

  it('returns 0 immediately when quantity is exactly 0, even for an unknown type', () => {
    // The real implementation returns 0 BEFORE the factor lookup runs,
    // so an unknown activityType with quantity 0 must NOT throw.
    expect(calculateEmission('totally_unknown_type', 0)).toBe(0);
    expect(calculateEmission('car_petrol_medium_km', 0)).toBe(0);
  });

  it('throws a TypeError for an unrecognized activity type when quantity > 0', () => {
    expect(() => calculateEmission('not_a_real_key', 10)).toThrow(TypeError);
    expect(() => calculateEmission('not_a_real_key', 10)).toThrow(
      'Unknown activity type: not_a_real_key'
    );
  });

  it('returns a positive number for a known activity type and positive quantity', () => {
    const result = calculateEmission('car_petrol_medium_km', 10);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
  });

  it('is linear in quantity for a fixed activity type (factor * quantity)', () => {
    const ten = calculateEmission('car_petrol_medium_km', 10);
    const twenty = calculateEmission('car_petrol_medium_km', 20);
    expect(twenty).toBeCloseTo(ten * 2, 5);
  });

  it('clamps the result to Number.MAX_SAFE_INTEGER for extreme quantities', () => {
    const result = calculateEmission(
      'car_petrol_medium_km',
      Number.MAX_SAFE_INTEGER
    );
    expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });

  it('does not mutate the imported EMISSION_FACTORS module between calls', () => {
    const first = calculateEmission('car_petrol_medium_km', 5);
    const second = calculateEmission('car_petrol_medium_km', 5);
    expect(first).toBe(second);
  });

  it('handles a decimal quantity correctly', () => {
    const result = calculateEmission('car_petrol_medium_km', 2.5);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });
});
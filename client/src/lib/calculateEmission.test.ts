import { calculateEmission } from './calculateEmission';

describe('calculateEmission', () => {
  it('returns correct value for known activity type', () => {
    expect(calculateEmission('flight_domestic_km', 100)).toBeCloseTo(25.5);
    expect(calculateEmission('beef_kg', 2)).toBeCloseTo(54.0);
  });

  it('returns 0 for zero quantity', () => {
    expect(calculateEmission('car_petrol_km', 0)).toBe(0);
  });

  it('throws a RangeError for negative quantity', () => {
    expect(() => calculateEmission('electricity_kwh_IN', -5)).toThrow(RangeError);
  });

  it('throws a TypeError for unknown activity type', () => {
    expect(() => calculateEmission('teleportation_km', 10)).toThrow(TypeError);
  });

  it('clamps value to Number.MAX_SAFE_INTEGER to prevent overflow', () => {
    const hugeQuantity = Number.MAX_SAFE_INTEGER;
    // Assuming beef_kg is 27.0, this would normally exceed MAX_SAFE_INTEGER
    expect(calculateEmission('beef_kg', hugeQuantity)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
import { generatePersonaNarrative, Persona } from './personaNarrative';

/**
 * lib/personaNarrative.test.ts
 *
 * Matched exactly to the real implementation:
 *   - EMISSION_LABELS only has 7 exact keys (flight_domestic_km,
 *     flight_international_km, car_petrol_km, car_ev_km, beef_kg,
 *     chicken_kg, electricity_kwh_IN) — anything else falls back
 *     to 'recent activity'
 *   - negative co2SavedKg is clamped to 0 via Math.max(0, co2SavedKg)
 *   - safeSavedKg > 0 uses the "saved" branch; safeSavedKg === 0 (including
 *     originally-negative input) uses the "contributing" branch
 *   - output format: "{name} here. {body} {closingLine}"
 */

const mockPersona: Persona = {
  id: 'arjun',
  name: 'Arjun',
  age: 44,
  occupation: 'rice farmer',
  location: 'Bihar, India',
  climateImpact: 'Monsoon unpredictability causing crop failure',
  portraitBackground: 'Cracked dry paddy field',
  impactMetric: 'unpredictable monsoon',
  impactDescription:
    'worsening monsoon patterns that destroy rice harvests across Bihar',
  closingLine: 'Every choice you make ripples here to Bihar.',
  weeklyAction: 'Skip one meat meal this week',
};

describe('generatePersonaNarrative', () => {
  it('uses the saved-carbon branch when co2SavedKg is greater than 0', () => {
    const result = generatePersonaNarrative(mockPersona, 'flight_domestic_km', 14);
    expect(result).toBe(
      'Arjun here. Your 14kg saved this week means one less day of unpredictable monsoon. Every choice you make ripples here to Bihar.'
    );
  });

  it('uses the contributing branch when co2SavedKg is exactly 0', () => {
    const result = generatePersonaNarrative(mockPersona, 'flight_domestic_km', 0);
    expect(result).toBe(
      'Arjun here. Your domestic flight choices directly contribute to worsening monsoon patterns that destroy rice harvests across Bihar. Every choice you make ripples here to Bihar.'
    );
  });

  it('clamps a negative co2SavedKg to 0 and uses the contributing branch (never shows negative)', () => {
    const result = generatePersonaNarrative(mockPersona, 'beef_kg', -5);
    expect(result).toContain('beef consumption choices directly contribute');
    expect(result).not.toContain('-5');
    expect(result).not.toMatch(/-\d/);
  });

  it('uses the exact-match label for each of the 7 keys defined in EMISSION_LABELS', () => {
    expect(
      generatePersonaNarrative(mockPersona, 'flight_domestic_km', 0)
    ).toContain('domestic flight choices');
    expect(
      generatePersonaNarrative(mockPersona, 'flight_international_km', 0)
    ).toContain('international flight choices');
    expect(generatePersonaNarrative(mockPersona, 'car_petrol_km', 0)).toContain(
      'daily commute choices'
    );
    expect(generatePersonaNarrative(mockPersona, 'car_ev_km', 0)).toContain(
      'electric vehicle use choices'
    );
    expect(generatePersonaNarrative(mockPersona, 'beef_kg', 0)).toContain(
      'beef consumption choices'
    );
    expect(generatePersonaNarrative(mockPersona, 'chicken_kg', 0)).toContain(
      'poultry consumption choices'
    );
    expect(
      generatePersonaNarrative(mockPersona, 'electricity_kwh_IN', 0)
    ).toContain('power consumption choices');
  });

  it('falls back to "recent activity" for any type not in EMISSION_LABELS', () => {
    const result = generatePersonaNarrative(mockPersona, 'unknown_type_xyz', 0);
    expect(result).toContain('recent activity choices directly contribute');
  });

  it('falls back to "recent activity" even for a valid emissionFactors.json key not in the label map (e.g. car_petrol_medium_km)', () => {
    // EMISSION_LABELS only has 'car_petrol_km', NOT 'car_petrol_medium_km'
    const result = generatePersonaNarrative(
      mockPersona,
      'car_petrol_medium_km',
      0
    );
    expect(result).toContain('recent activity choices');
  });

  it('rounds the co2SavedKg value to the nearest integer in the saved branch', () => {
    const result = generatePersonaNarrative(mockPersona, 'beef_kg', 14.7);
    expect(result).toContain('15kg saved');
  });

  it('always starts with "{name} here." and ends with the closingLine', () => {
    const result = generatePersonaNarrative(mockPersona, 'beef_kg', 10);
    expect(result.startsWith('Arjun here.')).toBe(true);
    expect(result.endsWith(mockPersona.closingLine)).toBe(true);
  });

  it('is a pure function with no side effects on the input persona object', () => {
    const before = { ...mockPersona };
    generatePersonaNarrative(mockPersona, 'beef_kg', 10);
    expect(mockPersona).toEqual(before);
  });

  it('handles co2SavedKg of exactly 0.4 (truthy but rounds to 0) using the saved branch since 0.4 > 0', () => {
    const result = generatePersonaNarrative(mockPersona, 'beef_kg', 0.4);
    // safeSavedKg = 0.4, which is > 0, so saved branch fires even though it rounds to 0kg
    expect(result).toContain('0kg saved');
  });
});
import { generatePersonaNarrative, Persona } from './personaNarrative';

const mockArjun: Persona = {
  id: 'arjun',
  name: 'Arjun',
  location: 'Bihar, India',
  occupation: 'rice farmer',
  impactMetric: 'unpredictable monsoon',
  impactDescription: 'crop failure',
  closingLine: 'Every choice ripples here.',
  weeklyAction: 'Go meatless today'
};

describe('generatePersonaNarrative', () => {
  it('uses the saved-carbon branch when co2SavedKg is greater than 0', () => {
    const result = generatePersonaNarrative(mockArjun, 'flight_domestic_km', 14);
    expect(result).toBe('Arjun here. Your 14kg saved this week means one less day of unpredictable monsoon. Every choice ripples here.');
  });

  it('uses the contributing branch when co2SavedKg is 0', () => {
    const result = generatePersonaNarrative(mockArjun, 'flight_domestic_km', 0);
    expect(result).toBe('Arjun here. Your domestic travel choices directly contribute to crop failure. Every choice ripples here.');
  });

  it('handles negative co2SavedKg safely (treats as contributing)', () => {
    const result = generatePersonaNarrative(mockArjun, 'beef_kg', -5);
    expect(result).toContain('dietary choices directly contribute');
  });

  it('uses fallback emission label when topEmissionType is not in EMISSION_LABELS', () => {
    const result = generatePersonaNarrative(mockArjun, 'unknown_type_xyz', 0);
    expect(result).toContain('recent activity choices');
  });
});
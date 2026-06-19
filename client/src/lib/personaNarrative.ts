// lib/personaNarrative.ts

export interface Persona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  climateImpact: string;
  portraitBackground: string;
  impactMetric: string;
  impactDescription: string;
  closingLine: string;
  weeklyAction: string;
  avatarUrl?: string;
}

// O(1) label lookup map
// Covers all major emission factor keys from emissionFactors.json
const EMISSION_LABELS: Record<string, string> = {
  // Transport
  flight_domestic_km: 'domestic flight',
  flight_international_km: 'international flight',
  car_petrol_km: 'daily commute',
  car_ev_km: 'electric vehicle use',

  // Diet
  beef_kg: 'beef consumption',
  chicken_kg: 'poultry consumption',

  // Energy
  electricity_kwh_IN: 'power consumption',

  // Fallback handled by ?? operator below
};

/**
 * Pure function — O(1) complexity
 * Returns a personalized narrative string for a given persona
 * Handles all edge cases: zero, negative, unknown emission types
 */
export function generatePersonaNarrative(
  persona: Persona,
  topEmissionType: string,
  co2SavedKg: number
): string {
  // O(1) label lookup with fallback
  const emissionLabel =
    EMISSION_LABELS[topEmissionType] ?? 'recent activity';

  // Handle negative co2SavedKg — treat as 0
  // Ideation PDF edge case: must not crash or show negative
  const safeSavedKg = Math.max(0, co2SavedKg);

  const body =
    safeSavedKg > 0
      ? `Your ${Math.round(safeSavedKg)}kg saved this week means one less day of ${persona.impactMetric}.`
      : `Your ${emissionLabel} choices directly contribute to ${persona.impactDescription}.`;

  return `${persona.name} here. ${body} ${persona.closingLine}`;
}
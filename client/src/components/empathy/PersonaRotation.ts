// components/empathy/personaRotation.ts

const PERSONA_IDS = ['arjun', 'amara', 'lena', 'ibrahim', 'mei', 'sofia', 'tariq', 'hana'];

export function getPersonaForWeek(userId: string, isoWeekNumber: number): string {
  const safeUserId = userId || '';
  const userSeed = safeUserId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const index = Math.abs(userSeed + isoWeekNumber) % (PERSONA_IDS.length || 1);
  
  // The '!' guarantees to TypeScript that this will always be a string, not undefined
  return PERSONA_IDS[index]! || PERSONA_IDS[0]!;
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
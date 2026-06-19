// components/empathy/personaRotation.ts

const PERSONA_IDS = ['arjun', 'amara', 'lena', 'ibrahim', 'mei', 'sofia', 'tariq', 'hana'];

export function getPersonaForWeek(userId: string, isoWeekNumber: number): string {
  // Combine user ID hash with week number for a stable, user-unique rotation
  const userSeed = userId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const index = (userSeed + isoWeekNumber) % PERSONA_IDS.length;
  return PERSONA_IDS[index];
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
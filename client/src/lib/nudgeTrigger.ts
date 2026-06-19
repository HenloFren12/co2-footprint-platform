// lib/nudgeTrigger.ts

const DAILY_NUDGE_CAP = 3;

export function shouldTriggerNudge(
  dailyCount: number,
  lastResetDate: string, // ISO date string, e.g. "2026-06-13"
  activityType: string,
  exemptTypes: string[]  // activity types that never trigger nudges
): boolean {
  const today = new Date().toISOString().split('T')[0];
  const effectiveCount = lastResetDate === today ? dailyCount : 0;

  if (exemptTypes.includes(activityType)) return false;
  return effectiveCount < DAILY_NUDGE_CAP;
}
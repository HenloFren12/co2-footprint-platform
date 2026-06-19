export function calculateTrustScore(
  commitmentsMet: number,
  totalCommitments: number,
  streakWeeks: number
): number {
  if (totalCommitments === 0) return 100;

  const baseScore = (commitmentsMet / totalCommitments) * 100;
  const streakBonus = Math.min(streakWeeks * 2, 20); 
  
  return Math.min(Math.round(baseScore + streakBonus), 100);
}
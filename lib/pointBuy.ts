export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

// Cost to purchase each score value (from D&D 5e PHB, 2014)
const SCORE_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function scoreCost(score: number): number {
  return SCORE_COSTS[score] ?? 0;
}

export function pointsSpent(scores: number[]): number {
  return scores.reduce((acc, s) => acc + scoreCost(s), 0);
}

export function pointsRemaining(scores: number[]): number {
  return POINT_BUY_TOTAL - pointsSpent(scores);
}

export function isValidPointBuy(scores: number[]): boolean {
  if (scores.some((s) => s < POINT_BUY_MIN || s > POINT_BUY_MAX)) return false;
  return pointsSpent(scores) <= POINT_BUY_TOTAL;
}

export function canIncrement(score: number, spent: number): boolean {
  const next = score + 1;
  if (next > POINT_BUY_MAX) return false;
  const additionalCost = scoreCost(next) - scoreCost(score);
  return spent + additionalCost <= POINT_BUY_TOTAL;
}

export function canDecrement(score: number): boolean {
  return score > POINT_BUY_MIN;
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

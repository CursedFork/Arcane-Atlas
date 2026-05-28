export type DiceExpression = `${number}d${number}` | `${number}d${number}+${number}` | `${number}d${number}-${number}`;

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

export function rollAndSum(count: number, sides: number, bonus = 0): number {
  return rollDice(count, sides).reduce((a, b) => a + b, 0) + bonus;
}

export function parseDiceExpression(expr: string): { count: number; sides: number; bonus: number } | null {
  const match = /^(\d+)d(\d+)([+-]\d+)?$/.exec(expr.trim().replace(/\s/g, ""));
  if (!match) return null;
  return {
    count: parseInt(match[1] ?? "1", 10),
    sides: parseInt(match[2] ?? "6", 10),
    bonus: match[3] ? parseInt(match[3], 10) : 0,
  };
}

export function rollExpression(expr: string): number | null {
  const parsed = parseDiceExpression(expr);
  if (!parsed) return null;
  return rollAndSum(parsed.count, parsed.sides, parsed.bonus);
}

// Roll 4d6 drop lowest — standard stat generation method
export function rollStat(): number {
  const rolls = rollDice(4, 6);
  const sorted = [...rolls].sort((a, b) => a - b);
  return sorted.slice(1).reduce((a, b) => a + b, 0);
}

export function rollAllStats(): number[] {
  return Array.from({ length: 6 }, () => rollStat());
}

// Starting gold by class (in gp)
export const STARTING_GOLD_DICE: Record<string, string> = {
  barbarian: "2d4x10",
  bard: "5d4x10",
  cleric: "5d4x10",
  druid: "2d4x10",
  fighter: "5d4x10",
  monk: "5d4",
  paladin: "5d4x10",
  ranger: "5d4x10",
  rogue: "4d4x10",
  sorcerer: "3d4x10",
  warlock: "4d4x10",
  wizard: "4d4x10",
};

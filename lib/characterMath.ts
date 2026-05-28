import { type AbilityScores, type AbilityKey } from "./schemas/character";
import { abilityModifier } from "./utils";

export const PROFICIENCY_BONUS: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

export function proficiencyBonus(level: number): number {
  return PROFICIENCY_BONUS[Math.min(Math.max(level, 1), 20)] ?? 2;
}

export function passivePerception(wisdom: number, isProficient: boolean, level: number): number {
  return 10 + abilityModifier(wisdom) + (isProficient ? proficiencyBonus(level) : 0);
}

export function initiative(dex: number): number {
  return abilityModifier(dex);
}

export function spellSaveDC(
  classSlug: string,
  scores: AbilityScores,
  level: number
): number | null {
  const castingAbility = spellcastingAbility(classSlug);
  if (!castingAbility) return null;
  return 8 + proficiencyBonus(level) + abilityModifier(scores[castingAbility]);
}

export function spellAttackBonus(
  classSlug: string,
  scores: AbilityScores,
  level: number
): number | null {
  const castingAbility = spellcastingAbility(classSlug);
  if (!castingAbility) return null;
  return proficiencyBonus(level) + abilityModifier(scores[castingAbility]);
}

export function spellcastingAbility(classSlug: string): AbilityKey | null {
  const map: Record<string, AbilityKey> = {
    bard: "charisma",
    cleric: "wisdom",
    druid: "wisdom",
    paladin: "charisma",
    ranger: "wisdom",
    sorcerer: "charisma",
    warlock: "charisma",
    wizard: "intelligence",
  };
  return map[classSlug] ?? null;
}

export function calculateMaxHP(
  classSlug: string,
  level: number,
  constitutionScore: number
): number {
  const conMod = abilityModifier(constitutionScore);
  const hitDie = CLASS_HIT_DICE[classSlug] ?? 8;
  // L1: max hit die + con mod; subsequent levels: average (rounded up) + con mod
  const averagePerLevel = Math.ceil((hitDie + 1) / 2);
  return hitDie + conMod + (level - 1) * (averagePerLevel + conMod);
}

export const CLASS_HIT_DICE: Record<string, number> = {
  barbarian: 12,
  fighter: 10,
  paladin: 10,
  ranger: 10,
  bard: 8,
  cleric: 8,
  druid: 8,
  monk: 8,
  rogue: 8,
  warlock: 8,
  sorcerer: 6,
  wizard: 6,
};

export function armorClass(dex: number, armorType: "none" | "light" | "medium" | "heavy" | "mage_armor"): number {
  const dexMod = abilityModifier(dex);
  switch (armorType) {
    case "none": return 10 + dexMod;
    case "light": return 11 + dexMod; // Leather base
    case "medium": return 14 + Math.min(dexMod, 2); // Chain shirt base
    case "heavy": return 16; // Chain mail base, no Dex
    case "mage_armor": return 13 + dexMod;
  }
}

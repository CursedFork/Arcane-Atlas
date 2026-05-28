// Spell slot tables — D&D 5e 2014 ruleset

// Full casters: Bard, Cleric, Druid, Sorcerer, Wizard
// Index 0 = 1st-level slots, index 8 = 9th-level slots
const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // L1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // L2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // L3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // L4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // L5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // L6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // L7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // L8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // L9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // L10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // L11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // L12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // L13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // L14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // L15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // L16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // L17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // L18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // L19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // L20
];

// Half casters (Paladin, Ranger) — spells start at L2
const HALF_CASTER_SLOTS: number[][] = [
  [0, 0, 0, 0, 0], // L1 (no spells)
  [2, 0, 0, 0, 0], // L2
  [3, 0, 0, 0, 0], // L3
  [3, 0, 0, 0, 0], // L4
  [4, 2, 0, 0, 0], // L5
  [4, 2, 0, 0, 0], // L6
  [4, 3, 0, 0, 0], // L7
  [4, 3, 0, 0, 0], // L8
  [4, 3, 2, 0, 0], // L9
  [4, 3, 2, 0, 0], // L10
  [4, 3, 3, 0, 0], // L11
  [4, 3, 3, 0, 0], // L12
  [4, 3, 3, 1, 0], // L13
  [4, 3, 3, 1, 0], // L14
  [4, 3, 3, 2, 0], // L15
  [4, 3, 3, 2, 0], // L16
  [4, 3, 3, 3, 1], // L17
  [4, 3, 3, 3, 1], // L18
  [4, 3, 3, 3, 2], // L19
  [4, 3, 3, 3, 2], // L20
];

// Warlock Pact Magic — [slots, slot_level]
const WARLOCK_SLOTS: [number, number][] = [
  [1, 1], // L1
  [2, 1], // L2
  [2, 2], // L3
  [2, 2], // L4
  [2, 3], // L5
  [2, 3], // L6
  [2, 4], // L7
  [2, 4], // L8
  [2, 5], // L9
  [2, 5], // L10
  [3, 5], // L11
  [3, 5], // L12
  [3, 5], // L13
  [3, 5], // L14
  [3, 5], // L15
  [3, 5], // L16
  [4, 5], // L17
  [4, 5], // L18
  [4, 5], // L19
  [4, 5], // L20
];

export type SpellcastingType = "full" | "half" | "warlock" | "none";

export interface SpellSlotInfo {
  type: SpellcastingType;
  slots: number[]; // index = spell level - 1
  warlockSlotLevel?: number;
}

export function getSpellSlots(classSlug: string, level: number): SpellSlotInfo {
  const idx = Math.min(Math.max(level, 1), 20) - 1;

  const fullCasters = ["bard", "cleric", "druid", "sorcerer", "wizard"];
  const halfCasters = ["paladin", "ranger"];

  if (fullCasters.includes(classSlug)) {
    return { type: "full", slots: FULL_CASTER_SLOTS[idx] ?? [] };
  }
  if (halfCasters.includes(classSlug)) {
    return { type: "half", slots: HALF_CASTER_SLOTS[idx] ?? [] };
  }
  if (classSlug === "warlock") {
    const [slots, slotLevel] = WARLOCK_SLOTS[idx] ?? [0, 0];
    const slotArray = new Array<number>(9).fill(0);
    if (slotLevel > 0 && slotLevel <= 9) {
      slotArray[slotLevel - 1] = slots;
    }
    return { type: "warlock", slots: slotArray, warlockSlotLevel: slotLevel };
  }
  return { type: "none", slots: [] };
}

export function isSpellcaster(classSlug: string): boolean {
  return getSpellSlots(classSlug, 1).type !== "none";
}

// Cantrips known by level for each class
const BARD_CANTRIPS: number[] = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const SORCERER_CANTRIPS: number[] = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
const WARLOCK_CANTRIPS: number[] = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const WIZARD_CANTRIPS: number[] = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const DRUID_CANTRIPS: number[] = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const CLERIC_CANTRIPS: number[] = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

export function cantripsKnown(classSlug: string, level: number): number {
  const idx = Math.min(Math.max(level, 1), 20) - 1;
  const map: Record<string, number[]> = {
    bard: BARD_CANTRIPS,
    sorcerer: SORCERER_CANTRIPS,
    warlock: WARLOCK_CANTRIPS,
    wizard: WIZARD_CANTRIPS,
    druid: DRUID_CANTRIPS,
    cleric: CLERIC_CANTRIPS,
  };
  return map[classSlug]?.[idx] ?? 0;
}

// Spells known (for "known" casters like Bard, Sorcerer, Warlock, Ranger)
const BARD_SPELLS_KNOWN = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const SORCERER_SPELLS_KNOWN = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const WARLOCK_SPELLS_KNOWN = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const RANGER_SPELLS_KNOWN = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];

export function spellsKnown(classSlug: string, level: number): number | null {
  const idx = Math.min(Math.max(level, 1), 20) - 1;
  const map: Record<string, number[]> = {
    bard: BARD_SPELLS_KNOWN,
    sorcerer: SORCERER_SPELLS_KNOWN,
    warlock: WARLOCK_SPELLS_KNOWN,
    ranger: RANGER_SPELLS_KNOWN,
  };
  if (classSlug in map) return map[classSlug]?.[idx] ?? null;
  return null; // prepared casters don't have a fixed known count
}

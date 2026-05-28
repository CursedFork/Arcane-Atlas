import { describe, it, expect } from "vitest";
import {
  proficiencyBonus,
  calculateMaxHP,
  spellcastingAbility,
  spellSaveDC,
  spellAttackBonus,
  CLASS_HIT_DICE,
} from "@/lib/characterMath";
import { abilityModifier, formatModifier } from "@/lib/utils";

describe("proficiencyBonus", () => {
  it("is +2 at level 1", () => expect(proficiencyBonus(1)).toBe(2));
  it("is +2 at level 4", () => expect(proficiencyBonus(4)).toBe(2));
  it("is +3 at level 5", () => expect(proficiencyBonus(5)).toBe(3));
  it("is +4 at level 9", () => expect(proficiencyBonus(9)).toBe(4));
  it("is +5 at level 13", () => expect(proficiencyBonus(13)).toBe(5));
  it("is +6 at level 17", () => expect(proficiencyBonus(17)).toBe(6));
  it("is +6 at level 20", () => expect(proficiencyBonus(20)).toBe(6));
  it("clamps to +2 for level 0", () => expect(proficiencyBonus(0)).toBe(2));
  it("clamps to +6 for level 21", () => expect(proficiencyBonus(21)).toBe(6));
});

describe("calculateMaxHP", () => {
  it("barbarian L1 CON 10 → 12 HP", () => {
    expect(calculateMaxHP("barbarian", 1, 10)).toBe(12);
  });

  it("wizard L1 CON 10 → 6 HP", () => {
    expect(calculateMaxHP("wizard", 1, 10)).toBe(6);
  });

  it("fighter L1 CON 14 → 10 + 2 = 12 HP", () => {
    expect(calculateMaxHP("fighter", 1, 14)).toBe(12);
  });

  it("bard L1 CON 13 → 8 + 1 = 9 HP", () => {
    // con mod +1
    expect(calculateMaxHP("bard", 1, 13)).toBe(9);
  });

  it("bard L2 CON 10 → L1: 8 + L2: avg(8)=5, total 13 HP", () => {
    // hitDie=8, conMod=0
    // L1: 8+0 = 8; L2: ceil(9/2) + 0 = 5; total = 13
    expect(calculateMaxHP("bard", 2, 10)).toBe(13);
  });

  it("cleric L5 CON 16 → higher HP with +3 con mod", () => {
    // hitDie=8, conMod=+3
    // L1: 8+3=11; L2-5: 4*(5+3)=32; total = 43
    expect(calculateMaxHP("cleric", 5, 16)).toBe(43);
  });
});

describe("abilityModifier", () => {
  it("score 10 → mod 0", () => expect(abilityModifier(10)).toBe(0));
  it("score 11 → mod 0", () => expect(abilityModifier(11)).toBe(0));
  it("score 12 → mod +1", () => expect(abilityModifier(12)).toBe(1));
  it("score 8 → mod -1", () => expect(abilityModifier(8)).toBe(-1));
  it("score 20 → mod +5", () => expect(abilityModifier(20)).toBe(5));
  it("score 1 → mod -5", () => expect(abilityModifier(1)).toBe(-5));
  it("score 7 → mod -2", () => expect(abilityModifier(7)).toBe(-2));
});

describe("formatModifier", () => {
  it("positive mod has + prefix", () => expect(formatModifier(3)).toBe("+3"));
  it("zero mod has + prefix", () => expect(formatModifier(0)).toBe("+0"));
  it("negative mod has - prefix", () => expect(formatModifier(-2)).toBe("-2"));
});

describe("spellcastingAbility", () => {
  it("bard uses charisma", () => expect(spellcastingAbility("bard")).toBe("charisma"));
  it("wizard uses intelligence", () => expect(spellcastingAbility("wizard")).toBe("intelligence"));
  it("cleric uses wisdom", () => expect(spellcastingAbility("cleric")).toBe("wisdom"));
  it("druid uses wisdom", () => expect(spellcastingAbility("druid")).toBe("wisdom"));
  it("sorcerer uses charisma", () => expect(spellcastingAbility("sorcerer")).toBe("charisma"));
  it("warlock uses charisma", () => expect(spellcastingAbility("warlock")).toBe("charisma"));
  it("paladin uses charisma", () => expect(spellcastingAbility("paladin")).toBe("charisma"));
  it("ranger uses wisdom", () => expect(spellcastingAbility("ranger")).toBe("wisdom"));
  it("fighter returns null", () => expect(spellcastingAbility("fighter")).toBeNull());
  it("barbarian returns null", () => expect(spellcastingAbility("barbarian")).toBeNull());
});

describe("spellSaveDC", () => {
  const scores = {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 16,
  };

  it("bard L1 CHA 16 → DC 13 (8 + 2 + 3)", () => {
    // 8 + proficiencyBonus(1)=2 + abilityModifier(16)=3 = 13
    expect(spellSaveDC("bard", scores, 1)).toBe(13);
  });

  it("fighter returns null", () => {
    expect(spellSaveDC("fighter", scores, 5)).toBeNull();
  });
});

describe("spellAttackBonus", () => {
  const scores = {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 16,
  };

  it("bard L1 CHA 16 → +5 (profBonus=2 + mod=3)", () => {
    expect(spellAttackBonus("bard", scores, 1)).toBe(5);
  });
});

describe("CLASS_HIT_DICE", () => {
  it("barbarian has d12", () => expect(CLASS_HIT_DICE["barbarian"]).toBe(12));
  it("fighter has d10", () => expect(CLASS_HIT_DICE["fighter"]).toBe(10));
  it("bard has d8", () => expect(CLASS_HIT_DICE["bard"]).toBe(8));
  it("wizard has d6", () => expect(CLASS_HIT_DICE["wizard"]).toBe(6));
});

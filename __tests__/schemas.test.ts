import { describe, it, expect } from "vitest";
import { CharacterSchema, validateCharacterImport } from "@/lib/schemas/character";
import { HomebrewSpellSchema, HomebrewCollectionSchema } from "@/lib/schemas/homebrew";
import { SpellSchema } from "@/lib/schemas/spell";
import { MonsterSchema } from "@/lib/schemas/monster";

const now = new Date().toISOString();

const baseCharacter = {
  id: "00000000-0000-0000-0000-000000000001",
  version: 1,
  name: "Aria",
  level: 1,
  race: "half-elf",
  classSlug: "bard",
  subclass: "",
  background: "entertainer",
  alignment: "Chaotic Good",
  abilityScoreMethod: "standard" as const,
  baseAbilityScores: { strength: 8, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 15 },
  racialAbilityBoosts: { wisdom: 1, charisma: 2 },
  finalAbilityScores: { strength: 8, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 11, charisma: 17 },
  skillProficiencies: ["Performance", "Persuasion"],
  toolProficiencies: [],
  languages: ["Common", "Elvish"],
  savingThrowProficiencies: ["Dexterity", "Charisma"],
  equipment: [],
  spells: { cantrips: [], prepared: [], known: [] },
  hp: { max: 8, current: 8, temp: 0 },
  details: { appearance: "", backstory: "", bonds: "", ideals: "", flaws: "", notes: "" },
  homebrewIds: { spellSlugs: [], raceSlugs: [], classSlugs: [] },
  createdAt: now,
  updatedAt: now,
};

describe("CharacterSchema", () => {
  it("parses a valid character", () => {
    const result = CharacterSchema.safeParse(baseCharacter);
    if (!result.success) {
      console.error(result.error.errors);
    }
    expect(result.success).toBe(true);
  });

  it("rejects a name over 100 characters", () => {
    const result = CharacterSchema.safeParse({ ...baseCharacter, name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = CharacterSchema.safeParse({ ...baseCharacter, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects level 0", () => {
    const result = CharacterSchema.safeParse({ ...baseCharacter, level: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects level > 20", () => {
    const result = CharacterSchema.safeParse({ ...baseCharacter, level: 21 });
    expect(result.success).toBe(false);
  });

  it("rejects backstory over 10000 characters", () => {
    const result = CharacterSchema.safeParse({
      ...baseCharacter,
      details: { ...baseCharacter.details, backstory: "x".repeat(10001) },
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields", () => {
    const result = CharacterSchema.safeParse({ ...baseCharacter, unknownField: "evil" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("unknownField" in result.data).toBe(false);
    }
  });
});

describe("validateCharacterImport", () => {
  it("returns errors for invalid data", () => {
    const result = validateCharacterImport({ name: 123 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe("HomebrewSpellSchema", () => {
  const base = {
    slug: "my-spell",
    name: "My Spell",
    desc: "Does something magical.",
    range: "60 feet",
    components: "V, S",
    ritual: "no" as const,
    duration: "1 minute",
    concentration: "yes" as const,
    casting_time: "1 action",
    level: "2",
    level_int: 2,
    school: "Evocation",
    dnd_class: "Wizard, Sorcerer",
    isHomebrew: true as const,
  };

  it("parses a valid homebrew spell", () => {
    const result = HomebrewSpellSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = HomebrewSpellSchema.safeParse({ ...base, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects level_int > 9", () => {
    const result = HomebrewSpellSchema.safeParse({ ...base, level_int: 10 });
    expect(result.success).toBe(false);
  });
});

describe("HomebrewCollectionSchema", () => {
  it("accepts an empty collection", () => {
    const result = HomebrewCollectionSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.spells).toEqual([]);
    }
  });
});

describe("SpellSchema", () => {
  it("parses Open5e spell format", () => {
    const spell = {
      slug: "fireball",
      name: "Fireball",
      desc: "A bright streak flashes...",
      range: "150 feet",
      components: "V, S, M",
      ritual: "no",
      duration: "Instantaneous",
      concentration: "no",
      casting_time: "1 action",
      level: "3",
      level_int: 3,
      school: "Evocation",
      dnd_class: "Sorcerer, Wizard",
    };
    const result = SpellSchema.safeParse(spell);
    expect(result.success).toBe(true);
  });
});

describe("MonsterSchema", () => {
  it("parses a monster with required fields", () => {
    const goblin = {
      slug: "goblin",
      name: "Goblin",
      size: "Small",
      type: "humanoid",
      alignment: "neutral evil",
      armor_class: 15,
      hit_points: 7,
      hit_dice: "2d6",
      speed: { walk: 30 },
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8,
      senses: "darkvision 60 ft., passive Perception 9",
      languages: "Common, Goblin",
      challenge_rating: "1/4",
      cr: 0.25,
    };
    const result = MonsterSchema.safeParse(goblin);
    expect(result.success).toBe(true);
  });
});

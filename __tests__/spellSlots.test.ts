import { describe, it, expect } from "vitest";
import { getSpellSlots, cantripsKnown, spellsKnown, isSpellcaster } from "@/lib/spellSlots";

describe("getSpellSlots — full casters", () => {
  it("bard L1 has 2 first-level slots", () => {
    const info = getSpellSlots("bard", 1);
    expect(info.type).toBe("full");
    expect(info.slots[0]).toBe(2);
    expect(info.slots[1]).toBe(0);
  });

  it("wizard L3 has 4/2 slots", () => {
    const info = getSpellSlots("wizard", 3);
    expect(info.slots[0]).toBe(4);
    expect(info.slots[1]).toBe(2);
    expect(info.slots[2]).toBe(0);
  });

  it("cleric L17 has 9th-level slot", () => {
    const info = getSpellSlots("cleric", 17);
    expect(info.slots[8]).toBe(1);
  });

  it("sorcerer L20 has correct slot distribution", () => {
    const info = getSpellSlots("sorcerer", 20);
    expect(info.slots[0]).toBe(4);
    expect(info.slots[5]).toBe(2);
    expect(info.slots[8]).toBe(1);
  });
});

describe("getSpellSlots — half casters", () => {
  it("paladin L1 has no spell slots", () => {
    const info = getSpellSlots("paladin", 1);
    expect(info.type).toBe("half");
    expect(info.slots[0]).toBe(0);
  });

  it("ranger L2 has 2 first-level slots", () => {
    const info = getSpellSlots("ranger", 2);
    expect(info.slots[0]).toBe(2);
  });

  it("paladin L5 has 4/2 slots", () => {
    const info = getSpellSlots("paladin", 5);
    expect(info.slots[0]).toBe(4);
    expect(info.slots[1]).toBe(2);
  });
});

describe("getSpellSlots — warlock", () => {
  it("warlock L1 has 1 slot at level 1", () => {
    const info = getSpellSlots("warlock", 1);
    expect(info.type).toBe("warlock");
    expect(info.warlockSlotLevel).toBe(1);
    expect(info.slots[0]).toBe(1);
  });

  it("warlock L5 has 2 slots at level 3", () => {
    const info = getSpellSlots("warlock", 5);
    expect(info.warlockSlotLevel).toBe(3);
    expect(info.slots[2]).toBe(2);
  });

  it("warlock L20 has 4 slots at level 5", () => {
    const info = getSpellSlots("warlock", 20);
    expect(info.warlockSlotLevel).toBe(5);
    expect(info.slots[4]).toBe(4);
  });
});

describe("getSpellSlots — non-casters", () => {
  it("fighter returns none", () => {
    const info = getSpellSlots("fighter", 5);
    expect(info.type).toBe("none");
    expect(info.slots).toEqual([]);
  });

  it("barbarian returns none", () => {
    const info = getSpellSlots("barbarian", 10);
    expect(info.type).toBe("none");
  });
});

describe("isSpellcaster", () => {
  it("bard is a spellcaster", () => expect(isSpellcaster("bard")).toBe(true));
  it("paladin is a spellcaster", () => expect(isSpellcaster("paladin")).toBe(true));
  it("warlock is a spellcaster", () => expect(isSpellcaster("warlock")).toBe(true));
  it("fighter is not a spellcaster", () => expect(isSpellcaster("fighter")).toBe(false));
  it("barbarian is not a spellcaster", () => expect(isSpellcaster("barbarian")).toBe(false));
});

describe("cantripsKnown", () => {
  it("bard L1 knows 2 cantrips", () => expect(cantripsKnown("bard", 1)).toBe(2));
  it("sorcerer L1 knows 4 cantrips", () => expect(cantripsKnown("sorcerer", 1)).toBe(4));
  it("wizard L4 knows 4 cantrips", () => expect(cantripsKnown("wizard", 4)).toBe(4));
  it("fighter L10 knows 0 cantrips", () => expect(cantripsKnown("fighter", 10)).toBe(0));
});

describe("spellsKnown", () => {
  it("bard L1 knows 4 spells", () => expect(spellsKnown("bard", 1)).toBe(4));
  it("warlock L1 knows 2 spells", () => expect(spellsKnown("warlock", 1)).toBe(2));
  it("wizard returns null (prepared caster)", () => expect(spellsKnown("wizard", 5)).toBeNull());
  it("cleric returns null (prepared caster)", () => expect(spellsKnown("cleric", 5)).toBeNull());
  it("fighter returns null (non-caster)", () => expect(spellsKnown("fighter", 5)).toBeNull());
});

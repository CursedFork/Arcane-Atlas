/**
 * CSV bulk import for homebrew content.
 *
 * Supports: spells, magic items, feats, subclasses, monsters, weapons,
 *           races (simplified flat format), backgrounds (simplified flat format).
 *
 * Column names are matched case-insensitively and with common aliases
 * so users aren't locked into an exact header string.
 *
 * Multi-value fields (traits, equipment lists, etc.) use the pipe "|" separator
 * within a quoted cell.  e.g.  "Darkvision: 60 ft.|Fey Ancestry: You have advantage..."
 *
 * Races and backgrounds have nested schemas; this file handles the CSV↔schema
 * flattening/unflattening so callers don't need to worry about it.
 */

import { slugify } from "./utils";
import {
  HomebrewSpellSchema,
  HomebrewItemSchema,
  HomebrewFeatSchema,
  HomebrewSubclassSchema,
  HomebrewMonsterSchema,
  HomebrewWeaponSchema,
  HomebrewRaceSchema,
  HomebrewBackgroundSchema,
  type HomebrewSpell,
  type HomebrewItem,
  type HomebrewFeat,
  type HomebrewSubclass,
  type HomebrewMonster,
  type HomebrewWeapon,
  type HomebrewRace,
  type HomebrewBackground,
} from "./schemas/homebrew";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles quoted fields (including embedded commas and escaped double-quotes).

/**
 * RFC-4180 streaming CSV parser.
 * Handles quoted fields that contain embedded commas, newlines, and escaped
 * double-quotes ("") correctly — the previous line-split approach broke any
 * field whose value spanned multiple lines (e.g. spell descriptions).
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } // escaped ""
        else { inQuotes = false; }
      } else {
        cell += ch; // embedded newlines preserved inside quotes
      }
    } else {
      if      (ch === '"')  { inQuotes = true; }
      else if (ch === ',')  { row.push(cell.trim()); cell = ""; }
      else if (ch === '\n') {
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = []; cell = "";
      } else { cell += ch; }
    }
  }
  // flush final cell / row
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

// ── Header normalisation ──────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function makeHeaderMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set(normalise(h), i));
  return map;
}

function col(row: string[], headers: Map<string, number>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const idx = headers.get(normalise(alias));
    if (idx !== undefined) return row[idx]?.trim() ?? "";
  }
  return "";
}

function colInt(
  row: string[],
  headers: Map<string, number>,
  fallback: number,
  ...aliases: string[]
): number {
  const v = col(row, headers, ...aliases);
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

/** Split a pipe-separated field into a trimmed string array, dropping empties. */
function splitPipe(value: string): string[] {
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split a comma-separated field into a trimmed string array (for multi-value cells). */
function splitComma(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Import result type ────────────────────────────────────────────────────────

export interface ImportResult<T> {
  ok: T[];
  errors: { row: number; name: string; message: string }[];
}

// ── Spell import ──────────────────────────────────────────────────────────────
// Required: Name
// Optional: Level (0–9 or "Cantrip"), School, Casting Time, Range, Components,
//           Duration, Concentration (yes/no), Ritual (yes/no), Classes,
//           Description, At Higher Levels

export function importSpellsFromCSV(text: string): ImportResult<HomebrewSpell> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewSpell[] = [];
  const errors: ImportResult<HomebrewSpell>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "spell name");
    if (!name) return;

    const levelStr = col(row, h, "level", "spell level", "lvl");
    const levelInt =
      levelStr.toLowerCase() === "cantrip" ? 0 : parseInt(levelStr, 10) || 0;
    const level = levelInt === 0 ? "Cantrip" : String(levelInt);
    const concentration =
      col(row, h, "concentration", "conc") === "yes" ? ("yes" as const) : ("no" as const);
    const ritual =
      col(row, h, "ritual") === "yes" ? ("yes" as const) : ("no" as const);

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      desc: col(row, h, "description", "desc", "text", "effect") || "—",
      higher_level: col(row, h, "at higher levels", "higher levels", "upcast"),
      range: col(row, h, "range") || "—",
      components: col(row, h, "components", "component") || "—",
      material: col(row, h, "material", "materials") || "",
      ritual,
      duration: col(row, h, "duration") || "Instantaneous",
      concentration,
      casting_time:
        col(row, h, "casting time", "castingtime", "cast time") || "1 action",
      level,
      level_int: levelInt,
      school: col(row, h, "school", "magic school") || "Evocation",
      dnd_class: col(row, h, "classes", "class", "dnd class", "available to"),
      isHomebrew: true as const,
    };

    const result = HomebrewSpellSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Item import ───────────────────────────────────────────────────────────────
// Required: Name
// Optional: Type, Rarity, Requires Attunement, Description

export function importItemsFromCSV(text: string): ImportResult<HomebrewItem> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewItem[] = [];
  const errors: ImportResult<HomebrewItem>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "item name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      type: col(row, h, "type", "item type", "category") || "Wondrous Item",
      rarity: col(row, h, "rarity") || "Uncommon",
      requires_attunement: col(
        row,
        h,
        "requires attunement",
        "attunement",
        "attuned"
      ),
      desc: col(row, h, "description", "desc", "text") || "—",
      isHomebrew: true as const,
    };

    const result = HomebrewItemSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Feat import ───────────────────────────────────────────────────────────────
// Required: Name
// Optional: Prerequisite, Description

export function importFeatsFromCSV(text: string): ImportResult<HomebrewFeat> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewFeat[] = [];
  const errors: ImportResult<HomebrewFeat>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "feat name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      prerequisite: col(row, h, "prerequisite", "prereq", "requirement", "requires"),
      desc:
        col(row, h, "description", "desc", "text", "benefit") || "—",
      isHomebrew: true as const,
    };

    const result = HomebrewFeatSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Subclass import ───────────────────────────────────────────────────────────
// Required: Name, Class
// Optional: Description, Features (free-form text block), Source
//
// Features tip: write one feature per line in the cell, e.g.:
//   "Level 3: Bonus Proficiency. You gain proficiency in…
//    Level 7: Extra Attack. …"

export function importSubclassesFromCSV(text: string): ImportResult<HomebrewSubclass> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewSubclass[] = [];
  const errors: ImportResult<HomebrewSubclass>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "subclass name", "archetype name", "archetype");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      className: col(
        row,
        h,
        "class",
        "class name",
        "parent class",
        "for class",
        "base class"
      ) || "Unknown",
      desc: col(row, h, "description", "desc", "overview", "text") || "",
      features: col(
        row,
        h,
        "features",
        "class features",
        "subclass features",
        "abilities",
        "feature list"
      ) || "",
      source: col(row, h, "source", "sourcebook", "book", "from") || "",
      isHomebrew: true as const,
    };

    const result = HomebrewSubclassSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Monster import ────────────────────────────────────────────────────────────
// Required: Name, AC, HP, CR
// Optional: Size, Type, Alignment, Speed, STR/DEX/CON/INT/WIS/CHA,
//           Special Abilities, Actions, Description, Source
//
// AC and HP accept strings ("15 (natural armor)", "78 (12d8 + 24)").
// Stats (STR etc.) must be integers 1–30.

export function importMonstersFromCSV(text: string): ImportResult<HomebrewMonster> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewMonster[] = [];
  const errors: ImportResult<HomebrewMonster>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "monster name", "creature name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      size: col(row, h, "size") || "Medium",
      type: col(row, h, "type", "creature type", "monster type") || "Humanoid",
      alignment: col(row, h, "alignment") || "Unaligned",
      ac: col(row, h, "ac", "armor class", "armour class") || "10",
      hp: col(row, h, "hp", "hit points", "hitpoints", "hit dice") || "10",
      speed: col(row, h, "speed", "movement", "movement speed") || "30 ft.",
      str: colInt(row, h, 10, "str", "strength"),
      dex: colInt(row, h, 10, "dex", "dexterity"),
      con: colInt(row, h, 10, "con", "constitution"),
      int: colInt(row, h, 10, "int", "intelligence"),
      wis: colInt(row, h, 10, "wis", "wisdom"),
      cha: colInt(row, h, 10, "cha", "charisma"),
      cr: col(row, h, "cr", "challenge rating", "challenge") || "0",
      special_abilities: col(
        row,
        h,
        "special abilities",
        "specialabilities",
        "traits",
        "special traits",
        "abilities"
      ) || "",
      actions: col(row, h, "actions", "combat actions") || "",
      desc: col(row, h, "description", "desc", "notes", "lore") || "",
      source: col(row, h, "source", "sourcebook", "book", "from") || "",
      isHomebrew: true as const,
    };

    const result = HomebrewMonsterSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Weapon import ─────────────────────────────────────────────────────────────
// Required: Name
// Optional: Category, Damage, Damage Type, Properties, Weight, Cost, Description
//
// Category examples: Simple Melee, Simple Ranged, Martial Melee, Martial Ranged

export function importWeaponsFromCSV(text: string): ImportResult<HomebrewWeapon> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewWeapon[] = [];
  const errors: ImportResult<HomebrewWeapon>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "weapon name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      category: col(
        row,
        h,
        "category",
        "weapon category",
        "type",
        "weapon type",
        "classification"
      ) || "Martial Melee",
      damage: col(row, h, "damage", "damage dice", "dice") || "1d6",
      damage_type: col(
        row,
        h,
        "damage type",
        "damagetype",
        "dmg type",
        "type of damage"
      ) || "slashing",
      properties: col(row, h, "properties", "weapon properties", "traits") || "",
      weight: col(row, h, "weight", "wt") || "",
      cost: col(row, h, "cost", "price", "gp", "value") || "",
      desc: col(row, h, "description", "desc", "notes", "special") || "",
      isHomebrew: true as const,
    };

    const result = HomebrewWeaponSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Race import (simplified flat CSV) ─────────────────────────────────────────
// Required: Name, Size (Tiny/Small/Medium/Large/Huge/Gargantuan), Speed
// Optional: STR/DEX/CON/INT/WIS/CHA bonus columns (integers),
//           Traits ("Name: Desc|Name: Desc" pipe-separated),
//           Languages (comma-separated), Subraces (pipe-separated)
//
// The full HomebrewRace schema accepts traits as [{name, desc}] objects.
// This importer parses the flat CSV fields into that nested structure.

function parseTraits(traitsStr: string): { name: string; desc: string }[] {
  return splitPipe(traitsStr).map((t) => {
    const colonIdx = t.indexOf(":");
    if (colonIdx === -1) return { name: t, desc: "" };
    return {
      name: t.slice(0, colonIdx).trim(),
      desc: t.slice(colonIdx + 1).trim(),
    };
  });
}

const VALID_SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"] as const;

export function importRacesFromCSV(text: string): ImportResult<HomebrewRace> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewRace[] = [];
  const errors: ImportResult<HomebrewRace>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "race name");
    if (!name) return;

    const rawSize = col(row, h, "size");
    const size = VALID_SIZES.find(
      (s) => s.toLowerCase() === rawSize.toLowerCase()
    ) ?? "Medium";

    const traitsRaw = col(row, h, "traits", "racial traits", "features", "abilities");
    const languagesRaw = col(row, h, "languages", "language");
    const subracesRaw = col(row, h, "subraces", "subrace", "variants");

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      size,
      speed: colInt(row, h, 30, "speed", "movement speed", "base speed"),
      abilityScoreIncrease: {
        strength: colInt(row, h, 0, "str bonus", "strbonus", "str", "strength bonus"),
        dexterity: colInt(row, h, 0, "dex bonus", "dexbonus", "dex", "dexterity bonus"),
        constitution: colInt(row, h, 0, "con bonus", "conbonus", "con", "constitution bonus"),
        intelligence: colInt(row, h, 0, "int bonus", "intbonus", "int", "intelligence bonus"),
        wisdom: colInt(row, h, 0, "wis bonus", "wisbonus", "wis", "wisdom bonus"),
        charisma: colInt(row, h, 0, "cha bonus", "chabonus", "cha", "charisma bonus"),
      },
      traits: parseTraits(traitsRaw),
      languages: languagesRaw ? splitComma(languagesRaw) : ["Common"],
      subraces: subracesRaw ? splitPipe(subracesRaw) : [],
      isHomebrew: true as const,
    };

    const result = HomebrewRaceSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── Background import (simplified flat CSV) ───────────────────────────────────
// Required: Name, Feature Name, Feature Description
// Optional: Skill Proficiencies (comma-sep), Tool Proficiencies (comma-sep),
//           Language Count (integer), Equipment (pipe-sep)

export function importBackgroundsFromCSV(text: string): ImportResult<HomebrewBackground> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow)
    return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewBackground[] = [];
  const errors: ImportResult<HomebrewBackground>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "background name");
    if (!name) return;

    const skillsRaw = col(
      row,
      h,
      "skill proficiencies",
      "skillproficiencies",
      "skills",
      "skill profs"
    );
    const toolsRaw = col(
      row,
      h,
      "tool proficiencies",
      "toolproficiencies",
      "tools",
      "tool profs"
    );
    const equipmentRaw = col(row, h, "equipment", "starting equipment", "gear");
    const featureName = col(
      row,
      h,
      "feature name",
      "featurename",
      "background feature",
      "feature"
    );
    const featureDesc = col(
      row,
      h,
      "feature description",
      "featuredescription",
      "feature desc",
      "feature text"
    );

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      skillProficiencies: skillsRaw ? splitComma(skillsRaw) : [],
      toolProficiencies: toolsRaw ? splitComma(toolsRaw) : [],
      languages: colInt(row, h, 0, "language count", "languages", "language count"),
      equipment: equipmentRaw ? splitPipe(equipmentRaw) : [],
      feature: {
        name: featureName || name,
        desc: featureDesc || "—",
      },
      isHomebrew: true as const,
    };

    const result = HomebrewBackgroundSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      errors.push({
        row: rowNum,
        name,
        message: result.error.errors.map((e) => e.message).join("; "),
      });
    }
  });

  return { ok, errors };
}

// ── CSV template generators ───────────────────────────────────────────────────
// Returns a CSV string users can download, fill in, and re-upload.
// Example rows use fictional/generic content only — no copyrighted material.

export function spellTemplate(): string {
  const header =
    "Name,Level,School,Casting Time,Range,Components,Duration,Concentration,Ritual,Classes,Description,At Higher Levels";
  const example =
    '"Arcane Bolt",1,"Evocation","1 action","60 feet","V, S","Instantaneous","no","no","Wizard, Sorcerer","You hurl a bolt of pure arcane energy at a creature. Make a ranged spell attack against the target. On a hit, the target takes 2d10 force damage.","When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st."';
  return `${header}\n${example}\n`;
}

export function itemTemplate(): string {
  const header = "Name,Type,Rarity,Requires Attunement,Description";
  const example =
    '"Cloak of the Wanderer","Wondrous Item","Uncommon","requires attunement","While wearing this cloak you can move through nonmagical difficult terrain without expending extra movement."';
  return `${header}\n${example}\n`;
}

export function featTemplate(): string {
  const header = "Name,Prerequisite,Description";
  const example =
    '"Arcane Duelist","The ability to cast at least one spell","You have learned to weave arcane magic into your melee strikes. You can use your spellcasting ability modifier instead of Strength for attack and damage rolls with one-handed weapons."';
  return `${header}\n${example}\n`;
}

export function subclassTemplate(): string {
  const header = "Name,Class,Description,Features,Source";
  const example =
    '"Iron Pact Warrior","Fighter","A fighter who has forged a mystical bond with an iron construct.","Level 3: Iron Companion. You summon a Small iron construct that obeys your commands. It uses your proficiency bonus for its attacks.\nLevel 7: Iron Resilience. Your iron companion grants you resistance to one damage type of your choice at the start of each day.\nLevel 10: Synchronized Strike. When you take the Attack action, your iron companion can use its reaction to make one attack.\nLevel 15: Iron Fortress. Your iron companion can shield you, granting you half cover while it is within 5 feet of you.\nLevel 18: Living Metal. Your iron companion becomes a permanent part of you, granting its benefits even when destroyed until your next long rest.","Homebrew"';
  return `${header}\n${example}\n`;
}

export function monsterTemplate(): string {
  const header =
    "Name,Size,Type,Alignment,AC,HP,Speed,STR,DEX,CON,INT,WIS,CHA,CR,Special Abilities,Actions,Source";
  const example =
    '"Emberveil Sprite","Small","Fey","Chaotic Neutral","13","27 (6d6 + 6)","30 ft., fly 40 ft.",8,16,13,12,14,15,"1","Flicker (Recharge 5–6). The sprite magically becomes invisible until it attacks or until its concentration ends (as if concentrating on a spell).","Ember Touch. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) fire damage.\nShort Bow. Ranged Weapon Attack: +5 to hit, range 40/160 ft., one target. Hit: 5 (1d4 + 3) piercing damage plus 2 (1d4) fire damage.","Homebrew"';
  return `${header}\n${example}\n`;
}

export function weaponTemplate(): string {
  const header =
    "Name,Category,Damage,Damage Type,Properties,Weight,Cost,Description";
  const example =
    '"Void Cleaver","Martial Melee","2d6","slashing","Heavy, Two-Handed","12 lb.","special","A greatsword forged from void-iron. Attacks with this weapon ignore resistance to slashing damage."';
  return `${header}\n${example}\n`;
}

export function raceTemplate(): string {
  const header =
    "Name,Size,Speed,STR Bonus,DEX Bonus,CON Bonus,INT Bonus,WIS Bonus,CHA Bonus,Traits,Languages,Subraces";
  const example =
    '"Crystalfolk","Medium",30,0,0,1,2,0,0,"Crystalline Resilience: You have resistance to radiant damage.|Stone Sense: You have tremorsense to a range of 10 feet, allowing you to detect vibrations in the ground.|Natural Armor: Your AC equals 13 + your Dexterity modifier when you are not wearing armor.","Common, Terran","Amethyst Crystalfolk|Ruby Crystalfolk|Sapphire Crystalfolk"';
  return `${header}\n${example}\n`;
}

export function backgroundTemplate(): string {
  const header =
    "Name,Skill Proficiencies,Tool Proficiencies,Language Count,Equipment,Feature Name,Feature Description";
  const example =
    '"Runecutter","Arcana, History","Calligrapher\'s Supplies",1,"Calligrapher\'s supplies|a runic codex|common clothes|15 gp","Rune Network","You can identify and roughly date any rune or magical inscription you encounter. You also have contacts among runic scholars who may share lore with you."';
  return `${header}\n${example}\n`;
}

// ── Download helper ───────────────────────────────────────────────────────────

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

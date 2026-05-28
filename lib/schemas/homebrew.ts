import { z } from "zod";

const MAX_STR = 200;
const MAX_DESC = 5000;

// ── Homebrew Spell ─────────────────────────────────────────────────────────────
export const HomebrewSpellSchema = z
  .object({
    slug: z.string().max(MAX_STR),
    name: z.string().min(1).max(MAX_STR),
    desc: z.string().min(1).max(MAX_DESC),
    higher_level: z.string().max(MAX_DESC).default(""),
    range: z.string().max(MAX_STR),
    components: z.string().max(MAX_STR),
    material: z.string().max(MAX_STR).default(""),
    ritual: z.enum(["yes", "no"]),
    duration: z.string().max(MAX_STR),
    concentration: z.enum(["yes", "no"]),
    casting_time: z.string().max(MAX_STR),
    level: z.string().max(MAX_STR),
    level_int: z.number().int().min(0).max(9),
    school: z.string().max(MAX_STR),
    dnd_class: z.string().max(MAX_STR),
    isHomebrew: z.literal(true).default(true),
  })
  .strip();

export type HomebrewSpell = z.infer<typeof HomebrewSpellSchema>;

// ── Homebrew Race ──────────────────────────────────────────────────────────────
const TraitSchema = z.object({
  name: z.string().max(MAX_STR),
  desc: z.string().max(MAX_DESC),
});

export const HomebrewRaceSchema = z
  .object({
    slug: z.string().max(MAX_STR),
    name: z.string().min(1).max(MAX_STR),
    size: z.enum(["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]),
    speed: z.number().int().min(0).max(120),
    abilityScoreIncrease: z
      .object({
        strength: z.number().int().min(0).max(4).default(0),
        dexterity: z.number().int().min(0).max(4).default(0),
        constitution: z.number().int().min(0).max(4).default(0),
        intelligence: z.number().int().min(0).max(4).default(0),
        wisdom: z.number().int().min(0).max(4).default(0),
        charisma: z.number().int().min(0).max(4).default(0),
      })
      .strip(),
    traits: z.array(TraitSchema).max(20),
    languages: z.array(z.string().max(MAX_STR)).max(10),
    subraces: z.array(z.string().max(MAX_STR)).max(10).default([]),
    isHomebrew: z.literal(true).default(true),
  })
  .strip();

export type HomebrewRace = z.infer<typeof HomebrewRaceSchema>;

// ── Homebrew Item ──────────────────────────────────────────────────────────────
export const HomebrewItemSchema = z
  .object({
    slug: z.string().max(MAX_STR),
    name: z.string().min(1).max(MAX_STR),
    type: z.string().max(MAX_STR),
    rarity: z.string().max(MAX_STR),
    requires_attunement: z.string().max(MAX_STR).default(""),
    desc: z.string().min(1).max(MAX_DESC),
    isHomebrew: z.literal(true).default(true),
  })
  .strip();

export type HomebrewItem = z.infer<typeof HomebrewItemSchema>;

// ── Homebrew Background ────────────────────────────────────────────────────────
export const HomebrewBackgroundSchema = z
  .object({
    slug: z.string().max(MAX_STR),
    name: z.string().min(1).max(MAX_STR),
    skillProficiencies: z.array(z.string().max(MAX_STR)).max(6),
    toolProficiencies: z.array(z.string().max(MAX_STR)).max(6).default([]),
    languages: z.number().int().min(0).max(4).default(0),
    equipment: z.array(z.string().max(MAX_STR)).max(20),
    feature: z
      .object({
        name: z.string().max(MAX_STR),
        desc: z.string().max(MAX_DESC),
      })
      .strip(),
    isHomebrew: z.literal(true).default(true),
  })
  .strip();

export type HomebrewBackground = z.infer<typeof HomebrewBackgroundSchema>;

// ── Homebrew Feat ──────────────────────────────────────────────────────────────
export const HomebrewFeatSchema = z
  .object({
    slug: z.string().max(MAX_STR),
    name: z.string().min(1).max(MAX_STR),
    prerequisite: z.string().max(MAX_STR).default(""),
    desc: z.string().min(1).max(MAX_DESC),
    isHomebrew: z.literal(true).default(true),
  })
  .strip();

export type HomebrewFeat = z.infer<typeof HomebrewFeatSchema>;

// ── Full Homebrew Collection ───────────────────────────────────────────────────
export const HomebrewCollectionSchema = z
  .object({
    spells: z.array(HomebrewSpellSchema).max(500).default([]),
    races: z.array(HomebrewRaceSchema).max(100).default([]),
    items: z.array(HomebrewItemSchema).max(500).default([]),
    backgrounds: z.array(HomebrewBackgroundSchema).max(100).default([]),
    feats: z.array(HomebrewFeatSchema).max(200).default([]),
  })
  .strip();

export type HomebrewCollection = z.infer<typeof HomebrewCollectionSchema>;

export function validateHomebrewImport(
  data: unknown,
  type: "spell"
): { success: true; data: HomebrewSpell } | { success: false; errors: string[] };
export function validateHomebrewImport(
  data: unknown,
  type: "race"
): { success: true; data: HomebrewRace } | { success: false; errors: string[] };
export function validateHomebrewImport(
  data: unknown,
  type: "item"
): { success: true; data: HomebrewItem } | { success: false; errors: string[] };
export function validateHomebrewImport(
  data: unknown,
  type: "background"
): { success: true; data: HomebrewBackground } | { success: false; errors: string[] };
export function validateHomebrewImport(
  data: unknown,
  type: "feat"
): { success: true; data: HomebrewFeat } | { success: false; errors: string[] };
export function validateHomebrewImport(
  data: unknown,
  type: "spell" | "race" | "item" | "background" | "feat"
):
  | { success: true; data: HomebrewSpell | HomebrewRace | HomebrewItem | HomebrewBackground | HomebrewFeat }
  | { success: false; errors: string[] } {
  const schemaMap = {
    spell: HomebrewSpellSchema,
    race: HomebrewRaceSchema,
    item: HomebrewItemSchema,
    background: HomebrewBackgroundSchema,
    feat: HomebrewFeatSchema,
  };
  const schema = schemaMap[type];
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return { success: false, errors };
}

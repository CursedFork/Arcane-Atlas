import { z } from "zod";

const MAX_STRING = 100;
const MAX_BACKSTORY = 10000;
const MAX_LONG_STRING = 2000;
const MAX_ARRAY = 200;

export const AbilityScoresSchema = z.object({
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
});

export type AbilityScores = z.infer<typeof AbilityScoresSchema>;

export const ABILITY_KEYS = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

export type AbilityKey = (typeof ABILITY_KEYS)[number];

const EquipmentItemSchema = z.object({
  id: z.string().max(MAX_STRING),
  name: z.string().max(MAX_STRING),
  quantity: z.number().int().min(0).max(9999),
  weight: z.number().min(0).max(9999).optional(),
  isHomebrew: z.boolean().default(false),
});

export type EquipmentItem = z.infer<typeof EquipmentItemSchema>;

export const CharacterSchema = z
  .object({
    id: z.string().uuid(),
    version: z.literal(1),
    name: z.string().min(1).max(MAX_STRING),
    level: z.number().int().min(1).max(20),
    race: z.string().max(MAX_STRING),
    subrace: z.string().max(MAX_STRING).optional(),
    classSlug: z.string().max(MAX_STRING),
    subclass: z.string().max(MAX_STRING).optional(),
    background: z.string().max(MAX_STRING),
    alignment: z.string().max(MAX_STRING),
    abilityScoreMethod: z.enum(["standard", "pointbuy", "manual"]),
    baseAbilityScores: AbilityScoresSchema,
    racialAbilityBoosts: AbilityScoresSchema.partial(),
    finalAbilityScores: AbilityScoresSchema,
    skillProficiencies: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    toolProficiencies: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    languages: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    savingThrowProficiencies: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    equipment: z.array(EquipmentItemSchema).max(MAX_ARRAY),
    spells: z.object({
      cantrips: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
      prepared: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
      known: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    }),
    hp: z.object({
      max: z.number().int().min(1).max(9999),
      current: z.number().int().min(-9999).max(9999),
      temp: z.number().int().min(0).max(9999),
    }),
    details: z.object({
      appearance: z.string().max(MAX_LONG_STRING),
      backstory: z.string().max(MAX_BACKSTORY),
      bonds: z.string().max(MAX_LONG_STRING),
      ideals: z.string().max(MAX_LONG_STRING),
      flaws: z.string().max(MAX_LONG_STRING),
      notes: z.string().max(MAX_BACKSTORY),
    }),
    homebrewIds: z.object({
      spellSlugs: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
      raceSlugs: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
      classSlugs: z.array(z.string().max(MAX_STRING)).max(MAX_ARRAY),
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strip();

export type Character = z.infer<typeof CharacterSchema>;

export const CharacterImportSchema = CharacterSchema.extend({
  version: z.literal(1),
});

export function validateCharacterImport(data: unknown):
  | { success: true; character: Character }
  | { success: false; errors: string[] } {
  const result = CharacterImportSchema.safeParse(data);
  if (result.success) {
    return { success: true, character: result.data };
  }
  const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return { success: false, errors };
}

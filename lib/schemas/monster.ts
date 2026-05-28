import { z } from "zod";

const ActionSchema = z
  .object({
    name: z.string(),
    desc: z.string(),
    attack_bonus: z.number().optional(),
    damage_dice: z.string().optional(),
    damage_bonus: z.number().optional(),
  })
  .strip();

const SpecialAbilitySchema = z
  .object({
    name: z.string(),
    desc: z.string(),
  })
  .strip();

export const MonsterSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    size: z.string(),
    type: z.string(),
    subtype: z.string().optional().default(""),
    alignment: z.string(),
    armor_class: z.number(),
    armor_desc: z.string().optional().default(""),
    hit_points: z.number(),
    hit_dice: z.string(),
    speed: z.record(z.string(), z.number()),
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
    strength_save: z.number().nullable().optional(),
    dexterity_save: z.number().nullable().optional(),
    constitution_save: z.number().nullable().optional(),
    intelligence_save: z.number().nullable().optional(),
    wisdom_save: z.number().nullable().optional(),
    charisma_save: z.number().nullable().optional(),
    skills: z.record(z.string(), z.number()).optional().default({}),
    damage_vulnerabilities: z.string().optional().default(""),
    damage_resistances: z.string().optional().default(""),
    damage_immunities: z.string().optional().default(""),
    condition_immunities: z.string().optional().default(""),
    senses: z.string(),
    languages: z.string(),
    challenge_rating: z.string(),
    cr: z.number(),
    actions: z.array(ActionSchema).optional().default([]),
    special_abilities: z.array(SpecialAbilitySchema).optional().default([]),
    legendary_actions: z.array(ActionSchema).nullable().optional(),
    img_main: z.string().nullable().optional(),
    document__slug: z.string().optional(),
  })
  .strip();

export type Monster = z.infer<typeof MonsterSchema>;
export type MonsterAction = z.infer<typeof ActionSchema>;

export const MonstersArraySchema = z.array(MonsterSchema);

export function parseCR(cr: string): number {
  if (cr === "1/8") return 0.125;
  if (cr === "1/4") return 0.25;
  if (cr === "1/2") return 0.5;
  const n = parseFloat(cr);
  return isNaN(n) ? 0 : n;
}

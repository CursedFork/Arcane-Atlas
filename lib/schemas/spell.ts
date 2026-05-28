import { z } from "zod";

export const SpellSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    desc: z.string(),
    higher_level: z.string().optional().default(""),
    range: z.string(),
    components: z.string(),
    material: z.string().optional().default(""),
    ritual: z.string(),
    duration: z.string(),
    concentration: z.string(),
    casting_time: z.string(),
    level: z.string(),
    level_int: z.number().int().min(0).max(9),
    school: z.string(),
    dnd_class: z.string(),
    archetype: z.string().optional().default(""),
    circles: z.string().optional().default(""),
    document__slug: z.string().optional(),
    isHomebrew: z.boolean().optional().default(false),
  })
  .strip();

export type Spell = z.infer<typeof SpellSchema>;

export const SpellsArraySchema = z.array(SpellSchema);

export function isConcentration(spell: Spell): boolean {
  return spell.concentration.toLowerCase() === "yes";
}

export function isRitual(spell: Spell): boolean {
  return spell.ritual.toLowerCase() === "yes";
}

export function spellClassList(spell: Spell): string[] {
  return spell.dnd_class
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

import { z } from "zod";

export const MagicItemSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    type: z.string(),
    rarity: z.string(),
    requires_attunement: z.string().optional().default(""),
    desc: z.string(),
    document__slug: z.string().optional(),
    isHomebrew: z.boolean().optional().default(false),
  })
  .strip();

export type MagicItem = z.infer<typeof MagicItemSchema>;

export const MagicItemsArraySchema = z.array(MagicItemSchema);

export const RARITY_ORDER = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
] as const;

export type Rarity = (typeof RARITY_ORDER)[number];

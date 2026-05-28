export interface RaceTrait {
  name: string;
  desc: string;
}

export interface SRDSubrace {
  name: string;
  slug: string;
  abilityScoreIncrease: Partial<Record<string, number>>;
  traits: RaceTrait[];
  desc: string;
}

export interface SRDRace {
  name: string;
  slug: string;
  size: string;
  speed: number;
  abilityScoreIncrease: Partial<Record<string, number>>;
  // For races like Half-Elf that get +1 to two of your choice
  flexibleAbilityBoosts?: { count: number; amount: number };
  traits: RaceTrait[];
  languages: string[];
  subraces: SRDSubrace[];
  desc: string;
}

export const SRD_RACES: SRDRace[] = [
  {
    name: "Dwarf",
    slug: "dwarf",
    size: "Medium",
    speed: 25,
    abilityScoreIncrease: { constitution: 2 },
    traits: [
      { name: "Darkvision", desc: "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light." },
      { name: "Dwarven Resilience", desc: "You have advantage on saving throws against poison, and you have resistance against poison damage." },
      { name: "Dwarven Combat Training", desc: "You have proficiency with the battleaxe, handaxe, light hammer, and warhammer." },
      { name: "Tool Proficiency", desc: "You gain proficiency with the artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools." },
      { name: "Stonecunning", desc: "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient and add double your proficiency bonus." },
    ],
    languages: ["Common", "Dwarvish"],
    subraces: [
      {
        name: "Hill Dwarf",
        slug: "hill-dwarf",
        abilityScoreIncrease: { wisdom: 1 },
        traits: [
          { name: "Dwarven Toughness", desc: "Your hit point maximum increases by 1, and it increases by 1 every time you gain a level." },
        ],
        desc: "As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.",
      },
      {
        name: "Mountain Dwarf",
        slug: "mountain-dwarf",
        abilityScoreIncrease: { strength: 2 },
        traits: [
          { name: "Dwarven Armor Training", desc: "You have proficiency with light and medium armor." },
        ],
        desc: "As a mountain dwarf, you're strong and hardy, accustomed to a difficult life in rugged terrain.",
      },
    ],
    desc: "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.",
  },
  {
    name: "Elf",
    slug: "elf",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { dexterity: 2 },
    traits: [
      { name: "Darkvision", desc: "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light." },
      { name: "Keen Senses", desc: "You have proficiency in the Perception skill." },
      { name: "Fey Ancestry", desc: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Trance", desc: "Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. After resting this way, you gain the same benefit that a human does from 8 hours of sleep." },
    ],
    languages: ["Common", "Elvish"],
    subraces: [
      {
        name: "High Elf",
        slug: "high-elf",
        abilityScoreIncrease: { intelligence: 1 },
        traits: [
          { name: "Elf Weapon Training", desc: "You have proficiency with the longsword, shortsword, shortbow, and longbow." },
          { name: "Cantrip", desc: "You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it." },
          { name: "Extra Language", desc: "You can speak, read, and write one extra language of your choice." },
        ],
        desc: "As a high elf, you have a keen mind and a mastery of at least the basics of magic.",
      },
      {
        name: "Wood Elf",
        slug: "wood-elf",
        abilityScoreIncrease: { wisdom: 1 },
        traits: [
          { name: "Elf Weapon Training", desc: "You have proficiency with the longsword, shortsword, shortbow, and longbow." },
          { name: "Fleet of Foot", desc: "Your base walking speed increases to 35 feet." },
          { name: "Mask of the Wild", desc: "You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena." },
        ],
        desc: "As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.",
      },
      {
        name: "Dark Elf (Drow)",
        slug: "dark-elf",
        abilityScoreIncrease: { charisma: 1 },
        traits: [
          { name: "Superior Darkvision", desc: "Your darkvision has a radius of 120 feet." },
          { name: "Sunlight Sensitivity", desc: "You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight." },
          { name: "Drow Magic", desc: "You know the dancing lights cantrip. At 3rd level, you can cast faerie fire once per day. At 5th level, you can also cast darkness once per day. Charisma is your spellcasting ability." },
          { name: "Drow Weapon Training", desc: "You have proficiency with rapiers, shortswords, and hand crossbows." },
        ],
        desc: "Banished long ago, drow have turned to evil and now serve the Spider Queen.",
      },
    ],
    desc: "Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.",
  },
  {
    name: "Halfling",
    slug: "halfling",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { dexterity: 2 },
    traits: [
      { name: "Lucky", desc: "When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name: "Brave", desc: "You have advantage on saving throws against being frightened." },
      { name: "Halfling Nimbleness", desc: "You can move through the space of any creature that is of a size larger than yours." },
    ],
    languages: ["Common", "Halfling"],
    subraces: [
      {
        name: "Lightfoot Halfling",
        slug: "lightfoot-halfling",
        abilityScoreIncrease: { charisma: 1 },
        traits: [
          { name: "Naturally Stealthy", desc: "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you." },
        ],
        desc: "As a lightfoot halfling, you can easily hide from notice, even using other people as cover.",
      },
      {
        name: "Stout Halfling",
        slug: "stout-halfling",
        abilityScoreIncrease: { constitution: 1 },
        traits: [
          { name: "Stout Resilience", desc: "You have advantage on saving throws against poison, and you have resistance against poison damage." },
        ],
        desc: "As a stout halfling, you're hardier than average.",
      },
    ],
    desc: "The comforts of home are the goals of most halflings' lives: a place to settle in peace and quiet, far from marauding monsters and clashing armies.",
  },
  {
    name: "Human",
    slug: "human",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: {
      strength: 1, dexterity: 1, constitution: 1,
      intelligence: 1, wisdom: 1, charisma: 1,
    },
    traits: [
      { name: "Extra Language", desc: "You can speak, read, and write one extra language of your choice." },
    ],
    languages: ["Common", "One language of your choice"],
    subraces: [],
    desc: "In the reckonings of most worlds, humans are the youngest of the common races, late to arrive on the world scene and short-lived in comparison to dwarves, elves, and dragons.",
  },
  {
    name: "Dragonborn",
    slug: "dragonborn",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    traits: [
      { name: "Draconic Ancestry", desc: "You have draconic ancestry of a particular type of dragon. Choose one type from the Draconic Ancestry table (Black, Blue, Brass, Bronze, Copper, Gold, Green, Red, Silver, White)." },
      { name: "Breath Weapon", desc: "You can use your action to exhale destructive energy. Your draconic ancestry determines size, shape, and damage type. Constitution save DC = 8 + your Constitution modifier + your proficiency bonus. Recharges on short or long rest." },
      { name: "Damage Resistance", desc: "You have resistance to the damage type associated with your draconic ancestry." },
    ],
    languages: ["Common", "Draconic"],
    subraces: [],
    desc: "Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension.",
  },
  {
    name: "Gnome",
    slug: "gnome",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { intelligence: 2 },
    traits: [
      { name: "Darkvision", desc: "Accustomed to life underground, you have superior vision in dark and dim conditions. 60-foot radius." },
      { name: "Gnome Cunning", desc: "You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic." },
    ],
    languages: ["Common", "Gnomish"],
    subraces: [
      {
        name: "Forest Gnome",
        slug: "forest-gnome",
        abilityScoreIncrease: { dexterity: 1 },
        traits: [
          { name: "Natural Illusionist", desc: "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it." },
          { name: "Speak with Small Beasts", desc: "Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts." },
        ],
        desc: "As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth.",
      },
      {
        name: "Rock Gnome",
        slug: "rock-gnome",
        abilityScoreIncrease: { constitution: 1 },
        traits: [
          { name: "Artificer's Lore", desc: "Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you add twice your proficiency bonus." },
          { name: "Tinker", desc: "You have proficiency with artisan's tools (tinker's tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device." },
        ],
        desc: "As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.",
      },
    ],
    desc: "A gnome's energy and enthusiasm for living shines through every inch of his or her tiny body.",
  },
  {
    name: "Half-Elf",
    slug: "half-elf",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { charisma: 2 },
    flexibleAbilityBoosts: { count: 2, amount: 1 },
    traits: [
      { name: "Darkvision", desc: "Thanks to your elf blood, you have superior vision in dark and dim conditions. 60-foot radius." },
      { name: "Fey Ancestry", desc: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Skill Versatility", desc: "You gain proficiency in two skills of your choice." },
    ],
    languages: ["Common", "Elvish", "One language of your choice"],
    subraces: [],
    desc: "Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents.",
  },
  {
    name: "Half-Orc",
    slug: "half-orc",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    traits: [
      { name: "Darkvision", desc: "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light." },
      { name: "Menacing", desc: "You gain proficiency in the Intimidation skill." },
      { name: "Relentless Endurance", desc: "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. Once per long rest." },
      { name: "Savage Attacks", desc: "When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit." },
    ],
    languages: ["Common", "Orc"],
    subraces: [],
    desc: "Whether united under the leadership of a mighty warlock or having fought to a standstill after years of conflict, half-orcs blend two heritages.",
  },
  {
    name: "Tiefling",
    slug: "tiefling",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { intelligence: 1, charisma: 2 },
    traits: [
      { name: "Darkvision", desc: "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light." },
      { name: "Hellish Resistance", desc: "You have resistance to fire damage." },
      { name: "Infernal Legacy", desc: "You know the thaumaturgy cantrip. At 3rd level, you can cast hellish rebuke as a 2nd-level spell once per long rest. At 5th level, you can also cast darkness once per long rest. Charisma is your spellcasting ability." },
    ],
    languages: ["Common", "Infernal"],
    subraces: [],
    desc: "To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.",
  },
];

export function getRace(slug: string): SRDRace | undefined {
  return SRD_RACES.find((r) => r.slug === slug);
}

export function getRaceAbilityIncrease(
  race: SRDRace,
  subrace?: SRDSubrace,
  flexibleChoices?: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(race.abilityScoreIncrease)) {
    if (val !== undefined) result[key] = val;
  }
  if (subrace) {
    for (const [key, val] of Object.entries(subrace.abilityScoreIncrease)) {
      result[key] = (result[key] ?? 0) + (val ?? 0);
    }
  }
  if (flexibleChoices) {
    for (const [key, val] of Object.entries(flexibleChoices)) {
      result[key] = (result[key] ?? 0) + (val ?? 0);
    }
  }
  return result;
}

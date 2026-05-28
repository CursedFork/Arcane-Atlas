export interface Condition {
  name: string;
  slug: string;
  icon: string;
  color: string;
  effects: string[];
}

export const CONDITIONS: Condition[] = [
  {
    name: "Blinded",
    slug: "blinded",
    icon: "eye-off",
    color: "slate",
    effects: [
      "A blinded creature can't see and automatically fails any ability check that requires sight.",
      "Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
    ],
  },
  {
    name: "Charmed",
    slug: "charmed",
    icon: "heart",
    color: "pink",
    effects: [
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
      "The charmer has advantage on any ability check to interact socially with the creature.",
    ],
  },
  {
    name: "Deafened",
    slug: "deafened",
    icon: "volume-x",
    color: "slate",
    effects: [
      "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    ],
  },
  {
    name: "Frightened",
    slug: "frightened",
    icon: "zap",
    color: "yellow",
    effects: [
      "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.",
      "The creature can't willingly move closer to the source of its fear.",
    ],
  },
  {
    name: "Grappled",
    slug: "grappled",
    icon: "link",
    color: "orange",
    effects: [
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
      "The condition ends if the grappler is incapacitated.",
      "The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect.",
    ],
  },
  {
    name: "Incapacitated",
    slug: "incapacitated",
    icon: "x-circle",
    color: "red",
    effects: [
      "An incapacitated creature can't take actions or reactions.",
    ],
  },
  {
    name: "Invisible",
    slug: "invisible",
    icon: "ghost",
    color: "gray",
    effects: [
      "An invisible creature is impossible to see without the aid of magic or a special sense.",
      "For the purpose of hiding, the creature is heavily obscured.",
      "The creature's location can be detected by any noise it makes or any tracks it leaves.",
      "Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
    ],
  },
  {
    name: "Paralyzed",
    slug: "paralyzed",
    icon: "pause-circle",
    color: "purple",
    effects: [
      "A paralyzed creature is incapacitated and can't move or speak.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
      "Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    ],
  },
  {
    name: "Petrified",
    slug: "petrified",
    icon: "mountain",
    color: "stone",
    effects: [
      "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone).",
      "Its weight increases by a factor of ten, and it ceases aging.",
      "The creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
      "Attack rolls against the creature have advantage.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "The creature has resistance to all damage.",
      "The creature is immune to poison and disease, though effects already affecting it are merely suspended.",
    ],
  },
  {
    name: "Poisoned",
    slug: "poisoned",
    icon: "droplets",
    color: "green",
    effects: [
      "A poisoned creature has disadvantage on attack rolls and ability checks.",
    ],
  },
  {
    name: "Prone",
    slug: "prone",
    icon: "arrow-down",
    color: "brown",
    effects: [
      "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.",
      "The creature has disadvantage on attack rolls.",
      "An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.",
    ],
  },
  {
    name: "Restrained",
    slug: "restrained",
    icon: "lock",
    color: "amber",
    effects: [
      "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
      "Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
      "The creature has disadvantage on Dexterity saving throws.",
    ],
  },
  {
    name: "Stunned",
    slug: "stunned",
    icon: "star",
    color: "yellow",
    effects: [
      "A stunned creature is incapacitated, can't move, and can speak only falteringly.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
    ],
  },
  {
    name: "Unconscious",
    slug: "unconscious",
    icon: "moon",
    color: "indigo",
    effects: [
      "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
      "The creature drops whatever it's holding and falls prone.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
      "Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    ],
  },
];

export const EXHAUSTION_LEVELS = [
  { level: 1, effect: "Disadvantage on ability checks" },
  { level: 2, effect: "Speed halved" },
  { level: 3, effect: "Disadvantage on attack rolls and saving throws" },
  { level: 4, effect: "Hit point maximum halved" },
  { level: 5, effect: "Speed reduced to 0" },
  { level: 6, effect: "Death" },
];

export const COMMON_ACTIONS = [
  {
    name: "Attack",
    desc: "When you take the Attack action, you make one attack with a weapon or unarmed strike.",
  },
  {
    name: "Cast a Spell",
    desc: "Spellcasters have access to spells and can use the Cast a Spell action to use them. The spell's casting time governs how this works.",
  },
  {
    name: "Dash",
    desc: "When you take the Dash action, you gain extra movement for the current turn. The increase equals your speed, after applying any modifiers.",
  },
  {
    name: "Disengage",
    desc: "If you take the Disengage action, your movement doesn't provoke opportunity attacks for the rest of the turn.",
  },
  {
    name: "Dodge",
    desc: "When you take the Dodge action, you focus entirely on avoiding attacks. Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage.",
  },
  {
    name: "Help",
    desc: "You can lend your aid to another creature in the completion of a task. The creature you aid gains advantage on the next ability check it makes to perform the task you are helping with, or advantage on its next attack roll against a creature within 5 feet of you.",
  },
  {
    name: "Hide",
    desc: "When you take the Hide action, you make a Dexterity (Stealth) check in an attempt to hide. If you succeed, you gain certain benefits, as described in 'Unseen Attackers and Targets.'",
  },
  {
    name: "Ready",
    desc: "Sometimes you want to get the jump on a foe or wait for a particular circumstance before you act. You designate a trigger condition and a reaction to take when that trigger occurs. If the trigger occurs before the start of your next turn, you use your reaction to perform the readied action.",
  },
  {
    name: "Search",
    desc: "When you take the Search action, you devote your attention to finding something. Depending on the nature of your search, the DM might have you make a Wisdom (Perception) check or an Intelligence (Investigation) check.",
  },
  {
    name: "Use an Object",
    desc: "You normally interact with an object while doing something else, such as drawing a sword as part of an attack. When an object requires your action for its use, you take the Use an Object action.",
  },
  {
    name: "Grapple",
    desc: "When you want to grab a creature or wrestle with it, you can use the Attack action to make a special melee attack — a grapple. If you're able to make multiple attacks with the Attack action, this attack replaces one of them. The target must be no more than one size larger than you and must be within your reach. Using at least one free hand, you try to seize the target by making a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check.",
  },
  {
    name: "Shove",
    desc: "Using the Attack action, you can make a special melee attack to shove a creature, either to knock it prone or push it away from you. The target must be no more than one size larger than you and must be within your reach. Make a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check. If you win the contest, you either knock the target prone or push it 5 feet away from you.",
  },
];

export function getCondition(slug: string): Condition | undefined {
  return CONDITIONS.find((c) => c.slug === slug);
}

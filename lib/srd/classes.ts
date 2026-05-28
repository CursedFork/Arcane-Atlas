export interface ClassFeature {
  level: number;
  name: string;
  desc: string;
}

export interface SRDSubclass {
  name: string;
  slug: string;
  desc: string;
}

export interface SRDClass {
  name: string;
  slug: string;
  hitDie: number;
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: { from: string[]; count: number };
  spellcastingAbility: string | null;
  subclassLevel: number;
  subclassTitle: string;
  isSpellcaster: boolean;
  subclasses: SRDSubclass[];
  startingEquipmentOptions: string[];
  level1Features: ClassFeature[];
}

export const SRD_CLASSES: SRDClass[] = [
  {
    name: "Barbarian",
    slug: "barbarian",
    hitDie: 12,
    primaryAbility: "Strength",
    savingThrows: ["Strength", "Constitution"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
      count: 2,
    },
    spellcastingAbility: null,
    subclassLevel: 3,
    subclassTitle: "Primal Path",
    isSpellcaster: false,
    subclasses: [
      { name: "Path of the Berserker", slug: "berserker", desc: "Berserkers channel rage into frenzied attacks, becoming whirlwinds of fury." },
      { name: "Path of the Totem Warrior", slug: "totem-warrior", desc: "Totem Warriors forge a spiritual connection to an animal totem." },
    ],
    startingEquipmentOptions: [
      "(a) a greataxe or (b) any martial melee weapon",
      "(a) two handaxes or (b) any simple weapon",
      "An explorer's pack, and four javelins",
    ],
    level1Features: [
      { level: 1, name: "Rage", desc: "In battle, you fight with primal ferocity. You can enter a rage as a bonus action." },
      { level: 1, name: "Unarmored Defense", desc: "While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier." },
    ],
  },
  {
    name: "Bard",
    slug: "bard",
    hitDie: 8,
    primaryAbility: "Charisma",
    savingThrows: ["Dexterity", "Charisma"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    toolProficiencies: ["Three musical instruments of your choice"],
    skillChoices: {
      from: [
        "Acrobatics","Animal Handling","Arcana","Athletics","Deception","History",
        "Insight","Intimidation","Investigation","Medicine","Nature","Perception",
        "Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival",
      ],
      count: 3,
    },
    spellcastingAbility: "charisma",
    subclassLevel: 3,
    subclassTitle: "Bard College",
    isSpellcaster: true,
    subclasses: [
      { name: "College of Lore", slug: "college-of-lore", desc: "Lore bards plumb every source of knowledge to fuel their magical music." },
      { name: "College of Valor", slug: "college-of-valor", desc: "Valor bards are daring skalds whose tales preserve the memory of great heroes." },
    ],
    startingEquipmentOptions: [
      "(a) a rapier, (b) a longsword, or (c) any simple weapon",
      "(a) a diplomat's pack or (b) an entertainer's pack",
      "(a) a lute or (b) any other musical instrument",
      "Leather armor, and a dagger",
    ],
    level1Features: [
      { level: 1, name: "Bardic Inspiration", desc: "You can inspire others through stirring words or music. Bonus action: give a creature within 60 feet a Bardic Inspiration die (d6 at L1)." },
      { level: 1, name: "Spellcasting", desc: "You can cast bard spells using Charisma as your spellcasting ability." },
    ],
  },
  {
    name: "Cleric",
    slug: "cleric",
    hitDie: 8,
    primaryAbility: "Wisdom",
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
      count: 2,
    },
    spellcastingAbility: "wisdom",
    subclassLevel: 1,
    subclassTitle: "Divine Domain",
    isSpellcaster: true,
    subclasses: [
      { name: "Life Domain", slug: "life", desc: "Clerics of the Life domain channel the positive energy of life." },
      { name: "Light Domain", slug: "light", desc: "Clerics of the Light domain command the power of fire and sun." },
      { name: "Trickery Domain", slug: "trickery", desc: "Trickery clerics are devoted to mischief and deception." },
      { name: "War Domain", slug: "war", desc: "War clerics are exemplars of battlefield prowess and valor." },
    ],
    startingEquipmentOptions: [
      "(a) a mace or (b) a warhammer (if proficient)",
      "(a) scale mail, (b) leather armor, or (c) chain mail (if proficient)",
      "(a) a light crossbow and 20 bolts or (b) any simple weapon",
      "(a) a priest's pack or (b) an explorer's pack",
      "A shield and a holy symbol",
    ],
    level1Features: [
      { level: 1, name: "Spellcasting", desc: "As a conduit for divine power, you can cast cleric spells using Wisdom." },
      { level: 1, name: "Divine Domain", desc: "Choose a divine domain related to your deity. At 1st level you gain domain spells and a domain feature." },
    ],
  },
  {
    name: "Druid",
    slug: "druid",
    hitDie: 8,
    primaryAbility: "Wisdom",
    savingThrows: ["Intelligence", "Wisdom"],
    armorProficiencies: ["Light armor (nonmetal)", "Medium armor (nonmetal)", "Shields (nonmetal)"],
    weaponProficiencies: ["Clubs","Daggers","Darts","Javelins","Maces","Quarterstaffs","Scimitars","Sickles","Slings","Spears"],
    toolProficiencies: ["Herbalism kit"],
    skillChoices: {
      from: ["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"],
      count: 2,
    },
    spellcastingAbility: "wisdom",
    subclassLevel: 2,
    subclassTitle: "Druid Circle",
    isSpellcaster: true,
    subclasses: [
      { name: "Circle of the Land", slug: "circle-of-land", desc: "Land druids draw on the ancient magical presence of the land." },
      { name: "Circle of the Moon", slug: "circle-of-moon", desc: "Moon druids are fierce guardians of the wilds." },
    ],
    startingEquipmentOptions: [
      "(a) a wooden shield or (b) any simple weapon",
      "(a) a scimitar or (b) any simple melee weapon",
      "Leather armor, an explorer's pack, and a druidic focus",
    ],
    level1Features: [
      { level: 1, name: "Druidic", desc: "You know Druidic, the secret language of druids. You can speak it and use it to leave hidden messages." },
      { level: 1, name: "Spellcasting", desc: "Drawing on the divine essence of nature, you can cast druid spells using Wisdom." },
    ],
  },
  {
    name: "Fighter",
    slug: "fighter",
    hitDie: 10,
    primaryAbility: "Strength or Dexterity",
    savingThrows: ["Strength", "Constitution"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],
      count: 2,
    },
    spellcastingAbility: null,
    subclassLevel: 3,
    subclassTitle: "Martial Archetype",
    isSpellcaster: false,
    subclasses: [
      { name: "Champion", slug: "champion", desc: "Champion fighters focus on the development of raw physical power." },
      { name: "Battle Master", slug: "battle-master", desc: "Battle Masters employ martial techniques passed down through generations." },
      { name: "Eldritch Knight", slug: "eldritch-knight", desc: "Eldritch Knights combine martial mastery with spellcasting." },
    ],
    startingEquipmentOptions: [
      "(a) chain mail or (b) leather armor, longbow, and 20 arrows",
      "(a) a martial weapon and a shield or (b) two martial weapons",
      "(a) a light crossbow and 20 bolts or (b) two handaxes",
      "(a) a dungeoneer's pack or (b) an explorer's pack",
    ],
    level1Features: [
      { level: 1, name: "Fighting Style", desc: "You adopt a particular style of fighting as your specialty. Choose one: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting." },
      { level: 1, name: "Second Wind", desc: "You have a limited well of stamina. Bonus action: regain 1d10 + fighter level HP. Recharges on short or long rest." },
    ],
  },
  {
    name: "Monk",
    slug: "monk",
    hitDie: 8,
    primaryAbility: "Dexterity & Wisdom",
    savingThrows: ["Strength", "Dexterity"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple weapons", "Shortswords"],
    toolProficiencies: ["One type of artisan's tools or one musical instrument"],
    skillChoices: {
      from: ["Acrobatics","Athletics","History","Insight","Religion","Stealth"],
      count: 2,
    },
    spellcastingAbility: null,
    subclassLevel: 3,
    subclassTitle: "Monastic Tradition",
    isSpellcaster: false,
    subclasses: [
      { name: "Way of the Open Hand", slug: "way-of-open-hand", desc: "Open Hand monks master unarmed combat techniques." },
      { name: "Way of Shadow", slug: "way-of-shadow", desc: "Shadow monks follow a tradition using darkness and stealth." },
      { name: "Way of the Four Elements", slug: "way-of-four-elements", desc: "Four Elements monks harness elemental energy through ki." },
    ],
    startingEquipmentOptions: [
      "(a) a shortsword or (b) any simple weapon",
      "(a) a dungeoneer's pack or (b) an explorer's pack",
      "10 darts",
    ],
    level1Features: [
      { level: 1, name: "Unarmored Defense", desc: "While not wearing armor, your AC equals 10 + Dexterity modifier + Wisdom modifier." },
      { level: 1, name: "Martial Arts", desc: "Your practice of martial arts gives special combat benefits. You can use Dexterity instead of Strength for attacks with monk weapons. You can roll a d4 in place of normal damage. When you use Attack action, you can make one unarmed strike as a bonus action." },
    ],
  },
  {
    name: "Paladin",
    slug: "paladin",
    hitDie: 10,
    primaryAbility: "Strength & Charisma",
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],
      count: 2,
    },
    spellcastingAbility: "charisma",
    subclassLevel: 3,
    subclassTitle: "Sacred Oath",
    isSpellcaster: true,
    subclasses: [
      { name: "Oath of Devotion", slug: "oath-of-devotion", desc: "The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order." },
      { name: "Oath of the Ancients", slug: "oath-of-ancients", desc: "The Oath of the Ancients is as old as the race of elves and the rituals of the druids." },
      { name: "Oath of Vengeance", slug: "oath-of-vengeance", desc: "The Oath of Vengeance is a solemn commitment to punish those who have committed a grievous sin." },
    ],
    startingEquipmentOptions: [
      "(a) a martial weapon and a shield or (b) two martial weapons",
      "(a) five javelins or (b) any simple melee weapon",
      "(a) a priest's pack or (b) an explorer's pack",
      "Chain mail and a holy symbol",
    ],
    level1Features: [
      { level: 1, name: "Divine Sense", desc: "The presence of strong evil registers on your senses. You can detect celestials, fiends, and undead as a bonus action." },
      { level: 1, name: "Lay on Hands", desc: "Your blessed touch can heal wounds. You have a pool of healing power that replenishes on long rest. As an action, you can touch a creature to restore HP from the pool." },
    ],
  },
  {
    name: "Ranger",
    slug: "ranger",
    hitDie: 10,
    primaryAbility: "Dexterity & Wisdom",
    savingThrows: ["Strength", "Dexterity"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],
      count: 3,
    },
    spellcastingAbility: "wisdom",
    subclassLevel: 3,
    subclassTitle: "Ranger Archetype",
    isSpellcaster: true,
    subclasses: [
      { name: "Hunter", slug: "hunter", desc: "Hunter rangers embrace the role of prey into predator." },
      { name: "Beast Master", slug: "beast-master", desc: "Beast Master rangers form a close bond with an animal companion." },
    ],
    startingEquipmentOptions: [
      "(a) scale mail or (b) leather armor",
      "(a) two shortswords or (b) two simple melee weapons",
      "(a) a dungeoneer's pack or (b) an explorer's pack",
      "A longbow and a quiver of 20 arrows",
    ],
    level1Features: [
      { level: 1, name: "Favored Enemy", desc: "You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy." },
      { level: 1, name: "Natural Explorer", desc: "You are a master of navigating the natural world, and you react with swift and decisive action when attacked." },
    ],
  },
  {
    name: "Rogue",
    slug: "rogue",
    hitDie: 8,
    primaryAbility: "Dexterity",
    savingThrows: ["Dexterity", "Intelligence"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"],
    toolProficiencies: ["Thieves' tools"],
    skillChoices: {
      from: [
        "Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation",
        "Perception","Performance","Persuasion","Sleight of Hand","Stealth",
      ],
      count: 4,
    },
    spellcastingAbility: null,
    subclassLevel: 3,
    subclassTitle: "Roguish Archetype",
    isSpellcaster: false,
    subclasses: [
      { name: "Thief", slug: "thief", desc: "Thieves refine their skills in larceny and escape." },
      { name: "Assassin", slug: "assassin", desc: "Assassins focus their training for grim work of infiltration and treachery." },
      { name: "Arcane Trickster", slug: "arcane-trickster", desc: "Arcane Tricksters enhance their abilities with magic, often from the illusion and enchantment schools." },
    ],
    startingEquipmentOptions: [
      "(a) a rapier or (b) a shortsword",
      "(a) a shortbow and quiver of 20 arrows or (b) a shortsword",
      "(a) a burglar's pack, (b) a dungeoneer's pack, or (c) an explorer's pack",
      "Leather armor, two daggers, and thieves' tools",
    ],
    level1Features: [
      { level: 1, name: "Expertise", desc: "Choose two of your skill proficiencies, or one skill and your thieves' tools. Your proficiency bonus is doubled for any ability check using the chosen proficiencies." },
      { level: 1, name: "Sneak Attack", desc: "Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack with a finesse or ranged weapon if you have advantage or an ally is adjacent to your target." },
      { level: 1, name: "Thieves' Cant", desc: "You have learned thieves' cant, a secret mix of dialect, jargon, and code." },
    ],
  },
  {
    name: "Sorcerer",
    slug: "sorcerer",
    hitDie: 6,
    primaryAbility: "Charisma",
    savingThrows: ["Constitution", "Charisma"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],
      count: 2,
    },
    spellcastingAbility: "charisma",
    subclassLevel: 1,
    subclassTitle: "Sorcerous Origin",
    isSpellcaster: true,
    subclasses: [
      { name: "Draconic Bloodline", slug: "draconic-bloodline", desc: "Draconic Bloodline sorcerers have magic that springs from draconic origins." },
      { name: "Wild Magic Surge", slug: "wild-magic", desc: "Wild Magic sorcerers channel wild surges of chaotic power." },
    ],
    startingEquipmentOptions: [
      "(a) a light crossbow and 20 bolts or (b) any simple weapon",
      "(a) a component pouch or (b) an arcane focus",
      "(a) a dungeoneer's pack or (b) an explorer's pack",
      "Two daggers",
    ],
    level1Features: [
      { level: 1, name: "Spellcasting", desc: "An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic." },
      { level: 1, name: "Sorcerous Origin", desc: "Choose a sorcerous origin, which describes the source of your innate magical power." },
    ],
  },
  {
    name: "Warlock",
    slug: "warlock",
    hitDie: 8,
    primaryAbility: "Charisma",
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],
      count: 2,
    },
    spellcastingAbility: "charisma",
    subclassLevel: 1,
    subclassTitle: "Otherworldly Patron",
    isSpellcaster: true,
    subclasses: [
      { name: "The Fiend", slug: "the-fiend", desc: "Fiend warlocks made pacts with a powerful devil or demon of the Nine Hells or Abyss." },
      { name: "The Great Old One", slug: "the-great-old-one", desc: "Great Old One warlocks drew power from beings of the Far Realm." },
      { name: "The Archfey", slug: "the-archfey", desc: "Archfey warlocks serve powerful lords and ladies of the Feywild." },
    ],
    startingEquipmentOptions: [
      "(a) a light crossbow and 20 bolts or (b) any simple weapon",
      "(a) a component pouch or (b) an arcane focus",
      "(a) a scholar's pack or (b) a dungeoneer's pack",
      "Leather armor, any simple weapon, and two daggers",
    ],
    level1Features: [
      { level: 1, name: "Otherworldly Patron", desc: "You have struck a bargain with an otherworldly being of your choice." },
      { level: 1, name: "Pact Magic", desc: "Your arcane research and the magic bestowed on you by your patron have given you facility with spells. You regain all spell slots on a short or long rest." },
    ],
  },
  {
    name: "Wizard",
    slug: "wizard",
    hitDie: 6,
    primaryAbility: "Intelligence",
    savingThrows: ["Intelligence", "Wisdom"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],
    toolProficiencies: [],
    skillChoices: {
      from: ["Arcana","History","Insight","Investigation","Medicine","Religion"],
      count: 2,
    },
    spellcastingAbility: "intelligence",
    subclassLevel: 2,
    subclassTitle: "Arcane Tradition",
    isSpellcaster: true,
    subclasses: [
      { name: "School of Abjuration", slug: "abjuration", desc: "Abjuration wizards specialize in protective magic." },
      { name: "School of Conjuration", slug: "conjuration", desc: "Conjuration wizards learn to transport objects and creatures." },
      { name: "School of Divination", slug: "divination", desc: "Divination wizards peer into the future and unravel mysteries." },
      { name: "School of Enchantment", slug: "enchantment", desc: "Enchantment wizards entrance and beguile other creatures." },
      { name: "School of Evocation", slug: "evocation", desc: "Evocation wizards shape magical energy to produce powerful effects." },
      { name: "School of Illusion", slug: "illusion", desc: "Illusion wizards weave shadows and phantasms into seeming reality." },
      { name: "School of Necromancy", slug: "necromancy", desc: "Necromancy wizards explore the cosmic forces of life, death, and undeath." },
      { name: "School of Transmutation", slug: "transmutation", desc: "Transmutation wizards change the properties of creatures and objects." },
    ],
    startingEquipmentOptions: [
      "(a) a quarterstaff or (b) a dagger",
      "(a) a component pouch or (b) an arcane focus",
      "(a) a scholar's pack or (b) an explorer's pack",
      "A spellbook",
    ],
    level1Features: [
      { level: 1, name: "Spellcasting", desc: "As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power." },
      { level: 1, name: "Arcane Recovery", desc: "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can recover spell slots whose combined level equals half your wizard level (rounded up)." },
    ],
  },
];

export function getClass(slug: string): SRDClass | undefined {
  return SRD_CLASSES.find((c) => c.slug === slug);
}

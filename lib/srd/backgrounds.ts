export interface BackgroundFeature {
  name: string;
  desc: string;
}

export interface SRDBackground {
  name: string;
  slug: string;
  desc: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number; // number of language choices
  equipment: string[];
  feature: BackgroundFeature;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export const SRD_BACKGROUNDS: SRDBackground[] = [
  {
    name: "Acolyte",
    slug: "acolyte",
    desc: "You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world.",
    skillProficiencies: ["Insight", "Religion"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["Holy symbol", "Prayer book or wheel", "5 sticks of incense", "Vestments", "Common clothes", "15 gp"],
    feature: {
      name: "Shelter of the Faithful",
      desc: "You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components needed for spells.",
    },
    personalityTraits: [
      "I idolize a particular hero and constantly refer to that person's deeds.",
      "I can find common ground between the fiercest enemies.",
    ],
    ideals: ["Tradition", "Charity", "Change", "Power", "Faith", "Aspiration"],
    bonds: ["I would die to recover an ancient relic of my faith."],
    flaws: ["I judge others harshly, and myself even more severely."],
  },
  {
    name: "Charlatan",
    slug: "charlatan",
    desc: "You have always had a way with people. You know what makes them tick, you can tease out their heart's desires after a few minutes of conversation, and with a few leading questions you can read them like they were children's books.",
    skillProficiencies: ["Deception", "Sleight of Hand"],
    toolProficiencies: ["Disguise kit", "Forgery kit"],
    languages: 0,
    equipment: ["Fine clothes", "Disguise kit", "Tools of the con trade", "15 gp"],
    feature: {
      name: "False Identity",
      desc: "You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona.",
    },
    personalityTraits: ["I fall in and out of love easily.", "I have a joke for every occasion."],
    ideals: ["Independence", "Fairness", "Charity", "Creativity", "Friendship", "Aspiration"],
    bonds: ["I fleeced the wrong person and must work to ensure they don't come after me."],
    flaws: ["I can't resist a pretty face."],
  },
  {
    name: "Criminal",
    slug: "criminal",
    desc: "You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld.",
    skillProficiencies: ["Deception", "Stealth"],
    toolProficiencies: ["One type of gaming set", "Thieves' tools"],
    languages: 0,
    equipment: ["A crowbar", "Dark common clothes including a hood", "15 gp"],
    feature: {
      name: "Criminal Contact",
      desc: "You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact.",
    },
    personalityTraits: ["I always have a plan for what to do when things go wrong.", "I am always calm, no matter what."],
    ideals: ["Honor", "Freedom", "Charity", "Greed", "People", "Redemption"],
    bonds: ["I'm trying to pay off an old debt I owe to a generous benefactor."],
    flaws: ["When I see something valuable, I can't think about anything but how to steal it."],
  },
  {
    name: "Entertainer",
    slug: "entertainer",
    desc: "You thrive in front of an audience. You know how to entrance them, entertain them, and even inspire them. Your poetics can stir the hearts of those who hear you, awakening grief or joy, laughter or anger.",
    skillProficiencies: ["Acrobatics", "Performance"],
    toolProficiencies: ["Disguise kit", "One type of musical instrument"],
    languages: 0,
    equipment: ["A musical instrument", "The favor of an admirer", "Costume", "15 gp"],
    feature: {
      name: "By Popular Demand",
      desc: "You can always find a place to perform, usually in an inn or tavern but possibly with a circus, at a theater, or even in a noble's court. In exchange, you receive free lodging and food of a modest or comfortable standard.",
    },
    personalityTraits: ["I know a story relevant to almost every situation.", "Whenever I come to a new place, I collect local rumors."],
    ideals: ["Beauty", "Tradition", "Creativity", "Greed", "People", "Honesty"],
    bonds: ["My instrument is my most treasured possession."],
    flaws: ["I can't help pocketing loose coins and trinkets."],
  },
  {
    name: "Folk Hero",
    slug: "folk-hero",
    desc: "You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion, and your destiny calls you to stand against the tyrants and monsters that threaten the common folk everywhere.",
    skillProficiencies: ["Animal Handling", "Survival"],
    toolProficiencies: ["One type of artisan's tools", "Vehicles (land)"],
    languages: 0,
    equipment: ["A set of artisan's tools", "A shovel", "An iron pot", "Common clothes", "10 gp"],
    feature: {
      name: "Rustic Hospitality",
      desc: "Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them.",
    },
    personalityTraits: ["I judge people by their actions, not their words.", "If someone is in trouble, I'm always ready to lend help."],
    ideals: ["Respect", "Fairness", "Freedom", "Might", "Sincerity", "Destiny"],
    bonds: ["I have a family, but I have no idea where they are."],
    flaws: ["The tyrant who rules my land will stop at nothing to see me captured."],
  },
  {
    name: "Guild Artisan",
    slug: "guild-artisan",
    desc: "You are a member of an artisan's guild, skilled in a particular field and closely associated with other artisans. You are a well-established part of the mercantile world.",
    skillProficiencies: ["Insight", "Persuasion"],
    toolProficiencies: ["One type of artisan's tools"],
    languages: 1,
    equipment: ["A set of artisan's tools", "A letter of introduction from your guild", "Traveler's clothes", "15 gp"],
    feature: {
      name: "Guild Membership",
      desc: "As an established and respected member of a guild, you can rely on certain benefits that membership provides. Your fellow guild members will provide you with lodging and food if necessary.",
    },
    personalityTraits: ["I believe that anything worth doing is worth doing right.", "I'm rude to people who lack my commitment to hard work."],
    ideals: ["Community", "Generosity", "Freedom", "Greed", "People", "Aspiration"],
    bonds: ["The workshop where I learned my trade is the most important place in the world to me."],
    flaws: ["I'm horribly jealous of anyone who can outshine my handiwork."],
  },
  {
    name: "Hermit",
    slug: "hermit",
    desc: "You lived in seclusion—either in a sheltered community such as a monastery, or entirely alone—for a formative part of your life. In your time apart from the clamor of society, you found quiet, solitude, and perhaps some of the answers you were looking for.",
    skillProficiencies: ["Medicine", "Religion"],
    toolProficiencies: ["Herbalism kit"],
    languages: 1,
    equipment: ["A scroll case stuffed full of notes", "A winter blanket", "Common clothes", "Herbalism kit", "5 gp"],
    feature: {
      name: "Discovery",
      desc: "The quiet seclusion of your extended hermitage gave you access to a unique and powerful discovery. You might have uncovered a great truth about the cosmos, the gods, the powerful beings of the outer planes, or the forces of nature.",
    },
    personalityTraits: ["I've been isolated for so long that I rarely speak.", "I connect everything that happens to me to a grand cosmic plan."],
    ideals: ["Greater Good", "Logic", "Free Thinking", "Power", "Live and Let Live", "Self-Knowledge"],
    bonds: ["I entered seclusion to hide from the ones who might still be hunting me."],
    flaws: ["I am dogmatic in my thinking."],
  },
  {
    name: "Noble",
    slug: "noble",
    desc: "You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence.",
    skillProficiencies: ["History", "Persuasion"],
    toolProficiencies: ["One type of gaming set"],
    languages: 1,
    equipment: ["Fine clothes", "A signet ring", "A scroll of pedigree", "A purse containing 25 gp"],
    feature: {
      name: "Position of Privilege",
      desc: "Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are.",
    },
    personalityTraits: ["My eloquent flattery makes everyone I talk to feel like the most wonderful and important person.", "I take great pains to always look my best."],
    ideals: ["Respect", "Responsibility", "Independence", "Power", "Family", "Noble Obligation"],
    bonds: ["I will face any challenge to win the approval of my family."],
    flaws: ["I secretly believe that everyone is beneath me."],
  },
  {
    name: "Outlander",
    slug: "outlander",
    desc: "You grew up in the wilds, far from civilization and the comforts of town and technology. You've witnessed the migration of herds larger than forests, survived weather more extreme than any city-dweller could comprehend.",
    skillProficiencies: ["Athletics", "Survival"],
    toolProficiencies: ["One type of musical instrument"],
    languages: 1,
    equipment: ["A staff", "A hunting trap", "A trophy from an animal you killed", "Traveler's clothes", "10 gp"],
    feature: {
      name: "Wanderer",
      desc: "You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you. In addition, you can find food and fresh water for yourself and up to five other people each day.",
    },
    personalityTraits: ["I'm driven by a wanderlust that led me away from home.", "I watch over my friends as if they were a litter of newborn pups."],
    ideals: ["Change", "Greater Good", "Independence", "Might", "Nature", "Glory"],
    bonds: ["My family, clan, or tribe is the most important thing in my life."],
    flaws: ["I am too enamored of ale, wine, and other intoxicants."],
  },
  {
    name: "Sage",
    slug: "sage",
    desc: "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you. Your efforts have made you a master in your fields of study.",
    skillProficiencies: ["Arcana", "History"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["A bottle of black ink", "A quill", "A small knife", "A letter from a dead colleague", "Common clothes", "10 gp"],
    feature: {
      name: "Researcher",
      desc: "When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually this information comes from a library, scriptorium, university, or a sage.",
    },
    personalityTraits: ["I use polysyllabic words to convey the impression of great erudition.", "I've read every book in the world's greatest libraries."],
    ideals: ["Knowledge", "Beauty", "Logic", "No Limits", "Power", "Self-Improvement"],
    bonds: ["I have an ancient text that holds terrible secrets that must not fall into the wrong hands."],
    flaws: ["I speak without really thinking through my words, invariably insulting others."],
  },
  {
    name: "Sailor",
    slug: "sailor",
    desc: "You sailed on a seagoing vessel for years. In that time, you faced down mighty storms, monsters of the deep, and those who wanted to sink your craft to the bottomless depths.",
    skillProficiencies: ["Athletics", "Perception"],
    toolProficiencies: ["Navigator's tools", "Vehicles (water)"],
    languages: 0,
    equipment: ["A belaying pin (club)", "50 feet of silk rope", "A lucky charm", "Common clothes", "10 gp"],
    feature: {
      name: "Ship's Passage",
      desc: "When you need to, you can secure free passage on a sailing ship for yourself and your adventuring companions. The ship will carry you to your destination free of charge, though you might have to help with the ship's work.",
    },
    personalityTraits: ["My friends know they can rely on me.", "I work hard so that I can play hard when the work is done."],
    ideals: ["Respect", "Fairness", "Freedom", "Mastery", "People", "Aspiration"],
    bonds: ["I'm loyal to my captain first, everything else second."],
    flaws: ["I follow orders, even if I think they're wrong."],
  },
  {
    name: "Soldier",
    slug: "soldier",
    desc: "War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques, including how to stay alive on the battlefield.",
    skillProficiencies: ["Athletics", "Intimidation"],
    toolProficiencies: ["One type of gaming set", "Vehicles (land)"],
    languages: 0,
    equipment: ["An insignia of rank", "A trophy taken from a fallen enemy", "A set of bone dice or deck of cards", "Common clothes", "10 gp"],
    feature: {
      name: "Military Rank",
      desc: "You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.",
    },
    personalityTraits: ["I'm always polite and respectful.", "I'm haunted by memories of war."],
    ideals: ["Greater Good", "Responsibility", "Independence", "Might", "Live and Let Live", "Nation"],
    bonds: ["I would still lay down my life for the people I served with."],
    flaws: ["I have little respect for anyone who is not a proven warrior."],
  },
  {
    name: "Urchin",
    slug: "urchin",
    desc: "You grew up on the streets alone, orphaned, and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself.",
    skillProficiencies: ["Sleight of Hand", "Stealth"],
    toolProficiencies: ["Disguise kit", "Thieves' tools"],
    languages: 0,
    equipment: ["A small knife", "A map of the city you grew up in", "A pet mouse", "A token to remember your parents by", "Common clothes", "10 gp"],
    feature: {
      name: "City Secrets",
      desc: "You know the secret patterns and flow to cities and can find passages through the urban sprawl that others would miss. When you are not in combat, you (and companions you lead) can travel between any two locations in the city twice as fast as your speed would normally allow.",
    },
    personalityTraits: ["I hide scraps of food and trinkets away in my pockets.", "I ask a lot of questions."],
    ideals: ["Respect", "Charity", "Change", "Greater Good", "People", "Aspiration"],
    bonds: ["I escaped my life of poverty by robbing an important person."],
    flaws: ["If I'm outnumbered, I will run away from a fight."],
  },
];

export function getBackground(slug: string): SRDBackground | undefined {
  return SRD_BACKGROUNDS.find((b) => b.slug === slug);
}

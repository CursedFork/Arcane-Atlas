"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { type Character, type AbilityScores } from "@/lib/schemas/character";
import { calculateMaxHP } from "@/lib/characterMath";
import { getRace, getRaceAbilityIncrease } from "@/lib/srd/races";

export const BUILDER_STEPS = [
  "Race",
  "Class",
  "Subclass",
  "Ability Scores",
  "Background",
  "Skills",
  "Equipment",
  "Spells",
  "Details",
  "Review",
] as const;

export type BuilderStepName = (typeof BUILDER_STEPS)[number];

const DEFAULT_SCORES: AbilityScores = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8,
};

interface BuilderState {
  step: number;

  // Step 1: Race
  race: string;
  subrace: string;
  flexibleBoosts: Record<string, number>; // for Half-Elf etc.

  // Step 2: Class
  classSlug: string;

  // Step 3: Subclass
  subclass: string;

  // Step 4: Ability Scores
  abilityScoreMethod: "standard" | "pointbuy" | "manual";
  baseAbilityScores: AbilityScores;

  // Step 5: Background
  background: string;

  // Step 6: Skills
  chosenSkills: string[];

  // Step 7: Equipment
  chosenEquipment: string[];

  // Step 8: Spells
  chosenCantrips: string[];
  chosenSpells: string[];

  // Step 9: Details
  name: string;
  alignment: string;
  appearance: string;
  backstory: string;
  bonds: string;
  ideals: string;
  flaws: string;
  notes: string;
  level: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setRace: (race: string, subrace?: string, flexibleBoosts?: Record<string, number>) => void;
  setClass: (classSlug: string) => void;
  setSubclass: (subclass: string) => void;
  setAbilityScoreMethod: (method: "standard" | "pointbuy" | "manual") => void;
  setBaseAbilityScores: (scores: AbilityScores) => void;
  setFlexibleBoosts: (boosts: Record<string, number>) => void;
  setBackground: (background: string) => void;
  setChosenSkills: (skills: string[]) => void;
  setChosenEquipment: (equipment: string[]) => void;
  setChosenCantrips: (cantrips: string[]) => void;
  setChosenSpells: (spells: string[]) => void;
  setDetails: (details: Partial<Pick<BuilderState, "name" | "alignment" | "appearance" | "backstory" | "bonds" | "ideals" | "flaws" | "notes">>) => void;
  setLevel: (level: number) => void;

  // Computed helpers
  getFinalAbilityScores: () => AbilityScores;
  buildCharacter: () => Character;
  resetBuilder: () => void;
}

const initialState = {
  step: 0,
  race: "",
  subrace: "",
  flexibleBoosts: {} as Record<string, number>,
  classSlug: "",
  subclass: "",
  abilityScoreMethod: "standard" as const,
  baseAbilityScores: { ...DEFAULT_SCORES },
  background: "",
  chosenSkills: [] as string[],
  chosenEquipment: [] as string[],
  chosenCantrips: [] as string[],
  chosenSpells: [] as string[],
  name: "",
  alignment: "True Neutral",
  appearance: "",
  backstory: "",
  bonds: "",
  ideals: "",
  flaws: "",
  notes: "",
  level: 1,
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, BUILDER_STEPS.length - 1) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

      setRace: (race, subrace = "", flexibleBoosts = {}) =>
        set({ race, subrace, flexibleBoosts }),

      setClass: (classSlug) => set({ classSlug, subclass: "", chosenCantrips: [], chosenSpells: [] }),

      setSubclass: (subclass) => set({ subclass }),

      setAbilityScoreMethod: (method) => set({ abilityScoreMethod: method }),

      setBaseAbilityScores: (scores) => set({ baseAbilityScores: scores }),

      setFlexibleBoosts: (boosts) => set({ flexibleBoosts: boosts }),

      setBackground: (background) => set({ background }),

      setChosenSkills: (skills) => set({ chosenSkills: skills }),

      setChosenEquipment: (equipment) => set({ chosenEquipment: equipment }),

      setChosenCantrips: (cantrips) => set({ chosenCantrips: cantrips }),

      setChosenSpells: (spells) => set({ chosenSpells: spells }),

      setDetails: (details) => set(details),

      setLevel: (level) => set({ level }),

      getFinalAbilityScores: () => {
        const { race, subrace, flexibleBoosts, baseAbilityScores } = get();
        const raceData = getRace(race);
        if (!raceData) return { ...baseAbilityScores };

        const subraceData = raceData.subraces.find((s) => s.slug === subrace);
        const racialBoosts = getRaceAbilityIncrease(raceData, subraceData, flexibleBoosts);

        return {
          strength: baseAbilityScores.strength + (racialBoosts["strength"] ?? 0),
          dexterity: baseAbilityScores.dexterity + (racialBoosts["dexterity"] ?? 0),
          constitution: baseAbilityScores.constitution + (racialBoosts["constitution"] ?? 0),
          intelligence: baseAbilityScores.intelligence + (racialBoosts["intelligence"] ?? 0),
          wisdom: baseAbilityScores.wisdom + (racialBoosts["wisdom"] ?? 0),
          charisma: baseAbilityScores.charisma + (racialBoosts["charisma"] ?? 0),
        };
      },

      buildCharacter: () => {
        const state = get();
        const finalScores = state.getFinalAbilityScores();
        const raceData = getRace(state.race);
        const subraceData = raceData?.subraces.find((s) => s.slug === state.subrace);
        const racialBoosts = raceData
          ? getRaceAbilityIncrease(raceData, subraceData, state.flexibleBoosts)
          : {};

        const maxHp = calculateMaxHP(state.classSlug, state.level, finalScores.constitution);
        const now = new Date().toISOString();

        const character: Character = {
          id: uuidv4(),
          version: 1,
          name: state.name || "Unnamed Hero",
          level: state.level,
          race: state.race,
          subrace: state.subrace || undefined,
          classSlug: state.classSlug,
          subclass: state.subclass || undefined,
          background: state.background,
          alignment: state.alignment,
          abilityScoreMethod: state.abilityScoreMethod,
          baseAbilityScores: { ...state.baseAbilityScores },
          racialAbilityBoosts: racialBoosts as Partial<AbilityScores>,
          finalAbilityScores: finalScores,
          skillProficiencies: [...state.chosenSkills],
          toolProficiencies: [],
          languages: [],
          savingThrowProficiencies: [],
          equipment: state.chosenEquipment.map((name, idx) => ({
            id: `eq-${idx}`,
            name,
            quantity: 1,
            isHomebrew: false,
          })),
          spells: {
            cantrips: [...state.chosenCantrips],
            prepared: [],
            known: [...state.chosenSpells],
          },
          hp: { max: maxHp, current: maxHp, temp: 0 },
          details: {
            appearance: state.appearance,
            backstory: state.backstory,
            bonds: state.bonds,
            ideals: state.ideals,
            flaws: state.flaws,
            notes: state.notes,
          },
          homebrewIds: {
            spellSlugs: [],
            raceSlugs: [],
            classSlugs: [],
          },
          createdAt: now,
          updatedAt: now,
        };

        return character;
      },

      resetBuilder: () => set({ ...initialState }),
    }),
    {
      name: "arcane-atlas:builder-draft",
    }
  )
);

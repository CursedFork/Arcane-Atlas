"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type HomebrewCollection,
  type HomebrewSpell,
  type HomebrewRace,
  type HomebrewItem,
  type HomebrewBackground,
  type HomebrewFeat,
  type HomebrewSubclass,
  type HomebrewMonster,
  type HomebrewWeapon,
} from "@/lib/schemas/homebrew";

interface HomebrewState extends HomebrewCollection {
  addSpell: (spell: HomebrewSpell) => void;
  removeSpell: (slug: string) => void;
  updateSpell: (slug: string, spell: HomebrewSpell) => void;
  bulkAddSpells: (spells: HomebrewSpell[]) => void;

  addRace: (race: HomebrewRace) => void;
  removeRace: (slug: string) => void;
  bulkAddRaces: (races: HomebrewRace[]) => void;

  addItem: (item: HomebrewItem) => void;
  removeItem: (slug: string) => void;
  bulkAddItems: (items: HomebrewItem[]) => void;

  addBackground: (background: HomebrewBackground) => void;
  removeBackground: (slug: string) => void;
  bulkAddBackgrounds: (backgrounds: HomebrewBackground[]) => void;

  addFeat: (feat: HomebrewFeat) => void;
  removeFeat: (slug: string) => void;
  bulkAddFeats: (feats: HomebrewFeat[]) => void;

  addSubclass: (sc: HomebrewSubclass) => void;
  removeSubclass: (slug: string) => void;
  bulkAddSubclasses: (subclasses: HomebrewSubclass[]) => void;

  addMonster: (m: HomebrewMonster) => void;
  removeMonster: (slug: string) => void;
  bulkAddMonsters: (monsters: HomebrewMonster[]) => void;

  addWeapon: (w: HomebrewWeapon) => void;
  removeWeapon: (slug: string) => void;
  bulkAddWeapons: (weapons: HomebrewWeapon[]) => void;

  importCollection: (collection: HomebrewCollection) => void;
  resetHomebrew: () => void;
}

const emptyState = {
  spells: [] as HomebrewSpell[],
  races: [] as HomebrewRace[],
  items: [] as HomebrewItem[],
  backgrounds: [] as HomebrewBackground[],
  feats: [] as HomebrewFeat[],
  subclasses: [] as HomebrewSubclass[],
  monsters: [] as HomebrewMonster[],
  weapons: [] as HomebrewWeapon[],
};

export const useHomebrewStore = create<HomebrewState>()(
  persist(
    (set) => ({
      ...emptyState,

      addSpell: (spell) =>
        set((state) => ({
          spells: [...state.spells.filter((s) => s.slug !== spell.slug), spell],
        })),
      removeSpell: (slug) =>
        set((state) => ({ spells: state.spells.filter((s) => s.slug !== slug) })),
      updateSpell: (slug, spell) =>
        set((state) => ({
          spells: state.spells.map((s) => (s.slug === slug ? spell : s)),
        })),
      bulkAddSpells: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((s) => s.slug));
          return { spells: [...state.spells.filter((s) => !slugSet.has(s.slug)), ...incoming] };
        }),

      addRace: (race) =>
        set((state) => ({
          races: [...state.races.filter((r) => r.slug !== race.slug), race],
        })),
      removeRace: (slug) =>
        set((state) => ({ races: state.races.filter((r) => r.slug !== slug) })),
      bulkAddRaces: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((r) => r.slug));
          return { races: [...state.races.filter((r) => !slugSet.has(r.slug)), ...incoming] };
        }),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items.filter((i) => i.slug !== item.slug), item],
        })),
      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      bulkAddItems: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((i) => i.slug));
          return { items: [...state.items.filter((i) => !slugSet.has(i.slug)), ...incoming] };
        }),

      addBackground: (bg) =>
        set((state) => ({
          backgrounds: [...state.backgrounds.filter((b) => b.slug !== bg.slug), bg],
        })),
      removeBackground: (slug) =>
        set((state) => ({
          backgrounds: state.backgrounds.filter((b) => b.slug !== slug),
        })),
      bulkAddBackgrounds: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((b) => b.slug));
          return { backgrounds: [...state.backgrounds.filter((b) => !slugSet.has(b.slug)), ...incoming] };
        }),

      addFeat: (feat) =>
        set((state) => ({
          feats: [...state.feats.filter((f) => f.slug !== feat.slug), feat],
        })),
      removeFeat: (slug) =>
        set((state) => ({ feats: state.feats.filter((f) => f.slug !== slug) })),
      bulkAddFeats: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((f) => f.slug));
          return { feats: [...state.feats.filter((f) => !slugSet.has(f.slug)), ...incoming] };
        }),

      addSubclass: (sc) =>
        set((state) => ({
          subclasses: [...state.subclasses.filter((s) => s.slug !== sc.slug), sc],
        })),
      removeSubclass: (slug) =>
        set((state) => ({
          subclasses: state.subclasses.filter((s) => s.slug !== slug),
        })),
      bulkAddSubclasses: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((s) => s.slug));
          return { subclasses: [...state.subclasses.filter((s) => !slugSet.has(s.slug)), ...incoming] };
        }),

      addMonster: (m) =>
        set((state) => ({
          monsters: [...state.monsters.filter((x) => x.slug !== m.slug), m],
        })),
      removeMonster: (slug) =>
        set((state) => ({
          monsters: state.monsters.filter((m) => m.slug !== slug),
        })),
      bulkAddMonsters: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((m) => m.slug));
          return { monsters: [...state.monsters.filter((m) => !slugSet.has(m.slug)), ...incoming] };
        }),

      addWeapon: (w) =>
        set((state) => ({
          weapons: [...state.weapons.filter((x) => x.slug !== w.slug), w],
        })),
      removeWeapon: (slug) =>
        set((state) => ({
          weapons: state.weapons.filter((w) => w.slug !== slug),
        })),
      bulkAddWeapons: (incoming) =>
        set((state) => {
          const slugSet = new Set(incoming.map((w) => w.slug));
          return { weapons: [...state.weapons.filter((w) => !slugSet.has(w.slug)), ...incoming] };
        }),

      importCollection: (collection) =>
        set((state) => ({
          spells: [...state.spells, ...collection.spells],
          races: [...state.races, ...collection.races],
          items: [...state.items, ...collection.items],
          backgrounds: [...state.backgrounds, ...collection.backgrounds],
          feats: [...state.feats, ...collection.feats],
          subclasses: [...state.subclasses, ...(collection.subclasses ?? [])],
          monsters: [...state.monsters, ...(collection.monsters ?? [])],
          weapons: [...state.weapons, ...(collection.weapons ?? [])],
        })),

      resetHomebrew: () => set(emptyState),
    }),
    { name: "arcane-atlas:homebrew" }
  )
);

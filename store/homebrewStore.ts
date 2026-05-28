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

  addRace: (race: HomebrewRace) => void;
  removeRace: (slug: string) => void;

  addItem: (item: HomebrewItem) => void;
  removeItem: (slug: string) => void;

  addBackground: (background: HomebrewBackground) => void;
  removeBackground: (slug: string) => void;

  addFeat: (feat: HomebrewFeat) => void;
  removeFeat: (slug: string) => void;

  addSubclass: (sc: HomebrewSubclass) => void;
  removeSubclass: (slug: string) => void;

  addMonster: (m: HomebrewMonster) => void;
  removeMonster: (slug: string) => void;

  addWeapon: (w: HomebrewWeapon) => void;
  removeWeapon: (slug: string) => void;

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

      addRace: (race) =>
        set((state) => ({
          races: [...state.races.filter((r) => r.slug !== race.slug), race],
        })),
      removeRace: (slug) =>
        set((state) => ({ races: state.races.filter((r) => r.slug !== slug) })),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items.filter((i) => i.slug !== item.slug), item],
        })),
      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),

      addBackground: (bg) =>
        set((state) => ({
          backgrounds: [...state.backgrounds.filter((b) => b.slug !== bg.slug), bg],
        })),
      removeBackground: (slug) =>
        set((state) => ({
          backgrounds: state.backgrounds.filter((b) => b.slug !== slug),
        })),

      addFeat: (feat) =>
        set((state) => ({
          feats: [...state.feats.filter((f) => f.slug !== feat.slug), feat],
        })),
      removeFeat: (slug) =>
        set((state) => ({ feats: state.feats.filter((f) => f.slug !== slug) })),

      addSubclass: (sc) =>
        set((state) => ({
          subclasses: [...state.subclasses.filter((s) => s.slug !== sc.slug), sc],
        })),
      removeSubclass: (slug) =>
        set((state) => ({
          subclasses: state.subclasses.filter((s) => s.slug !== slug),
        })),

      addMonster: (m) =>
        set((state) => ({
          monsters: [...state.monsters.filter((x) => x.slug !== m.slug), m],
        })),
      removeMonster: (slug) =>
        set((state) => ({
          monsters: state.monsters.filter((m) => m.slug !== slug),
        })),

      addWeapon: (w) =>
        set((state) => ({
          weapons: [...state.weapons.filter((x) => x.slug !== w.slug), w],
        })),
      removeWeapon: (slug) =>
        set((state) => ({
          weapons: state.weapons.filter((w) => w.slug !== slug),
        })),

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

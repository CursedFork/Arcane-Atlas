"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hpMax: number;
  hpCurrent: number;
  ac: number;
  conditions: string[];
  isConcentrating: boolean;
  notes: string;
  isPC: boolean;
  monsterSlug?: string;
}

interface DmState {
  combatants: Combatant[];
  currentTurnIndex: number;
  round: number;
  isRunning: boolean;

  addCombatant: (combatant: Omit<Combatant, "id">) => void;
  removeCombatant: (id: string) => void;
  updateCombatant: (id: string, updates: Partial<Combatant>) => void;
  reorderCombatants: (orderedIds: string[]) => void;
  sortByInitiative: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  setRound: (round: number) => void;
  startCombat: () => void;
  endCombat: () => void;
  applyDamage: (id: string, amount: number) => void;
  applyHealing: (id: string, amount: number) => void;
  toggleCondition: (id: string, condition: string) => void;
  clearCombatants: () => void;
}

export const useDmStore = create<DmState>()(
  persist(
    (set, get) => ({
      combatants: [],
      currentTurnIndex: 0,
      round: 1,
      isRunning: false,

      addCombatant: (combatant) =>
        set((state) => ({
          combatants: [...state.combatants, { ...combatant, id: uuidv4() }],
        })),

      removeCombatant: (id) =>
        set((state) => {
          const idx = state.combatants.findIndex((c) => c.id === id);
          const newCombatants = state.combatants.filter((c) => c.id !== id);
          const newIdx =
            idx <= state.currentTurnIndex && state.currentTurnIndex > 0
              ? state.currentTurnIndex - 1
              : state.currentTurnIndex;
          return {
            combatants: newCombatants,
            currentTurnIndex: Math.min(newIdx, Math.max(0, newCombatants.length - 1)),
          };
        }),

      updateCombatant: (id, updates) =>
        set((state) => ({
          combatants: state.combatants.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      reorderCombatants: (orderedIds) =>
        set((state) => {
          const map = new Map(state.combatants.map((c) => [c.id, c]));
          return {
            combatants: orderedIds.map((id) => map.get(id)).filter(Boolean) as Combatant[],
          };
        }),

      sortByInitiative: () =>
        set((state) => ({
          combatants: [...state.combatants].sort((a, b) => b.initiative - a.initiative),
          currentTurnIndex: 0,
        })),

      nextTurn: () =>
        set((state) => {
          const next = state.currentTurnIndex + 1;
          if (next >= state.combatants.length) {
            return { currentTurnIndex: 0, round: state.round + 1 };
          }
          return { currentTurnIndex: next };
        }),

      prevTurn: () =>
        set((state) => {
          if (state.currentTurnIndex === 0) {
            return {
              currentTurnIndex: Math.max(0, state.combatants.length - 1),
              round: Math.max(1, state.round - 1),
            };
          }
          return { currentTurnIndex: state.currentTurnIndex - 1 };
        }),

      setRound: (round) => set({ round }),

      startCombat: () =>
        set((state) => {
          const sorted = [...state.combatants].sort((a, b) => b.initiative - a.initiative);
          return { combatants: sorted, currentTurnIndex: 0, round: 1, isRunning: true };
        }),

      endCombat: () => set({ isRunning: false, currentTurnIndex: 0, round: 1 }),

      applyDamage: (id, amount) =>
        set((state) => ({
          combatants: state.combatants.map((c) => {
            if (c.id !== id) return c;
            const newHp = Math.max(0, c.hpCurrent - amount);
            return { ...c, hpCurrent: newHp };
          }),
        })),

      applyHealing: (id, amount) =>
        set((state) => ({
          combatants: state.combatants.map((c) => {
            if (c.id !== id) return c;
            const newHp = Math.min(c.hpMax, c.hpCurrent + amount);
            return { ...c, hpCurrent: newHp };
          }),
        })),

      toggleCondition: (id, condition) =>
        set((state) => ({
          combatants: state.combatants.map((c) => {
            if (c.id !== id) return c;
            const has = c.conditions.includes(condition);
            return {
              ...c,
              conditions: has
                ? c.conditions.filter((cond) => cond !== condition)
                : [...c.conditions, condition],
            };
          }),
        })),

      clearCombatants: () =>
        set({ combatants: [], currentTurnIndex: 0, round: 1, isRunning: false }),
    }),
    {
      name: "arcane-atlas:dm-encounter",
    }
  )
);

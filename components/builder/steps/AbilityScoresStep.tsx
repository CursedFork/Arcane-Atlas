"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ABILITY_KEYS, type AbilityScores, type AbilityKey } from "@/lib/schemas/character";
import {
  STANDARD_ARRAY,
  POINT_BUY_TOTAL,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  scoreCost,
  pointsSpent,
  canIncrement,
  canDecrement,
} from "@/lib/pointBuy";
import { abilityModifier, formatModifier, cn } from "@/lib/utils";

const ABILITY_NAMES: Record<AbilityKey, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

const ABILITY_ABBREV: Record<AbilityKey, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

const STANDARD_ARRAY_LABELS = ["15", "14", "13", "12", "10", "8"];

export function AbilityScoresStep() {
  const { abilityScoreMethod, baseAbilityScores, setAbilityScoreMethod, setBaseAbilityScores, nextStep, getFinalAbilityScores } =
    useBuilderStore();

  // Standard array assignment: which array index is assigned to which ability
  const [standardAssign, setStandardAssign] = useState<Record<AbilityKey, number | null>>(
    () => {
      const result: Record<AbilityKey, number | null> = {} as Record<AbilityKey, number | null>;
      for (const key of ABILITY_KEYS) result[key] = null;
      return result;
    }
  );

  const finalScores = getFinalAbilityScores();

  const handleStandardAssign = (ability: AbilityKey, idx: number) => {
    const current = { ...standardAssign };
    // Remove any previous assignment of this value
    for (const k of ABILITY_KEYS) {
      if (current[k] === idx) current[k] = null;
    }
    current[ability] = current[ability] === idx ? null : idx;
    setStandardAssign(current);

    // Update base scores
    const newScores: AbilityScores = { ...baseAbilityScores };
    for (const k of ABILITY_KEYS) {
      const assignedIdx = current[k];
      newScores[k] = assignedIdx !== null ? (STANDARD_ARRAY[assignedIdx] ?? 8) : 8;
    }
    setBaseAbilityScores(newScores);
  };

  const handlePointBuyChange = (ability: AbilityKey, delta: number) => {
    const current = baseAbilityScores[ability];
    const next = current + delta;
    const spent = pointsSpent(ABILITY_KEYS.map((k) => baseAbilityScores[k]));
    if (delta > 0 && !canIncrement(current, spent)) return;
    if (delta < 0 && !canDecrement(current)) return;
    setBaseAbilityScores({ ...baseAbilityScores, [ability]: next });
  };

  const handleManualChange = (ability: AbilityKey, value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    setBaseAbilityScores({ ...baseAbilityScores, [ability]: Math.min(30, Math.max(1, n)) });
  };

  const pbSpent = pointsSpent(ABILITY_KEYS.map((k) => baseAbilityScores[k]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Ability Scores</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Determine your character&apos;s six ability scores. Racial bonuses are shown in the preview.
        </p>
      </div>

      {/* Method selector */}
      <div className="flex gap-2">
        {(["standard", "pointbuy", "manual"] as const).map((method) => (
          <button
            key={method}
            onClick={() => setAbilityScoreMethod(method)}
            className={cn(
              "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              abilityScoreMethod === method
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
            )}
          >
            {method === "standard" ? "Standard Array" : method === "pointbuy" ? "Point Buy" : "Manual Entry"}
          </button>
        ))}
      </div>

      {/* Standard Array */}
      {abilityScoreMethod === "standard" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assign each value from the standard array{" "}
            <span className="font-mono text-foreground">({STANDARD_ARRAY.join(", ")})</span> to
            one ability score.
          </p>
          {/* Available values */}
          <div className="flex gap-2 flex-wrap">
            {STANDARD_ARRAY.map((val, idx) => {
              const isAssigned = Object.values(standardAssign).includes(idx);
              return (
                <span
                  key={idx}
                  className={cn(
                    "rounded border px-3 py-1.5 text-sm font-mono",
                    isAssigned
                      ? "border-border/30 bg-muted text-muted-foreground line-through"
                      : "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  {val}
                </span>
              );
            })}
          </div>
          <div className="grid gap-3">
            {ABILITY_KEYS.map((key) => {
              const assignedIdx = standardAssign[key];
              const assignedVal = assignedIdx !== null ? STANDARD_ARRAY[assignedIdx] : null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium text-foreground">{ABILITY_NAMES[key]}</span>
                  <div className="flex gap-1 flex-wrap flex-1">
                    {STANDARD_ARRAY.map((val, idx) => {
                      const taken = Object.entries(standardAssign)
                        .some(([k, v]) => k !== key && v === idx);
                      return (
                        <button
                          key={idx}
                          disabled={taken}
                          onClick={() => handleStandardAssign(key, idx)}
                          className={cn(
                            "w-8 h-8 rounded border text-sm font-mono transition-colors",
                            assignedIdx === idx
                              ? "border-primary bg-primary text-primary-foreground"
                              : taken
                              ? "border-border/30 bg-muted text-muted-foreground cursor-not-allowed"
                              : "border-border bg-secondary hover:border-primary/50 text-foreground"
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="stat-box w-20 text-center">
                    <span className="text-[10px] uppercase text-muted-foreground">{ABILITY_ABBREV[key]}</span>
                    <span className="font-bold text-lg leading-none">{assignedVal ?? "—"}</span>
                    <span className="text-xs text-primary">
                      {assignedVal ? formatModifier(abilityModifier(finalScores[key])) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Point Buy */}
      {abilityScoreMethod === "pointbuy" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Distribute <span className="text-foreground font-semibold">{POINT_BUY_TOTAL}</span> points
              (scores {POINT_BUY_MIN}–{POINT_BUY_MAX}).
            </p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-bold",
                pbSpent > POINT_BUY_TOTAL
                  ? "bg-destructive/20 text-destructive"
                  : "bg-primary/20 text-primary"
              )}
            >
              {POINT_BUY_TOTAL - pbSpent} pts remaining
            </span>
          </div>
          <div className="grid gap-3">
            {ABILITY_KEYS.map((key) => {
              const score = baseAbilityScores[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium text-foreground">{ABILITY_NAMES[key]}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => handlePointBuyChange(key, -1)}
                      disabled={!canDecrement(score)}
                      className="w-8 h-8 rounded border border-border bg-secondary text-foreground disabled:opacity-40 hover:border-primary/50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-foreground">{score}</span>
                    <button
                      onClick={() => handlePointBuyChange(key, +1)}
                      disabled={!canIncrement(score, pbSpent)}
                      className="w-8 h-8 rounded border border-border bg-secondary text-foreground disabled:opacity-40 hover:border-primary/50 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Cost: {scoreCost(score)} pt{scoreCost(score) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="stat-box w-20 text-center">
                    <span className="text-[10px] uppercase text-muted-foreground">{ABILITY_ABBREV[key]}</span>
                    <span className="font-bold text-lg leading-none">{finalScores[key]}</span>
                    <span className="text-xs text-primary">{formatModifier(abilityModifier(finalScores[key]))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Entry */}
      {abilityScoreMethod === "manual" && (
        <div className="grid gap-3">
          {ABILITY_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-foreground">{ABILITY_NAMES[key]}</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={baseAbilityScores[key]}
                onChange={(e) => handleManualChange(key, e.target.value)}
                className="w-20 font-mono"
              />
              <div className="stat-box w-20 text-center">
                <span className="text-[10px] uppercase text-muted-foreground">{ABILITY_ABBREV[key]}</span>
                <span className="font-bold text-lg leading-none">{finalScores[key]}</span>
                <span className="text-xs text-primary">{formatModifier(abilityModifier(finalScores[key]))}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={nextStep} variant="gold" className="w-full">
        Continue &rarr;
      </Button>
    </div>
  );
}

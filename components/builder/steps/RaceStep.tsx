"use client";

import { useState } from "react";
import { SRD_RACES, type SRDRace } from "@/lib/srd/races";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ABILITY_KEYS } from "@/lib/schemas/character";
import { useHomebrewStore } from "@/store/homebrewStore";

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

export function RaceStep() {
  const { race, subrace, flexibleBoosts, setRace, nextStep } = useBuilderStore();
  const homebrewRaces = useHomebrewStore((s) => s.races);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedSubrace, setSelectedSubrace] = useState(subrace);
  const [localFlexible, setLocalFlexible] = useState<Record<string, number>>(flexibleBoosts);

  const allRaces = [...SRD_RACES.map((r) => ({ ...r, isHomebrew: false }))];

  function handleSelect(r: SRDRace & { isHomebrew: boolean }) {
    setExpanded(r.slug);
    setSelectedSubrace("");
    setLocalFlexible({});
  }

  function handleConfirm(r: SRDRace & { isHomebrew: boolean }) {
    setRace(r.slug, selectedSubrace, localFlexible);
    nextStep();
  }

  function getAbilityText(r: SRDRace & { isHomebrew?: boolean }) {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(r.abilityScoreIncrease)) {
      if (val) parts.push(`+${val} ${ABILITY_ABBREV[key] ?? key}`);
    }
    if (r.flexibleAbilityBoosts) {
      parts.push(`+${r.flexibleAbilityBoosts.amount} to ${r.flexibleAbilityBoosts.count} ability scores of your choice`);
    }
    return parts.join(", ") || "None";
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">Choose Your Race</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your race determines some of your character's traits and capabilities.
        </p>
      </div>

      <div className="space-y-3">
        {allRaces.map((r) => {
          const isSelected = race === r.slug;
          const isExpanded = expanded === r.slug;

          return (
            <div
              key={r.slug}
              className={cn(
                "rounded-lg border transition-colors",
                isSelected ? "border-primary/60 bg-primary/5" : "border-border bg-card",
              )}
            >
              {/* Race header */}
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(isExpanded ? null : r.slug)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.size} · Speed {r.speed} ft · {getAbilityText(r)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Badge variant="gold" className="text-[10px]">Selected</Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  <p className="text-sm text-muted-foreground">{r.desc}</p>

                  {/* Traits */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Racial Traits
                    </p>
                    <ul className="space-y-1">
                      {r.traits.map((t) => (
                        <li key={t.name} className="text-sm">
                          <span className="font-medium text-foreground">{t.name}.</span>{" "}
                          <span className="text-muted-foreground">{t.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Flexible boosts (Half-Elf) */}
                  {r.flexibleAbilityBoosts && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Choose {r.flexibleAbilityBoosts.count} Ability Score{r.flexibleAbilityBoosts.count > 1 ? "s" : ""} to increase by +{r.flexibleAbilityBoosts.amount}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ABILITY_KEYS.filter((k) => !(k in r.abilityScoreIncrease) || r.abilityScoreIncrease[k] === 0).map((key) => {
                          const chosen = Object.keys(localFlexible).includes(key);
                          const canSelect =
                            !chosen &&
                            Object.keys(localFlexible).length < r.flexibleAbilityBoosts!.count;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                if (chosen) {
                                  const next = { ...localFlexible };
                                  delete next[key];
                                  setLocalFlexible(next);
                                } else if (canSelect) {
                                  setLocalFlexible({ ...localFlexible, [key]: r.flexibleAbilityBoosts!.amount });
                                }
                              }}
                              className={cn(
                                "rounded border px-2 py-1 text-xs uppercase tracking-wider transition-colors",
                                chosen
                                  ? "border-primary bg-primary/20 text-primary"
                                  : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              {ABILITY_ABBREV[key]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subraces */}
                  {r.subraces.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Subrace
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {r.subraces.map((sr) => (
                          <button
                            key={sr.slug}
                            onClick={() => setSelectedSubrace(sr.slug)}
                            className={cn(
                              "rounded border p-2 text-left text-sm transition-colors",
                              selectedSubrace === sr.slug
                                ? "border-primary bg-primary/15 text-foreground"
                                : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                            )}
                          >
                            <span className="font-medium block">{sr.name}</span>
                            <span className="text-xs">
                              {Object.entries(sr.abilityScoreIncrease)
                                .filter(([, v]) => v)
                                .map(([k, v]) => `+${v} ${ABILITY_ABBREV[k] ?? k}`)
                                .join(", ")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleConfirm(r)}
                    disabled={
                      (r.subraces.length > 0 && !selectedSubrace) ||
                      (r.flexibleAbilityBoosts
                        ? Object.keys(localFlexible).length !== r.flexibleAbilityBoosts.count
                        : false)
                    }
                    className="w-full"
                    variant="gold"
                  >
                    Select {r.name}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SRD_CLASSES } from "@/lib/srd/classes";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

const HIT_DIE_COLOR: Record<number, string> = {
  6: "text-red-400",
  8: "text-orange-400",
  10: "text-yellow-400",
  12: "text-green-400",
};

export function ClassStep() {
  const { classSlug, setClass, nextStep } = useBuilderStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">Choose Your Class</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your class is the primary definition of what your character can do.
        </p>
      </div>

      <div className="space-y-3">
        {SRD_CLASSES.map((cls) => {
          const isSelected = classSlug === cls.slug;
          const isExpanded = expanded === cls.slug;

          return (
            <div
              key={cls.slug}
              className={cn(
                "rounded-lg border transition-colors",
                isSelected ? "border-primary/60 bg-primary/5" : "border-border bg-card"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(isExpanded ? null : cls.slug)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{cls.name}</span>
                      {cls.isSpellcaster && (
                        <Zap className="h-3 w-3 text-primary" aria-label="Spellcaster" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      d{cls.hitDie} Hit Die ·{" "}
                      <span className={HIT_DIE_COLOR[cls.hitDie] ?? ""}>{cls.primaryAbility}</span>
                      {" · "}Saves: {cls.savingThrows.join(", ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSelected && <Badge variant="gold" className="text-[10px]">Selected</Badge>}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  {/* Proficiencies */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Armor
                      </p>
                      <p className="text-foreground">
                        {cls.armorProficiencies.join(", ") || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Weapons
                      </p>
                      <p className="text-foreground">
                        {cls.weaponProficiencies.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Skills
                      </p>
                      <p className="text-foreground">
                        Choose {cls.skillChoices.count} from {cls.skillChoices.from.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Subclass
                      </p>
                      <p className="text-foreground">
                        {cls.subclassTitle} at Level {cls.subclassLevel}
                      </p>
                    </div>
                  </div>

                  {/* L1 Features */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Level 1 Features
                    </p>
                    <ul className="space-y-1">
                      {cls.level1Features.map((f) => (
                        <li key={f.name} className="text-sm">
                          <span className="font-medium text-foreground">{f.name}.</span>{" "}
                          <span className="text-muted-foreground">{f.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Starting equipment */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Starting Equipment
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
                      {cls.startingEquipmentOptions.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => {
                      setClass(cls.slug);
                      nextStep();
                    }}
                    variant="gold"
                    className="w-full"
                  >
                    Select {cls.name}
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

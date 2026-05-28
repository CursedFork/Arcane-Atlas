"use client";

import { useState } from "react";
import { SRD_BACKGROUNDS } from "@/lib/srd/backgrounds";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export function BackgroundStep() {
  const { background, setBackground, nextStep } = useBuilderStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">Choose Your Background</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your background defines your character's history and provides skill proficiencies and a special feature.
        </p>
      </div>

      <div className="space-y-2">
        {SRD_BACKGROUNDS.map((bg) => {
          const isSelected = background === bg.slug;
          const isExpanded = expanded === bg.slug;

          return (
            <div
              key={bg.slug}
              className={cn(
                "rounded-lg border transition-colors",
                isSelected ? "border-primary/60 bg-primary/5" : "border-border bg-card"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(isExpanded ? null : bg.slug)}
                aria-expanded={isExpanded}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{bg.name}</span>
                    {isSelected && <Badge variant="gold" className="text-[10px]">Selected</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Skills: {bg.skillProficiencies.join(", ")}
                    {bg.languages > 0 && ` · ${bg.languages} language${bg.languages > 1 ? "s" : ""}`}
                    {bg.toolProficiencies.length > 0 && ` · ${bg.toolProficiencies.join(", ")}`}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  <p className="text-sm text-muted-foreground">{bg.desc}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Skill Proficiencies
                      </p>
                      <p>{bg.skillProficiencies.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Equipment
                      </p>
                      <p className="text-muted-foreground">{bg.equipment.join(", ")}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Feature: {bg.feature.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{bg.feature.desc}</p>
                  </div>

                  <Button
                    onClick={() => {
                      setBackground(bg.slug);
                      nextStep();
                    }}
                    variant="gold"
                    className="w-full"
                  >
                    Select {bg.name}
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

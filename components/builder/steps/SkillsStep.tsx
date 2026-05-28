"use client";

import { useBuilderStore } from "@/store/builderStore";
import { getClass } from "@/lib/srd/classes";
import { getBackground } from "@/lib/srd/backgrounds";
import { Button } from "@/components/ui/button";
import { ALL_SKILLS, SKILL_ABILITY } from "@/lib/srd/index";
import { cn } from "@/lib/utils";

export function SkillsStep() {
  const { classSlug, background, chosenSkills, setChosenSkills, nextStep } = useBuilderStore();
  const classData = getClass(classSlug);
  const bgData = getBackground(background);

  const fromBg = bgData?.skillProficiencies ?? [];
  const available = classData?.skillChoices.from ?? [...ALL_SKILLS];
  const needed = classData?.skillChoices.count ?? 2;
  const chosen = chosenSkills.filter((s) => !fromBg.includes(s));

  const toggle = (skill: string) => {
    if (fromBg.includes(skill)) return;
    const isChosen = chosen.includes(skill);
    if (isChosen) {
      setChosenSkills([...fromBg, ...chosen.filter((s) => s !== skill)]);
    } else if (chosen.length < needed) {
      setChosenSkills([...fromBg, ...chosen, skill]);
    }
  };

  const allProficient = [...new Set([...fromBg, ...chosenSkills])];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">Skills &amp; Proficiencies</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Choose {needed} skill{needed !== 1 ? "s" : ""} from your class list.
          Background skills are automatically included.
        </p>
      </div>

      {fromBg.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            From Background ({bgData?.name})
          </p>
          <div className="flex flex-wrap gap-2">
            {fromBg.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Choose {needed} from class ({classData?.name ?? "—"}): {chosen.length}/{needed} selected
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {available.map((skill) => {
            const isFromBg = fromBg.includes(skill);
            const isChosen = chosen.includes(skill);
            const isDisabled = !isFromBg && !isChosen && chosen.length >= needed;

            return (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                disabled={isFromBg || isDisabled}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm text-left transition-colors",
                  isFromBg
                    ? "border-primary/30 bg-primary/5 text-primary/70 cursor-default"
                    : isChosen
                    ? "border-primary/60 bg-primary/15 text-foreground"
                    : isDisabled
                    ? "border-border/30 bg-muted text-muted-foreground/50 cursor-not-allowed"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                <span className="font-medium">{skill}</span>
                <span className="text-xs block text-muted-foreground">
                  {SKILL_ABILITY[skill]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {allProficient.length > 0 && (
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">All proficiencies:</p>
          <p className="text-sm text-foreground">{allProficient.join(", ")}</p>
        </div>
      )}

      <Button
        onClick={() => {
          setChosenSkills([...fromBg, ...chosen]);
          nextStep();
        }}
        disabled={chosen.length < needed}
        variant="gold"
        className="w-full"
      >
        Continue &rarr;
      </Button>
    </div>
  );
}

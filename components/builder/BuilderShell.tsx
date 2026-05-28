"use client";

import { useBuilderStore, BUILDER_STEPS } from "@/store/builderStore";
import { CharacterPreview } from "./CharacterPreview";
import { RaceStep } from "./steps/RaceStep";
import { ClassStep } from "./steps/ClassStep";
import { SubclassStep } from "./steps/SubclassStep";
import { AbilityScoresStep } from "./steps/AbilityScoresStep";
import { BackgroundStep } from "./steps/BackgroundStep";
import { SkillsStep } from "./steps/SkillsStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { SpellsStep } from "./steps/SpellsStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const STEP_COMPONENTS = [
  RaceStep,
  ClassStep,
  SubclassStep,
  AbilityScoresStep,
  BackgroundStep,
  SkillsStep,
  EquipmentStep,
  SpellsStep,
  DetailsStep,
  ReviewStep,
];

export function BuilderShell() {
  const { step, setStep, prevStep } = useBuilderStore();
  const CurrentStep = STEP_COMPONENTS[step] ?? RaceStep;

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar — steps nav */}
      <aside className="hidden lg:flex w-48 shrink-0 flex-col border-r border-border bg-card/50 py-4">
        <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Character Creation
        </p>
        <nav className="flex flex-col gap-0.5 px-2" aria-label="Builder steps">
          {BUILDER_STEPS.map((name, idx) => (
            <button
              key={name}
              onClick={() => idx <= step && setStep(idx)}
              disabled={idx > step}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                idx === step
                  ? "bg-primary/15 text-primary font-medium"
                  : idx < step
                  ? "text-foreground hover:bg-secondary"
                  : "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0",
                  idx === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : idx < step
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-border text-muted-foreground"
                )}
              >
                {idx < step ? "✓" : idx + 1}
              </span>
              {name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl">
            {/* Mobile step indicator */}
            <div className="lg:hidden flex items-center gap-3 mb-4">
              {step > 0 && (
                <Button onClick={prevStep} size="sm" variant="ghost" className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Step {step + 1} of {BUILDER_STEPS.length}: {BUILDER_STEPS[step]}
              </span>
            </div>

            {/* Step progress bar (mobile) */}
            <div className="lg:hidden mb-4 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((step + 1) / BUILDER_STEPS.length) * 100}%` }}
              />
            </div>

            <CurrentStep />
          </div>
        </ScrollArea>

        {/* Character preview panel */}
        <aside className="hidden xl:block w-64 shrink-0 border-l border-border bg-card/30 p-4 overflow-y-auto">
          <CharacterPreview />
        </aside>
      </div>
    </div>
  );
}

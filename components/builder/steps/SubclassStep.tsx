"use client";

import { getClass } from "@/lib/srd/classes";
import { useBuilderStore } from "@/store/builderStore";
import { useHomebrewStore } from "@/store/homebrewStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function SubclassStep() {
  const { classSlug, subclass, level, setSubclass, nextStep } = useBuilderStore();
  const homebrewSubclasses = useHomebrewStore((s) => s.subclasses);
  const classData = getClass(classSlug);

  if (!classData) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">Subclass</h2>
        <p className="text-muted-foreground">Please select a class first.</p>
      </div>
    );
  }

  const unlocked = level >= classData.subclassLevel;

  if (!unlocked) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">
          {classData.subclassTitle}
        </h2>
        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">
            {classData.subclassTitle} unlocks at Level {classData.subclassLevel}
          </p>
          <p className="text-sm text-muted-foreground">
            Your {classData.name} will choose a {classData.subclassTitle} when they reach
            level {classData.subclassLevel}. For now, continue building your character.
          </p>
          <Button onClick={nextStep} variant="outline" className="mt-2">
            Continue &rarr;
          </Button>
        </div>
      </div>
    );
  }

  // Merge SRD + homebrew subclasses for this class.
  const matchingHB = homebrewSubclasses.filter(
    (sc) => sc.className.toLowerCase() === classData.name.toLowerCase(),
  );

  type DisplaySubclass = { slug: string; name: string; desc: string; isHomebrew: boolean };
  const allSubclasses: DisplaySubclass[] = [
    ...classData.subclasses.map((sc) => ({ ...sc, isHomebrew: false })),
    ...matchingHB.map((sc) => ({
      slug: sc.slug,
      name: sc.name,
      desc: sc.desc || sc.features || "",
      isHomebrew: true,
    })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">
          {classData.subclassTitle}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Choose your {classData.name}&apos;s {classData.subclassTitle}.
        </p>
      </div>

      <div className="space-y-3">
        {allSubclasses.map((sc) => (
          <button
            key={sc.slug}
            onClick={() => setSubclass(sc.slug)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors",
              subclass === sc.slug
                ? "border-primary/60 bg-primary/10"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <p className="font-semibold text-foreground flex items-center gap-2">
              {sc.name}
              {sc.isHomebrew && <span className="badge-homebrew text-[10px]">HB</span>}
            </p>
            {sc.desc && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{sc.desc}</p>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={nextStep}
        disabled={!subclass}
        variant="gold"
        className="w-full"
      >
        Continue &rarr;
      </Button>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { useHomebrewStore } from "@/store/homebrewStore";
import { getClass } from "@/lib/srd/classes";
import { isSpellcaster, cantripsKnown, spellsKnown } from "@/lib/spellSlots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, BookOpen } from "lucide-react";
import spellsData from "@/data/srd/spells.json";
import { type Spell } from "@/lib/schemas/spell";

export function SpellsStep() {
  const {
    classSlug, level, chosenCantrips, chosenSpells,
    setChosenCantrips, setChosenSpells, nextStep,
  } = useBuilderStore();
  const homebrewSpells = useHomebrewStore((s) => s.spells);

  const classData = getClass(classSlug);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"cantrip" | "spell">("cantrip");

  if (!classData || !isSpellcaster(classSlug)) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">Spells</h2>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">{classData?.name ?? "This class"} does not cast spells</p>
          <p className="text-sm text-muted-foreground mt-1">You can skip this step.</p>
          <Button onClick={nextStep} variant="outline" className="mt-4">
            Continue &rarr;
          </Button>
        </div>
      </div>
    );
  }

  const className = classData.name.toLowerCase();
  const allSpells: Spell[] = [
    ...(spellsData as Spell[]),
    ...homebrewSpells.map((s) => ({
      ...s,
      ritual: s.ritual,
      concentration: s.concentration,
      higher_level: s.higher_level,
      material: s.material,
      archetype: "",
      circles: "",
      isHomebrew: true as const,
    })),
  ];

  const matchesClass = (spell: Spell) => {
    const classes = spell.dnd_class.toLowerCase();
    return classes.includes(className) || classes.includes("all");
  };

  const cantrips = allSpells.filter(
    (s) => s.level_int === 0 && matchesClass(s)
  );
  const spells = allSpells.filter(
    (s) => s.level_int === 1 && matchesClass(s)
  );

  const maxCantrips = cantripsKnown(classSlug, level);
  const maxSpells = spellsKnown(classSlug, level) ?? 0;
  const isPrepared = maxSpells === 0 && isSpellcaster(classSlug);

  const filtered = (filter === "cantrip" ? cantrips : spells).filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (slug: string, type: "cantrip" | "spell") => {
    if (type === "cantrip") {
      const has = chosenCantrips.includes(slug);
      if (has) {
        setChosenCantrips(chosenCantrips.filter((s) => s !== slug));
      } else if (chosenCantrips.length < maxCantrips) {
        setChosenCantrips([...chosenCantrips, slug]);
      }
    } else {
      const has = chosenSpells.includes(slug);
      if (has) {
        setChosenSpells(chosenSpells.filter((s) => s !== slug));
      } else if (maxSpells === 0 || chosenSpells.length < maxSpells) {
        setChosenSpells([...chosenSpells, slug]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground">
          <Zap className="inline h-5 w-5 text-primary mr-2" />
          Spells
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {classData.name} uses {classData.spellcastingAbility} as their spellcasting ability.
          {maxSpells > 0 && ` Known spells at level ${level}: ${maxSpells}.`}
          {isPrepared && " You prepare spells from the full class list (shown below — select favorites)."}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("cantrip")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            filter === "cantrip"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-secondary text-muted-foreground"
          )}
        >
          Cantrips ({chosenCantrips.length}/{maxCantrips})
        </button>
        <button
          onClick={() => setFilter("spell")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            filter === "spell"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-secondary text-muted-foreground"
          )}
        >
          1st-level Spells{maxSpells > 0 && ` (${chosenSpells.length}/${maxSpells})`}
          {isPrepared && " (select favorites)"}
        </button>
      </div>

      <Input
        placeholder="Search spells..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No spells found.</p>
        )}
        {filtered.map((spell) => {
          const isChosen =
            filter === "cantrip"
              ? chosenCantrips.includes(spell.slug)
              : chosenSpells.includes(spell.slug);
          const isDisabled =
            !isChosen &&
            (filter === "cantrip"
              ? chosenCantrips.length >= maxCantrips
              : maxSpells > 0 && chosenSpells.length >= maxSpells);

          return (
            <div
              key={spell.slug}
              className={cn(
                "rounded-lg border p-3 transition-colors cursor-pointer",
                isChosen
                  ? "border-primary/60 bg-primary/10"
                  : isDisabled
                  ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-60"
                  : "border-border bg-card hover:border-primary/40"
              )}
              onClick={() => !isDisabled && toggle(spell.slug, filter)}
              role="checkbox"
              aria-checked={isChosen}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm">{spell.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {spell.school}
                    </Badge>
                    {spell.concentration === "yes" && (
                      <Badge variant="secondary" className="text-[10px] py-0">Conc.</Badge>
                    )}
                    {spell.ritual === "yes" && (
                      <Badge variant="secondary" className="text-[10px] py-0">Ritual</Badge>
                    )}
                    {spell.isHomebrew && (
                      <span className="badge-homebrew">HB</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {spell.casting_time} · {spell.range} · {spell.duration}
                    {" · "}{spell.components}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{spell.desc}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                    isChosen ? "border-primary bg-primary" : "border-border"
                  )}
                >
                  {isChosen && <span className="text-primary-foreground text-[10px]">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={nextStep} variant="gold" className="w-full">
        Continue &rarr;
      </Button>
    </div>
  );
}

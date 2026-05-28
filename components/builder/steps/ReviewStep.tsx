"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRace } from "@/lib/srd/races";
import { getClass } from "@/lib/srd/classes";
import { getBackground } from "@/lib/srd/backgrounds";
import { abilityModifier, formatModifier } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";
import { saveCharacter, exportCharacterJSON } from "@/lib/storage";
import { proficiencyBonus } from "@/lib/characterMath";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PDFExportButton = dynamic(
  () => import("@/components/PDFExport").then((m) => m.PDFExportButton),
  { ssr: false }
);

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

export function ReviewStep() {
  const store = useBuilderStore();
  const router = useRouter();
  const [error, setError] = useState("");

  const finalScores = store.getFinalAbilityScores();
  const raceData = getRace(store.race);
  const classData = getClass(store.classSlug);
  const bgData = getBackground(store.background);
  const character = store.buildCharacter();

  const handleSave = () => {
    try {
      saveCharacter(character);
      store.resetBuilder();
      router.push("/characters");
    } catch {
      setError("Failed to save character. Check localStorage availability.");
    }
  };

  const handleExportJSON = () => {
    exportCharacterJSON(character);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Review Your Character</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Check the details below, then save or export your character.
        </p>
      </div>

      {/* Identity */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="font-display text-lg text-primary">Identity</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{store.name || "—"}</span></div>
          <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground font-medium">{store.level}</span></div>
          <div><span className="text-muted-foreground">Race:</span> <span className="text-foreground font-medium">{raceData?.name ?? "—"}{store.subrace && ` (${raceData?.subraces.find(s=>s.slug===store.subrace)?.name})`}</span></div>
          <div><span className="text-muted-foreground">Class:</span> <span className="text-foreground font-medium">{classData?.name ?? "—"}{store.subclass && ` — ${classData?.subclasses.find(s=>s.slug===store.subclass)?.name}`}</span></div>
          <div><span className="text-muted-foreground">Background:</span> <span className="text-foreground font-medium">{bgData?.name ?? "—"}</span></div>
          <div><span className="text-muted-foreground">Alignment:</span> <span className="text-foreground font-medium">{store.alignment}</span></div>
          <div><span className="text-muted-foreground">Proficiency Bonus:</span> <span className="text-foreground font-medium">+{proficiencyBonus(store.level)}</span></div>
          <div><span className="text-muted-foreground">HP:</span> <span className="text-foreground font-medium">{character.hp.max}</span></div>
        </div>
      </section>

      {/* Ability Scores */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-lg text-primary mb-3">Ability Scores</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ABILITY_KEYS.map((key) => (
            <div key={key} className="stat-box text-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {ABILITY_ABBREV[key]}
              </span>
              <span className="text-xl font-bold text-foreground leading-none">
                {finalScores[key]}
              </span>
              <span className="text-sm text-primary">
                {formatModifier(abilityModifier(finalScores[key]))}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      {store.chosenSkills.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-lg text-primary mb-2">Skill Proficiencies</h3>
          <div className="flex flex-wrap gap-1.5">
            {store.chosenSkills.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Spells */}
      {(store.chosenCantrips.length > 0 || store.chosenSpells.length > 0) && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-lg text-primary mb-2">Spells</h3>
          {store.chosenCantrips.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cantrips</p>
              <div className="flex flex-wrap gap-1.5">
                {store.chosenCantrips.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            </div>
          )}
          {store.chosenSpells.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Known Spells</p>
              <div className="flex flex-wrap gap-1.5">
                {store.chosenSpells.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Equipment */}
      {store.chosenEquipment.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-lg text-primary mb-2">Equipment</h3>
          <ul className="space-y-0.5 text-sm text-muted-foreground">
            {store.chosenEquipment.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} variant="gold" className="flex-1">
          Save to Library
        </Button>
        <Button onClick={handleExportJSON} variant="outline" className="flex-1">
          Export JSON
        </Button>
        <PDFExportButton character={character} />
      </div>
    </div>
  );
}

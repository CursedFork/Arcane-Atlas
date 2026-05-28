"use client";

import { useBuilderStore } from "@/store/builderStore";
import { getRace } from "@/lib/srd/races";
import { getClass } from "@/lib/srd/classes";
import { getBackground } from "@/lib/srd/backgrounds";
import { abilityModifier, formatModifier, capitalize } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

export function CharacterPreview() {
  const store = useBuilderStore();
  const finalScores = store.getFinalAbilityScores();

  const raceData = getRace(store.race);
  const classData = getClass(store.classSlug);
  const bgData = getBackground(store.background);

  const displayName = store.name || "Unnamed Hero";
  const displayRace = raceData
    ? (store.subrace
        ? raceData.subraces.find((s) => s.slug === store.subrace)?.name ?? raceData.name
        : raceData.name)
    : "—";
  const displayClass = classData?.name ?? "—";
  const displayBg = bgData?.name ?? "—";

  return (
    <aside className="w-full space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-xl text-primary truncate">{displayName}</h2>
        <p className="text-muted-foreground mt-0.5">
          Level {store.level} {displayRace} {displayClass}
        </p>
        {store.background && (
          <p className="text-xs text-muted-foreground">{displayBg} Background</p>
        )}
      </div>

      <div className="divider-gold" />

      {/* Ability scores */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Ability Scores
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ABILITY_KEYS.map((key) => {
            const score = finalScores[key];
            const mod = abilityModifier(score);
            return (
              <div key={key} className="stat-box text-center">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {ABILITY_ABBREV[key]}
                </span>
                <span className="text-lg font-bold text-foreground leading-none">{score}</span>
                <span className="text-xs text-primary">{formatModifier(mod)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      {store.chosenSkills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {store.chosenSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spells */}
      {(store.chosenCantrips.length > 0 || store.chosenSpells.length > 0) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Spells
          </p>
          {store.chosenCantrips.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground">{store.chosenCantrips.length}</span> cantrip
              {store.chosenCantrips.length !== 1 ? "s" : ""}
            </p>
          )}
          {store.chosenSpells.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground">{store.chosenSpells.length}</span> spell
              {store.chosenSpells.length !== 1 ? "s" : ""} known
            </p>
          )}
        </div>
      )}

      {/* Alignment */}
      {store.alignment && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Alignment
          </p>
          <p className="text-xs">{store.alignment}</p>
        </div>
      )}
    </aside>
  );
}

"use client";

import { type Character } from "@/lib/schemas/character";
import { getRace } from "@/lib/srd/races";
import { getClass } from "@/lib/srd/classes";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Download } from "lucide-react";
import { exportCharacterJSON } from "@/lib/storage";
import { abilityModifier, formatModifier } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";
import { proficiencyBonus } from "@/lib/characterMath";
import dynamic from "next/dynamic";

const PDFExportButton = dynamic(
  () => import("@/components/PDFExport").then((m) => m.PDFExportButton),
  { ssr: false }
);

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

export function CharacterCard({ character, onDelete, onDuplicate }: CharacterCardProps) {
  const race = getRace(character.race);
  const cls = getClass(character.classSlug);

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-foreground">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              Level {character.level} {race?.name ?? character.race} {cls?.name ?? character.classSlug}
            </p>
            <p className="text-xs text-muted-foreground">{character.alignment}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">HP</p>
            <p className="font-bold text-foreground">{character.hp.max}</p>
            <p className="text-xs text-muted-foreground">PB +{proficiencyBonus(character.level)}</p>
          </div>
        </div>

        {/* Ability scores mini */}
        <div className="grid grid-cols-6 gap-1">
          {ABILITY_KEYS.map((key) => {
            const score = character.finalAbilityScores[key];
            return (
              <div key={key} className="text-center bg-secondary rounded-sm py-1">
                <p className="text-[9px] uppercase text-muted-foreground">{ABILITY_ABBREV[key]}</p>
                <p className="text-xs font-bold text-foreground leading-none">{score}</p>
                <p className="text-[10px] text-primary">{formatModifier(abilityModifier(score))}</p>
              </div>
            );
          })}
        </div>

        {/* Skills summary */}
        {character.skillProficiencies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.skillProficiencies.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
            ))}
            {character.skillProficiencies.length > 5 && (
              <Badge variant="outline" className="text-[10px]">
                +{character.skillProficiencies.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 gap-2 flex-wrap">
        <Button
          onClick={() => exportCharacterJSON(character)}
          size="sm"
          variant="outline"
          className="gap-1"
        >
          <Download className="h-3.5 w-3.5" />JSON
        </Button>
        <PDFExportButton character={character} />
        <Button
          onClick={() => onDuplicate(character.id)}
          size="sm"
          variant="ghost"
          className="gap-1"
        >
          <Copy className="h-3.5 w-3.5" />Copy
        </Button>
        <Button
          onClick={() => onDelete(character.id)}
          size="sm"
          variant="ghost"
          className="gap-1 text-destructive hover:text-destructive ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

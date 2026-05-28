"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import spellsData from "@/data/srd/spells.json";
import monstersData from "@/data/srd/monsters.json";
import { type Spell } from "@/lib/schemas/spell";
import { type Monster } from "@/lib/schemas/monster";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { abilityModifier, formatModifier } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";

const allSpells = spellsData as Spell[];
const allMonsters = monstersData as unknown as Monster[];

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

export function SpellMonsterLookup() {
  const [tab, setTab] = useState<"spells" | "monsters">("spells");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredSpells = allSpells
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20);

  const filteredMonsters = allMonsters
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20);

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <h2 className="font-display text-lg text-primary shrink-0">Lookup</h2>

      <div className="flex gap-1 shrink-0">
        {(["spells", "monsters"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); setExpanded(null); }}
            className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
              tab === t
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Input
        placeholder={`Search ${tab}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="shrink-0"
      />

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {tab === "spells" &&
          filteredSpells.map((spell) => {
            const isExpanded = expanded === spell.slug;
            return (
              <div key={spell.slug} className="rounded-lg border border-border bg-card">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                  onClick={() => setExpanded(isExpanded ? null : spell.slug)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{spell.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0">{spell.school}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {spell.level === "Cantrip" ? "Cantrip" : `L${spell.level_int}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/spells/${spell.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Open ${spell.name} reference`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-1">
                    <p className="text-[11px] text-muted-foreground">
                      {spell.casting_time} · {spell.range} · {spell.duration} · {spell.components}
                      {spell.concentration === "yes" && " · Concentration"}
                      {spell.ritual === "yes" && " · Ritual"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {spell.desc.slice(0, 300)}{spell.desc.length > 300 ? "..." : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

        {tab === "monsters" &&
          filteredMonsters.map((m) => {
            const isExpanded = expanded === m.slug;
            return (
              <div key={m.slug} className="rounded-lg border border-border bg-card">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                  onClick={() => setExpanded(isExpanded ? null : m.slug)}
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <p className="text-[11px] text-muted-foreground">
                      CR {m.challenge_rating} · HP {m.hit_points} · AC {m.armor_class} · {m.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/monsters/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Open ${m.name} stat block`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-2">
                    {/* Ability scores mini */}
                    <div className="flex gap-2">
                      {ABILITY_KEYS.map((key) => {
                        const score = m[key as keyof Monster] as number;
                        const mod = abilityModifier(score);
                        return (
                          <div key={key} className="text-center">
                            <p className="text-[9px] uppercase text-muted-foreground">{ABILITY_ABBREV[key]}</p>
                            <p className="text-xs font-bold text-foreground">{score}</p>
                            <p className="text-[10px] text-primary">{formatModifier(mod)}</p>
                          </div>
                        );
                      })}
                    </div>
                    {m.special_abilities && m.special_abilities.length > 0 && (
                      <div>
                        {m.special_abilities.map((sa) => (
                          <p key={sa.name} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{sa.name}.</span> {sa.desc.slice(0, 150)}
                            {sa.desc.length > 150 ? "..." : ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {m.actions && m.actions.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Actions</p>
                        {m.actions.map((a) => (
                          <p key={a.name} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{a.name}.</span> {a.desc.slice(0, 100)}
                            {a.desc.length > 100 ? "..." : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {tab === "spells" && filteredSpells.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No spells found.</p>
        )}
        {tab === "monsters" && filteredMonsters.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No monsters found.</p>
        )}
      </div>
    </div>
  );
}

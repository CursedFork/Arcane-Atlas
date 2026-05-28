"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import spellsData from "@/data/srd/spells.json";
import homebrewData from "@/data/srd/spells.json"; // placeholder; homebrew spells come from store
import { type Spell } from "@/lib/schemas/spell";
import { useHomebrewStore } from "@/store/homebrewStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SPELL_SCHOOLS } from "@/lib/srd/index";
import { ExternalLink } from "lucide-react";

const allSrdSpells = spellsData as Spell[];

const LEVELS = ["Cantrip", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function SpellsPage() {
  const homebrew = useHomebrewStore((s) => s.spells);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");

  const allSpells: (Spell & { isHomebrew?: boolean })[] = useMemo(() => {
    const hbSpells = homebrew.map((s) => ({
      slug: s.slug,
      name: s.name,
      school: s.school,
      level: s.level,
      level_int: s.level_int,
      casting_time: s.casting_time,
      range: s.range,
      duration: s.duration,
      components: s.components,
      concentration: s.concentration,
      ritual: s.ritual,
      desc: s.desc,
      dnd_class: s.dnd_class,
      higher_level: s.higher_level,
      material: s.material,
      archetype: "",
      circles: "",
      isHomebrew: true,
    }));
    return [...allSrdSpells, ...hbSpells];
  }, [homebrew]);

  const filtered = useMemo(() => {
    return allSpells.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchLevel =
        levelFilter === "all" ||
        (levelFilter === "Cantrip" ? s.level === "Cantrip" : String(s.level_int) === levelFilter);
      const matchSchool = schoolFilter === "all" || s.school.toLowerCase() === schoolFilter.toLowerCase();
      return matchSearch && matchLevel && matchSchool;
    });
  }, [allSpells, search, levelFilter, schoolFilter]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Spell Reference</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} spells</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search spells..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setLevelFilter("all")}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              levelFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Levels
          </button>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l === levelFilter ? "all" : l)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                levelFilter === l
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "Cantrip" ? "Cantrip" : `L${l}`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSchoolFilter("all")}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              schoolFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Schools
          </button>
          {SPELL_SCHOOLS.map((school) => (
            <button
              key={school}
              onClick={() => setSchoolFilter(school === schoolFilter ? "all" : school)}
              className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
                schoolFilter === school
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {school}
            </button>
          ))}
        </div>
      </div>

      {/* Spell list */}
      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No spells found.</p>
        )}
        {filtered.map((spell) => (
          <div
            key={spell.slug}
            className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <Link href={`/spells/${spell.slug}`} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {spell.name}
                </span>
                {"isHomebrew" in spell && spell.isHomebrew && (
                  <Badge variant="homebrew" className="text-[10px] py-0">HB</Badge>
                )}
                <Badge variant="outline" className="text-[10px] py-0">{spell.school}</Badge>
                <span className="text-xs text-muted-foreground">
                  {spell.level === "Cantrip" ? "Cantrip" : `Level ${spell.level_int}`}
                </span>
                <span className="text-xs text-muted-foreground">{spell.casting_time}</span>
                {spell.concentration === "yes" && (
                  <span className="text-xs text-muted-foreground">Concentration</span>
                )}
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import monstersData from "@/data/srd/monsters.json";
import { type Monster } from "@/lib/schemas/monster";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MONSTER_TYPES } from "@/lib/srd/index";
import { ExternalLink } from "lucide-react";

const allMonsters = monstersData as unknown as Monster[];

const CR_OPTIONS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

function crSort(cr: string): number {
  if (cr === "1/8") return 0.125;
  if (cr === "1/4") return 0.25;
  if (cr === "1/2") return 0.5;
  return parseFloat(cr) || 0;
}

export default function MonstersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [maxCr, setMaxCr] = useState<string>("all");

  const filtered = useMemo(() => {
    return allMonsters
      .filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || m.type.toLowerCase().includes(typeFilter.toLowerCase());
        const matchCr =
          maxCr === "all" || crSort(String(m.challenge_rating)) <= crSort(maxCr);
        return matchSearch && matchType && matchCr;
      })
      .sort((a, b) => crSort(String(a.challenge_rating)) - crSort(String(b.challenge_rating)));
  }, [search, typeFilter, maxCr]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Monster Bestiary</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} monsters</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search monsters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Max CR</label>
          <select
            value={maxCr}
            onChange={(e) => setMaxCr(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="all">Any</option>
            {CR_OPTIONS.map((cr) => (
              <option key={cr} value={cr}>CR {cr}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              typeFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Types
          </button>
          {MONSTER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? "all" : t)}
              className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
                typeFilter === t
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Monster list */}
      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No monsters found.</p>
        )}
        {filtered.map((m) => (
          <div
            key={m.slug}
            className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <Link href={`/monsters/${m.slug}`} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {m.name}
                </span>
                <Badge variant="outline" className="text-[10px] py-0">CR {m.challenge_rating}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{m.type}</span>
                <span className="text-xs text-muted-foreground">HP {m.hit_points} · AC {m.armor_class}</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

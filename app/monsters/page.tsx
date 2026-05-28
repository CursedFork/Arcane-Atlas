"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import monstersData from "@/data/srd/monsters.json";
import { type Monster } from "@/lib/schemas/monster";
import { type HomebrewMonster } from "@/lib/schemas/homebrew";
import { useHomebrewStore } from "@/store/homebrewStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MONSTER_TYPES } from "@/lib/srd/index";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

const srdMonsters = monstersData as unknown as Monster[];

const CR_OPTIONS = [
  "0", "1/8", "1/4", "1/2",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
];

function crSort(cr: string | number): number {
  const s = String(cr);
  if (s === "1/8") return 0.125;
  if (s === "1/4") return 0.25;
  if (s === "1/2") return 0.5;
  return parseFloat(s) || 0;
}

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

// ── Unified row type ──────────────────────────────────────────────────────────

interface SrdRow {
  kind: "srd";
  slug: string;
  name: string;
  type: string;
  size: string;
  crDisplay: string;
  crSortVal: number;
  hp: string;
  ac: string;
}

interface HomebrewRow extends HomebrewMonster {
  kind: "homebrew";
  crSortVal: number;
}

type MonsterRow = SrdRow | HomebrewRow;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MonstersPage() {
  const homebrewMonsters = useHomebrewStore((s) => s.monsters);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [maxCr, setMaxCr] = useState<string>("all");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const allRows = useMemo((): MonsterRow[] => {
    const srd: SrdRow[] = srdMonsters.map((m) => ({
      kind: "srd",
      slug: m.slug,
      name: m.name,
      type: m.type,
      size: m.size ?? "",
      crDisplay: String(m.challenge_rating),
      crSortVal: crSort(m.challenge_rating),
      hp: String(m.hit_points),
      ac: String(m.armor_class),
    }));

    const hb: HomebrewRow[] = homebrewMonsters.map((m) => ({
      ...m,
      kind: "homebrew",
      crSortVal: crSort(m.cr),
    }));

    return [...srd, ...hb];
  }, [homebrewMonsters]);

  const filtered = useMemo(() => {
    return allRows
      .filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchType =
          typeFilter === "all" ||
          m.type.toLowerCase().includes(typeFilter.toLowerCase());
        const matchCr =
          maxCr === "all" || m.crSortVal <= crSort(maxCr);
        return matchSearch && matchType && matchCr;
      })
      .sort((a, b) => a.crSortVal - b.crSortVal);
  }, [allRows, search, typeFilter, maxCr]);

  const homebrewCount = homebrewMonsters.length;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Monster Bestiary</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filtered.length} monsters
          {homebrewCount > 0 && (
            <span className="ml-2 text-primary">
              ({homebrewCount} homebrew)
            </span>
          )}
        </p>
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
              <option key={cr} value={cr}>
                CR {cr}
              </option>
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
          <p className="text-sm text-muted-foreground text-center py-10">
            No monsters found.
          </p>
        )}

        {filtered.map((m) => {
          if (m.kind === "srd") {
            return (
              <div
                key={m.slug}
                className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <Link
                  href={`/monsters/${m.slug}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {m.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      CR {m.crDisplay}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {m.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      HP {m.hp} · AC {m.ac}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              </div>
            );
          }

          // Homebrew monster — expandable inline stat block
          const isOpen = expandedSlug === m.slug;
          return (
            <div
              key={m.slug}
              className="rounded-lg border border-primary/30 bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedSlug(isOpen ? null : m.slug)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium text-foreground">{m.name}</span>
                  <Badge className="text-[10px] py-0 bg-primary/20 text-primary border-primary/30">
                    Homebrew
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0">
                    CR {m.cr}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {m.size} {m.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    HP {m.hp} · AC {m.ac}
                  </span>
                  {m.source && (
                    <span className="text-xs text-muted-foreground">
                      {m.source}
                    </span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isOpen && <HomebrewStatBlock m={m} />}
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ── Homebrew stat block ───────────────────────────────────────────────────────

function HomebrewStatBlock({ m }: { m: HomebrewMonster }) {
  return (
    <div className="border-t border-primary/20 bg-primary/5 px-4 py-4 space-y-4 text-sm">
      {/* Header line */}
      <div className="text-muted-foreground text-xs italic">
        {m.size} {m.type}, {m.alignment}
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
        <Stat label="Armor Class" value={m.ac} />
        <Stat label="Hit Points" value={m.hp} />
        <Stat label="Speed" value={m.speed} />
      </div>

      {/* Ability scores */}
      <div className="grid grid-cols-6 gap-2 text-center border-t border-b border-primary/20 py-3">
        {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((label, i) => {
          const vals = [m.str, m.dex, m.con, m.int, m.wis, m.cha];
          const score = vals[i] ?? 10;
          return (
            <div key={label} className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {label}
              </div>
              <div className="font-medium text-foreground">{score}</div>
              <div className="text-xs text-muted-foreground">{mod(score)}</div>
            </div>
          );
        })}
      </div>

      {/* Challenge */}
      <div className="text-xs">
        <span className="font-medium text-foreground">Challenge</span>{" "}
        <span className="text-muted-foreground">{m.cr}</span>
      </div>

      {/* Special abilities */}
      {m.special_abilities && (
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Special Abilities
          </p>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {m.special_abilities}
          </p>
        </div>
      )}

      {/* Actions */}
      {m.actions && (
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Actions
          </p>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {m.actions}
          </p>
        </div>
      )}

      {/* Lore */}
      {m.desc && (
        <p className="text-muted-foreground/80 italic text-xs leading-relaxed border-t border-border/50 pt-3">
          {m.desc}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="font-medium text-foreground">{label}</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

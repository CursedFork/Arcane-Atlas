/**
 * CSV bulk import for homebrew content.
 *
 * Supports: spells, magic items, feats.
 * Races/backgrounds are JSON-only (too complex for flat CSV).
 *
 * Column names are matched case-insensitively and with common aliases
 * so users aren't locked into an exact header string.
 */

import { slugify } from "./utils";
import {
  HomebrewSpellSchema,
  HomebrewItemSchema,
  HomebrewFeatSchema,
  type HomebrewSpell,
  type HomebrewItem,
  type HomebrewFeat,
} from "./schemas/homebrew";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles quoted fields (including embedded commas and escaped double-quotes).

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  // Normalise line endings
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    rows.push(parseCSVLine(line));
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

// ── Header normalisation ──────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function makeHeaderMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set(normalise(h), i));
  return map;
}

function col(
  row: string[],
  headers: Map<string, number>,
  ...aliases: string[]
): string {
  for (const alias of aliases) {
    const idx = headers.get(normalise(alias));
    if (idx !== undefined) return row[idx]?.trim() ?? "";
  }
  return "";
}

// ── Import result type ────────────────────────────────────────────────────────

export interface ImportResult<T> {
  ok: T[];
  errors: { row: number; name: string; message: string }[];
}

// ── Spell import ──────────────────────────────────────────────────────────────
// Expected columns (order doesn't matter, names case-insensitive):
// Name | Level | School | Casting Time | Range | Components | Duration |
// Concentration (yes/no) | Ritual (yes/no) | Classes | Description | At Higher Levels

export function importSpellsFromCSV(text: string): ImportResult<HomebrewSpell> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow) return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewSpell[] = [];
  const errors: ImportResult<HomebrewSpell>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed, +1 for header
    const name = col(row, h, "name", "spell name");
    if (!name) return; // skip blank rows

    const levelStr = col(row, h, "level", "spell level", "lvl");
    const levelInt = levelStr.toLowerCase() === "cantrip" ? 0 : parseInt(levelStr, 10) || 0;
    const level = levelInt === 0 ? "Cantrip" : String(levelInt);
    const concentration = col(row, h, "concentration", "conc") === "yes" ? "yes" as const : "no" as const;
    const ritual = col(row, h, "ritual") === "yes" ? "yes" as const : "no" as const;
    const school = col(row, h, "school", "magic school") || "Evocation";
    const dndClass = col(row, h, "classes", "class", "dnd class", "available to");

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      desc: col(row, h, "description", "desc", "text", "effect") || "—",
      higher_level: col(row, h, "at higher levels", "higher levels", "upcast"),
      range: col(row, h, "range") || "—",
      components: col(row, h, "components", "component") || "—",
      material: col(row, h, "material", "materials") || "",
      ritual,
      duration: col(row, h, "duration") || "Instantaneous",
      concentration,
      casting_time: col(row, h, "casting time", "castingtime", "cast time") || "1 action",
      level,
      level_int: levelInt,
      school,
      dnd_class: dndClass,
      isHomebrew: true as const,
    };

    const result = HomebrewSpellSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      const msg = result.error.errors.map((e) => e.message).join("; ");
      errors.push({ row: rowNum, name, message: msg });
    }
  });

  return { ok, errors };
}

// ── Item import ───────────────────────────────────────────────────────────────
// Expected columns:
// Name | Type | Rarity | Requires Attunement | Description

export function importItemsFromCSV(text: string): ImportResult<HomebrewItem> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow) return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewItem[] = [];
  const errors: ImportResult<HomebrewItem>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "item name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      type: col(row, h, "type", "item type", "category") || "Wondrous Item",
      rarity: col(row, h, "rarity") || "Uncommon",
      requires_attunement: col(row, h, "requires attunement", "attunement", "attuned"),
      desc: col(row, h, "description", "desc", "text") || "—",
      isHomebrew: true as const,
    };

    const result = HomebrewItemSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      const msg = result.error.errors.map((e) => e.message).join("; ");
      errors.push({ row: rowNum, name, message: msg });
    }
  });

  return { ok, errors };
}

// ── Feat import ───────────────────────────────────────────────────────────────
// Expected columns:
// Name | Prerequisite | Description

export function importFeatsFromCSV(text: string): ImportResult<HomebrewFeat> {
  const [headerRow, ...dataRows] = parseCSV(text);
  if (!headerRow) return { ok: [], errors: [{ row: 0, name: "—", message: "File is empty." }] };

  const h = makeHeaderMap(headerRow);
  const ok: HomebrewFeat[] = [];
  const errors: ImportResult<HomebrewFeat>["errors"] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const name = col(row, h, "name", "feat name");
    if (!name) return;

    const data = {
      slug: `${slugify(name)}-${Date.now()}-${i}`,
      name,
      prerequisite: col(row, h, "prerequisite", "prereq", "requirement", "requires"),
      desc: col(row, h, "description", "desc", "text", "benefit") || "—",
      isHomebrew: true as const,
    };

    const result = HomebrewFeatSchema.safeParse(data);
    if (result.success) {
      ok.push(result.data);
    } else {
      const msg = result.error.errors.map((e) => e.message).join("; ");
      errors.push({ row: rowNum, name, message: msg });
    }
  });

  return { ok, errors };
}

// ── CSV template generators ───────────────────────────────────────────────────
// Returns a CSV string users can download, fill in, and re-upload.

export function spellTemplate(): string {
  const header = "Name,Level,School,Casting Time,Range,Components,Duration,Concentration,Ritual,Classes,Description,At Higher Levels";
  const example = '"Thunderclap",1,"Evocation","1 action","5 feet","V","Instantaneous","no","no","Bard, Druid, Sorcerer, Wizard","Each creature within 5 feet of you must make a Constitution saving throw.","When you cast this spell using a spell slot of 2nd level or higher, increase the damage by 1d6."';
  return `${header}\n${example}\n`;
}

export function itemTemplate(): string {
  const header = "Name,Type,Rarity,Requires Attunement,Description";
  const example = '"Boots of Elvenkind","Wondrous Item","Uncommon","","Your steps make no sound regardless of the surface you are moving across."';
  return `${header}\n${example}\n`;
}

export function featTemplate(): string {
  const header = "Name,Prerequisite,Description";
  const example = '"War Caster","The ability to cast at least one spell","You have practiced casting spells in the midst of combat."';
  return `${header}\n${example}\n`;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

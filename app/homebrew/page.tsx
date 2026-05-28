"use client";

import { useRef, useState } from "react";
import { useHomebrewStore } from "@/store/homebrewStore";
import {
  HomebrewCollectionSchema,
  HomebrewSpellSchema,
  HomebrewItemSchema,
  HomebrewFeatSchema,
  HomebrewSubclassSchema,
  HomebrewMonsterSchema,
  HomebrewWeaponSchema,
  type HomebrewSpell,
  type HomebrewItem,
  type HomebrewFeat,
  type HomebrewSubclass,
  type HomebrewMonster,
  type HomebrewWeapon,
} from "@/lib/schemas/homebrew";
import {
  importSpellsFromCSV,
  importItemsFromCSV,
  importFeatsFromCSV,
  importSubclassesFromCSV,
  importMonstersFromCSV,
  importWeaponsFromCSV,
  importRacesFromCSV,
  importBackgroundsFromCSV,
  spellTemplate,
  itemTemplate,
  featTemplate,
  subclassTemplate,
  monsterTemplate,
  weaponTemplate,
  raceTemplate,
  backgroundTemplate,
  downloadCSV,
  type ImportResult,
} from "@/lib/csvImport";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Upload,
  Download,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SPELL_SCHOOLS } from "@/lib/srd/index";

// ── Tab definitions ───────────────────────────────────────────────────────────

type Tab =
  | "spells"
  | "items"
  | "feats"
  | "subclasses"
  | "monsters"
  | "weapons"
  | "races"
  | "backgrounds";
type Mode = "manual" | "csv";

const TAB_LABELS: Record<Tab, string> = {
  spells: "Spells",
  items: "Items",
  feats: "Feats",
  subclasses: "Subclasses",
  monsters: "Monsters",
  weapons: "Weapons",
  races: "Races",
  backgrounds: "Backgrounds",
};

const CSV_COLUMNS: Record<Tab, string> = {
  spells:
    "Name · Level (0–9 or Cantrip) · School · Casting Time · Range · Components · Duration · Concentration (yes/no) · Ritual (yes/no) · Classes · Description · At Higher Levels",
  items: "Name · Type · Rarity · Requires Attunement · Description",
  feats: "Name · Prerequisite · Description",
  subclasses:
    "Name · Class · Description · Features (free-form text, one feature per line) · Source",
  monsters:
    "Name · Size · Type · Alignment · AC · HP · Speed · STR · DEX · CON · INT · WIS · CHA · CR · Special Abilities · Actions · Source",
  weapons:
    "Name · Category (Simple/Martial Melee/Ranged) · Damage · Damage Type · Properties · Weight · Cost · Description",
  races:
    "Name · Size · Speed · STR/DEX/CON/INT/WIS/CHA Bonus · Traits (pipe-sep: Name: Desc|Name: Desc) · Languages (comma-sep) · Subraces (pipe-sep)",
  backgrounds:
    "Name · Skill Proficiencies (comma-sep) · Tool Proficiencies (comma-sep) · Language Count · Equipment (pipe-sep) · Feature Name · Feature Description",
};

const TEMPLATE_FNS: Record<Tab, () => string> = {
  spells: spellTemplate,
  items: itemTemplate,
  feats: featTemplate,
  subclasses: subclassTemplate,
  monsters: monsterTemplate,
  weapons: weaponTemplate,
  races: raceTemplate,
  backgrounds: backgroundTemplate,
};

const TEMPLATE_NAMES: Record<Tab, string> = {
  spells: "spell-template.csv",
  items: "item-template.csv",
  feats: "feat-template.csv",
  subclasses: "subclass-template.csv",
  monsters: "monster-template.csv",
  weapons: "weapon-template.csv",
  races: "race-template.csv",
  backgrounds: "background-template.csv",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomebrewPage() {
  const store = useHomebrewStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("spells");
  const [mode, setMode] = useState<Mode>("manual");
  const [importError, setImportError] = useState<string | null>(null);
  const [csvResult, setCsvResult] = useState<{
    added: number;
    errors: { row: number; name: string; message: string }[];
  } | null>(null);

  // Manual-entry form visibility per type
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showFeatForm, setShowFeatForm] = useState(false);
  const [showSubclassForm, setShowSubclassForm] = useState(false);
  const [showMonsterForm, setShowMonsterForm] = useState(false);
  const [showWeaponForm, setShowWeaponForm] = useState(false);

  // ── Counts ──────────────────────────────────────────────────────────────────

  const counts: Record<Tab, number> = {
    spells: store.spells.length,
    items: store.items.length,
    feats: store.feats.length,
    subclasses: store.subclasses.length,
    monsters: store.monsters.length,
    weapons: store.weapons.length,
    races: store.races.length,
    backgrounds: store.backgrounds.length,
  };
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // ── JSON import/export ──────────────────────────────────────────────────────

  const exportCollection = () => {
    const data = JSON.stringify(
      {
        spells: store.spells,
        races: store.races,
        items: store.items,
        backgrounds: store.backgrounds,
        feats: store.feats,
        subclasses: store.subclasses,
        monsters: store.monsters,
        weapons: store.weapons,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arcane-atlas-homebrew.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (file: File) => {
    setImportError(null);
    if (file.size > 1_048_576) {
      setImportError("File exceeds 1 MB limit.");
      return;
    }
    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const result = HomebrewCollectionSchema.safeParse(json);
      if (!result.success) {
        setImportError(
          result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")
        );
        return;
      }
      store.importCollection(result.data);
    } catch {
      setImportError("Invalid JSON file.");
    }
  };

  // ── CSV upload ──────────────────────────────────────────────────────────────

  const handleCSVFile = async (file: File) => {
    setCsvResult(null);
    if (file.size > 2_097_152) {
      setImportError("File exceeds 2 MB limit.");
      return;
    }
    setImportError(null);
    const text = await file.text();

    let added = 0;
    let errors: ImportResult<{ slug: string; name: string }>["errors"] = [];

    if (tab === "spells") {
      const r = importSpellsFromCSV(text);
      r.ok.forEach((s) => store.addSpell(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "items") {
      const r = importItemsFromCSV(text);
      r.ok.forEach((s) => store.addItem(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "feats") {
      const r = importFeatsFromCSV(text);
      r.ok.forEach((s) => store.addFeat(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "subclasses") {
      const r = importSubclassesFromCSV(text);
      r.ok.forEach((s) => store.addSubclass(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "monsters") {
      const r = importMonstersFromCSV(text);
      r.ok.forEach((s) => store.addMonster(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "weapons") {
      const r = importWeaponsFromCSV(text);
      r.ok.forEach((s) => store.addWeapon(s));
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "races") {
      const r = importRacesFromCSV(text);
      r.ok.forEach((s) => store.addRace(s));
      added = r.ok.length;
      errors = r.errors;
    } else {
      const r = importBackgroundsFromCSV(text);
      r.ok.forEach((s) => store.addBackground(s));
      added = r.ok.length;
      errors = r.errors;
    }

    setCsvResult({ added, errors });
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const changeTab = (t: Tab) => {
    setTab(t);
    setCsvResult(null);
    setShowSpellForm(false);
    setShowItemForm(false);
    setShowFeatForm(false);
    setShowSubclassForm(false);
    setShowMonsterForm(false);
    setShowWeaponForm(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Homebrew Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} homebrew{" "}
            {totalCount === 1 ? "entry" : "entries"} across all types
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCollection}>
            <Download className="h-4 w-4" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportJSON(f);
              e.target.value = "";
            }}
          />
          {totalCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                store.resetHomebrew();
                setCsvResult(null);
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {importError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {importError}
        </div>
      )}

      {/* Entity tabs — horizontally scrollable on small screens */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {TAB_LABELS[t]}{" "}
              <span className="ml-1 text-xs opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
        <button
          onClick={() => {
            setMode("manual");
            setCsvResult(null);
          }}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "manual"
              ? "bg-card text-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => {
            setMode("csv");
            setCsvResult(null);
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "csv"
              ? "bg-card text-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Bulk CSV Import
        </button>
      </div>

      {/* ── CSV MODE ────────────────────────────────────────────────────────── */}
      {mode === "csv" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-base text-foreground">
              Bulk import {TAB_LABELS[tab].toLowerCase()} from a spreadsheet
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fill in a CSV with your own content (from your books or notes) and
              upload it here. Data is stored only in your browser — nothing is
              shared externally.
            </p>

            {/* Source note */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-200 leading-relaxed">
              <strong>Your content, your rules.</strong> This tool is designed for content you
              own — sourcebooks, personal notes, third-party content you have purchased.
              Nothing is pre-loaded; you supply the data.
            </div>

            {/* Column reference */}
            <div className="rounded-lg bg-secondary/50 border border-border px-4 py-3 text-xs space-y-1">
              <p className="font-medium text-foreground uppercase tracking-wide text-[10px]">
                Expected columns for {TAB_LABELS[tab].toLowerCase()}
              </p>
              <p className="font-mono text-muted-foreground leading-relaxed">
                {CSV_COLUMNS[tab]}
              </p>
              <p className="text-muted-foreground pt-1">
                Headers are matched case-insensitively.{" "}
                {(tab === "races" || tab === "backgrounds") &&
                  "Pipe | separates multiple values within a cell. "}
                Missing optional columns are filled with defaults.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  downloadCSV(TEMPLATE_FNS[tab](), TEMPLATE_NAMES[tab])
                }
              >
                <Download className="h-3.5 w-3.5" />
                Download{" "}
                {TAB_LABELS[tab].slice(0, -1) === TAB_LABELS[tab]
                  ? TAB_LABELS[tab]
                  : TAB_LABELS[tab].replace(/s$/, "")}{" "}
                Template (.csv)
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="gap-2"
                onClick={() => csvInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCSVFile(f);
                }}
              />
            </div>
          </div>

          {/* Results */}
          <CsvResults result={csvResult} label={TAB_LABELS[tab].toLowerCase()} />
        </div>
      )}

      {/* ── MANUAL MODE ─────────────────────────────────────────────────────── */}
      {mode === "manual" && (
        <div className="space-y-4">
          {/* Spells */}
          {tab === "spells" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowSpellForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Spell
              </Button>
              {showSpellForm && (
                <SpellForm
                  onSave={(s) => {
                    store.addSpell(s);
                    setShowSpellForm(false);
                  }}
                  onCancel={() => setShowSpellForm(false)}
                />
              )}
              <EntityList
                items={store.spells}
                renderLabel={(s) =>
                  `${s.school} · ${s.level === "Cantrip" ? "Cantrip" : `Level ${s.level_int}`} · ${s.dnd_class || "—"}`
                }
                onRemove={(s) => store.removeSpell(s.slug)}
              />
            </>
          )}

          {/* Items */}
          {tab === "items" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowItemForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
              {showItemForm && (
                <ItemForm
                  onSave={(item) => {
                    store.addItem(item);
                    setShowItemForm(false);
                  }}
                  onCancel={() => setShowItemForm(false)}
                />
              )}
              <EntityList
                items={store.items}
                renderLabel={(item) => `${item.rarity} · ${item.type}`}
                onRemove={(item) => store.removeItem(item.slug)}
              />
            </>
          )}

          {/* Feats */}
          {tab === "feats" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowFeatForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Feat
              </Button>
              {showFeatForm && (
                <FeatForm
                  onSave={(feat) => {
                    store.addFeat(feat);
                    setShowFeatForm(false);
                  }}
                  onCancel={() => setShowFeatForm(false)}
                />
              )}
              <EntityList
                items={store.feats}
                renderLabel={(feat) =>
                  feat.prerequisite ? `Req: ${feat.prerequisite}` : "No prerequisite"
                }
                onRemove={(feat) => store.removeFeat(feat.slug)}
              />
            </>
          )}

          {/* Subclasses */}
          {tab === "subclasses" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowSubclassForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Subclass
              </Button>
              {showSubclassForm && (
                <SubclassForm
                  onSave={(sc) => {
                    store.addSubclass(sc);
                    setShowSubclassForm(false);
                  }}
                  onCancel={() => setShowSubclassForm(false)}
                />
              )}
              <EntityList
                items={store.subclasses}
                renderLabel={(sc) =>
                  `${sc.className}${sc.source ? ` · ${sc.source}` : ""}`
                }
                onRemove={(sc) => store.removeSubclass(sc.slug)}
              />
            </>
          )}

          {/* Monsters */}
          {tab === "monsters" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowMonsterForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Monster
              </Button>
              {showMonsterForm && (
                <MonsterForm
                  onSave={(m) => {
                    store.addMonster(m);
                    setShowMonsterForm(false);
                  }}
                  onCancel={() => setShowMonsterForm(false)}
                />
              )}
              <EntityList
                items={store.monsters}
                renderLabel={(m) =>
                  `CR ${m.cr} · ${m.size} ${m.type}${m.source ? ` · ${m.source}` : ""}`
                }
                onRemove={(m) => store.removeMonster(m.slug)}
              />
            </>
          )}

          {/* Weapons */}
          {tab === "weapons" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowWeaponForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Weapon
              </Button>
              {showWeaponForm && (
                <WeaponForm
                  onSave={(w) => {
                    store.addWeapon(w);
                    setShowWeaponForm(false);
                  }}
                  onCancel={() => setShowWeaponForm(false)}
                />
              )}
              <EntityList
                items={store.weapons}
                renderLabel={(w) =>
                  `${w.category} · ${w.damage} ${w.damage_type}${w.properties ? ` · ${w.properties}` : ""}`
                }
                onRemove={(w) => store.removeWeapon(w.slug)}
              />
            </>
          )}

          {/* Races */}
          {tab === "races" && (
            <>
              <p className="text-sm text-muted-foreground">
                Races have nested trait structures. Use{" "}
                <button
                  onClick={() => setMode("csv")}
                  className="text-primary underline underline-offset-2"
                >
                  CSV import
                </button>{" "}
                for bulk entry, or JSON import (via the header button) for full
                control.
              </p>
              <EntityList
                items={store.races}
                renderLabel={(r) =>
                  `${r.size} · ${r.speed} ft.${r.subraces.length > 0 ? ` · ${r.subraces.length} subraces` : ""}`
                }
                onRemove={(r) => store.removeRace(r.slug)}
              />
            </>
          )}

          {/* Backgrounds */}
          {tab === "backgrounds" && (
            <>
              <p className="text-sm text-muted-foreground">
                Use{" "}
                <button
                  onClick={() => setMode("csv")}
                  className="text-primary underline underline-offset-2"
                >
                  CSV import
                </button>{" "}
                for bulk entry, or JSON import for full control.
              </p>
              <EntityList
                items={store.backgrounds}
                renderLabel={(b) =>
                  `Skills: ${b.skillProficiencies.join(", ") || "—"}`
                }
                onRemove={(b) => store.removeBackground(b.slug)}
              />
            </>
          )}
        </div>
      )}
    </main>
  );
}

// ── CSV result banner ─────────────────────────────────────────────────────────

function CsvResults({
  result,
  label,
}: {
  result: { added: number; errors: { row: number; name: string; message: string }[] } | null;
  label: string;
}) {
  if (!result) return null;
  return (
    <div className="space-y-2">
      {result.added > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Successfully imported {result.added} {label}.
        </div>
      )}
      {result.errors.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {result.errors.length} row{result.errors.length !== 1 ? "s" : ""} had
            errors and were skipped
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.errors.map((e) => (
              <p key={e.row} className="text-xs text-destructive/80">
                <span className="font-medium">
                  Row {e.row} ({e.name || "unnamed"}):
                </span>{" "}
                {e.message}
              </p>
            ))}
          </div>
        </div>
      )}
      {result.added === 0 && result.errors.length === 0 && (
        <p className="text-sm text-muted-foreground">No rows found in file.</p>
      )}
    </div>
  );
}

// ── Shared entity list ────────────────────────────────────────────────────────

function EntityList<T extends { slug: string; name: string }>({
  items,
  renderLabel,
  onRemove,
}: {
  items: T[];
  renderLabel: (item: T) => string;
  onRemove: (item: T) => void;
}) {
  if (items.length === 0)
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nothing here yet. Add one manually or use Bulk CSV Import.
      </p>
    );
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div
          key={item.slug}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="min-w-0">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="ml-3 text-xs text-muted-foreground truncate">
              {renderLabel(item)}
            </span>
          </div>
          <button
            onClick={() => onRemove(item)}
            className="ml-3 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Shared form helpers ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase text-muted-foreground tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

// ── Spell form ────────────────────────────────────────────────────────────────

function SpellForm({
  onSave,
  onCancel,
}: {
  onSave: (s: HomebrewSpell) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    school: "Evocation",
    level_int: 1,
    dnd_class: "",
    casting_time: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    concentration: "no" as "yes" | "no",
    ritual: "no" as "yes" | "no",
    desc: "",
    higher_level: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-spell-${Date.now()}`,
      level: f.level_int === 0 ? "Cantrip" : String(f.level_int),
      material: "",
      isHomebrew: true as const,
    };
    const result = HomebrewSpellSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Spell</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="School">
          <Select
            value={f.school}
            options={SPELL_SCHOOLS}
            onChange={(v) => setF((p) => ({ ...p, school: v }))}
          />
        </Field>
        <Field label="Level (0 = Cantrip)">
          <Input
            type="number"
            min={0}
            max={9}
            value={f.level_int}
            onChange={(e) =>
              setF((p) => ({ ...p, level_int: parseInt(e.target.value, 10) || 0 }))
            }
          />
        </Field>
        <Field label="Classes (comma-sep)">
          <Input
            value={f.dnd_class}
            onChange={(e) => setF((p) => ({ ...p, dnd_class: e.target.value }))}
          />
        </Field>
        <Field label="Casting Time">
          <Input
            value={f.casting_time}
            onChange={(e) => setF((p) => ({ ...p, casting_time: e.target.value }))}
          />
        </Field>
        <Field label="Range">
          <Input
            value={f.range}
            onChange={(e) => setF((p) => ({ ...p, range: e.target.value }))}
          />
        </Field>
        <Field label="Components">
          <Input
            value={f.components}
            onChange={(e) => setF((p) => ({ ...p, components: e.target.value }))}
          />
        </Field>
        <Field label="Duration">
          <Input
            value={f.duration}
            onChange={(e) => setF((p) => ({ ...p, duration: e.target.value }))}
          />
        </Field>
        <Field label="Concentration">
          <Select
            value={f.concentration}
            options={["no", "yes"]}
            onChange={(v) => setF((p) => ({ ...p, concentration: v as "yes" | "no" }))}
          />
        </Field>
        <Field label="Ritual">
          <Select
            value={f.ritual}
            options={["no", "yes"]}
            onChange={(v) => setF((p) => ({ ...p, ritual: v as "yes" | "no" }))}
          />
        </Field>
      </div>
      <Field label="Description *">
        <Textarea value={f.desc} onChange={(v) => setF((p) => ({ ...p, desc: v }))} />
      </Field>
      <Field label="At Higher Levels (optional)">
        <Textarea
          rows={2}
          value={f.higher_level}
          onChange={(v) => setF((p) => ({ ...p, higher_level: v }))}
        />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Spell
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Item form ─────────────────────────────────────────────────────────────────

function ItemForm({
  onSave,
  onCancel,
}: {
  onSave: (item: HomebrewItem) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requires_attunement: "",
    desc: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-item-${Date.now()}`,
      isHomebrew: true as const,
    };
    const result = HomebrewItemSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Item</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="Type">
          <Input
            value={f.type}
            onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))}
          />
        </Field>
        <Field label="Rarity">
          <Select
            value={f.rarity}
            options={["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"]}
            onChange={(v) => setF((p) => ({ ...p, rarity: v }))}
          />
        </Field>
        <Field label="Attunement">
          <Input
            value={f.requires_attunement}
            placeholder="requires attunement (optional)"
            onChange={(e) =>
              setF((p) => ({ ...p, requires_attunement: e.target.value }))
            }
          />
        </Field>
      </div>
      <Field label="Description *">
        <Textarea value={f.desc} onChange={(v) => setF((p) => ({ ...p, desc: v }))} />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Item
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Feat form ─────────────────────────────────────────────────────────────────

function FeatForm({
  onSave,
  onCancel,
}: {
  onSave: (feat: HomebrewFeat) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({ name: "", prerequisite: "", desc: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-feat-${Date.now()}`,
      isHomebrew: true as const,
    };
    const result = HomebrewFeatSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Feat</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="Prerequisite">
          <Input
            value={f.prerequisite}
            onChange={(e) => setF((p) => ({ ...p, prerequisite: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Description *">
        <Textarea value={f.desc} onChange={(v) => setF((p) => ({ ...p, desc: v }))} />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Feat
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Subclass form ─────────────────────────────────────────────────────────────

const CLASSES = [
  "Artificer", "Barbarian", "Bard", "Cleric", "Druid",
  "Fighter", "Monk", "Paladin", "Ranger", "Rogue",
  "Sorcerer", "Warlock", "Wizard",
];

function SubclassForm({
  onSave,
  onCancel,
}: {
  onSave: (sc: HomebrewSubclass) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    className: "Fighter",
    desc: "",
    features: "",
    source: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-subclass-${Date.now()}`,
      isHomebrew: true as const,
    };
    const result = HomebrewSubclassSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Subclass</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subclass Name *">
          <Input
            value={f.name}
            placeholder="e.g. Circle of the Moon"
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="Base Class *">
          <Select
            value={f.className}
            options={CLASSES}
            onChange={(v) => setF((p) => ({ ...p, className: v }))}
          />
        </Field>
        <Field label="Source (book, page, etc.)">
          <Input
            value={f.source}
            placeholder="e.g. Xanathar's Guide p.23"
            onChange={(e) => setF((p) => ({ ...p, source: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Overview / Flavour">
        <Textarea
          rows={2}
          value={f.desc}
          onChange={(v) => setF((p) => ({ ...p, desc: v }))}
        />
      </Field>
      <Field label="Features (one per line, e.g. Level 3: Feature Name. Description…)">
        <Textarea
          rows={6}
          value={f.features}
          onChange={(v) => setF((p) => ({ ...p, features: v }))}
        />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Subclass
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Monster form ──────────────────────────────────────────────────────────────

const SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const DAMAGE_TYPES = [
  "slashing", "piercing", "bludgeoning", "fire", "cold", "lightning",
  "thunder", "acid", "poison", "necrotic", "radiant", "psychic", "force",
];

function MonsterForm({
  onSave,
  onCancel,
}: {
  onSave: (m: HomebrewMonster) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    size: "Medium",
    type: "Humanoid",
    alignment: "Unaligned",
    ac: "12",
    hp: "26 (4d8 + 8)",
    speed: "30 ft.",
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    cr: "1",
    special_abilities: "",
    actions: "",
    desc: "",
    source: "",
  });
  const [error, setError] = useState<string | null>(null);

  const numField = (key: keyof typeof f, label: string) => (
    <Field label={label}>
      <Input
        type="number"
        min={1}
        max={30}
        value={f[key] as number}
        onChange={(e) =>
          setF((p) => ({ ...p, [key]: parseInt(e.target.value, 10) || 10 }))
        }
      />
    </Field>
  );

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-monster-${Date.now()}`,
      isHomebrew: true as const,
    };
    const result = HomebrewMonsterSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Monster</p>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="Type (Beast, Undead…)">
          <Input
            value={f.type}
            onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))}
          />
        </Field>
        <Field label="Size">
          <Select
            value={f.size}
            options={SIZES}
            onChange={(v) => setF((p) => ({ ...p, size: v }))}
          />
        </Field>
        <Field label="Alignment">
          <Input
            value={f.alignment}
            onChange={(e) => setF((p) => ({ ...p, alignment: e.target.value }))}
          />
        </Field>
        <Field label="AC (e.g. 14 or 14 (natural armor))">
          <Input
            value={f.ac}
            onChange={(e) => setF((p) => ({ ...p, ac: e.target.value }))}
          />
        </Field>
        <Field label="HP (e.g. 52 or 52 (8d8+16))">
          <Input
            value={f.hp}
            onChange={(e) => setF((p) => ({ ...p, hp: e.target.value }))}
          />
        </Field>
        <Field label="Speed">
          <Input
            value={f.speed}
            onChange={(e) => setF((p) => ({ ...p, speed: e.target.value }))}
          />
        </Field>
        <Field label="Challenge Rating">
          <Input
            value={f.cr}
            placeholder="0, 1/8, 1/4, 1/2, 1…30"
            onChange={(e) => setF((p) => ({ ...p, cr: e.target.value }))}
          />
        </Field>
      </div>

      {/* Ability scores */}
      <div className="grid grid-cols-6 gap-2">
        {numField("str", "STR")}
        {numField("dex", "DEX")}
        {numField("con", "CON")}
        {numField("int", "INT")}
        {numField("wis", "WIS")}
        {numField("cha", "CHA")}
      </div>

      <Field label="Special Abilities / Traits">
        <Textarea
          rows={3}
          value={f.special_abilities}
          onChange={(v) => setF((p) => ({ ...p, special_abilities: v }))}
        />
      </Field>
      <Field label="Actions">
        <Textarea
          rows={3}
          value={f.actions}
          onChange={(v) => setF((p) => ({ ...p, actions: v }))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lore / Notes (optional)">
          <Textarea
            rows={2}
            value={f.desc}
            onChange={(v) => setF((p) => ({ ...p, desc: v }))}
          />
        </Field>
        <Field label="Source (optional)">
          <Input
            value={f.source}
            placeholder="e.g. Monster Manual p.48"
            onChange={(e) => setF((p) => ({ ...p, source: e.target.value }))}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Monster
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Weapon form ───────────────────────────────────────────────────────────────

const WEAPON_CATEGORIES = [
  "Simple Melee",
  "Simple Ranged",
  "Martial Melee",
  "Martial Ranged",
];

function WeaponForm({
  onSave,
  onCancel,
}: {
  onSave: (w: HomebrewWeapon) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    category: "Martial Melee",
    damage: "1d8",
    damage_type: "slashing",
    properties: "",
    weight: "",
    cost: "",
    desc: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = {
      ...f,
      slug: slugify(f.name) || `hb-weapon-${Date.now()}`,
      isHomebrew: true as const,
    };
    const result = HomebrewWeaponSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Validation error");
      return;
    }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Weapon</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>
        <Field label="Category">
          <Select
            value={f.category}
            options={WEAPON_CATEGORIES}
            onChange={(v) => setF((p) => ({ ...p, category: v }))}
          />
        </Field>
        <Field label="Damage Dice (e.g. 1d8)">
          <Input
            value={f.damage}
            onChange={(e) => setF((p) => ({ ...p, damage: e.target.value }))}
          />
        </Field>
        <Field label="Damage Type">
          <Select
            value={f.damage_type}
            options={DAMAGE_TYPES}
            onChange={(v) => setF((p) => ({ ...p, damage_type: v }))}
          />
        </Field>
        <Field label="Properties (comma-sep)">
          <Input
            value={f.properties}
            placeholder="Finesse, Light"
            onChange={(e) => setF((p) => ({ ...p, properties: e.target.value }))}
          />
        </Field>
        <Field label="Weight">
          <Input
            value={f.weight}
            placeholder="3 lb."
            onChange={(e) => setF((p) => ({ ...p, weight: e.target.value }))}
          />
        </Field>
        <Field label="Cost">
          <Input
            value={f.cost}
            placeholder="25 gp"
            onChange={(e) => setF((p) => ({ ...p, cost: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Special Rules / Description">
        <Textarea value={f.desc} onChange={(v) => setF((p) => ({ ...p, desc: v }))} />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>
          Save Weapon
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}


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
  type HomebrewRace,
  type HomebrewBackground,
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
  Loader2,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Search,
  X,
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

// ── Bulk drop types & helpers ─────────────────────────────────────────────────

interface BulkFileResult {
  filename: string;
  type: Tab | "unknown";
  added: number;
  errors: { row: number; name: string; message: string }[];
  skipped?: string;
}

function detectContentType(filename: string, firstLine: string): Tab | "unknown" {
  const lower = filename.toLowerCase();
  if (lower.includes("monster")) return "monsters";
  if (lower.includes("spell")) return "spells";
  if (lower.includes("weapon")) return "weapons";
  if (lower.includes("item")) return "items";
  if (lower.includes("feat")) return "feats";
  if (lower.includes("subclass")) return "subclasses";
  if (lower.includes("background")) return "backgrounds";
  if (lower.includes("race")) return "races";
  // Header-based fallback
  const h = firstLine.toLowerCase();
  if (h.includes("casting time") || h.includes("school")) return "spells";
  if (h.includes("cr") && h.includes("str")) return "monsters";
  if (h.includes("damage type")) return "weapons";
  if (h.includes("str bonus")) return "races";
  if (h.includes("skill proficiencies") || h.includes("feature name")) return "backgrounds";
  if (h.includes("class") && h.includes("features")) return "subclasses";
  if (h.includes("prerequisite")) return "feats";
  if (h.includes("rarity") && h.includes("type")) return "items";
  return "unknown";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomebrewPage() {
  const store = useHomebrewStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const bulkDropInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("spells");
  const [mode, setMode] = useState<Mode>("manual");
  const [importError, setImportError] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkFileResult[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [csvResult, setCsvResult] = useState<{
    added: number;
    errors: { row: number; name: string; message: string }[];
  } | null>(null);

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
    if (file.size > 10_485_760) {
      setImportError("File exceeds 10 MB limit.");
      return;
    }
    setImportError(null);
    const text = await file.text();

    let added = 0;
    let errors: ImportResult<{ slug: string; name: string }>["errors"] = [];

    if (tab === "spells") {
      const r = importSpellsFromCSV(text);
      store.bulkAddSpells(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "items") {
      const r = importItemsFromCSV(text);
      store.bulkAddItems(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "feats") {
      const r = importFeatsFromCSV(text);
      store.bulkAddFeats(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "subclasses") {
      const r = importSubclassesFromCSV(text);
      store.bulkAddSubclasses(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "monsters") {
      const r = importMonstersFromCSV(text);
      store.bulkAddMonsters(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "weapons") {
      const r = importWeaponsFromCSV(text);
      store.bulkAddWeapons(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else if (tab === "races") {
      const r = importRacesFromCSV(text);
      store.bulkAddRaces(r.ok);
      added = r.ok.length;
      errors = r.errors;
    } else {
      const r = importBackgroundsFromCSV(text);
      store.bulkAddBackgrounds(r.ok);
      added = r.ok.length;
      errors = r.errors;
    }

    setCsvResult({ added, errors });
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  // ── Bulk drop handler ────────────────────────────────────────────────────────

  const processBulkFiles = async (fileList: FileList) => {
    setIsBulkProcessing(true);
    const results: BulkFileResult[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        results.push({ filename: file.name, type: "unknown", added: 0, errors: [], skipped: "Not a CSV file" });
        continue;
      }
      if (file.size > 10_485_760) {
        results.push({ filename: file.name, type: "unknown", added: 0, errors: [], skipped: "Exceeds 10 MB limit" });
        continue;
      }
      const text = await file.text();
      const firstLine = text.split("\n")[0] ?? "";
      const type = detectContentType(file.name, firstLine);
      if (type === "unknown") {
        results.push({ filename: file.name, type: "unknown", added: 0, errors: [], skipped: "Could not detect content type" });
        continue;
      }
      let added = 0;
      let errors: BulkFileResult["errors"] = [];
      switch (type) {
        case "spells":     { const r = importSpellsFromCSV(text);     store.bulkAddSpells(r.ok);      added = r.ok.length; errors = r.errors; break; }
        case "items":      { const r = importItemsFromCSV(text);      store.bulkAddItems(r.ok);       added = r.ok.length; errors = r.errors; break; }
        case "feats":      { const r = importFeatsFromCSV(text);      store.bulkAddFeats(r.ok);       added = r.ok.length; errors = r.errors; break; }
        case "subclasses": { const r = importSubclassesFromCSV(text); store.bulkAddSubclasses(r.ok); added = r.ok.length; errors = r.errors; break; }
        case "monsters":   { const r = importMonstersFromCSV(text);   store.bulkAddMonsters(r.ok);   added = r.ok.length; errors = r.errors; break; }
        case "weapons":    { const r = importWeaponsFromCSV(text);    store.bulkAddWeapons(r.ok);    added = r.ok.length; errors = r.errors; break; }
        case "races":      { const r = importRacesFromCSV(text);      store.bulkAddRaces(r.ok);      added = r.ok.length; errors = r.errors; break; }
        case "backgrounds":{ const r = importBackgroundsFromCSV(text);store.bulkAddBackgrounds(r.ok);added = r.ok.length; errors = r.errors; break; }
      }
      results.push({ filename: file.name, type, added, errors });
    }
    setBulkResults(results);
    setIsBulkProcessing(false);
  };

  const changeTab = (t: Tab) => {
    setTab(t);
    setCsvResult(null);
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isBulkProcessing}
            onClick={() => bulkDropInputRef.current?.click()}
          >
            {isBulkProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Import CSVs
          </Button>
          <input
            ref={bulkDropInputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processBulkFiles(e.target.files);
                e.target.value = "";
              }
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

      {/* Bulk import results */}
      {bulkResults.length > 0 && !isBulkProcessing && (
        <BulkResultsList results={bulkResults} onDismiss={() => setBulkResults([])} />
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
          {tab === "spells"      && <SpellsTab />}
          {tab === "items"       && <ItemsTab />}
          {tab === "feats"       && <FeatsTab />}
          {tab === "subclasses"  && <SubclassesTab />}
          {tab === "monsters"    && <MonstersTab />}
          {tab === "weapons"     && <WeaponsTab />}
          {tab === "races"       && <RacesTab onSwitchToCSV={() => setMode("csv")} />}
          {tab === "backgrounds" && <BackgroundsTab onSwitchToCSV={() => setMode("csv")} />}
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
  renderDetail,
  onRemove,
}: {
  items: T[];
  renderLabel: (item: T) => string;
  renderDetail?: (item: T) => React.ReactNode;
  onRemove: (item: T) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (items.length === 0)
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nothing here yet. Add one manually or use Bulk CSV Import.
      </p>
    );
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const isOpen = expanded === item.slug;
        return (
          <div
            key={item.slug}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Row header */}
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                renderDetail
                  ? "cursor-pointer hover:bg-secondary/30 transition-colors select-none"
                  : ""
              }`}
              onClick={() =>
                renderDetail &&
                setExpanded(isOpen ? null : item.slug)
              }
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="ml-3 text-xs text-muted-foreground truncate">
                  {renderLabel(item)}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                {renderDetail &&
                  (isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded detail panel */}
            {renderDetail && isOpen && (
              <div className="border-t border-border/50 px-4 py-3 bg-secondary/10">
                {renderDetail(item)}
              </div>
            )}
          </div>
        );
      })}
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

// ── Bulk results list ─────────────────────────────────────────────────────────

const TYPE_LABEL: Record<Tab | "unknown", string> = {
  spells: "Spells",
  items: "Items",
  feats: "Feats",
  subclasses: "Subclasses",
  monsters: "Monsters",
  weapons: "Weapons",
  races: "Races",
  backgrounds: "Backgrounds",
  unknown: "Unknown",
};

function BulkResultsList({
  results,
  onDismiss,
}: {
  results: BulkFileResult[];
  onDismiss: () => void;
}) {
  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const skippedFiles = results.filter((r) => r.skipped);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Summary bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3 flex-wrap">
          {totalAdded > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {totalAdded} record{totalAdded !== 1 ? "s" : ""} imported
            </span>
          )}
          {totalErrors > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {totalErrors} row{totalErrors !== 1 ? "s" : ""} skipped
            </span>
          )}
          {skippedFiles.length > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <SkipForward className="h-4 w-4 shrink-0" />
              {skippedFiles.length} file{skippedFiles.length !== 1 ? "s" : ""} skipped
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Dismiss
        </button>
      </div>

      {/* Per-file breakdown */}
      <div className="divide-y divide-border">
        {results.map((r, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">
                  {r.filename}
                </span>
                {!r.skipped && (
                  <span className="text-xs text-muted-foreground">
                    Detected as{" "}
                    <span className="text-foreground font-medium">{TYPE_LABEL[r.type]}</span>
                    {r.added > 0 && (
                      <span className="text-green-400">
                        {" "}· {r.added} imported
                      </span>
                    )}
                    {r.errors.length > 0 && (
                      <span className="text-destructive">
                        {" "}· {r.errors.length} error{r.errors.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                )}
                {r.skipped && (
                  <span className="text-xs text-muted-foreground">
                    Skipped — {r.skipped}
                  </span>
                )}
              </div>
              {!r.skipped && r.added > 0 && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
              )}
              {r.skipped && (
                <SkipForward className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              )}
            </div>
            {r.errors.length > 0 && (
              <div className="rounded bg-destructive/10 px-3 py-2 max-h-32 overflow-y-auto space-y-0.5">
                {r.errors.map((e) => (
                  <p key={e.row} className="text-xs text-destructive/80">
                    <span className="font-medium">Row {e.row} ({e.name || "unnamed"}):</span>{" "}
                    {e.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail view components ────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground/80">{label}: </span>
      {value}
    </span>
  );
}

function SpellDetail({ item }: { item: HomebrewSpell }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <DetailRow label="Casting Time" value={item.casting_time} />
        <DetailRow label="Range" value={item.range} />
        <DetailRow label="Duration" value={item.duration} />
        <DetailRow label="Components" value={item.components} />
        {item.concentration === "yes" && (
          <span className="text-xs text-amber-400 font-medium">Concentration</span>
        )}
        {item.ritual === "yes" && (
          <span className="text-xs text-amber-400 font-medium">Ritual</span>
        )}
        {item.dnd_class && <DetailRow label="Classes" value={item.dnd_class} />}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {item.desc}
      </p>
      {item.higher_level && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            At Higher Levels
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.higher_level}</p>
        </div>
      )}
    </div>
  );
}

function ItemDetail({ item }: { item: HomebrewItem }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <DetailRow label="Type" value={item.type} />
        <DetailRow label="Rarity" value={item.rarity} />
        {item.requires_attunement && (
          <span className="text-xs text-amber-400 font-medium">
            {item.requires_attunement}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {item.desc}
      </p>
    </div>
  );
}

function FeatDetail({ item }: { item: HomebrewFeat }) {
  return (
    <div className="space-y-2">
      {item.prerequisite && (
        <DetailRow label="Prerequisite" value={item.prerequisite} />
      )}
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {item.desc}
      </p>
    </div>
  );
}

function SubclassDetail({ item }: { item: HomebrewSubclass }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <DetailRow label="Class" value={item.className} />
        {item.source && <DetailRow label="Source" value={item.source} />}
      </div>
      {item.desc && (
        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
      )}
      {item.features && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Features
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {item.features}
          </p>
        </div>
      )}
    </div>
  );
}

function statMod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

function MonsterDetail({ item }: { item: HomebrewMonster }) {
  const stats: { key: keyof typeof item; label: string }[] = [
    { key: "str", label: "STR" },
    { key: "dex", label: "DEX" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "wis", label: "WIS" },
    { key: "cha", label: "CHA" },
  ];

  return (
    <div className="space-y-3 text-sm">
      {/* Creature identity */}
      <p className="text-xs text-muted-foreground italic">
        {item.size} {item.type}, {item.alignment}
      </p>

      {/* Core combat stats */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground uppercase tracking-wide text-[10px]">Armor Class</p>
          <p className="font-bold text-foreground text-base">{item.ac}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase tracking-wide text-[10px]">Hit Points</p>
          <p className="font-bold text-foreground text-base">{item.hp}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase tracking-wide text-[10px]">Speed</p>
          <p className="font-bold text-foreground text-base">{item.speed}</p>
        </div>
      </div>

      {/* Ability scores */}
      <div className="rounded-md border border-border/50 bg-secondary/30 p-2">
        <div className="grid grid-cols-6 gap-1 text-center">
          {stats.map(({ key, label }) => {
            const score = item[key] as number;
            return (
              <div key={key} className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-sm font-bold text-foreground">{score}</p>
                <p className="text-xs text-muted-foreground">{statMod(score)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CR */}
      <p className="text-xs">
        <span className="font-semibold text-foreground/80">Challenge: </span>
        <span className="text-muted-foreground">{item.cr}</span>
      </p>

      {/* Special abilities */}
      {item.special_abilities && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Special Abilities
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {item.special_abilities}
          </p>
        </div>
      )}

      {/* Actions */}
      {item.actions && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Actions
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {item.actions}
          </p>
        </div>
      )}

      {/* Lore / notes */}
      {item.desc && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Notes
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
        </div>
      )}

      {item.source && (
        <p className="text-xs text-muted-foreground/60 border-t border-border/30 pt-1">
          Source: {item.source}
        </p>
      )}
    </div>
  );
}

function WeaponDetail({ item }: { item: HomebrewWeapon }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <DetailRow label="Category" value={item.category} />
        <DetailRow label="Damage" value={`${item.damage} ${item.damage_type}`} />
        {item.properties && <DetailRow label="Properties" value={item.properties} />}
        {item.weight && <DetailRow label="Weight" value={item.weight} />}
        {item.cost && <DetailRow label="Cost" value={item.cost} />}
      </div>
      {item.desc && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {item.desc}
        </p>
      )}
    </div>
  );
}

function RaceDetail({ item }: { item: HomebrewRace }) {
  const STAT_LABELS: Record<string, string> = {
    strength: "STR", dexterity: "DEX", constitution: "CON",
    intelligence: "INT", wisdom: "WIS", charisma: "CHA",
  };
  const bonuses = Object.entries(item.abilityScoreIncrease)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${STAT_LABELS[k] ?? k}`)
    .join(", ");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <DetailRow label="Size" value={item.size} />
        <DetailRow label="Speed" value={`${item.speed} ft.`} />
        {bonuses && <DetailRow label="Ability Score Increases" value={bonuses} />}
        {item.languages.length > 0 && (
          <DetailRow label="Languages" value={item.languages.join(", ")} />
        )}
      </div>
      {item.traits.length > 0 && (
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Racial Traits
          </p>
          <ul className="space-y-1.5">
            {item.traits.map((t) => (
              <li key={t.name} className="text-xs">
                <span className="font-semibold text-foreground/90">{t.name}.</span>{" "}
                <span className="text-muted-foreground">{t.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.subraces.length > 0 && (
        <p className="text-xs text-muted-foreground border-t border-border/30 pt-2">
          <span className="font-semibold text-foreground/80">Subraces: </span>
          {item.subraces.join(", ")}
        </p>
      )}
    </div>
  );
}

function BackgroundDetail({ item }: { item: HomebrewBackground }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {item.skillProficiencies.length > 0 && (
          <DetailRow label="Skills" value={item.skillProficiencies.join(", ")} />
        )}
        {item.toolProficiencies.length > 0 && (
          <DetailRow label="Tools" value={item.toolProficiencies.join(", ")} />
        )}
        {item.languages > 0 && (
          <DetailRow
            label="Languages"
            value={`${item.languages} of your choice`}
          />
        )}
      </div>
      {item.equipment.length > 0 && (
        <DetailRow label="Equipment" value={item.equipment.join(", ")} />
      )}
      <div className="border-t border-border/30 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Feature: {item.feature.name}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {item.feature.desc}
        </p>
      </div>
    </div>
  );
}

// ── Filter primitives ─────────────────────────────────────────────────────────

function TabSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 rounded-md border border-input bg-background pl-8 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FilterChips({
  label,
  options,
  active,
  onToggle,
}: {
  label: string;
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
}) {
  if (options.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
        {label}:
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
            active.includes(opt)
              ? "border-primary bg-primary/20 text-primary font-medium"
              : "border-border bg-card text-muted-foreground hover:border-primary/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ToggleFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
        {label}:
      </span>
      <button
        onClick={() => onChange(value === true ? null : true)}
        className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
          value === true
            ? "border-green-500/70 bg-green-500/15 text-green-400 font-medium"
            : "border-border bg-card text-muted-foreground hover:border-green-500/50"
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(value === false ? null : false)}
        className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
          value === false
            ? "border-destructive/70 bg-destructive/15 text-destructive font-medium"
            : "border-border bg-card text-muted-foreground hover:border-destructive/50"
        }`}
      >
        No
      </button>
    </div>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2.5 space-y-2">
      {children}
    </div>
  );
}

function tog(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function crToNum(cr: string): number {
  if (cr.includes("/")) {
    const [n, d] = cr.split("/");
    return Number(n) / Number(d);
  }
  return Number(cr) || 0;
}

// ── Per-tab components (each owns its own filter + form state) ────────────────

function SpellsTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fSchools, setFSchools] = useState<string[]>([]);
  const [fLevels, setFLevels] = useState<string[]>([]);
  const [fConc, setFConc] = useState<boolean | null>(null);
  const [fRitual, setFRitual] = useState<boolean | null>(null);

  const schools = [...new Set(store.spells.map((s) => s.school))].sort();
  const levels = [...new Set(store.spells.map((s) => s.level))].sort((a, b) =>
    a === "Cantrip" ? -1 : b === "Cantrip" ? 1 : Number(a) - Number(b),
  );

  const filtered = store.spells.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fSchools.length && !fSchools.includes(s.school)) return false;
    if (fLevels.length && !fLevels.includes(s.level)) return false;
    if (fConc !== null && (s.concentration === "yes") !== fConc) return false;
    if (fRitual !== null && (s.ritual === "yes") !== fRitual) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Spell
      </Button>
      {showForm && (
        <SpellForm
          onSave={(s) => { store.addSpell(s); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.spells.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search spells…" />
          <FilterChips label="School" options={schools} active={fSchools} onToggle={(v) => setFSchools(tog(fSchools, v))} />
          <FilterChips label="Level" options={levels} active={fLevels} onToggle={(v) => setFLevels(tog(fLevels, v))} />
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <ToggleFilter label="Concentration" value={fConc} onChange={setFConc} />
            <ToggleFilter label="Ritual" value={fRitual} onChange={setFRitual} />
          </div>
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(s) =>
          `${s.school} · ${s.level === "Cantrip" ? "Cantrip" : `Level ${s.level_int}`} · ${s.dnd_class || "—"}`
        }
        renderDetail={(s) => <SpellDetail item={s} />}
        onRemove={(s) => store.removeSpell(s.slug)}
      />
    </>
  );
}

function ItemsTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fRarities, setFRarities] = useState<string[]>([]);
  const [fTypes, setFTypes] = useState<string[]>([]);
  const [fAttuned, setFAttuned] = useState<boolean | null>(null);

  const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];
  const presentRarities = new Set(store.items.map((i) => i.rarity));
  const rarities = RARITY_ORDER.filter((r) => presentRarities.has(r));
  const types = [...new Set(store.items.map((i) => i.type))].sort();

  const filtered = store.items.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fRarities.length && !fRarities.includes(i.rarity)) return false;
    if (fTypes.length && !fTypes.includes(i.type)) return false;
    if (fAttuned !== null && !!i.requires_attunement !== fAttuned) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Item
      </Button>
      {showForm && (
        <ItemForm
          onSave={(item) => { store.addItem(item); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.items.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search items…" />
          <FilterChips label="Rarity" options={rarities} active={fRarities} onToggle={(v) => setFRarities(tog(fRarities, v))} />
          <FilterChips label="Type" options={types} active={fTypes} onToggle={(v) => setFTypes(tog(fTypes, v))} />
          <ToggleFilter label="Requires Attunement" value={fAttuned} onChange={setFAttuned} />
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(item) => `${item.rarity} · ${item.type}`}
        renderDetail={(item) => <ItemDetail item={item} />}
        onRemove={(item) => store.removeItem(item.slug)}
      />
    </>
  );
}

function FeatsTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fPrereq, setFPrereq] = useState<boolean | null>(null);

  const filtered = store.feats.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fPrereq !== null && !!f.prerequisite !== fPrereq) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Feat
      </Button>
      {showForm && (
        <FeatForm
          onSave={(feat) => { store.addFeat(feat); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.feats.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search feats…" />
          <ToggleFilter label="Has Prerequisite" value={fPrereq} onChange={setFPrereq} />
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(feat) => (feat.prerequisite ? `Req: ${feat.prerequisite}` : "No prerequisite")}
        renderDetail={(feat) => <FeatDetail item={feat} />}
        onRemove={(feat) => store.removeFeat(feat.slug)}
      />
    </>
  );
}

function SubclassesTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fClasses, setFClasses] = useState<string[]>([]);

  const classes = [...new Set(store.subclasses.map((sc) => sc.className))].sort();

  const filtered = store.subclasses.filter((sc) => {
    if (search && !sc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fClasses.length && !fClasses.includes(sc.className)) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Subclass
      </Button>
      {showForm && (
        <SubclassForm
          onSave={(sc) => { store.addSubclass(sc); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.subclasses.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search subclasses…" />
          <FilterChips label="Class" options={classes} active={fClasses} onToggle={(v) => setFClasses(tog(fClasses, v))} />
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(sc) => `${sc.className}${sc.source ? ` · ${sc.source}` : ""}`}
        renderDetail={(sc) => <SubclassDetail item={sc} />}
        onRemove={(sc) => store.removeSubclass(sc.slug)}
      />
    </>
  );
}

function MonstersTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fTypes, setFTypes] = useState<string[]>([]);
  const [fSizes, setFSizes] = useState<string[]>([]);
  const [fCRs, setFCRs] = useState<string[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);

  const SIZE_ORDER = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
  const presentSizes = new Set(store.monsters.map((m) => m.size));
  const sizes = SIZE_ORDER.filter((s) => presentSizes.has(s));
  const types = [...new Set(store.monsters.map((m) => m.type))].sort();
  const crs = [...new Set(store.monsters.map((m) => m.cr))].sort(
    (a, b) => crToNum(a) - crToNum(b),
  );

  const filtered = store.monsters.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fTypes.length && !fTypes.includes(m.type)) return false;
    if (fSizes.length && !fSizes.includes(m.size)) return false;
    if (fCRs.length && !fCRs.includes(m.cr)) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Monster
      </Button>
      {showForm && (
        <MonsterForm
          onSave={(m) => { store.addMonster(m); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.monsters.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search monsters…" />
          <FilterChips label="Size" options={sizes} active={fSizes} onToggle={(v) => setFSizes(tog(fSizes, v))} />
          <FilterChips label="CR" options={crs} active={fCRs} onToggle={(v) => setFCRs(tog(fCRs, v))} />
          {/* Creature type — expandable because there can be many */}
          {types.length >= 2 && (
            <div>
              <button
                onClick={() => setTypeOpen((v) => !v)}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {typeOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Creature Type
                {fTypes.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-primary">
                    {fTypes.length}
                  </span>
                )}
              </button>
              {typeOpen && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {types.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFTypes(tog(fTypes, t))}
                      className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                        fTypes.includes(t)
                          ? "border-primary bg-primary/20 text-primary font-medium"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(m) =>
          `CR ${m.cr} · ${m.size} ${m.type}${m.source ? ` · ${m.source}` : ""}`
        }
        renderDetail={(m) => <MonsterDetail item={m} />}
        onRemove={(m) => store.removeMonster(m.slug)}
      />
    </>
  );
}

function WeaponsTab() {
  const store = useHomebrewStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fCategories, setFCategories] = useState<string[]>([]);
  const [fDmgTypes, setFDmgTypes] = useState<string[]>([]);

  const categories = [...new Set(store.weapons.map((w) => w.category))].sort();
  const dmgTypes = [...new Set(store.weapons.map((w) => w.damage_type))].sort();

  const filtered = store.weapons.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fCategories.length && !fCategories.includes(w.category)) return false;
    if (fDmgTypes.length && !fDmgTypes.includes(w.damage_type)) return false;
    return true;
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm((v) => !v)}>
        <Plus className="h-4 w-4" /> Add Weapon
      </Button>
      {showForm && (
        <WeaponForm
          onSave={(w) => { store.addWeapon(w); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {store.weapons.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search weapons…" />
          <FilterChips label="Category" options={categories} active={fCategories} onToggle={(v) => setFCategories(tog(fCategories, v))} />
          <FilterChips label="Damage Type" options={dmgTypes} active={fDmgTypes} onToggle={(v) => setFDmgTypes(tog(fDmgTypes, v))} />
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(w) =>
          `${w.category} · ${w.damage} ${w.damage_type}${w.properties ? ` · ${w.properties}` : ""}`
        }
        renderDetail={(w) => <WeaponDetail item={w} />}
        onRemove={(w) => store.removeWeapon(w.slug)}
      />
    </>
  );
}

function RacesTab({ onSwitchToCSV }: { onSwitchToCSV: () => void }) {
  const store = useHomebrewStore();
  const [search, setSearch] = useState("");
  const [fSizes, setFSizes] = useState<string[]>([]);
  const [fAsi, setFAsi] = useState<string[]>([]);

  const SIZE_ORDER = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"] as const;
  const presentSizes = new Set(store.races.map((r) => r.size));
  const sizes = SIZE_ORDER.filter((s) => presentSizes.has(s)) as string[];
  const STAT_LABELS: Record<string, string> = {
    strength: "STR", dexterity: "DEX", constitution: "CON",
    intelligence: "INT", wisdom: "WIS", charisma: "CHA",
  };
  const asiOptions = Object.entries(STAT_LABELS)
    .filter(([key]) =>
      store.races.some((r) => ((r.abilityScoreIncrease as Record<string, number>)[key] ?? 0) > 0),
    )
    .map(([, abbr]) => abbr);

  const filtered = store.races.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fSizes.length && !fSizes.includes(r.size)) return false;
    if (fAsi.length) {
      const asiMap: Record<string, string> = {
        STR: "strength", DEX: "dexterity", CON: "constitution",
        INT: "intelligence", WIS: "wisdom", CHA: "charisma",
      };
      const hasAsi = fAsi.some(
        (abbr) => ((r.abilityScoreIncrease as Record<string, number>)[asiMap[abbr]!] ?? 0) > 0,
      );
      if (!hasAsi) return false;
    }
    return true;
  });

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Races have nested trait structures. Use{" "}
        <button onClick={onSwitchToCSV} className="text-primary underline underline-offset-2">
          CSV import
        </button>{" "}
        for bulk entry, or JSON import (via the header button) for full control.
      </p>
      {store.races.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search races…" />
          <FilterChips label="Size" options={sizes} active={fSizes} onToggle={(v) => setFSizes(tog(fSizes, v))} />
          <FilterChips label="ASI" options={asiOptions} active={fAsi} onToggle={(v) => setFAsi(tog(fAsi, v))} />
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(r) =>
          `${r.size} · ${r.speed} ft.${r.subraces.length > 0 ? ` · ${r.subraces.length} subraces` : ""}`
        }
        renderDetail={(r) => <RaceDetail item={r} />}
        onRemove={(r) => store.removeRace(r.slug)}
      />
    </>
  );
}

function BackgroundsTab({ onSwitchToCSV }: { onSwitchToCSV: () => void }) {
  const store = useHomebrewStore();
  const [search, setSearch] = useState("");
  const [fSkills, setFSkills] = useState<string[]>([]);
  const [fHasTools, setFHasTools] = useState<boolean | null>(null);
  const [fHasLangs, setFHasLangs] = useState<boolean | null>(null);

  const allSkills = [
    ...new Set(store.backgrounds.flatMap((b) => b.skillProficiencies)),
  ].sort();

  const filtered = store.backgrounds.filter((b) => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fSkills.length && !fSkills.some((s) => b.skillProficiencies.includes(s))) return false;
    if (fHasTools !== null && (b.toolProficiencies.length > 0) !== fHasTools) return false;
    if (fHasLangs !== null && (b.languages > 0) !== fHasLangs) return false;
    return true;
  });

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Use{" "}
        <button onClick={onSwitchToCSV} className="text-primary underline underline-offset-2">
          CSV import
        </button>{" "}
        for bulk entry, or JSON import for full control.
      </p>
      {store.backgrounds.length > 0 && (
        <FilterBar>
          <TabSearch value={search} onChange={setSearch} placeholder="Search backgrounds…" />
          <FilterChips label="Skill" options={allSkills} active={fSkills} onToggle={(v) => setFSkills(tog(fSkills, v))} />
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <ToggleFilter label="Tool Proficiency" value={fHasTools} onChange={setFHasTools} />
            <ToggleFilter label="Language Choice" value={fHasLangs} onChange={setFHasLangs} />
          </div>
        </FilterBar>
      )}
      <EntityList
        items={filtered}
        renderLabel={(b) => `Skills: ${b.skillProficiencies.join(", ") || "—"}`}
        renderDetail={(b) => <BackgroundDetail item={b} />}
        onRemove={(b) => store.removeBackground(b.slug)}
      />
    </>
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


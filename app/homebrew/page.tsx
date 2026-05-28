"use client";

import { useRef, useState } from "react";
import { useHomebrewStore } from "@/store/homebrewStore";
import {
  HomebrewCollectionSchema,
  HomebrewSpellSchema,
  HomebrewItemSchema,
  HomebrewFeatSchema,
  type HomebrewSpell,
  type HomebrewItem,
  type HomebrewFeat,
} from "@/lib/schemas/homebrew";
import {
  importSpellsFromCSV,
  importItemsFromCSV,
  importFeatsFromCSV,
  spellTemplate,
  itemTemplate,
  featTemplate,
  downloadCSV,
  type ImportResult,
} from "@/lib/csvImport";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Download, Plus, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { SPELL_SCHOOLS } from "@/lib/srd/index";

type Tab = "spells" | "items" | "feats";
type Mode = "manual" | "csv";

export default function HomebrewPage() {
  const store = useHomebrewStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("spells");
  const [mode, setMode] = useState<Mode>("manual");
  const [importError, setImportError] = useState<string | null>(null);
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showFeatForm, setShowFeatForm] = useState(false);
  const [csvResult, setCsvResult] = useState<{
    added: number;
    errors: { row: number; name: string; message: string }[];
  } | null>(null);

  const exportCollection = () => {
    const data = JSON.stringify(
      { spells: store.spells, races: store.races, items: store.items, backgrounds: store.backgrounds, feats: store.feats },
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
    if (file.size > 1_048_576) { setImportError("File exceeds 1 MB limit."); return; }
    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const result = HomebrewCollectionSchema.safeParse(json);
      if (!result.success) {
        setImportError(result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        return;
      }
      store.importCollection(result.data);
    } catch {
      setImportError("Invalid JSON file.");
    }
  };

  const handleCSVFile = async (file: File) => {
    setCsvResult(null);
    if (file.size > 2_097_152) { setImportError("File exceeds 2 MB limit."); return; }
    setImportError(null);
    const text = await file.text();

    let result: ImportResult<HomebrewSpell> | ImportResult<HomebrewItem> | ImportResult<HomebrewFeat>;

    if (tab === "spells") {
      result = importSpellsFromCSV(text);
      result.ok.forEach((s) => store.addSpell(s as HomebrewSpell));
    } else if (tab === "items") {
      result = importItemsFromCSV(text);
      result.ok.forEach((item) => store.addItem(item as HomebrewItem));
    } else {
      result = importFeatsFromCSV(text);
      result.ok.forEach((f) => store.addFeat(f as HomebrewFeat));
    }

    setCsvResult({ added: result.ok.length, errors: result.errors });
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const handleTemplateDownload = () => {
    if (tab === "spells") downloadCSV(spellTemplate(), "spell-template.csv");
    else if (tab === "items") downloadCSV(itemTemplate(), "item-template.csv");
    else downloadCSV(featTemplate(), "feat-template.csv");
  };

  const totalCount =
    store.spells.length + store.races.length + store.items.length +
    store.backgrounds.length + store.feats.length;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Homebrew Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount} homebrew entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCollection}>
            <Download className="h-4 w-4" />Export All
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportJSON(f); e.target.value = ""; }}
          />
          {totalCount > 0 && (
            <Button variant="destructive" size="sm" onClick={() => { store.resetHomebrew(); setCsvResult(null); }}>
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

      {/* Entity tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["spells", "items", "feats"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setCsvResult(null); }}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors -mb-px ${
              tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} ({t === "spells" ? store.spells.length : t === "items" ? store.items.length : store.feats.length})
          </button>
        ))}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
        <button
          onClick={() => { setMode("manual"); setCsvResult(null); }}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "manual" ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => { setMode("csv"); setCsvResult(null); }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "csv" ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Bulk CSV Import
        </button>
      </div>

      {/* ── CSV MODE ── */}
      {mode === "csv" && (
        <div className="space-y-4">
          {/* Explainer */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-base text-foreground">Bulk import from a spreadsheet</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fill in a CSV file with your own content (from your books, notes, or any source you
              own) and upload it here. Data stays in your browser — nothing is shared.
            </p>
            <div className="rounded-lg bg-secondary/50 border border-border px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide">Column names are flexible</p>
              <p className="text-muted-foreground text-xs">
                Headers are matched case-insensitively. &ldquo;Casting Time&rdquo;, &ldquo;castingtime&rdquo;, and &ldquo;Cast Time&rdquo; all work.
                Columns you don&apos;t need can be omitted.
              </p>
            </div>

            {/* Expected columns per type */}
            <div className="text-xs text-muted-foreground space-y-1.5">
              {tab === "spells" && (
                <>
                  <p className="font-medium text-foreground">Expected columns for spells:</p>
                  <p className="font-mono bg-secondary rounded px-2 py-1 text-[11px] leading-relaxed">
                    Name · Level (0–9 or &ldquo;Cantrip&rdquo;) · School · Casting Time · Range ·
                    Components · Duration · Concentration (yes/no) · Ritual (yes/no) ·
                    Classes · Description · At Higher Levels
                  </p>
                </>
              )}
              {tab === "items" && (
                <>
                  <p className="font-medium text-foreground">Expected columns for items:</p>
                  <p className="font-mono bg-secondary rounded px-2 py-1 text-[11px] leading-relaxed">
                    Name · Type · Rarity · Requires Attunement · Description
                  </p>
                </>
              )}
              {tab === "feats" && (
                <>
                  <p className="font-medium text-foreground">Expected columns for feats:</p>
                  <p className="font-mono bg-secondary rounded px-2 py-1 text-[11px] leading-relaxed">
                    Name · Prerequisite · Description
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleTemplateDownload}>
                <Download className="h-3.5 w-3.5" />
                Download {tab === "spells" ? "Spell" : tab === "items" ? "Item" : "Feat"} Template (.csv)
              </Button>
              <Button variant="gold" size="sm" className="gap-2" onClick={() => csvInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSVFile(f); }}
              />
            </div>
          </div>

          {/* Import results */}
          {csvResult && (
            <div className="space-y-2">
              {csvResult.added > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Successfully imported {csvResult.added} {tab}.
                </div>
              )}
              {csvResult.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {csvResult.errors.length} row{csvResult.errors.length !== 1 ? "s" : ""} had errors and were skipped
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {csvResult.errors.map((e) => (
                      <p key={e.row} className="text-xs text-destructive/80">
                        <span className="font-medium">Row {e.row} ({e.name || "unnamed"}):</span> {e.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {csvResult.added === 0 && csvResult.errors.length === 0 && (
                <p className="text-sm text-muted-foreground">No rows found in file.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL MODE ── */}
      {mode === "manual" && (
        <>
          {/* Spells */}
          {tab === "spells" && (
            <div className="space-y-4">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowSpellForm((v) => !v)}>
                <Plus className="h-4 w-4" />Add Spell
              </Button>
              {showSpellForm && (
                <SpellForm
                  onSave={(s) => { store.addSpell(s); setShowSpellForm(false); }}
                  onCancel={() => setShowSpellForm(false)}
                />
              )}
              <EntityList
                items={store.spells}
                renderLabel={(s) => `${s.school} · ${s.level === "Cantrip" ? "Cantrip" : `L${s.level_int}`} · ${s.dnd_class}`}
                onRemove={(s) => store.removeSpell(s.slug)}
              />
            </div>
          )}

          {/* Items */}
          {tab === "items" && (
            <div className="space-y-4">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowItemForm((v) => !v)}>
                <Plus className="h-4 w-4" />Add Item
              </Button>
              {showItemForm && (
                <ItemForm
                  onSave={(item) => { store.addItem(item); setShowItemForm(false); }}
                  onCancel={() => setShowItemForm(false)}
                />
              )}
              <EntityList
                items={store.items}
                renderLabel={(item) => `${item.rarity} · ${item.type}`}
                onRemove={(item) => store.removeItem(item.slug)}
              />
            </div>
          )}

          {/* Feats */}
          {tab === "feats" && (
            <div className="space-y-4">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowFeatForm((v) => !v)}>
                <Plus className="h-4 w-4" />Add Feat
              </Button>
              {showFeatForm && (
                <FeatForm
                  onSave={(feat) => { store.addFeat(feat); setShowFeatForm(false); }}
                  onCancel={() => setShowFeatForm(false)}
                />
              )}
              <EntityList
                items={store.feats}
                renderLabel={(feat) => feat.prerequisite ? `Req: ${feat.prerequisite}` : "No prerequisite"}
                onRemove={(feat) => store.removeFeat(feat.slug)}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}

/* ── Shared entity list ──────────────────────────────────────────────────────── */

function EntityList<T extends { slug: string; name: string }>({
  items,
  renderLabel,
  onRemove,
}: {
  items: T[];
  renderLabel: (item: T) => string;
  onRemove: (item: T) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground py-4">Nothing here yet.</p>;
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.slug} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="ml-3 text-xs text-muted-foreground">{renderLabel(item)}</span>
          </div>
          <button onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Inline forms ─────────────────────────────────────────────────────────── */

function SpellForm({ onSave, onCancel }: { onSave: (s: HomebrewSpell) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    name: "", school: "Evocation", level_int: 1, dnd_class: "",
    casting_time: "1 action", range: "60 feet", components: "V, S",
    duration: "Instantaneous", concentration: "no" as "yes" | "no",
    ritual: "no" as "yes" | "no", desc: "", higher_level: "",
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
    if (!result.success) { setError(result.error.errors[0]?.message ?? "Validation error"); return; }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Spell</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *"><Input value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="School">
          <select value={f.school} onChange={(e) => setF((p) => ({ ...p, school: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
            {SPELL_SCHOOLS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Level (0=Cantrip)"><Input type="number" min={0} max={9} value={f.level_int} onChange={(e) => setF((p) => ({ ...p, level_int: parseInt(e.target.value, 10) || 0 }))} /></Field>
        <Field label="Classes (comma-sep)"><Input value={f.dnd_class} onChange={(e) => setF((p) => ({ ...p, dnd_class: e.target.value }))} /></Field>
        <Field label="Casting Time"><Input value={f.casting_time} onChange={(e) => setF((p) => ({ ...p, casting_time: e.target.value }))} /></Field>
        <Field label="Range"><Input value={f.range} onChange={(e) => setF((p) => ({ ...p, range: e.target.value }))} /></Field>
        <Field label="Components"><Input value={f.components} onChange={(e) => setF((p) => ({ ...p, components: e.target.value }))} /></Field>
        <Field label="Duration"><Input value={f.duration} onChange={(e) => setF((p) => ({ ...p, duration: e.target.value }))} /></Field>
      </div>
      <Field label="Description *">
        <textarea value={f.desc} onChange={(e) => setF((p) => ({ ...p, desc: e.target.value }))} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>Save Spell</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function ItemForm({ onSave, onCancel }: { onSave: (item: HomebrewItem) => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: "", type: "Wondrous Item", rarity: "Uncommon", requires_attunement: "", desc: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = { ...f, slug: slugify(f.name) || `hb-item-${Date.now()}`, isHomebrew: true as const };
    const result = HomebrewItemSchema.safeParse(data);
    if (!result.success) { setError(result.error.errors[0]?.message ?? "Validation error"); return; }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Item</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *"><Input value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Type"><Input value={f.type} onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))} /></Field>
        <Field label="Rarity">
          <select value={f.rarity} onChange={(e) => setF((p) => ({ ...p, rarity: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
            {["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Attunement"><Input value={f.requires_attunement} placeholder="requires attunement (optional)" onChange={(e) => setF((p) => ({ ...p, requires_attunement: e.target.value }))} /></Field>
      </div>
      <Field label="Description *">
        <textarea value={f.desc} onChange={(e) => setF((p) => ({ ...p, desc: e.target.value }))} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>Save Item</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function FeatForm({ onSave, onCancel }: { onSave: (feat: HomebrewFeat) => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: "", prerequisite: "", desc: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const data = { ...f, slug: slugify(f.name) || `hb-feat-${Date.now()}`, isHomebrew: true as const };
    const result = HomebrewFeatSchema.safeParse(data);
    if (!result.success) { setError(result.error.errors[0]?.message ?? "Validation error"); return; }
    onSave(result.data);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">New Homebrew Feat</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *"><Input value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Prerequisite"><Input value={f.prerequisite} onChange={(e) => setF((p) => ({ ...p, prerequisite: e.target.value }))} /></Field>
      </div>
      <Field label="Description *">
        <textarea value={f.desc} onChange={(e) => setF((p) => ({ ...p, desc: e.target.value }))} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="gold" onClick={handleSave}>Save Feat</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</label>
      {children}
    </div>
  );
}

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
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Download, Plus } from "lucide-react";
import { SPELL_SCHOOLS } from "@/lib/srd/index";

type Tab = "spells" | "items" | "feats";

export default function HomebrewPage() {
  const store = useHomebrewStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("spells");
  const [importError, setImportError] = useState<string | null>(null);
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showFeatForm, setShowFeatForm] = useState(false);

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

  const handleImport = async (file: File) => {
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

  const totalCount =
    store.spells.length +
    store.races.length +
    store.items.length +
    store.backgrounds.length +
    store.feats.length;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
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
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }}
          />
          {totalCount > 0 && (
            <Button variant="destructive" size="sm" onClick={() => store.resetHomebrew()}>
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {(["spells", "items", "feats"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors -mb-px ${
              tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} ({t === "spells" ? store.spells.length : t === "items" ? store.items.length : store.feats.length})
          </button>
        ))}
      </div>

      {/* Spells tab */}
      {tab === "spells" && (
        <div className="space-y-4">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowSpellForm((v) => !v)}>
            <Plus className="h-4 w-4" />Add Spell
          </Button>
          {showSpellForm && <SpellForm onSave={(s) => { store.addSpell(s); setShowSpellForm(false); }} onCancel={() => setShowSpellForm(false)} />}
          <div className="space-y-1.5">
            {store.spells.length === 0 && <p className="text-sm text-muted-foreground py-4">No homebrew spells yet.</p>}
            {store.spells.map((s) => (
              <div key={s.slug} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="ml-3 text-xs text-muted-foreground">{s.school} · {s.level === "Cantrip" ? "Cantrip" : `L${s.level_int}`} · {s.dnd_class}</span>
                </div>
                <button onClick={() => store.removeSpell(s.slug)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items tab */}
      {tab === "items" && (
        <div className="space-y-4">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowItemForm((v) => !v)}>
            <Plus className="h-4 w-4" />Add Item
          </Button>
          {showItemForm && <ItemForm onSave={(item) => { store.addItem(item); setShowItemForm(false); }} onCancel={() => setShowItemForm(false)} />}
          <div className="space-y-1.5">
            {store.items.length === 0 && <p className="text-sm text-muted-foreground py-4">No homebrew items yet.</p>}
            {store.items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="ml-3 text-xs text-muted-foreground">{item.rarity} · {item.type}</span>
                </div>
                <button onClick={() => store.removeItem(item.slug)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feats tab */}
      {tab === "feats" && (
        <div className="space-y-4">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowFeatForm((v) => !v)}>
            <Plus className="h-4 w-4" />Add Feat
          </Button>
          {showFeatForm && <FeatForm onSave={(feat) => { store.addFeat(feat); setShowFeatForm(false); }} onCancel={() => setShowFeatForm(false)} />}
          <div className="space-y-1.5">
            {store.feats.length === 0 && <p className="text-sm text-muted-foreground py-4">No homebrew feats yet.</p>}
            {store.feats.map((feat) => (
              <div key={feat.slug} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">{feat.name}</span>
                  {feat.prerequisite && <span className="ml-3 text-xs text-muted-foreground">Req: {feat.prerequisite}</span>}
                </div>
                <button onClick={() => store.removeFeat(feat.slug)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
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

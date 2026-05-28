"use client";

import { useState } from "react";
import { useDmStore, type Combatant } from "@/store/dmStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CONDITIONS } from "@/lib/srd/conditions";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ChevronRight, Heart, Shield, Skull } from "lucide-react";
import monstersData from "@/data/srd/monsters.json";
import { type Monster } from "@/lib/schemas/monster";

const allMonsters = monstersData as unknown as Monster[];

interface AddForm {
  name: string;
  initiative: string;
  hpMax: string;
  ac: string;
  isPC: boolean;
  monsterSearch: string;
}

const defaultForm: AddForm = {
  name: "",
  initiative: "",
  hpMax: "10",
  ac: "10",
  isPC: false,
  monsterSearch: "",
};

export function InitiativeTracker() {
  const store = useDmStore();
  const [form, setForm] = useState<AddForm>(defaultForm);
  const [showAdd, setShowAdd] = useState(false);
  const [monsterSuggestions, setMonsterSuggestions] = useState<Monster[]>([]);
  const [hpEdit, setHpEdit] = useState<Record<string, string>>({});
  const [dmgInput, setDmgInput] = useState<Record<string, string>>({});

  const handleMonsterSearch = (q: string) => {
    setForm((f) => ({ ...f, monsterSearch: q, name: q }));
    if (q.length < 2) {
      setMonsterSuggestions([]);
      return;
    }
    const matches = allMonsters
      .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6);
    setMonsterSuggestions(matches);
  };

  const selectMonster = (m: Monster) => {
    setForm((f) => ({
      ...f,
      name: m.name,
      hpMax: String(m.hit_points),
      ac: String(m.armor_class),
      monsterSearch: m.name,
      isPC: false,
    }));
    setMonsterSuggestions([]);
  };

  const handleAdd = () => {
    const hp = parseInt(form.hpMax, 10) || 10;
    const ac = parseInt(form.ac, 10) || 10;
    const init = parseInt(form.initiative, 10) || 0;
    if (!form.name.trim()) return;

    store.addCombatant({
      name: form.name.trim().slice(0, 100),
      initiative: init,
      hpMax: hp,
      hpCurrent: hp,
      ac,
      conditions: [],
      isConcentrating: false,
      notes: "",
      isPC: form.isPC,
    });
    setForm(defaultForm);
    setShowAdd(false);
  };

  const applyDmgHeal = (id: string, heal: boolean) => {
    const val = parseInt(dmgInput[id] ?? "", 10);
    if (isNaN(val) || val <= 0) return;
    if (heal) store.applyHealing(id, val);
    else store.applyDamage(id, val);
    setDmgInput((prev) => ({ ...prev, [id]: "" }));
  };

  const currentCombatant = store.combatants[store.currentTurnIndex];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-primary">Initiative Tracker</h2>
          {store.isRunning && (
            <p className="text-xs text-muted-foreground">Round {store.round}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!store.isRunning ? (
            <Button
              onClick={store.startCombat}
              size="sm"
              variant="gold"
              disabled={store.combatants.length === 0}
            >
              Start Combat
            </Button>
          ) : (
            <>
              <Button onClick={store.prevTurn} size="sm" variant="outline">
                ← Prev
              </Button>
              <Button onClick={store.nextTurn} size="sm" variant="default">
                Next Turn →
              </Button>
              <Button onClick={store.endCombat} size="sm" variant="destructive">
                End
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowAdd((v) => !v)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Add combatant form */}
      {showAdd && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          {/* Monster search */}
          <div className="relative">
            <Input
              placeholder="Search monster or enter name..."
              value={form.monsterSearch}
              onChange={(e) => handleMonsterSearch(e.target.value)}
              onBlur={() => setTimeout(() => setMonsterSuggestions([]), 200)}
            />
            {monsterSuggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-lg">
                {monsterSuggestions.map((m) => (
                  <button
                    key={m.slug}
                    onClick={() => selectMonster(m)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                  >
                    <span>{m.name}</span>
                    <span className="text-xs text-muted-foreground">
                      CR {m.challenge_rating} · HP {m.hit_points} · AC {m.armor_class}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Initiative</label>
              <Input
                type="number"
                value={form.initiative}
                onChange={(e) => setForm((f) => ({ ...f, initiative: e.target.value }))}
                placeholder="Roll..."
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Max HP</label>
              <Input
                type="number"
                value={form.hpMax}
                onChange={(e) => setForm((f) => ({ ...f, hpMax: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">AC</label>
              <Input
                type="number"
                value={form.ac}
                onChange={(e) => setForm((f) => ({ ...f, ac: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setForm((f) => ({ ...f, isPC: !f.isPC }))}
              className={cn(
                "text-xs rounded border px-2 py-1 transition-colors",
                form.isPC
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-muted-foreground"
              )}
            >
              {form.isPC ? "PC" : "Monster/NPC"}
            </button>
            <Button onClick={handleAdd} size="sm" variant="gold" className="ml-auto">
              Add Combatant
            </Button>
          </div>
        </div>
      )}

      {/* Combatants list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {store.combatants.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Add combatants above, then press Start Combat.
          </div>
        )}

        {store.combatants.map((c, idx) => {
          const isActive = store.isRunning && idx === store.currentTurnIndex;
          const hpPercent = c.hpMax > 0 ? (c.hpCurrent / c.hpMax) * 100 : 0;

          return (
            <div
              key={c.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                isActive
                  ? "border-primary/60 bg-primary/8"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start gap-2">
                {/* Initiative bubble */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border text-sm font-bold flex items-center justify-center shrink-0",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary"
                  )}
                >
                  {c.initiative}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("font-medium text-sm truncate", isActive && "text-primary")}>
                      {c.name}
                    </span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    {c.isConcentrating && (
                      <Badge variant="outline" className="text-[10px] py-0">Conc.</Badge>
                    )}
                  </div>

                  {/* HP bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          hpPercent > 50 ? "bg-green-500" : hpPercent > 25 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {c.hpCurrent}/{c.hpMax}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-0.5">
                      <Shield className="h-3 w-3" />{c.ac}
                    </span>
                  </div>

                  {/* Damage/Heal input */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Input
                      type="number"
                      placeholder="Amt"
                      min={0}
                      value={dmgInput[c.id] ?? ""}
                      onChange={(e) => setDmgInput((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="h-6 w-16 text-xs px-2"
                    />
                    <Button
                      onClick={() => applyDmgHeal(c.id, false)}
                      size="sm"
                      variant="destructive"
                      className="h-6 px-2 text-xs gap-0.5"
                    >
                      <Skull className="h-3 w-3" />Dmg
                    </Button>
                    <Button
                      onClick={() => applyDmgHeal(c.id, true)}
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs gap-0.5"
                    >
                      <Heart className="h-3 w-3" />Heal
                    </Button>
                    <button
                      onClick={() => store.removeCombatant(c.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      aria-label="Remove combatant"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Conditions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {CONDITIONS.slice(0, 8).map((cond) => {
                      const active = c.conditions.includes(cond.slug);
                      return (
                        <button
                          key={cond.slug}
                          onClick={() => store.toggleCondition(c.id, cond.slug)}
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] transition-colors border",
                            active
                              ? "border-accent/60 bg-accent/20 text-accent-foreground"
                              : "border-border/30 bg-muted/30 text-muted-foreground hover:border-border"
                          )}
                        >
                          {cond.name}
                        </button>
                      );
                    })}
                    {c.conditions.filter(
                      (cond) => !CONDITIONS.slice(0, 8).some((c2) => c2.slug === cond)
                    ).map((cond) => (
                      <Badge key={cond} variant="burgundy" className="text-[10px]">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {store.combatants.length > 0 && (
        <Button
          onClick={store.clearCombatants}
          size="sm"
          variant="outline"
          className="w-full text-muted-foreground"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

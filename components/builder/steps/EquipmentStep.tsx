"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { getClass } from "@/lib/srd/classes";
import { getBackground } from "@/lib/srd/backgrounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

export function EquipmentStep() {
  const { classSlug, background, chosenEquipment, setChosenEquipment, nextStep } = useBuilderStore();
  const classData = getClass(classSlug);
  const bgData = getBackground(background);
  const [custom, setCustom] = useState("");

  const bgEquip = bgData?.equipment ?? [];
  const classOptions = classData?.startingEquipmentOptions ?? [];

  const allItems = [...new Set([...bgEquip, ...chosenEquipment])];

  const addCustom = () => {
    if (!custom.trim()) return;
    const trimmed = custom.trim().slice(0, 100);
    setChosenEquipment([...chosenEquipment, trimmed]);
    setCustom("");
  };

  const removeItem = (item: string) => {
    if (bgEquip.includes(item)) return; // can't remove background equipment
    setChosenEquipment(chosenEquipment.filter((e) => e !== item));
  };

  const addPreset = (item: string) => {
    if (!chosenEquipment.includes(item)) {
      setChosenEquipment([...chosenEquipment, item]);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-foreground">Starting Equipment</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review your starting gear from background and class, then add or remove items.
        </p>
      </div>

      {/* Background equipment */}
      {bgEquip.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            From Background ({bgData?.name})
          </p>
          <ul className="space-y-1">
            {bgEquip.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Class equipment options */}
      {classOptions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Class Starting Equipment ({classData?.name})
          </p>
          <ul className="space-y-1 mb-3">
            {classOptions.map((opt, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {opt}
              </li>
            ))}
          </ul>
          {/* Quick-add common class items */}
          <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {["Leather armor", "Chain mail", "Longbow + 20 arrows", "Shortsword", "Dagger", "Rapier", "Shield", "Holy symbol", "Spellbook", "Component pouch", "Dungeoneer's pack", "Explorer's pack"].map((item) => (
              <button
                key={item}
                onClick={() => addPreset(item)}
                disabled={chosenEquipment.includes(item)}
                className="rounded border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-default"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inventory */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Inventory ({allItems.length} items)
        </p>
        <div className="space-y-1 rounded-lg border border-border bg-secondary/30 p-3 min-h-[80px]">
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No items yet</p>
          ) : (
            allItems.map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item}</span>
                {!bgEquip.includes(item) && (
                  <button
                    onClick={() => removeItem(item)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom item */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Add Custom Item</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Item name..."
            maxLength={100}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <Button onClick={addCustom} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button onClick={nextStep} variant="gold" className="w-full">
        Continue &rarr;
      </Button>
    </div>
  );
}

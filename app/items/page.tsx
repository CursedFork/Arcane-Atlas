"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import itemsData from "@/data/srd/magic-items.json";
import { type MagicItem, RARITY_ORDER } from "@/lib/schemas/item";
import { useHomebrewStore } from "@/store/homebrewStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const allSrdItems = itemsData as MagicItem[];

const RARITY_COLORS: Record<string, string> = {
  Common: "text-foreground",
  Uncommon: "text-green-400",
  Rare: "text-blue-400",
  "Very Rare": "text-purple-400",
  Legendary: "text-primary",
  Artifact: "text-red-400",
};

export default function ItemsPage() {
  const homebrewItems = useHomebrewStore((s) => s.items);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  const allItems = useMemo(() => {
    const hb = homebrewItems.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      requires_attunement: item.requires_attunement,
      desc: item.desc,
      isHomebrew: true,
    }));
    return [...allSrdItems, ...hb];
  }, [homebrewItems]);

  const filtered = useMemo(() => {
    return allItems
      .filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchRarity = rarityFilter === "all" || item.rarity.toLowerCase() === rarityFilter.toLowerCase();
        return matchSearch && matchRarity;
      })
      .sort((a, b) => {
        const ai = RARITY_ORDER.indexOf(a.rarity as (typeof RARITY_ORDER)[number]);
        const bi = RARITY_ORDER.indexOf(b.rarity as (typeof RARITY_ORDER)[number]);
        return ai - bi;
      });
  }, [allItems, search, rarityFilter]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Magic Items</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} items</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setRarityFilter("all")}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              rarityFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Rarities
          </button>
          {RARITY_ORDER.map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r === rarityFilter ? "all" : r)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                rarityFilter === r
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No items found.</p>
        )}
        {filtered.map((item) => (
          <div
            key={item.slug}
            className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <Link href={`/items/${item.slug}`} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.name}
                </span>
                {"isHomebrew" in item && item.isHomebrew && (
                  <Badge variant="homebrew" className="text-[10px] py-0">HB</Badge>
                )}
                <span className={`text-xs font-medium ${RARITY_COLORS[item.rarity] ?? "text-foreground"}`}>
                  {item.rarity}
                </span>
                <span className="text-xs text-muted-foreground">{item.type}</span>
                {item.requires_attunement && (
                  <span className="text-xs text-muted-foreground italic">attunement</span>
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

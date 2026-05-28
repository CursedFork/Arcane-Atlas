import { notFound } from "next/navigation";
import Link from "next/link";
import itemsData from "@/data/srd/magic-items.json";
import { type MagicItem } from "@/lib/schemas/item";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const allItems = itemsData as MagicItem[];

const RARITY_COLORS: Record<string, string> = {
  Common: "text-foreground",
  Uncommon: "text-green-400",
  Rare: "text-blue-400",
  "Very Rare": "text-purple-400",
  Legendary: "text-primary",
  Artifact: "text-red-400",
};

export function generateStaticParams() {
  return allItems.map((i) => ({ slug: i.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = allItems.find((i) => i.slug === params.slug);
  if (!item) return { title: "Item Not Found — Arcane Atlas" };
  return { title: `${item.name} — Arcane Atlas` };
}

export default function ItemPage({ params }: { params: { slug: string } }) {
  const item = allItems.find((i) => i.slug === params.slug);
  if (!item) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <Link href="/items">
          <ArrowLeft className="h-4 w-4" />
          All Items
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="font-display text-4xl text-foreground">{item.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="text-xs">{item.type}</Badge>
          <span className={`text-sm font-medium ${RARITY_COLORS[item.rarity] ?? "text-foreground"}`}>
            {item.rarity}
          </span>
          {item.requires_attunement && (
            <span className="text-sm text-muted-foreground italic">{item.requires_attunement}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {item.desc.split("\n\n").map((para, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </main>
  );
}

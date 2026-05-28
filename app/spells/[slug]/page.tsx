import { notFound } from "next/navigation";
import Link from "next/link";
import spellsData from "@/data/srd/spells.json";
import { type Spell } from "@/lib/schemas/spell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const allSpells = spellsData as Spell[];

export function generateStaticParams() {
  return allSpells.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const spell = allSpells.find((s) => s.slug === params.slug);
  if (!spell) return { title: "Spell Not Found — Arcane Atlas" };
  return { title: `${spell.name} — Arcane Atlas` };
}

export default function SpellPage({ params }: { params: { slug: string } }) {
  const spell = allSpells.find((s) => s.slug === params.slug);
  if (!spell) notFound();

  const classes = spell.dnd_class
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <Link href="/spells">
          <ArrowLeft className="h-4 w-4" />
          All Spells
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-4xl text-foreground">{spell.name}</h1>
          {spell.ritual === "yes" && (
            <Badge variant="outline" className="text-xs">Ritual</Badge>
          )}
        </div>
        <p className="text-muted-foreground italic">
          {spell.level === "Cantrip"
            ? `${spell.school} cantrip`
            : `${ordinal(spell.level_int)}-level ${spell.school.toLowerCase()}`}
        </p>
      </div>

      {/* Stat block */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <StatRow label="Casting Time" value={spell.casting_time} />
        <StatRow label="Range" value={spell.range} />
        <StatRow label="Components" value={spell.components} />
        <StatRow label="Duration" value={
          spell.concentration === "yes"
            ? `Concentration, ${spell.duration}`
            : spell.duration
        } />
      </div>

      {/* Description */}
      <div className="space-y-3">
        {spell.desc.split("\n\n").map((para, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {para}
          </p>
        ))}
        {spell.higher_level && (
          <div className="rounded-lg border border-border/50 bg-secondary/30 px-4 py-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              At Higher Levels
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">{spell.higher_level}</p>
          </div>
        )}
      </div>

      {/* Classes */}
      {classes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Available to
          </p>
          <div className="flex flex-wrap gap-1.5">
            {classes.map((cls) => (
              <Badge key={cls} variant="secondary">{cls}</Badge>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

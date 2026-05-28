import { notFound } from "next/navigation";
import Link from "next/link";
import monstersData from "@/data/srd/monsters.json";
import { type Monster } from "@/lib/schemas/monster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield } from "lucide-react";
import { abilityModifier, formatModifier } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";

const allMonsters = monstersData as unknown as Monster[];

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

export function generateStaticParams() {
  return allMonsters.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const m = allMonsters.find((m) => m.slug === params.slug);
  if (!m) return { title: "Monster Not Found — Arcane Atlas" };
  return { title: `${m.name} — Arcane Atlas` };
}

export default function MonsterPage({ params }: { params: { slug: string } }) {
  const m = allMonsters.find((m) => m.slug === params.slug);
  if (!m) notFound();

  const speeds = Object.entries(m.speed)
    .map(([k, v]) => (k === "walk" ? `${v} ft.` : `${k} ${v} ft.`))
    .join(", ");

  const saves = (
    [
      ["STR", m.strength_save],
      ["DEX", m.dexterity_save],
      ["CON", m.constitution_save],
      ["INT", m.intelligence_save],
      ["WIS", m.wisdom_save],
      ["CHA", m.charisma_save],
    ] as [string, number | null | undefined][]
  )
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k} ${v! >= 0 ? "+" : ""}${v!}`)
    .join(", ");

  const skills = Object.entries(m.skills ?? {})
    .map(([k, v]) => `${capitalize(k)} ${v >= 0 ? "+" : ""}${v}`)
    .join(", ");

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <Link href="/monsters">
          <ArrowLeft className="h-4 w-4" />
          All Monsters
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-4xl text-foreground">{m.name}</h1>
        <p className="text-muted-foreground italic text-sm">
          {m.size} {m.type}{m.subtype ? ` (${m.subtype})` : ""}, {m.alignment}
        </p>
      </div>

      {/* Core stats */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Armor Class {m.armor_class}{m.armor_desc ? ` (${m.armor_desc})` : ""}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-foreground">
            Hit Points {m.hit_points} ({m.hit_dice})
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-foreground">Speed {speeds}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">CR {m.challenge_rating}</Badge>
        </div>
      </div>

      {/* Ability scores */}
      <div className="grid grid-cols-6 gap-2">
        {ABILITY_KEYS.map((key) => {
          const score = m[key as keyof Monster] as number;
          const mod = abilityModifier(score);
          return (
            <div key={key} className="text-center bg-secondary rounded-lg py-3">
              <p className="text-[10px] uppercase text-muted-foreground font-medium">{ABILITY_ABBREV[key]}</p>
              <p className="text-lg font-bold text-foreground leading-none">{score}</p>
              <p className="text-xs text-primary">{formatModifier(mod)}</p>
            </div>
          );
        })}
      </div>

      {/* Traits */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
        {saves && <StatRow label="Saving Throws" value={saves} />}
        {skills && <StatRow label="Skills" value={skills} />}
        {m.damage_vulnerabilities && <StatRow label="Vulnerabilities" value={m.damage_vulnerabilities} />}
        {m.damage_resistances && <StatRow label="Resistances" value={m.damage_resistances} />}
        {m.damage_immunities && <StatRow label="Immunities" value={m.damage_immunities} />}
        {m.condition_immunities && <StatRow label="Condition Immunities" value={m.condition_immunities} />}
        <StatRow label="Senses" value={m.senses} />
        <StatRow label="Languages" value={m.languages || "—"} />
      </div>

      {/* Special abilities */}
      {m.special_abilities && m.special_abilities.length > 0 && (
        <ActionSection title="Special Abilities" actions={m.special_abilities} />
      )}

      {/* Actions */}
      {m.actions && m.actions.length > 0 && (
        <ActionSection title="Actions" actions={m.actions} />
      )}

      {/* Legendary actions */}
      {m.legendary_actions && m.legendary_actions.length > 0 && (
        <ActionSection title="Legendary Actions" actions={m.legendary_actions} />
      )}
    </main>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function ActionSection({
  title,
  actions,
}: {
  title: string;
  actions: { name: string; desc: string }[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg text-primary border-b border-border pb-2">{title}</h2>
      {actions.map((a) => (
        <div key={a.name}>
          <p className="text-sm">
            <span className="font-semibold text-foreground italic">{a.name}. </span>
            <span className="text-muted-foreground">{a.desc}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Wand2, Users, Sword, Scroll } from "lucide-react";

const features = [
  {
    icon: Sword,
    title: "Character Builder",
    desc: "10-step guided creation: race, class, subclass, ability scores, skills, equipment, spells, and backstory.",
    href: "/builder",
    cta: "Start Building",
  },
  {
    icon: Users,
    title: "Character Library",
    desc: "Manage all your characters. Export to PDF or JSON, duplicate, import from file.",
    href: "/characters",
    cta: "View Characters",
  },
  {
    icon: Shield,
    title: "DM Shield",
    desc: "Initiative tracker with HP bars, condition toggles, and a searchable spell & monster reference.",
    href: "/dm",
    cta: "Open DM Shield",
  },
  {
    icon: Wand2,
    title: "Spell Reference",
    desc: "Browse and search all SRD spells with full descriptions, filter by level, school, and class.",
    href: "/spells",
    cta: "Browse Spells",
  },
  {
    icon: BookOpen,
    title: "Monster Bestiary",
    desc: "Full stat blocks for SRD monsters. CR, HP, AC, actions, and special abilities at a glance.",
    href: "/monsters",
    cta: "Browse Monsters",
  },
  {
    icon: Scroll,
    title: "Homebrew Manager",
    desc: "Create custom spells, races, items, backgrounds, and feats. Import/export homebrew collections.",
    href: "/homebrew",
    cta: "Manage Homebrew",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs text-primary uppercase tracking-widest mb-2">
            D&amp;D 5e SRD · OGL 1.0a
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
            Arcane <span className="text-primary">Atlas</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A full-featured D&amp;D 5e companion: build characters, run combat, look up rules — all
            in your browser with no account required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg" variant="gold" className="gap-2">
              <Link href="/builder">
                <Sword className="h-4 w-4" />
                Build a Character
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dm">Open DM Shield</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title, desc, href, cta }) => (
          <div
            key={href}
            className="group rounded-xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            <Button asChild variant="ghost" size="sm" className="px-0 text-primary hover:text-primary/80">
              <Link href={href}>{cta} →</Link>
            </Button>
          </div>
        ))}
      </section>

      {/* Legal footer */}
      <section className="border-t border-border/50 py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          Arcane Atlas uses SRD content published under the{" "}
          <Link href="/credits" className="text-primary hover:underline">
            OGL 1.0a
          </Link>
          . All game rules content is © Wizards of the Coast and reproduced with permission under
          the Open Game License. No affiliation with Wizards of the Coast.
        </p>
      </section>
    </main>
  );
}

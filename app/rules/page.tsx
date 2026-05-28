import { CONDITIONS, EXHAUSTION_LEVELS, COMMON_ACTIONS } from "@/lib/srd/conditions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = { title: "Rules Reference — Arcane Atlas" };

export default function RulesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
      <div>
        <h1 className="font-display text-3xl text-foreground">Rules Reference</h1>
        <p className="text-muted-foreground text-sm mt-1">
          SRD conditions, combat actions, and exhaustion rules
        </p>
      </div>

      {/* Conditions */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-primary border-b border-border pb-2">Conditions</h2>
        <Accordion type="multiple" className="space-y-0">
          {CONDITIONS.map((c) => (
            <AccordionItem key={c.slug} value={c.slug} className="border-border/50">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <span className="font-medium text-foreground">{c.name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5 pb-2">
                  {c.effects.map((effect, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">•</span>
                      {effect}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Exhaustion */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-primary border-b border-border pb-2">Exhaustion</h2>
        <p className="text-sm text-muted-foreground">
          Exhaustion levels are cumulative. A long rest removes one level.
        </p>
        <div className="space-y-2">
          {EXHAUSTION_LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-3"
            >
              <div className="w-8 h-8 rounded-full border border-accent/50 bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                {lvl.level}
              </div>
              <p className="text-sm text-muted-foreground pt-1">{lvl.effect}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Combat Actions */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-primary border-b border-border pb-2">Combat Actions</h2>
        <Accordion type="multiple" className="space-y-0">
          {COMMON_ACTIONS.map((action) => (
            <AccordionItem key={action.name} value={action.name} className="border-border/50">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <span className="font-medium text-foreground">{action.name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pb-2">{action.desc}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}

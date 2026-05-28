"use client";

import { useState } from "react";
import { CONDITIONS, EXHAUSTION_LEVELS, COMMON_ACTIONS } from "@/lib/srd/conditions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function QuickReference() {
  const [tab, setTab] = useState<"conditions" | "actions" | "exhaustion">("conditions");

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <h2 className="font-display text-lg text-primary shrink-0">Quick Reference</h2>

      <div className="flex gap-1 shrink-0">
        {(["conditions", "actions", "exhaustion"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
              tab === t
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "conditions" && (
          <Accordion type="multiple" className="space-y-0">
            {CONDITIONS.map((c) => (
              <AccordionItem key={c.slug} value={c.slug} className="border-border/50">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  <span className="font-medium text-foreground">{c.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {c.effects.map((effect, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        {effect}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {tab === "exhaustion" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Exhaustion levels are cumulative. Long rest removes one level.
            </p>
            {EXHAUSTION_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className="flex items-start gap-3 rounded-md border border-border bg-card p-2.5"
              >
                <div className="w-6 h-6 rounded-full border border-accent/50 bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                  {lvl.level}
                </div>
                <p className="text-sm text-muted-foreground">{lvl.effect}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "actions" && (
          <Accordion type="multiple" className="space-y-0">
            {COMMON_ACTIONS.map((action) => (
              <AccordionItem key={action.name} value={action.name} className="border-border/50">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  <span className="font-medium text-foreground">{action.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

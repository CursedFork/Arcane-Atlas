"use client";

import { useState } from "react";
import { InitiativeTracker } from "@/components/dm/InitiativeTracker";
import { QuickReference } from "@/components/dm/QuickReference";
import { SpellMonsterLookup } from "@/components/dm/SpellMonsterLookup";

const TABS = ["Initiative", "Reference", "Lookup"] as const;
type Tab = (typeof TABS)[number];

export default function DmPage() {
  const [mobileTab, setMobileTab] = useState<Tab>("Initiative");

  return (
    <main className="h-[calc(100vh-4rem)] overflow-hidden">
      {/* Desktop: 3 columns */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_1.2fr_1.2fr] h-full divide-x divide-border">
        <div className="overflow-hidden p-5">
          <InitiativeTracker />
        </div>
        <div className="overflow-hidden p-5">
          <QuickReference />
        </div>
        <div className="overflow-hidden p-5">
          <SpellMonsterLookup />
        </div>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden flex flex-col h-full">
        <div className="flex border-b border-border shrink-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={`flex-1 py-3 text-sm transition-colors ${
                mobileTab === t
                  ? "border-b-2 border-primary text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {mobileTab === "Initiative" && <InitiativeTracker />}
          {mobileTab === "Reference" && <QuickReference />}
          {mobileTab === "Lookup" && <SpellMonsterLookup />}
        </div>
      </div>
    </main>
  );
}

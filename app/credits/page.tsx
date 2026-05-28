export const metadata = { title: "Credits & License — Arcane Atlas" };

export default function CreditsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="font-display text-3xl text-foreground">Credits &amp; License</h1>
        <p className="text-muted-foreground text-sm mt-1">Attribution and legal notices for Arcane Atlas</p>
      </div>

      <Section title="Arcane Atlas">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Arcane Atlas is an open-source web application for D&amp;D 5e character creation and DM
          tooling. The source code is released under the MIT License.
        </p>
      </Section>

      <Section title="D&D 5e SRD Content">
        <p className="text-sm text-muted-foreground leading-relaxed">
          This app uses content from the{" "}
          <span className="text-foreground font-medium">D&amp;D 5e Systems Reference Document (SRD)</span>,
          published by Wizards of the Coast LLC under the Open Game License v1.0a. The SRD content
          in <code className="text-primary">/data/srd/</code> is Open Game Content.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          SRD data is retrieved from{" "}
          <span className="text-foreground font-medium">Open5e</span> (
          <span className="text-primary">api.open5e.com</span>), a community project that provides
          structured access to SRD content.
        </p>
      </Section>

      <Section title="Open Game License v1.0a">
        <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted-foreground leading-relaxed space-y-3 font-mono">
          <p>OPEN GAME LICENSE Version 1.0a</p>
          <p>
            The following text is the property of Wizards of the Coast, Inc. and is Copyright 2000
            Wizards of the Coast, Inc (&quot;Wizards&quot;). All Rights Reserved.
          </p>
          <p>
            1. Definitions: (a) &quot;Contributors&quot; means the copyright and/or trademark owners who have
            contributed Open Game Content; (b) &quot;Derivative Material&quot; means copyrighted material
            including derivative works and translations (including into other computer languages),
            potation, modification, correction, addition, extension, upgrade, improvement,
            compilation, abridgment or other form in which an existing work may be recast,
            transformed or adapted; (c) &quot;Distribute&quot; means to reproduce, license, rent, lease,
            sell, broadcast, publicly display, transmit or otherwise distribute; (d) &quot;Open Game
            Content&quot; means the game mechanic and includes the methods, procedures, processes and
            routines to the extent such content does not embody the Product Identity and is an
            enhancement over the prior art and any additional content clearly identified as Open Game
            Content by the Contributor, and means any work covered by this License, including
            translations and derivative works under copyright law, but specifically excludes Product
            Identity.
          </p>
          <p>
            2. The License: This License applies to any Open Game Content that contains a notice
            indicating that the Open Game Content may only be Used under and in terms of this
            License. You must affix such a notice to any Open Game Content that you Use. No terms
            may be added to or subtracted from this License except as described by the License
            itself. No other terms or conditions may be applied to any Open Game Content distributed
            using this License.
          </p>
          <p>
            3. Offer and Acceptance: By Using the Open Game Content You indicate Your acceptance of
            the terms of this License.
          </p>
          <p>
            6. Notice of License Copyright: You must update the COPYRIGHT NOTICE portion of this
            License to include the exact text of the COPYRIGHT NOTICE of any Open Game Content You
            are copying, modifying or distributing, and You must add the title, the copyright date,
            and the copyright holder&apos;s name to the COPYRIGHT NOTICE of any original Open Game
            Content you Distribute.
          </p>
          <p>
            15. COPYRIGHT NOTICE Open Game License v1.0a Copyright 2000, Wizards of the Coast, Inc.
            System Reference Document 5.1 Copyright 2016, Wizards of the Coast, Inc.; Authors Mike
            Mearls, Jeremy Crawford, Chris Perkins, Rodney Thompson, Peter Lee, James Wyatt, Robert J.
            Schwalb, Bruce R. Cordell, Chris Sims, and Steve Townshend, based on original material
            by E. Gary Gygax and Dave Arneson.
          </p>
          <p>END OF LICENSE</p>
        </div>
      </Section>

      <Section title="Third-Party Libraries">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            ["Next.js", "MIT", "Vercel"],
            ["React", "MIT", "Meta Platforms"],
            ["Tailwind CSS", "MIT", "Tailwind Labs"],
            ["shadcn/ui", "MIT", "shadcn"],
            ["Radix UI", "MIT", "WorkOS"],
            ["Zustand", "MIT", "pmndrs"],
            ["TanStack Query", "MIT", "TanStack"],
            ["Zod", "MIT", "Colin McDonnell"],
            ["@react-pdf/renderer", "MIT", "Diego Muracciole"],
            ["Lucide React", "ISC", "Lucide contributors"],
            ["Cinzel", "OFL 1.1", "Google Fonts / Natanael Gama"],
            ["Inter", "OFL 1.1", "Google Fonts / Rasmus Andersson"],
          ].map(([lib, license, author]) => (
            <li key={lib} className="flex items-center gap-3">
              <span className="font-medium text-foreground w-48 shrink-0">{lib}</span>
              <span className="text-xs bg-secondary rounded px-2 py-0.5">{license}</span>
              <span>{author}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-primary border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  );
}

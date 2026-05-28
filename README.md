# Arcane Atlas

A full-featured D&D 5e (2014 ruleset) character creation and Dungeon Master companion web app. Built with Next.js 14, TypeScript, and Tailwind CSS. All data stored locally in the browser — no account required.

## Features

- **10-step character builder**: race (with subrace), class, subclass, ability scores (standard array / point buy / manual), background, skills, equipment, spells, backstory, and review
- **Character library**: manage saved characters, export/import JSON, export to PDF, duplicate
- **DM Shield**: initiative tracker with HP bars and condition toggles, quick rules reference (conditions, exhaustion, actions), spell and monster lookup
- **Spell reference**: full SRD spell catalog with descriptions, filterable by level, school, and class
- **Monster bestiary**: full stat blocks for all SRD monsters, filterable by CR and type
- **Magic items**: SRD magic items catalog
- **Homebrew manager**: create custom spells, items, and feats via form or JSON import
- **PDF export**: dark-fantasy styled character sheet PDF generated client-side

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run tests (watch mode) |
| `npm run test:ci` | Run tests once (CI) |
| `npm run fetch-srd` | Re-fetch SRD data from Open5e API into `/data/srd/` |
| `npm run typecheck` | TypeScript type checking |

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript** strict mode
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **Zustand** with `persist` middleware (localStorage)
- **TanStack Query v5**
- **Zod** for schema validation on all user input and imports
- **@react-pdf/renderer** for PDF generation (client-side only)
- **Vitest** for unit tests

## SRD Data

Game rules content in `/data/srd/` is sourced from [Open5e](https://api.open5e.com/) and licensed under the [OGL 1.0a](./ATTRIBUTION.md). To refresh the data:

```bash
npm run fetch-srd
```

## Security

All homebrew and character JSON imports pass through Zod schemas before touching application state. Files over 1 MB are rejected. String lengths are capped at the schema level. No `dangerouslySetInnerHTML` is used anywhere. See [SECURITY.md](./SECURITY.md) for the full threat model.

## License

Source code: **MIT License** — see [LICENSE](./LICENSE).

SRD content in `/data/srd/`: **OGL 1.0a** — see [ATTRIBUTION.md](./ATTRIBUTION.md).

Fonts (Cinzel, Inter): **SIL OFL 1.1**.

*Not affiliated with Wizards of the Coast.*

## Roadmap (not built)

- **Supabase backend** — auth, cloud sync, sharing characters via link
- **Stripe subscriptions** — DM tier with advanced tools
- **AI portrait generation** — character portrait from description
- **Battlemap** — grid with fog of war and token placement
- **Encounter generator** — CR-appropriate random encounters by environment
- **One-shot generator** — AI-assisted adventure outline from a premise

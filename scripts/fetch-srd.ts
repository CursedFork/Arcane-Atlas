#!/usr/bin/env tsx
/**
 * Fetches SRD content from Open5e API and writes to /data/srd/*.json
 * Run with: npm run fetch-srd
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const API_BASE = "https://api.open5e.com";
const DATA_DIR = join(process.cwd(), "data", "srd");

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function fetchAll<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${API_BASE}${endpoint}?format=json&limit=500`;

  while (url) {
    console.log(`  Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const data = (await res.json()) as PaginatedResponse<T>;
    results.push(...data.results);
    url = data.next;
  }

  return results;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("Fetching SRD spells...");
  try {
    const spells = await fetchAll("/spells/");
    writeFileSync(join(DATA_DIR, "spells.json"), JSON.stringify(spells, null, 2));
    console.log(`  ✓ ${spells.length} spells saved`);
  } catch (err) {
    console.error("  ✗ Failed to fetch spells:", err);
  }

  console.log("Fetching SRD monsters...");
  try {
    const monsters = await fetchAll("/monsters/");
    writeFileSync(join(DATA_DIR, "monsters.json"), JSON.stringify(monsters, null, 2));
    console.log(`  ✓ ${monsters.length} monsters saved`);
  } catch (err) {
    console.error("  ✗ Failed to fetch monsters:", err);
  }

  console.log("Fetching SRD magic items...");
  try {
    const items = await fetchAll("/magicitems/");
    writeFileSync(join(DATA_DIR, "magic-items.json"), JSON.stringify(items, null, 2));
    console.log(`  ✓ ${items.length} magic items saved`);
  } catch (err) {
    console.error("  ✗ Failed to fetch magic items:", err);
  }

  console.log("\nFetch complete. Data written to /data/srd/");
  console.log("Note: Only OGL 1.0a / SRD content is fetched (document__slug=srd).");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

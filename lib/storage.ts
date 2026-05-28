import { type Character, CharacterSchema } from "./schemas/character";
import { type HomebrewCollection, HomebrewCollectionSchema } from "./schemas/homebrew";

const CHARACTERS_KEY = "arcane-atlas:characters";
const HOMEBREW_KEY = "arcane-atlas:homebrew";
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

// ── Characters ─────────────────────────────────────────────────────────────────

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHARACTERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => CharacterSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: Character }).data);
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

export function saveCharacter(character: Character): void {
  const characters = loadCharacters();
  const idx = characters.findIndex((c) => c.id === character.id);
  if (idx >= 0) {
    characters[idx] = { ...character, updatedAt: new Date().toISOString() };
  } else {
    characters.push(character);
  }
  saveCharacters(characters);
}

export function deleteCharacter(id: string): void {
  const characters = loadCharacters().filter((c) => c.id !== id);
  saveCharacters(characters);
}

export function duplicateCharacter(id: string): Character | null {
  const { v4: uuidv4 } = require("uuid") as { v4: () => string };
  const characters = loadCharacters();
  const original = characters.find((c) => c.id === id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: Character = {
    ...original,
    id: uuidv4(),
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };
  saveCharacter(copy);
  return copy;
}

// ── JSON Import/Export ─────────────────────────────────────────────────────────

export function exportCharacterJSON(character: Character): void {
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${character.name.replace(/\s+/g, "_")}_L${character.level}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCharacterJSON(
  file: File
): Promise<{ success: true; character: Character } | { success: false; errors: string[] }> {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, errors: ["File exceeds 1 MB limit."] };
  }
  if (!file.name.endsWith(".json")) {
    return { success: false, errors: ["File must be a .json file."] };
  }
  try {
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    const result = CharacterSchema.safeParse(parsed);
    if (result.success) {
      return { success: true, character: result.data };
    }
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return { success: false, errors };
  } catch {
    return { success: false, errors: ["Invalid JSON file."] };
  }
}

// ── Homebrew ──────────────────────────────────────────────────────────────────

export function loadHomebrew(): HomebrewCollection {
  if (typeof window === "undefined") {
    return { spells: [], races: [], items: [], backgrounds: [], feats: [] };
  }
  try {
    const raw = localStorage.getItem(HOMEBREW_KEY);
    if (!raw) return { spells: [], races: [], items: [], backgrounds: [], feats: [] };
    const parsed: unknown = JSON.parse(raw);
    const result = HomebrewCollectionSchema.safeParse(parsed);
    if (result.success) return result.data;
    return { spells: [], races: [], items: [], backgrounds: [], feats: [] };
  } catch {
    return { spells: [], races: [], items: [], backgrounds: [], feats: [] };
  }
}

export function saveHomebrew(collection: HomebrewCollection): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOMEBREW_KEY, JSON.stringify(collection));
}

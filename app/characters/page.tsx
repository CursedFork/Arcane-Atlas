"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCharacters, saveCharacter, deleteCharacter, duplicateCharacter, importCharacterJSON } from "@/lib/storage";
import { type Character } from "@/lib/schemas/character";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCharacters(loadCharacters());
  }, []);

  const refresh = () => setCharacters(loadCharacters());

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    refresh();
  };

  const handleDuplicate = (id: string) => {
    duplicateCharacter(id);
    refresh();
  };

  const handleFile = async (file: File) => {
    setImportError(null);
    const result = await importCharacterJSON(file);
    if (result.success) {
      saveCharacter(result.character);
      refresh();
    } else {
      setImportError(result.errors.join("; "));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Character Library</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {characters.length} character{characters.length !== 1 ? "s" : ""} saved locally
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleInputChange}
          />
          <Button variant="gold" size="sm" className="gap-2" onClick={() => router.push("/builder")}>
            <Plus className="h-4 w-4" />
            New Character
          </Button>
        </div>
      </div>

      {importError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Import failed: {importError}
        </div>
      )}

      {/* Drop zone + grid */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`min-h-[200px] rounded-xl transition-colors ${
          dragging ? "border-2 border-dashed border-primary/60 bg-primary/5" : ""
        }`}
      >
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <p className="text-sm">No characters yet. Build one or drop a JSON file here.</p>
            <Button variant="gold" onClick={() => router.push("/builder")} className="gap-2">
              <Plus className="h-4 w-4" />
              Build Your First Character
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {characters.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {dragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 pointer-events-none">
          <div className="rounded-xl border-2 border-dashed border-primary bg-card p-10 text-center">
            <Upload className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="font-display text-lg text-primary">Drop to import character</p>
          </div>
        </div>
      )}
    </main>
  );
}

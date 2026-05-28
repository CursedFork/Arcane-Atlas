"use client";

import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { type Character } from "@/lib/schemas/character";
import { getRace } from "@/lib/srd/races";
import { getClass } from "@/lib/srd/classes";
import { getBackground } from "@/lib/srd/backgrounds";
import { abilityModifier, formatModifier } from "@/lib/utils";
import { ABILITY_KEYS } from "@/lib/schemas/character";
import { proficiencyBonus } from "@/lib/characterMath";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

const ABILITY_ABBREV: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON",
  intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0f1520",
    color: "#e8d5a3",
    fontFamily: "Helvetica",
    padding: 32,
  },
  header: {
    borderBottom: "2pt solid #d4941a",
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#d4941a",
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#8a7a5a",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#d4941a",
    letterSpacing: 2,
    textTransform: "uppercase",
    borderBottom: "0.5pt solid #333",
    paddingBottom: 3,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 8,
    color: "#8a7a5a",
    textTransform: "uppercase",
    letterSpacing: 1,
    width: 80,
  },
  value: {
    fontSize: 9,
    color: "#e8d5a3",
    flex: 1,
  },
  abilityGrid: {
    flexDirection: "row",
    gap: 8,
  },
  abilityBox: {
    border: "1pt solid #333",
    borderRadius: 4,
    width: 72,
    padding: 6,
    alignItems: "center",
    backgroundColor: "#1a2035",
  },
  abilityAbbr: {
    fontSize: 7,
    color: "#8a7a5a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  abilityScore: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#e8d5a3",
    lineHeight: 1.2,
  },
  abilityMod: {
    fontSize: 11,
    color: "#d4941a",
    fontFamily: "Helvetica-Bold",
  },
  stat: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottom: "0.5pt solid #1e2030",
  },
  statLabel: { fontSize: 9, color: "#8a7a5a" },
  statValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#e8d5a3" },
  badge: {
    backgroundColor: "#2a1a10",
    border: "0.5pt solid #d4941a",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeText: { fontSize: 8, color: "#d4941a" },
  body: { fontSize: 9, color: "#8a7a5a", lineHeight: 1.5 },
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
});

interface CharacterSheetPDFProps {
  character: Character;
}

function CharacterSheetPDF({ character }: CharacterSheetPDFProps) {
  const race = getRace(character.race);
  const cls = getClass(character.classSlug);
  const bg = getBackground(character.background);
  const pb = proficiencyBonus(character.level);

  const subtitle = [
    `Level ${character.level}`,
    race?.name,
    cls?.name,
    bg ? `(${bg.name})` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Document title={`${character.name} — Arcane Atlas`} author="Arcane Atlas">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{character.name}</Text>
          <Text style={styles.subtitle}>{subtitle} · {character.alignment}</Text>
        </View>

        <View style={styles.twoCol}>
          {/* Left column */}
          <View style={styles.col}>
            {/* Combat Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Combat</Text>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Hit Points</Text>
                <Text style={styles.statValue}>{character.hp.max}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Proficiency Bonus</Text>
                <Text style={styles.statValue}>+{pb}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Initiative</Text>
                <Text style={styles.statValue}>
                  {formatModifier(abilityModifier(character.finalAbilityScores.dexterity))}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Speed</Text>
                <Text style={styles.statValue}>{race?.speed ?? 30} ft</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Hit Die</Text>
                <Text style={styles.statValue}>d{cls?.hitDie ?? 8}</Text>
              </View>
            </View>

            {/* Ability Scores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ability Scores</Text>
              <View style={[styles.abilityGrid, { flexWrap: "wrap" }]}>
                {ABILITY_KEYS.map((key) => {
                  const score = character.finalAbilityScores[key];
                  const mod = abilityModifier(score);
                  return (
                    <View key={key} style={styles.abilityBox}>
                      <Text style={styles.abilityAbbr}>{ABILITY_ABBREV[key]}</Text>
                      <Text style={styles.abilityScore}>{score}</Text>
                      <Text style={styles.abilityMod}>{formatModifier(mod)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Right column */}
          <View style={styles.col}>
            {/* Skills */}
            {character.skillProficiencies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skill Proficiencies</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {character.skillProficiencies.map((s) => (
                    <View key={s} style={styles.badge}>
                      <Text style={styles.badgeText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Spells */}
            {(character.spells.cantrips.length > 0 || character.spells.known.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Spells</Text>
                {character.spells.cantrips.length > 0 && (
                  <>
                    <Text style={[styles.body, { marginBottom: 2 }]}>Cantrips:</Text>
                    <Text style={styles.body}>{character.spells.cantrips.join(", ")}</Text>
                  </>
                )}
                {character.spells.known.length > 0 && (
                  <>
                    <Text style={[styles.body, { marginTop: 4, marginBottom: 2 }]}>Known:</Text>
                    <Text style={styles.body}>{character.spells.known.join(", ")}</Text>
                  </>
                )}
              </View>
            )}

            {/* Equipment */}
            {character.equipment.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Equipment</Text>
                {character.equipment.map((item) => (
                  <Text key={item.id} style={styles.body}>
                    • {item.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Backstory */}
        {character.details.backstory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backstory</Text>
            <Text style={styles.body}>{character.details.backstory.slice(0, 500)}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={[styles.body, { position: "absolute", bottom: 20, right: 32 }]}>
          Generated by Arcane Atlas · D&D 5e SRD (OGL 1.0a)
        </Text>
      </Page>
    </Document>
  );
}

interface PDFExportButtonProps {
  character: Character;
}

export function PDFExportButton({ character }: PDFExportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const doc = <CharacterSheetPDF character={character} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${character.name.replace(/\s+/g, "_")}_L${character.level}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={generating} variant="outline" className="flex-1 gap-2">
      <FileDown className="h-4 w-4" />
      {generating ? "Generating..." : "Export PDF"}
    </Button>
  );
}

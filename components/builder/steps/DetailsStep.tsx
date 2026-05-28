"use client";

import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALIGNMENTS } from "@/lib/srd/index";

export function DetailsStep() {
  const state = useBuilderStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-foreground">Character Details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Give your character a name, alignment, and some personal history.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="char-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              Character Name *
            </Label>
            <Input
              id="char-name"
              value={state.name}
              onChange={(e) => state.setDetails({ name: e.target.value.slice(0, 100) })}
              placeholder="Enter character name..."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Alignment
            </Label>
            <Select
              value={state.alignment}
              onValueChange={(v) => state.setDetails({ alignment: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Level
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={state.level}
              onChange={(e) => state.setLevel(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="appearance" className="text-xs uppercase tracking-wider text-muted-foreground">
            Appearance
          </Label>
          <Textarea
            id="appearance"
            value={state.appearance}
            onChange={(e) => state.setDetails({ appearance: e.target.value.slice(0, 2000) })}
            placeholder="Describe your character's appearance..."
            className="mt-1 resize-none"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="backstory" className="text-xs uppercase tracking-wider text-muted-foreground">
            Backstory
          </Label>
          <Textarea
            id="backstory"
            value={state.backstory}
            onChange={(e) => state.setDetails({ backstory: e.target.value.slice(0, 10000) })}
            placeholder="Tell us your character's story..."
            className="mt-1 resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ideals" className="text-xs uppercase tracking-wider text-muted-foreground">
              Ideals
            </Label>
            <Textarea
              id="ideals"
              value={state.ideals}
              onChange={(e) => state.setDetails({ ideals: e.target.value.slice(0, 2000) })}
              placeholder="What drives your character?"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="bonds" className="text-xs uppercase tracking-wider text-muted-foreground">
              Bonds
            </Label>
            <Textarea
              id="bonds"
              value={state.bonds}
              onChange={(e) => state.setDetails({ bonds: e.target.value.slice(0, 2000) })}
              placeholder="Who or what matters most?"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="flaws" className="text-xs uppercase tracking-wider text-muted-foreground">
              Flaws
            </Label>
            <Textarea
              id="flaws"
              value={state.flaws}
              onChange={(e) => state.setDetails({ flaws: e.target.value.slice(0, 2000) })}
              placeholder="What are your character's weaknesses or vices?"
              className="mt-1 resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={state.nextStep}
        disabled={!state.name.trim()}
        variant="gold"
        className="w-full"
      >
        Review Character &rarr;
      </Button>
    </div>
  );
}

"use client";

import React from "react";
import { Lock, Unlock, Compass, ArrowRight } from "lucide-react";
import { EncounterChoice, InventoryItem } from "@/types/game";

interface ChoiceListProps {
  choices: EncounterChoice[];
  inventory: InventoryItem[];
  onSelectChoice: (choice: EncounterChoice) => void;
}

export default function ChoiceList({
  choices,
  inventory,
  onSelectChoice,
}: ChoiceListProps) {
  const hasItem = (requiredItemId: string | null) => {
    if (!requiredItemId) return true;
    return inventory.some((item) => item.id === requiredItemId);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-parchment-300 px-1">
        Choose Your Path
      </h3>

      <div className="grid grid-cols-1 gap-2.5">
        {choices.map((choice) => {
          const unlocked = hasItem(choice.requiredItemId);
          const isGated = Boolean(choice.requiredItemId);

          return (
            <button
              key={choice.id}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onSelectChoice(choice)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                !unlocked
                  ? "border-forest-800 bg-forest-950/60 opacity-60 cursor-not-allowed"
                  : isGated
                  ? "border-parchment-400/60 bg-gradient-to-r from-forest-800/95 to-forest-900/95 hover:border-parchment-300 shadow-lg active:scale-[0.99]"
                  : "border-forest-700 bg-forest-900/80 hover:bg-forest-800/80 hover:border-forest-500 active:scale-[0.99]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  {/* Gated Item Requirement Pill */}
                  {isGated ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border bg-forest-950/90 border-parchment-400/40">
                      {unlocked ? (
                        <>
                          <Unlock className="h-3 w-3 text-moss-400" />
                          <span className="text-moss-400">
                            Unlocked with {choice.requiredItemName}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 text-amber-400" />
                          <span className="text-amber-200/90">
                            Bring this token: {choice.requiredItemName}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] text-parchment-300/70">
                      <Compass className="h-3 w-3 text-parchment-400" />
                      <span>The path is open</span>
                    </div>
                  )}

                  <p
                    className={`text-sm font-serif font-semibold ${
                      unlocked ? "text-parchment-50" : "text-parchment-200/60"
                    }`}
                  >
                    {choice.label}
                  </p>

                  <p className="text-[11px] text-parchment-300/70">
                    Heading: {choice.compassDirection}
                  </p>
                </div>

                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    unlocked
                      ? "border-parchment-400/50 bg-forest-800 text-parchment-200"
                      : "border-forest-800 bg-forest-950 text-forest-600"
                  }`}
                >
                  {unlocked ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

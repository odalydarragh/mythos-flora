"use client";

import React, { useState } from "react";
import { Hand, CheckCircle2, RefreshCw, Sparkles, Leaf } from "lucide-react";
import { ForageQuest, InventoryItem } from "@/types/game";

interface ForageRitualBoxProps {
  forageQuest: ForageQuest;
  inventory: InventoryItem[];
  onCollectItem: (item: InventoryItem, isSubstitute: boolean) => void;
}

export default function ForageRitualBox({
  forageQuest,
  inventory,
  onCollectItem,
}: ForageRitualBoxProps) {
  const [useSubstitute, setUseSubstitute] = useState(false);

  const activeItem = useSubstitute
    ? forageQuest.substituteItem
    : forageQuest.primaryItem;

  const isPrimaryCollected = inventory.some(
    (i) => i.id === forageQuest.primaryItem.id
  );
  const isSubstituteCollected = inventory.some(
    (i) => i.id === forageQuest.substituteItem.id
  );
  const isAnyCollectedThisTurn = isPrimaryCollected || isSubstituteCollected;

  return (
    <div className="rounded-2xl border border-parchment-400/50 bg-gradient-to-b from-forest-800/90 to-forest-900/95 p-4 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-parchment-300">
          <Hand className="h-4 w-4 text-parchment-400" />
          <span>A Woodland Offering</span>
        </div>
        {isAnyCollectedThisTurn && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>In Your Satchel</span>
          </span>
        )}
      </div>

      <p className="text-xs text-parchment-100 leading-relaxed">
        {forageQuest.ritualPrompt}
      </p>

      {/* Active Item Card */}
      <div className="rounded-xl border border-forest-600/80 bg-forest-950/85 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-800 border border-parchment-400/40 text-parchment-300">
            {useSubstitute ? (
              <Sparkles className="h-5 w-5 text-amber-300" />
            ) : (
              <Leaf className="h-5 w-5 text-moss-400" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-serif font-bold text-parchment-50">
                {activeItem.name}
              </h4>
              {useSubstitute && (
                <span className="rounded bg-amber-950/90 border border-amber-500/40 px-1.5 py-0.5 text-[10px] text-amber-200">
                  Spirit Substitute
                </span>
              )}
            </div>
            <p className="text-xs text-parchment-200/80">
              {activeItem.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isAnyCollectedThisTurn}
          onClick={() => onCollectItem(activeItem, useSubstitute)}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            isAnyCollectedThisTurn
              ? "bg-emerald-900/50 text-emerald-200 border border-emerald-600/40 cursor-default"
              : "bg-parchment-400 text-forest-950 hover:bg-parchment-300 shadow-md active:scale-[0.98]"
          }`}
        >
          {isAnyCollectedThisTurn ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Collected</span>
            </>
          ) : (
            <>
              <Hand className="h-4 w-4" />
              <span>I Picked Up {activeItem.name}</span>
            </>
          )}
        </button>
      </div>

      {/* Substitute Toggle for When Player Cannot Find Primary Item */}
      {!isAnyCollectedThisTurn && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setUseSubstitute((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-parchment-300 hover:text-parchment-100 underline decoration-parchment-400/50 underline-offset-4 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-parchment-400" />
            <span>
              {useSubstitute
                ? `Found a ${forageQuest.primaryItem.name} instead? Switch back`
                : `Can't find ${forageQuest.primaryItem.name} nearby? Ask the spirit for a substitute`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Compass, Camera, Sparkles, Footprints } from "lucide-react";
import { EncounterChoice } from "@/types/game";

interface DirectionStageProps {
  selectedChoice: EncounterChoice;
  onContinueToCamera: () => void;
}

export default function DirectionStage({
  selectedChoice,
  onContinueToCamera,
}: DirectionStageProps) {
  return (
    <div className="rounded-2xl border border-parchment-400/50 bg-gradient-to-b from-forest-900 to-forest-950 p-6 shadow-2xl space-y-5">
      {/* Ritual Outcome */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 border border-parchment-400/40">
          <Sparkles className="h-6 w-6 text-parchment-300" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-parchment-400">
          The Forest Responds
        </span>
        <h2 className="text-lg font-serif font-bold text-parchment-50">
          {selectedChoice.label}
        </h2>
        <p className="text-sm text-parchment-100/90 leading-relaxed max-w-md mx-auto">
          {selectedChoice.outcomeText}
        </p>
      </div>

      {/* Bundled Compass & Walking Instruction */}
      <div className="rounded-xl border border-forest-700 bg-forest-950/90 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-moss-400">
          <Compass className="h-4 w-4" />
          <span>Spirit Compass: {selectedChoice.compassDirection}</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm text-parchment-100 leading-relaxed">
          <Footprints className="h-5 w-5 text-parchment-400 shrink-0 mt-0.5" />
          <p>{selectedChoice.pathPrompt}</p>
        </div>
      </div>

      {/* Next Turn Trigger */}
      <button
        type="button"
        onClick={onContinueToCamera}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-500 px-5 py-4 text-sm font-semibold text-parchment-50 shadow-lg border border-parchment-300/30 hover:from-forest-500 hover:to-forest-600 active:scale-[0.99] transition"
      >
        <Camera className="h-5 w-5 text-parchment-200" />
        <span>Walk the Path & Snap Next Photo</span>
      </button>
    </div>
  );
}

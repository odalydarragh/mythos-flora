"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Leaf,
  Eye,
  ScrollText,
  Camera,
  Check,
  Edit3,
} from "lucide-react";
import { EncounterResponse } from "@/types/game";

interface EncounterCardProps {
  encounter: EncounterResponse;
  capturedImageUrl?: string | null;
  onRetakeForCloserLook?: () => void;
  onOverrideSpecies?: (speciesName: string) => void;
}

export default function EncounterCard({
  encounter,
  capturedImageUrl,
  onRetakeForCloserLook,
  onOverrideSpecies,
}: EncounterCardProps) {
  const {
    plant,
    folklore,
    story,
    sceneDescription,
    needsCloserLook,
    closerLookGuidance,
  } = encounter;

  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [customSpecies, setCustomSpecies] = useState("");

  const isUncertain =
    needsCloserLook ||
    plant.confidence === "low" ||
    plant.confidence === "medium";

  const confidenceBadgeColor =
    plant.confidence === "high" && !needsCloserLook
      ? "bg-emerald-950/90 text-emerald-300 border-emerald-600/50"
      : plant.confidence === "medium"
      ? "bg-amber-950/90 text-amber-300 border-amber-500/60"
      : "bg-amber-950/95 text-amber-200 border-amber-500/70";

  const handleConfirmCandidate = (candidate: string) => {
    if (onOverrideSpecies) {
      onOverrideSpecies(`The plant in this photo is ${candidate}`);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSpecies.trim() || !onOverrideSpecies) return;
    onOverrideSpecies(`The plant in this photo is ${customSpecies.trim()}`);
    setShowCorrectionInput(false);
    setCustomSpecies("");
  };

  return (
    <div className="space-y-4">
      {/* Prominent Closer Look Callout when the AI is not 100% certain of the species */}
      {isUncertain && (
        <div className="rounded-2xl border-2 border-amber-400/70 bg-gradient-to-b from-amber-950/85 to-forest-900/95 p-4 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-900/70 border border-amber-400/50 text-amber-200">
              <Eye className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {plant.confidence === "low"
                  ? "The Spirit Needs a Closer Look"
                  : "The Spirit Asks for a Closer Look"}
              </span>
              <p className="text-xs text-amber-50/95 leading-relaxed">
                {closerLookGuidance ||
                  plant.missingDiagnosticTraits ||
                  "To confirm the exact species without guessing, step closer and photograph a telling detail such as the stem buds, leaf attachment, or bark."}
              </p>
            </div>
          </div>

          {onRetakeForCloserLook && (
            <button
              type="button"
              onClick={onRetakeForCloserLook}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-forest-950 shadow-md hover:bg-amber-300 active:scale-[0.99] transition"
            >
              <Camera className="h-4 w-4" />
              <span>Photograph Closer Picture (Buds / Bark / Leaf Base)</span>
            </button>
          )}
        </div>
      )}

      {/* Botanical Identification Header Card */}
      <div className="overflow-hidden rounded-2xl border border-forest-700 bg-forest-900/90 shadow-xl">
        <div className="flex flex-col sm:flex-row">
          {capturedImageUrl && (
            <div className="relative h-44 w-full sm:h-auto sm:w-44 shrink-0 bg-forest-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImageUrl}
                alt={plant.commonName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent sm:hidden" />
              <span className="absolute bottom-2 left-2 rounded-md bg-forest-950/85 border border-parchment-400/30 px-2 py-0.5 text-[10px] font-serif text-parchment-300">
                {plant.oghamName}
              </span>
            </div>
          )}

          <div className="flex-1 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-serif uppercase tracking-widest text-parchment-400">
                {plant.oghamName}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase ${confidenceBadgeColor}`}
              >
                {needsCloserLook
                  ? `${plant.confidence} Confidence • Closer Look Needed`
                  : `${plant.confidence} ID Confidence`}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-parchment-50 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-moss-400 shrink-0" />
                <span>{plant.commonName}</span>
              </h2>
              <p className="text-xs italic text-parchment-300/80">
                {plant.scientificName}
              </p>
            </div>

            <p className="text-xs text-parchment-200/90 leading-relaxed">
              <strong className="text-parchment-300 font-medium">
                Morphological Analysis:
              </strong>{" "}
              {plant.visualTraits}
            </p>

            {/* Specialized BioCLIP 2.5 Plant Model Telemetry */}
            {plant.bioClipCandidates && plant.bioClipCandidates.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-forest-800/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-moss-400">
                  Possible kin — choose a name to seek its tale:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {plant.bioClipCandidates.slice(0, 4).map((c) => {
                    const label = c.commonName
                      ? `${c.commonName} (${c.scientificName})`
                      : c.scientificName;
                    return (
                      <button
                        key={c.scientificName}
                        type="button"
                        onClick={() => handleConfirmCandidate(label)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-forest-600/80 bg-forest-950/90 px-2.5 py-1 text-[11px] text-parchment-200 hover:border-moss-400 hover:bg-forest-800 transition"
                      >
                        <Check className="h-3 w-3 text-moss-400" />
                        <span>{label}</span>
                        <span className="text-[10px] text-parchment-400/75">
                          {Math.round(c.similarity * 100)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Candidate Species / Lookalikes & Quick Correction */}
            {plant.possibleSpecies && plant.possibleSpecies.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-forest-800/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment-400">
                  Candidate Species Considered (Tap to Confirm):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {plant.possibleSpecies.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      onClick={() => handleConfirmCandidate(candidate)}
                      className="inline-flex items-center gap-1 rounded-lg border border-forest-600 bg-forest-950/80 px-2.5 py-1 text-[11px] text-parchment-200 hover:border-parchment-400 hover:bg-forest-800 transition"
                    >
                      <Check className="h-3 w-3 text-moss-400" />
                      <span>{candidate}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Species Correction Toggle */}
            {onOverrideSpecies && (
              <div className="pt-1">
                {!showCorrectionInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCorrectionInput(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-parchment-300/80 hover:text-parchment-100 underline decoration-parchment-400/40 underline-offset-4"
                  >
                    <Edit3 className="h-3 w-3 text-parchment-400" />
                    <span>Wrong species? Tell the spirit what plant this is</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomSubmit}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={customSpecies}
                      onChange={(e) => setCustomSpecies(e.target.value)}
                      placeholder="e.g., European Ash (Fraxinus excelsior)"
                      className="flex-1 rounded-lg border border-forest-600 bg-forest-950 px-2.5 py-1.5 text-xs text-parchment-100 placeholder:text-parchment-300/40 focus:border-parchment-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-parchment-400 px-3 py-1.5 text-xs font-semibold text-forest-950 hover:bg-parchment-300"
                    >
                      Re-Attune
                    </button>
                  </form>
                )}
              </div>
            )}

            {sceneDescription && (
              <p className="text-[11px] text-parchment-300/60 border-t border-forest-800 pt-1.5">
                Scene: {sceneDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historical & Celtic Folklore Scroll */}
      <div className="rounded-2xl border border-parchment-400/35 bg-gradient-to-br from-forest-900 via-forest-900 to-forest-950 p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-parchment-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{folklore.tradition}</span>
          </span>
        </div>
        <h3 className="text-base font-serif font-semibold text-parchment-100">
          {folklore.title}
        </h3>
        <p className="text-xs text-parchment-200/90 leading-relaxed font-serif">
          {folklore.loreText}
        </p>
      </div>

      {/* Interactive Story Narrative */}
      <div className="rounded-2xl border border-forest-700 bg-forest-900/75 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-moss-400">
          <ScrollText className="h-4 w-4" />
          <span>{story.title}</span>
        </div>
        <p className="text-sm text-parchment-100 leading-relaxed">
          {story.narrative}
        </p>
        <div className="rounded-xl bg-forest-950/90 border border-forest-800 p-3 text-xs italic text-parchment-300 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-parchment-400 shrink-0 mt-0.5" />
          <span>{story.spiritPrompt}</span>
        </div>
      </div>
    </div>
  );
}

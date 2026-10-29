"use client";

import React, { useState } from "react";
import {
  DiscoveredPlantRecord,
  EncounterResponse,
  InventoryItem,
} from "@/types/game";

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  compendium: DiscoveredPlantRecord[];
  onResetJourney: () => void;
  currentEncounter?: EncounterResponse | null;
  onTriggerPreset?: (
    archetype: "oak" | "fern" | "hawthorn",
    note: string
  ) => void;
  onOverrideSpecies?: (speciesName: string) => void;
}

export default function InventoryDrawer({
  isOpen,
  onClose,
  inventory,
  compendium,
  onResetJourney,
  currentEncounter,
  onTriggerPreset,
  onOverrideSpecies,
}: InventoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<"bag" | "compendium" | "field">(
    "bag"
  );
  const [customSpecies, setCustomSpecies] = useState("");

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSpecies.trim() || !onOverrideSpecies) return;
    onOverrideSpecies(`The plant in this photo is ${customSpecies.trim()}`);
    setCustomSpecies("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-[#18221b]/65 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Forager's Satchel & Herbarium Dossier"
    >
      <div
        className="relative flex max-h-[88dvh] sm:max-h-full sm:h-full w-full sm:max-w-md flex-col border-t sm:border-t-0 sm:border-l border-[#353525] bg-[#f1e8d7] text-[#18221b] shadow-2xl"
        style={{
          backgroundImage: "url('/assets/plates/paper-texture.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      >
        {/* Archival Sheet Header */}
        <div className="flex items-center justify-between border-b border-[#353525] px-5 py-3.5">
          <div>
            <h2
              className="text-xl font-semibold text-[#16190d] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Herbarium Satchel &amp; Ledger
            </h2>
            <p className="text-xs text-[#3b3e30]">
              Pressed specimens, foraged tokens &amp; botanical notes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#353525] bg-[#efe9d8] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#202315] hover:bg-[#e5dcc6] active:scale-[0.98]"
          >
            Close
          </button>
        </div>

        {/* Archival Ledger Tabs */}
        <div className="grid grid-cols-3 border-b border-[#353525] bg-[#e9dec8]/60 px-3 py-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("bag")}
            className={`rounded-[4px] py-1.5 px-2 font-medium transition border ${
              activeTab === "bag"
                ? "bg-[#8b382c] text-[#f6e6d9] border-[#682319]"
                : "bg-transparent text-[#27291b] border-transparent hover:border-[#353525]/40"
            }`}
          >
            Satchel ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compendium")}
            className={`rounded-[4px] py-1.5 px-2 font-medium transition border ${
              activeTab === "compendium"
                ? "bg-[#8b382c] text-[#f6e6d9] border-[#682319]"
                : "bg-transparent text-[#27291b] border-transparent hover:border-[#353525]/40"
            }`}
          >
            Vouchers ({compendium.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("field")}
            className={`rounded-[4px] py-1.5 px-2 font-medium transition border ${
              activeTab === "field"
                ? "bg-[#8b382c] text-[#f6e6d9] border-[#682319]"
                : "bg-transparent text-[#27291b] border-transparent hover:border-[#353525]/40"
            }`}
          >
            Field Lab
          </button>
        </div>

        {/* Scrollable Ledger Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "bag" && (
            <>
              {inventory.length === 0 ? (
                <div className="border border-dashed border-[#353525]/70 p-6 text-center space-y-2">
                  <p
                    className="text-lg font-semibold text-[#16190d]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Your Satchel is Empty
                  </p>
                  <p className="text-xs text-[#3b3e30] leading-relaxed">
                    Complete physical foraging rituals on any voucher sheet to
                    gather fallen fronds, acorns, and waystones that unlock
                    folkloric paths.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#353525]/60 border-t border-b border-[#353525]">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h3
                          className="text-lg font-semibold text-[#16190d] leading-none"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                          }}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#2b3020] leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-[#5c5848]">
                          Origin Specimen: {item.originPlant}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#353525] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[#202315]">
                        In Bag
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "compendium" && (
            <>
              {compendium.length === 0 ? (
                <div className="border border-dashed border-[#353525]/70 p-6 text-center space-y-2">
                  <p
                    className="text-lg font-semibold text-[#16190d]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    No Pressed Vouchers Recorded
                  </p>
                  <p className="text-xs text-[#3b3e30] leading-relaxed">
                    Every plant identified along your walk is cataloged here
                    with its Latin binomial and world folklore entry.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#353525]/60 border-t border-b border-[#353525]">
                  {compendium.map((entry, idx) => (
                    <div key={entry.id} className="py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5c5848]">
                        <span>Voucher #{String(idx + 1).padStart(2, "0")}</span>
                        <span>{entry.tradition}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h3
                          className="text-xl font-semibold text-[#16190d]"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                          }}
                        >
                          {entry.commonName}
                        </h3>
                        <span className="text-xs italic text-[#3b3e30]">
                          {entry.scientificName}
                        </span>
                      </div>
                      <p className="text-xs text-[#17150f] leading-relaxed">
                        {entry.loreText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "field" && (
            <div className="space-y-5">
              {/* Indoor Evaluation Specimen Presets (tucked here per outdoor-focus priority) */}
              {onTriggerPreset && (
                <div className="border-t border-b border-[#353525] py-3.5 space-y-2.5">
                  <h3
                    className="text-base font-semibold text-[#16190d]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Herbarium Reference Specimens (Indoor Evaluation)
                  </h3>
                  <p className="text-xs text-[#3b3e30] leading-relaxed">
                    Testing indoors away from a trail? Load a reference
                    botanical specimen to run a live BioCLIP 2.5 + Llama Vision
                    folklore analysis:
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPreset(
                          "fern",
                          "Wild Woodland Bracken Fern (Pteridium aquilinum) fronds unfurling along a mossy forest path"
                        );
                        onClose();
                      }}
                      className="rounded-[4px] border border-[#353525] bg-[#efe9d8] px-2.5 py-2 text-xs font-medium text-[#18221b] hover:bg-[#e3dac3]"
                    >
                      Bracken Fern
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPreset(
                          "oak",
                          "Ancient Pedunculate Oak tree (Quercus robur) with lobed leaves and acorns beside the woodland path"
                        );
                        onClose();
                      }}
                      className="rounded-[4px] border border-[#353525] bg-[#efe9d8] px-2.5 py-2 text-xs font-medium text-[#18221b] hover:bg-[#e3dac3]"
                    >
                      Pedunculate Oak
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPreset(
                          "hawthorn",
                          "Flowering Hawthorn hedgerow (Crataegus monogyna) marking an old boundary path"
                        );
                        onClose();
                      }}
                      className="rounded-[4px] border border-[#353525] bg-[#efe9d8] px-2.5 py-2 text-xs font-medium text-[#18221b] hover:bg-[#e3dac3]"
                    >
                      May Hawthorn
                    </button>
                  </div>
                </div>
              )}

              {/* BioCLIP 2.5 & Manual Species Override */}
              {currentEncounter && (
                <div className="border-b border-[#353525] pb-4 space-y-2.5">
                  <h3
                    className="text-base font-semibold text-[#16190d]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Morphological &amp; BioCLIP 2.5 Telemetry
                  </h3>
                  <p className="text-xs text-[#2b3020] leading-relaxed">
                    <strong>Observed Traits:</strong>{" "}
                    {currentEncounter.plant.visualTraits}
                  </p>
                  {currentEncounter.plant.bioClipCandidates &&
                    currentEncounter.plant.bioClipCandidates.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] uppercase tracking-wider text-[#5c5848]">
                          Top BioCLIP 2.5 Matches (4,271 Species — Tap to
                          Re-Attune):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {currentEncounter.plant.bioClipCandidates
                            .slice(0, 4)
                            .map((c) => {
                              const label = c.commonName
                                ? `${c.commonName} (${c.scientificName})`
                                : c.scientificName;
                              return (
                                <button
                                  key={c.scientificName}
                                  type="button"
                                  onClick={() => {
                                    if (onOverrideSpecies) {
                                      onOverrideSpecies(
                                        `The plant in this photo is ${label}`
                                      );
                                      onClose();
                                    }
                                  }}
                                  className="rounded-[4px] border border-[#353525] bg-[#efe9d8] px-2 py-1 text-[11px] text-[#18221b] hover:bg-[#e3dac3]"
                                >
                                  {label} ({Math.round(c.similarity * 100)}%)
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                  {onOverrideSpecies && (
                    <form
                      onSubmit={handleCustomSubmit}
                      className="flex items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        value={customSpecies}
                        onChange={(e) => setCustomSpecies(e.target.value)}
                        placeholder="Override species (e.g., Fraxinus excelsior)..."
                        className="flex-1 rounded-[4px] border border-[#353525] bg-[#f7f2e4] px-2.5 py-1.5 text-xs text-[#18221b] placeholder:text-[#5c5848]"
                      />
                      <button
                        type="submit"
                        className="rounded-[4px] bg-[#8b382c] px-3 py-1.5 text-xs font-medium text-[#f6e6d9]"
                      >
                        Re-Attune
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Open-Weight AI Attribution */}
              <div className="space-y-1 text-xs text-[#3b3e30]">
                <p>
                  <strong>Open-Weight Vision AI:</strong>{" "}
                  meta-llama/Llama-3.2-11B-Vision-Instruct &amp; BioCLIP 2.5
                </p>
                <p>
                  <strong>Folklore Corpus:</strong> Global ethnobotany &amp;
                  world mythological traditions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Reset */}
        <div className="border-t border-[#353525] px-5 py-3 flex items-center justify-between bg-[#e9dec8]/50">
          <span className="text-[11px] text-[#5c5848]">
            Stored locally in field ledger
          </span>
          <button
            type="button"
            onClick={onResetJourney}
            className="rounded-[4px] border border-[#8b382c] px-3 py-1 text-xs font-medium text-[#8b382c] hover:bg-[#8b382c] hover:text-[#f6e6d9] transition"
          >
            Reset Ledger
          </button>
        </div>
      </div>
    </div>
  );
}

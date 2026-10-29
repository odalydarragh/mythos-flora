"use client";

import React, { useRef, useState } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Search,
  Compass,
  Leaf,
  Trees,
} from "lucide-react";
import { compressImageToDataUrl } from "@/lib/image-utils";

interface CameraCaptureProps {
  onPhotoCaptured: (imageDataUrl: string, customNote?: string) => void;
  closerLookGuidance?: string | null;
  activeDirectionPrompt?: {
    compassDirection: string;
    pathPrompt: string;
  } | null;
  turnNumber: number;
}

/**
 * Generates an inline SVG botanical scene converted to a JPEG data URL on a canvas
 * so players or hackathon judges testing indoors without a tree nearby can still trigger
 * a real vision model call with a genuine visual botanical image.
 */
async function createBotanicalSampleImage(
  archetype: "oak" | "fern" | "hawthorn"
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Forest backdrop gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  if (archetype === "oak") {
    grad.addColorStop(0, "#12291b");
    grad.addColorStop(0.6, "#1f472c");
    grad.addColorStop(1, "#2a1f14");
  } else if (archetype === "fern") {
    grad.addColorStop(0, "#0d261c");
    grad.addColorStop(0.6, "#1b4d38");
    grad.addColorStop(1, "#0f1e15");
  } else {
    grad.addColorStop(0, "#1b2838");
    grad.addColorStop(0.6, "#284b36");
    grad.addColorStop(1, "#1e2618");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Draw winding earthen trail
  ctx.fillStyle = "#4a3b28";
  ctx.beginPath();
  ctx.moveTo(220, 480);
  ctx.quadraticCurveTo(300, 320, 340, 220);
  ctx.lineTo(395, 220);
  ctx.quadraticCurveTo(380, 330, 460, 480);
  ctx.closePath();
  ctx.fill();

  if (archetype === "oak") {
    // Oak trunk & deeply lobed green oak leaves + acorns
    ctx.fillStyle = "#3b2818";
    ctx.fillRect(110, 80, 75, 360);
    ctx.fillStyle = "#2d6a3e";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(150 + (i % 3) * 55, 110 + Math.floor(i / 3) * 40, 48, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#529451";
    ctx.beginPath();
    ctx.ellipse(470, 200, 70, 35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c99e52";
    ctx.font = "bold 22px Georgia, serif";
    ctx.fillText("Quercus robur — Oak Tree & Forest Path", 130, 445);
  } else if (archetype === "fern") {
    // Geometric fern fronds
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 4;
    for (let f = 0; f < 5; f++) {
      const baseX = 140 + f * 90;
      ctx.beginPath();
      ctx.moveTo(baseX, 420);
      ctx.quadraticCurveTo(baseX + 20, 260, baseX + 45, 150);
      ctx.stroke();
      for (let p = 0; p < 8; p++) {
        const y = 390 - p * 28;
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(baseX + p * 3 - 18, y, 18, 6, -0.4, 0, Math.PI * 2);
        ctx.ellipse(baseX + p * 3 + 22, y, 18, 6, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = "#d9f99d";
    ctx.font = "bold 22px Georgia, serif";
    ctx.fillText("Pteridium aquilinum — Woodland Bracken Fern", 110, 450);
  } else {
    // Hawthorn blossom & serrated leaves
    ctx.strokeStyle = "#5c4028";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(80, 340);
    ctx.lineTo(540, 160);
    ctx.stroke();
    for (let b = 0; b < 6; b++) {
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(170 + b * 60, 290 - b * 22, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(170 + b * 60, 290 - b * 22, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 22px Georgia, serif";
    ctx.fillText("Crataegus monogyna — Hawthorn Hedgerow", 120, 445);
  }

  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function CameraCapture({
  onPhotoCaptured,
  closerLookGuidance,
  activeDirectionPrompt,
  turnNumber,
}: CameraCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [customNote, setCustomNote] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMessage(null);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 768, 0.78);
      onPhotoCaptured(compressedDataUrl, customNote.trim() || undefined);
    } catch (err) {
      console.error("Image compression error:", err);
      setErrorMessage("This image is veiled from the spirit. Choose another photograph or take a new one.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handlePresetTrailSnap = async (
    archetype: "oak" | "fern" | "hawthorn",
    note: string
  ) => {
    setIsCompressing(true);
    setErrorMessage(null);
    try {
      const sampleUrl = await createBotanicalSampleImage(archetype);
      onPhotoCaptured(sampleUrl, note);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Path Direction Banner (from previous turn) */}
      {activeDirectionPrompt && (
        <div className="rounded-xl border border-parchment-400/40 bg-forest-900/90 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-parchment-400">
            <Compass className="h-4 w-4 text-parchment-400" />
            <span>Current Heading: {activeDirectionPrompt.compassDirection}</span>
          </div>
          <p className="mt-1.5 text-sm text-parchment-100 leading-relaxed">
            {activeDirectionPrompt.pathPrompt}
          </p>
        </div>
      )}

      {/* Closer Look Guidance Banner (if AI requested a closer look) */}
      {closerLookGuidance && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-950/50 p-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Search className="h-4 w-4" />
            <span>The Spirit Asks for a Closer Look</span>
          </div>
          <p className="mt-1 text-sm text-amber-100/90">{closerLookGuidance}</p>
        </div>
      )}

      {/* Main Mobile Viewfinder Card */}
      <div className="relative overflow-hidden rounded-2xl border border-forest-700 bg-gradient-to-b from-forest-900 to-forest-950 p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-800/90 border border-parchment-400/30 shadow-inner">
            <Trees className="h-8 w-8 text-parchment-300" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block rounded-full bg-forest-800/80 border border-forest-600 px-3 py-0.5 text-[11px] font-medium uppercase tracking-widest text-parchment-300">
              Chapter {turnNumber} • The Encounter
            </span>
            <h2 className="text-xl font-serif font-bold text-parchment-50">
              Meet the Living Wood
            </h2>
            <p className="text-xs text-parchment-200/80 max-w-xs mx-auto leading-relaxed">
              Photograph a tree, leaf, or mossy stone along your path. Offer its likeness to the woodland spirit and discover the tales it carries.
            </p>
          </div>

          {/* Optional Herbalist Observation Note */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Optional note (e.g., 'Near an old oak tree by the river')..."
              className="w-full rounded-xl border border-forest-700 bg-forest-950/80 px-3.5 py-2.5 text-xs text-parchment-100 placeholder:text-parchment-300/40 focus:border-parchment-400 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300 bg-red-950/60 border border-red-700/50 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}

          {/* Hidden Camera & File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Primary Mobile Camera Button */}
          <div className="grid w-full max-w-sm grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-500 px-5 py-3.5 text-sm font-semibold text-parchment-50 shadow-lg shadow-forest-950/60 border border-parchment-300/30 active:scale-[0.99] transition hover:from-forest-500 hover:to-forest-600 disabled:opacity-50"
            >
              <Camera className="h-5 w-5 text-parchment-200" />
              <span>{isCompressing ? "Calling the spirit…" : "Photograph the Wood"}</span>
            </button>

            <button
              type="button"
              disabled={isCompressing}
              onClick={() => uploadInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-forest-700 bg-forest-900/80 px-4 py-3.5 text-xs font-medium text-parchment-200 hover:bg-forest-800/80 active:scale-[0.99] transition disabled:opacity-50"
            >
              <Upload className="h-4 w-4 text-parchment-400" />
              <span>Offer a Photograph</span>
            </button>
          </div>

          {/* Quick Field / Judge Preset Specimens */}
          <div className="w-full max-w-sm pt-3 border-t border-forest-800/80">
            <p className="text-[11px] uppercase tracking-wider text-parchment-300/60 mb-2 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-parchment-400" />
              <span>By the hearth? Begin with an illustrated plant:</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isCompressing}
                onClick={() =>
                  handlePresetTrailSnap(
                    "oak",
                    "Ancient Pedunculate Oak tree (Quercus robur) with lobed leaves and acorns beside the woodland path"
                  )
                }
                className="flex flex-col items-center gap-1 rounded-lg border border-forest-700/80 bg-forest-950/70 p-2 text-[11px] text-parchment-200 hover:border-parchment-400/50 hover:bg-forest-800/50 transition"
              >
                <Leaf className="h-3.5 w-3.5 text-parchment-400" />
                <span>Sacred Oak</span>
              </button>
              <button
                type="button"
                disabled={isCompressing}
                onClick={() =>
                  handlePresetTrailSnap(
                    "fern",
                    "Wild Bracken Fern (Pteridium aquilinum) fronds unfurling along a mossy forest path"
                  )
                }
                className="flex flex-col items-center gap-1 rounded-lg border border-forest-700/80 bg-forest-950/70 p-2 text-[11px] text-parchment-200 hover:border-parchment-400/50 hover:bg-forest-800/50 transition"
              >
                <Leaf className="h-3.5 w-3.5 text-moss-400" />
                <span>Bracken Fern</span>
              </button>
              <button
                type="button"
                disabled={isCompressing}
                onClick={() =>
                  handlePresetTrailSnap(
                    "hawthorn",
                    "Flowering Hawthorn hedgerow (Crataegus monogyna) marking an old Celtic boundary path"
                  )
                }
                className="flex flex-col items-center gap-1 rounded-lg border border-forest-700/80 bg-forest-950/70 p-2 text-[11px] text-parchment-200 hover:border-parchment-400/50 hover:bg-forest-800/50 transition"
              >
                <Leaf className="h-3.5 w-3.5 text-amber-300" />
                <span>Hawthorn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

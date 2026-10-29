"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Leaf, Compass, Cpu } from "lucide-react";

interface LoreRitualLoaderProps {
  previewImageUrl?: string | null;
}

const RITUAL_STEPS = [
  {
    title: "Translating Ogham runes...",
    subtitle: "Reading the ancient tree-alphabet etched in bark and leaf.",
    ogham: "᚛ᚁᚂᚃᚄᚅ᚜",
  },
  {
    title: "Connecting to the Mycelial network...",
    subtitle: "Querying subterranean fungal threads beneath the footpath.",
    ogham: "᚛ᚆᚇᚈᚉᚊ᚜",
  },
  {
    title: "Running BioCLIP 2.5 plant taxonomy classifier...",
    subtitle: "Matching botanical embedding against 4,271 iNaturalist flora species.",
    ogham: "᚛ᚋᚌᚍᚎᚏ᚜",
  },
  {
    title: "Weaving Celtic & world folklore...",
    subtitle: "Binding local ecology to the memory of the wood.",
    ogham: "᚛ᚐᚑᚒᚓᚔ᚜",
  },
];

export default function LoreRitualLoader({
  previewImageUrl,
}: LoreRitualLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % RITUAL_STEPS.length);
    }, 2000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 92 ? prev + 4 : prev));
    }, 350);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const currentStep = RITUAL_STEPS[stepIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-forest-700/80 bg-forest-900/90 p-6 shadow-2xl backdrop-blur-md">
      {/* Subtle background preview */}
      {previewImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 opacity-15 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${previewImageUrl})` }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        {/* Animated Ogham & Mycelial Sigil */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-parchment-400/50 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-forest-500/60 animate-pulse" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-800/90 border border-parchment-400/40 shadow-inner">
            <Leaf className="h-8 w-8 text-parchment-300 animate-pulse" />
          </div>
        </div>

        {/* Ogham Rune Banner */}
        <div className="rounded-full bg-forest-950/90 border border-forest-700 px-4 py-1 text-sm tracking-[0.25em] text-parchment-400 font-serif">
          {currentStep.ogham}
        </div>

        {/* Dynamic Ritual Status Text */}
        <div className="space-y-1.5 min-h-[64px]">
          <h3 className="text-lg font-serif font-semibold text-parchment-100 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-parchment-400 shrink-0" />
            <span>{currentStep.title}</span>
          </h3>
          <p className="text-xs text-parchment-200/75 max-w-xs mx-auto leading-relaxed">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Slow & Steady Ritual Progress Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-forest-950 border border-forest-800">
            <div
              className="h-full bg-gradient-to-r from-forest-600 via-moss-500 to-parchment-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-parchment-300/70">
            <span className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-parchment-400" />
              Slow & Steady Ritual
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3 text-moss-400" />
              Llama-3.2-11B-Vision
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

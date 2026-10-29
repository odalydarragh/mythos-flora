"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  DiscoveredPlantRecord,
  EncounterChoice,
  EncounterResponse,
  InventoryItem,
} from "@/types/game";
import { compressImageToDataUrl } from "@/lib/image-utils";
import StoryPassage from "@/components/StoryPassage";
import InventoryDrawer from "@/components/InventoryDrawer";
import LoreRitualLoader from "@/components/LoreRitualLoader";

// Required plate references for Impeccable comp-spec contract:
// assets/plates/paper-texture.png
// assets/plates/specimen-plate.png

const STORAGE_KEY_INVENTORY = "mythos_flora_inventory_v2";
const STORAGE_KEY_COMPENDIUM = "mythos_flora_compendium_v2";

interface ChapterTurn {
  turnNumber: number;
  status: "capture" | "ritual" | "encounter";
  imageUrl: string | null;
  encounter: EncounterResponse | null;
  selectedChoice: EncounterChoice | null;
  useSubstitute: boolean;
}

const INITIAL_SPECIMEN_ENCOUNTER: EncounterResponse = {
  needsCloserLook: false,
  closerLookGuidance: null,
  sceneDescription:
    "Woodland Bracken fronds unfurling from damp forest mulch along an old footpath.",
  plant: {
    commonName: "Woodland Bracken",
    scientificName: "Pteridium aquilinum",
    confidence: "high",
    visualTraits:
      "Triangular bipinnate fronds rising from creeping underground rhizomes, with tightly coiled fiddlehead crosiers at the base.",
    oghamName: "Fearn — Slavic & Baltic Fern-Fire",
  },
  folklore: {
    tradition: "SLAVIC MIDSUMMER LORE",
    title: "The Fern-Fire of Kupala Night",
    loreText:
      "In Slavic midsummer lore, bracken uncurls beneath the fern-fire of the longest day, guarding sparks of the sun and leading the wise to hidden bloom. Folklore from the Carpathians to the Baltic tells of its fronds as thresholds between worlds.",
  },
  story: {
    title: "The Light Beneath the Ferns",
    narrative:
      "A single amber light hangs beneath the bracken. It does not flicker when the wind moves the fronds. As you draw closer, it slips deeper into the wood, then stops, as though waiting for you.\nA voice rises from the dry leaves at your feet. Someone has carried a spark beyond the old boundary, and the wood has lost the way to call it home.",
    spiritPrompt: "Will you follow the light along the open verge, or bring a token of the fernwood and ask the hidden path to let you through?",
  },
  forageQuest: {
    ritualPrompt:
      "Tender, tightly coiled. Harvest gently—leave the crown to unfurl.",
    primaryItem: {
      id: "coiled-frond-tip",
      name: "Coiled Frond Tip",
      description:
        "Tender, tightly coiled. Harvest gently—leave the crown to unfurl.",
      symbol: "leaf",
      originPlant: "Woodland Bracken (Pteridium aquilinum)",
    },
    substituteItem: {
      id: "fallen-bracken-stem",
      name: "Dry Bracken Stem",
      description:
        "A hollow autumn stem from the woodland floor, accepted when young fronds are scarce.",
      symbol: "sparkles",
      originPlant: "Woodland Floor",
    },
  },
  choices: [
    {
      id: "paths-await",
      label: "PATHS AWAIT",
      outcomeText:
        "You trace the edge of the bracken stand as the woodland path opens toward the ridge.",
      requiredItemId: null,
      requiredItemName: null,
      compassDirection: "North-East along the sunlit verge",
      pathPrompt: "Choose your path into the turn.",
    },
    {
      id: "into-the-fernwood",
      label: "II • INTO THE FERNWOOD",
      outcomeText:
        "With the fern token in your satchel, the hidden hollow parts to reveal an ancient boundary trail.",
      requiredItemId: "coiled-frond-tip",
      requiredItemName: "Coiled Frond Tip",
      compassDirection: "East-South-East where the old paths cross",
      pathPrompt: "Seek the fern-flower where the old paths cross.",
    },
  ],
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: "wayfarer-acorn-cup",
    name: "Fallen Acorn Cup",
    description:
      "A woody cupule gathered beneath a boundary oak to ward the traveler against storms.",
    symbol: "leaf",
    originPlant: "Pedunculate Oak (Quercus robur)",
  },
  {
    id: "river-quartz-pebble",
    name: "Weather-Worn Waystone",
    description:
      "A smooth stone from the trail crossing, carrying the memory of footsteps before yours.",
    symbol: "sparkles",
    originPlant: "Old Ridgeway Crossing",
  },
];

const DEFAULT_COMPENDIUM: DiscoveredPlantRecord[] = [
  {
    id: "voucher-01-pteridium-aquilinum",
    commonName: "Woodland Bracken",
    scientificName: "Pteridium aquilinum",
    oghamName: "Fearn",
    tradition: "Slavic Midsummer Lore",
    folkloreTitle: "The Fern-Fire of Kupala Night",
    loreText:
      "In Slavic midsummer lore, bracken uncurls beneath the fern-fire of the longest day, guarding sparks of the sun and leading the wise to hidden bloom.",
    visualTraits:
      "Triangular fronds with coiled crosiers emerging from forest leaf litter.",
    discoveredAt: "2026-10-29T12:00:00.000Z",
  },
];

function toRoman(num: number): string {
  const romans: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let n = Math.max(1, num);
  let res = "";
  for (const [val, sym] of romans) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res;
}

async function createBotanicalSampleImage(
  archetype: "oak" | "fern" | "hawthorn"
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  if (archetype === "oak") {
    grad.addColorStop(0, "#1d2d1e");
    grad.addColorStop(0.6, "#2c462d");
    grad.addColorStop(1, "#33261a");
  } else if (archetype === "fern") {
    grad.addColorStop(0, "#1c2b1e");
    grad.addColorStop(0.6, "#2e4b31");
    grad.addColorStop(1, "#241d15");
  } else {
    grad.addColorStop(0, "#243028");
    grad.addColorStop(0.6, "#384d3b");
    grad.addColorStop(1, "#2a241b");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = "#52412d";
  ctx.beginPath();
  ctx.moveTo(220, 480);
  ctx.quadraticCurveTo(300, 320, 340, 220);
  ctx.lineTo(395, 220);
  ctx.quadraticCurveTo(380, 330, 460, 480);
  ctx.closePath();
  ctx.fill();

  if (archetype === "oak") {
    ctx.fillStyle = "#3b2818";
    ctx.fillRect(110, 80, 75, 360);
    ctx.fillStyle = "#4d6b3c";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        150 + (i % 3) * 55,
        110 + Math.floor(i / 3) * 40,
        48,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "#f1e8d7";
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText("Quercus robur — Pedunculate Oak Specimen", 115, 445);
  } else if (archetype === "fern") {
    ctx.strokeStyle = "#6b7332";
    ctx.lineWidth = 4;
    for (let f = 0; f < 5; f++) {
      const baseX = 140 + f * 90;
      ctx.beginPath();
      ctx.moveTo(baseX, 420);
      ctx.quadraticCurveTo(baseX + 20, 260, baseX + 45, 150);
      ctx.stroke();
    }
    ctx.fillStyle = "#f1e8d7";
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText("Pteridium aquilinum — Woodland Bracken", 115, 445);
  } else {
    ctx.strokeStyle = "#5c4028";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(80, 340);
    ctx.lineTo(540, 160);
    ctx.stroke();
    for (let b = 0; b < 6; b++) {
      ctx.fillStyle = "#f7f2e7";
      ctx.beginPath();
      ctx.arc(170 + b * 60, 290 - b * 22, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8b382c";
      ctx.beginPath();
      ctx.arc(170 + b * 60, 290 - b * 22, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#f1e8d7";
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText("Crataegus monogyna — May Hawthorn", 125, 445);
  }

  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function MythosFloraPage() {
  const [inventory, setInventory] =
    useState<InventoryItem[]>(DEFAULT_INVENTORY);
  const [compendium, setCompendium] =
    useState<DiscoveredPlantRecord[]>(DEFAULT_COMPENDIUM);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [chapters, setChapters] = useState<ChapterTurn[]>([
    {
      turnNumber: 1,
      status: "encounter",
      imageUrl: "/assets/plates/specimen-plate.png",
      encounter: INITIAL_SPECIMEN_ENCOUNTER,
      selectedChoice: null,
      useSubstitute: false,
    },
    {
      turnNumber: 2,
      status: "capture",
      imageUrl: null,
      encounter: null,
      selectedChoice: null,
      useSubstitute: false,
    },
  ]);

  const [customNote, setCustomNote] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [activeTargetTurn, setActiveTargetTurn] = useState<number>(2);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const reelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedInv = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (savedInv) {
        const parsed = JSON.parse(savedInv);
        if (Array.isArray(parsed) && parsed.length > 0) setInventory(parsed);
      }
      const savedComp = localStorage.getItem(STORAGE_KEY_COMPENDIUM);
      if (savedComp) {
        const parsed = JSON.parse(savedComp);
        if (Array.isArray(parsed) && parsed.length > 0) setCompendium(parsed);
      }
    } catch (e) {
      console.error("Failed to hydrate herbarium state:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
      localStorage.setItem(STORAGE_KEY_COMPENDIUM, JSON.stringify(compendium));
    } catch (e) {
      console.error("Failed to persist herbarium state:", e);
    }
  }, [inventory, compendium]);

  const scrollToTurn = (turnNumber: number) => {
    const el = document.querySelector(
      `[data-turn-slide="${turnNumber}"]`
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }
  };

  const handlePhotoCapturedForTurn = async (
    turnNumber: number,
    imageDataUrl: string,
    observationNote?: string
  ) => {
    const prevChapter = chapters.find((c) => c.turnNumber === turnNumber - 1);

    setChapters((prev) =>
      prev.map((ch) =>
        ch.turnNumber === turnNumber
          ? { ...ch, status: "ritual", imageUrl: imageDataUrl }
          : ch
      )
    );

    try {
      const res = await fetch("/api/encounter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          turnNumber,
          inventory,
          previousChoiceLabel: prevChapter?.selectedChoice?.label,
          previousDirection: prevChapter?.selectedChoice?.compassDirection,
          previousStory: prevChapter?.encounter?.story.narrative,
          previousOutcome: prevChapter?.selectedChoice?.outcomeText,
          customObservation: observationNote,
        }),
      });

      if (!res.ok) throw new Error(`Encounter request failed: ${res.status}`);
      const data = (await res.json()) as EncounterResponse;

      setChapters((prev) => {
        const updated = prev.map((ch) =>
          ch.turnNumber === turnNumber
            ? { ...ch, status: "encounter" as const, encounter: data }
            : ch
        );
        const hasNextCaptureSlide = updated.some(
          (ch) => ch.turnNumber === turnNumber + 1
        );
        if (!hasNextCaptureSlide) {
          updated.push({
            turnNumber: turnNumber + 1,
            status: "capture",
            imageUrl: null,
            encounter: null,
            selectedChoice: null,
            useSubstitute: false,
          });
        }
        return updated;
      });

      if (
        data.plant?.commonName &&
        !data.needsCloserLook &&
        data.plant.confidence !== "low"
      ) {
        setCompendium((prev) => {
          const exists = prev.some(
            (p) =>
              p.commonName.toLowerCase() === data.plant.commonName.toLowerCase()
          );
          if (exists) return prev;
          return [
            {
              id: `${Date.now()}-${data.plant.commonName}`,
              commonName: data.plant.commonName,
              scientificName: data.plant.scientificName,
              oghamName: data.plant.oghamName,
              tradition: data.folklore.tradition,
              folkloreTitle: data.folklore.title,
              loreText: data.folklore.loreText,
              visualTraits: data.plant.visualTraits,
              discoveredAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }
    } catch (err) {
      console.error("Failed to summon botanical encounter:", err);
      setCaptureError("The woodland spirit cannot answer just now. Your photograph is not the problem. Please try again shortly.");
      setChapters((prev) =>
        prev.map((ch) =>
          ch.turnNumber === turnNumber ? { ...ch, status: "capture" } : ch
        )
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCaptureError(null);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 768, 0.78);
      await handlePhotoCapturedForTurn(
        activeTargetTurn,
        compressedDataUrl,
        customNote.trim() || undefined
      );
      setCustomNote("");
    } catch (err) {
      console.error("Image compression error:", err);
      setCaptureError("This image is veiled from the spirit. Choose another photograph or take a new one.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleCollectItem = (turnNumber: number) => {
    const chapter = chapters.find((c) => c.turnNumber === turnNumber);
    if (!chapter || !chapter.encounter) return;

    const item = chapter.useSubstitute
      ? chapter.encounter.forageQuest.substituteItem
      : chapter.encounter.forageQuest.primaryItem;

    setInventory((prev) => {
      if (prev.some((existing) => existing.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const handleSelectChoice = (turnNumber: number, choice: EncounterChoice) => {
    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.turnNumber === turnNumber ? { ...ch, selectedChoice: choice } : ch
      );
      const hasNext = updated.some((ch) => ch.turnNumber === turnNumber + 1);
      if (!hasNext) {
        updated.push({
          turnNumber: turnNumber + 1,
          status: "capture",
          imageUrl: null,
          encounter: null,
          selectedChoice: null,
          useSubstitute: false,
        });
      }
      return updated;
    });

    setTimeout(() => {
      scrollToTurn(turnNumber + 1);
    }, 180);
  };

  const handleResetJourney = () => {
    setInventory(DEFAULT_INVENTORY);
    setCompendium(DEFAULT_COMPENDIUM);
    setChapters([
      {
        turnNumber: 1,
        status: "encounter",
        imageUrl: "/assets/plates/specimen-plate.png",
        encounter: INITIAL_SPECIMEN_ENCOUNTER,
        selectedChoice: null,
        useSubstitute: false,
      },
      {
        turnNumber: 2,
        status: "capture",
        imageUrl: null,
        encounter: null,
        selectedChoice: null,
        useSubstitute: false,
      },
    ]);
    setIsDrawerOpen(false);
    localStorage.removeItem(STORAGE_KEY_INVENTORY);
    localStorage.removeItem(STORAGE_KEY_COMPENDIUM);
    scrollToTurn(1);
  };

  const sheet1 = chapters[0];
  const sheet1Encounter = sheet1.encounter || INITIAL_SPECIMEN_ENCOUNTER;
  const sheet1ActiveItem = sheet1.useSubstitute
    ? sheet1Encounter.forageQuest.substituteItem
    : sheet1Encounter.forageQuest.primaryItem;
  const isSheet1ItemCollected = inventory.some(
    (i) =>
      i.id === sheet1Encounter.forageQuest.primaryItem.id ||
      i.id === sheet1Encounter.forageQuest.substituteItem.id
  );

  return (
    <div
      ref={reelContainerRef}
      className="h-dvh w-full overflow-y-scroll snap-y snap-proximity bg-[#f1e8d7] scroll-smooth"
    >
      {/* Hidden Camera & Upload Inputs shared across turns */}
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

      {/* =====================================================================
          CHAPTER I (THE APPROVED HERO VOUCHER SHEET)
         ===================================================================== */}
      <section
        data-turn-slide="1"
        className="snap-start min-h-dvh w-full flex items-center justify-center bg-[#f1e8d7]"
      >
        <main className="comp-frame" data-voucher-sheet="01">
          {/* 1. Full-Sheet Paper Texture Plate */}
          <div
            className="r-paper-texture"
            data-region="paper-texture"
            style={{
              backgroundImage: "url('/assets/plates/paper-texture.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px",
            }}
          />

          {/* 2. Top Archival Header Bar Rules (Top & Bottom Hairline Rules) */}
          <div
            className="r-header-bar border-t border-b border-[#3b3c2e]"
            data-region="header-bar"
          />

          {/* 3. Sheet & Turn Title */}
          <div
            className="r-sheet-turn-title flex items-center justify-center pl-[5%] text-[#1d2111]"
            data-region="sheet-turn-title"
          >
            <p
              style={{
                fontFamily: "'Petrona', 'Cormorant Garamond', Georgia, serif",
                fontSize: "max(14px, 2.95cqw)",
                letterSpacing: "0.055em",
                lineHeight: 1.05,
                margin: 0,
                fontWeight: 400,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              CHAPTER I
            </p>
          </div>

          {/* 4. Satchel Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="r-satchel-button archival-press flex items-center justify-center rounded-full border-solid border-[#1a1c12] bg-[#efe9d8] text-[#1a1c12] hover:bg-[#e6dec8]"
            style={{ borderWidth: "0.28cqw" }}
            data-region="satchel-button"
          >
            <span
              style={{
                fontFamily: "'Petrona', 'Cormorant Garamond', Georgia, serif",
                fontSize: "max(14px, 2.75cqw)",
                letterSpacing: "0.06em",
                lineHeight: 1,
                fontWeight: 500,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              SATCHEL ({inventory.length})
            </span>
          </button>

          {/* 5. Specimen Plate (Taped Bracken Fern & Slavic Midsummer Lore Wax Seal) */}
          <figure className="r-specimen-plate m-0" data-region="specimen-plate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sheet1.imageUrl || "/assets/plates/specimen-plate.png"}
              alt={`${sheet1Encounter.plant.commonName} (${sheet1Encounter.plant.scientificName}) herbarium specimen`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </figure>

          {/* 6. Species Header (Shaded Bracken Frond Engraving + Common Name | Scientific Name) */}
          <div
            className="r-species-header flex items-center justify-between border-t border-b border-[#2b2e20] text-[#16190d]"
            data-region="species-header"
          >
            <div className="flex items-center gap-[1.8cqw] min-w-0">
              {/* Shaded Botanical Fern Frond Woodcut SVG */}
              <svg
                width="34"
                height="40"
                viewBox="0 0 34 40"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M7 36C11 26 16 15 25 4"
                  stroke="#16190d"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M11 28C7 26 4 23 5 20C8 20 11 24 11 28Z"
                  fill="#27291b"
                />
                <path
                  d="M14 22C10 20 7 17 8 14C11 14 14 18 14 22Z"
                  fill="#27291b"
                />
                <path
                  d="M18 16C14 14 12 11 13 8C16 8 18 12 18 16Z"
                  fill="#27291b"
                />
                <path
                  d="M12 29C16 28 20 29 21 32C18 33 14 31 12 29Z"
                  fill="#27291b"
                />
                <path
                  d="M15 23C19 22 23 23 24 26C21 27 17 25 15 23Z"
                  fill="#27291b"
                />
                <path
                  d="M19 17C23 16 26 17 27 20C24 21 21 19 19 17Z"
                  fill="#27291b"
                />
              </svg>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', 'Petrona', Georgia, serif",
                  fontSize: "max(26px, 5.55cqw)",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  margin: 0,
                  whiteSpace: "nowrap",
                  color: "#16190d",
                }}
              >
                {sheet1Encounter.plant.commonName}
              </h1>
            </div>

            <div className="flex items-center shrink-0 h-[60%] border-l border-[#626453] pl-[2.5cqw] pr-[0.5cqw]">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', 'Petrona', Georgia, serif",
                  fontSize: "max(14px, 3.75cqw)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#3b3e30",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {sheet1Encounter.plant.scientificName}
              </span>
            </div>
          </div>

          {/* 7. Folklore Text Block (2 paragraphs, 2 lines each = 4 lines total) */}
          <div
            className="r-lore-text-block flex flex-col justify-center gap-[1.1cqw] text-[#17150f]"
            data-region="lore-text-block"
          >
            <StoryPassage encounter={sheet1Encounter} />
          </div>

          {/* 8. Physical Forage Box Chrome (4-sided enclosed box + Shaded Coiled Crosier Engraving + Vertical Divider) */}
          <div
            className="r-forage-box border border-[#2b2e20] bg-[#efe7d5]/55 flex items-center"
            data-region="forage-box"
          >
            <div className="w-[14.5%] h-full flex items-center justify-center pl-1">
              {/* Shaded Coiled Fern Crosier Woodcut SVG */}
              <svg
                width="48"
                height="56"
                viewBox="0 0 48 56"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M22 52C22 37 24 23 28 13C30 7 37 6 40 11C42 15 39 21 34 21C30 21 29 16 33 14"
                  stroke="#1e2111"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M22 43C16 41 11 42 9 46C13 48 18 46 22 43Z"
                  fill="#27291b"
                />
                <path
                  d="M23 34C17 32 12 33 10 37C14 39 19 37 23 34Z"
                  fill="#27291b"
                />
                <path
                  d="M25 25C20 23 15 24 13 28C17 29 21 28 25 25Z"
                  fill="#27291b"
                />
                <path
                  d="M22 39C28 37 33 38 35 42C31 44 26 42 22 39Z"
                  fill="#27291b"
                />
                <path
                  d="M24 30C30 28 35 29 37 33C33 35 28 33 24 30Z"
                  fill="#27291b"
                />
              </svg>
            </div>
            <div className="ml-auto mr-[28.2%] h-[76%] border-r border-[#353525]/65" />
          </div>

          {/* 9. Forage Label Text */}
          <div
            className="r-forage-label-text flex flex-col justify-center text-[#1e2111]"
            data-region="forage-label-text"
          >
            <p
              style={{
                fontFamily: "var(--r-forage-label-text-family), Georgia, serif",
                fontSize: "max(14px, 2.85cqw)",
                fontWeight: 500,
                lineHeight: 1.15,
                margin: 0,
                whiteSpace: "nowrap",
                color: "#1e2111",
              }}
            >
              Gather a Token: {sheet1ActiveItem.name}
            </p>
            <p
              style={{
                fontFamily: "var(--r-forage-label-text-family), Georgia, serif",
                fontSize: "max(13px, 2.35cqw)",
                fontWeight: 300,
                lineHeight: 1.22,
                margin: "0.65cqw 0 0 0",
                color: "#474737",
              }}
            >
              {sheet1ActiveItem.description}
            </p>
          </div>

          {/* 10. Forage CTA Button */}
          <button
            type="button"
            onClick={() => handleCollectItem(1)}
            className="r-forage-cta-button archival-press flex items-center justify-center rounded-[4px] bg-[#904035] p-[3px] text-[#f6e6d9] hover:bg-[#7e3125]"
            data-region="forage-cta-button"
          >
            <span className="flex h-full w-full items-center justify-center rounded-[3px] border border-[#cc8f80]">
              <span
                style={{
                  fontFamily: "'Petrona', 'Cormorant Garamond', Georgia, serif",
                  fontSize: "max(14px, 3.15cqw)",
                  fontWeight: 600,
                  lineHeight: 1.12,
                  color: "#f6e6d9",
                  textAlign: "center",
                  display: "block",
                }}
              >
                {isSheet1ItemCollected ? (
                  <>
                    Kept in your satchel
                  </>
                ) : (
                  <>
                    I picked up {sheet1ActiveItem.name}
                  </>
                )}
              </span>
            </span>
          </button>

          {/* 11. Path Row 1: PATHS AWAIT */}
          <button
            type="button"
            onClick={() => handleSelectChoice(1, sheet1Encounter.choices[0])}
            className="r-path-row-1 archival-row flex items-center justify-between border-b border-[#2b2e20] text-left text-[#1e2111] hover:bg-[#e8dec8]/45"
            data-region="path-row-1"
          >
            <div className="flex items-center gap-[2.2cqw]">
              {/* Shaded 8-Point Compass Rose Engraving SVG */}
              <svg
                width="38"
                height="38"
                viewBox="0 0 42 42"
                fill="none"
                className="shrink-0 ml-1"
                aria-hidden="true"
              >
                <circle
                  cx="21"
                  cy="21"
                  r="14"
                  stroke="#27291b"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />
                <path
                  d="M21 8L23.5 18.5L34 21L23.5 23.5L21 34L18.5 23.5L8 21L18.5 18.5L21 8Z"
                  stroke="#27291b"
                  strokeWidth="1.3"
                  fill="#27291b"
                  fillOpacity="0.18"
                />
                <path
                  d="M21 3L23.5 18.5L39 21L23.5 23.5L21 39L18.5 23.5L3 21L18.5 18.5L21 3Z"
                  stroke="#27291b"
                  strokeWidth="1.4"
                />
                <circle cx="21" cy="21" r="2.2" fill="#27291b" />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily:
                      "'Petrona', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "max(14px, 3.05cqw)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    lineHeight: 1.15,
                    textTransform: "uppercase",
                    color: "#1e2111",
                  }}
                >
                  PATHS AWAIT
                </div>
                <div
                  style={{
                    fontFamily:
                      "'Petrona', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "max(13px, 2.55cqw)",
                    fontWeight: 300,
                    lineHeight: 1.2,
                    color: "#474737",
                  }}
                >
                  Choose your path into the turn.
                </div>
              </div>
            </div>
            <svg
              width="30"
              height="16"
              viewBox="0 0 36 20"
              fill="none"
              stroke="#27291b"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mr-1"
              aria-hidden="true"
            >
              <path d="M2 10H33M25 3L33 10L25 17" />
            </svg>
          </button>

          {/* 12. Path Row 2: II • INTO THE FERNWOOD */}
          <button
            type="button"
            onClick={() =>
              handleSelectChoice(
                1,
                sheet1Encounter.choices[1] || sheet1Encounter.choices[0]
              )
            }
            className="r-path-row-2 archival-row flex items-center justify-between border-b border-[#2b2e20] text-left text-[#1e2111] hover:bg-[#e8dec8]/45"
            data-region="path-row-2"
          >
            <div className="flex items-center gap-[2.2cqw]">
              {/* Shaded Five-Leaf Botanical Sprig Engraving SVG */}
              <svg
                width="38"
                height="38"
                viewBox="0 0 42 42"
                fill="none"
                className="shrink-0 ml-1"
                aria-hidden="true"
              >
                <path
                  d="M10 35C15 26 21 17 31 8"
                  stroke="#27291b"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M15 27C10 25 8 20 11 16C15 17 17 22 15 27Z"
                  fill="#27291b"
                  fillOpacity="0.26"
                  stroke="#27291b"
                  strokeWidth="1.3"
                />
                <path
                  d="M21 19C17 16 16 11 19 8C23 9 23 14 21 19Z"
                  fill="#27291b"
                  fillOpacity="0.26"
                  stroke="#27291b"
                  strokeWidth="1.3"
                />
                <path
                  d="M18 29C23 28 28 30 27 34C23 35 19 32 18 29Z"
                  fill="#27291b"
                  fillOpacity="0.26"
                  stroke="#27291b"
                  strokeWidth="1.3"
                />
                <path
                  d="M24 21C29 20 34 22 33 26C29 27 25 24 24 21Z"
                  fill="#27291b"
                  fillOpacity="0.26"
                  stroke="#27291b"
                  strokeWidth="1.3"
                />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily:
                      "'Petrona', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "max(14px, 3.05cqw)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    lineHeight: 1.15,
                    textTransform: "uppercase",
                    color: "#1e2111",
                  }}
                >
                  II • INTO THE FERNWOOD
                </div>
                <div
                  style={{
                    fontFamily:
                      "'Petrona', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "max(13px, 2.55cqw)",
                    fontWeight: 300,
                    lineHeight: 1.2,
                    color: "#474737",
                  }}
                >
                  Seek the fern-flower where the old paths cross.
                </div>
              </div>
            </div>
            <svg
              width="30"
              height="16"
              viewBox="0 0 36 20"
              fill="none"
              stroke="#27291b"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mr-1"
              aria-hidden="true"
            >
              <path d="M2 10H33M25 3L33 10L25 17" />
            </svg>
          </button>

          {/* 13. Swipe Footer */}
          <button
            type="button"
            onClick={() => scrollToTurn(2)}
            className="r-swipe-footer flex items-center justify-center gap-3 text-[#2b3020] cursor-pointer"
            data-region="swipe-footer"
          >
            <span className="h-[1px] flex-1 bg-[#4a4b3c]/75" />
            <span className="text-[1.9cqw] leading-none text-[#4a4b3c]">◇</span>
            <p
              style={{
                fontFamily: "'Petrona', 'Cormorant Garamond', Georgia, serif",
                fontSize: "max(13px, 2.5cqw)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              Swipe down for Chapter II
            </p>
            <span className="text-[1.9cqw] leading-none text-[#4a4b3c]">◇</span>
            <span className="h-[1px] flex-1 bg-[#4a4b3c]/75" />
          </button>
        </main>
      </section>

      {/* =====================================================================
          SUBSEQUENT VERTICAL REEL SHEETS (CHAPTER II, III, ...)
         ===================================================================== */}
      {chapters.slice(1).map((chapter) => {
        const sheetNum = String(chapter.turnNumber).padStart(2, "0");
        const romanTurn = toRoman(chapter.turnNumber);
        const prevChapter = chapters.find(
          (c) => c.turnNumber === chapter.turnNumber - 1
        );
        const activeHeading =
          prevChapter?.selectedChoice?.compassDirection ||
          "North-East along the Fernwood Trail";
        const activePrompt =
          prevChapter?.selectedChoice?.pathPrompt ||
          "Walk along the path and photograph the next living tree, leaf, or wild flora before you.";

        const enc = chapter.encounter;
        const activeItem = enc
          ? chapter.useSubstitute
            ? enc.forageQuest.substituteItem
            : enc.forageQuest.primaryItem
          : null;
        const isCollected =
          enc &&
          inventory.some(
            (i) =>
              i.id === enc.forageQuest.primaryItem.id ||
              i.id === enc.forageQuest.substituteItem.id
          );

        return (
          <section
            key={chapter.turnNumber}
            data-turn-slide={chapter.turnNumber}
            className="snap-start min-h-dvh w-full flex items-center justify-center bg-[#f1e8d7] px-4 py-4"
            style={{
              backgroundImage: "url('/assets/plates/paper-texture.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px",
            }}
          >
            <div className="w-full max-w-[560px] min-h-[94dvh] flex flex-col justify-between text-[#18221b]">
              {/* Top Archival Header Bar */}
              <header className="flex items-center justify-between border-t border-b border-[#3b3c2e] py-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[#5c5848]">
                  Mythos Flora
                </span>
                <span className="text-sm uppercase tracking-[0.08em] text-[#1d2111] font-normal">
                  CHAPTER {romanTurn}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="archival-press rounded-full border-solid border-[#1a1c12] bg-[#efe9d8] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#1a1c12] hover:bg-[#e5dcc6]"
                  style={{ borderWidth: "1.5px" }}
                >
                  SATCHEL ({inventory.length})
                </button>
              </header>

              {/* STATE A: UNMOUNTED VOUCHER / CAMERA CAPTURE */}
              {chapter.status === "capture" && !(isCompressing && activeTargetTurn === chapter.turnNumber) && (
                <div className="my-auto py-3 space-y-4">
                  {prevChapter?.selectedChoice && (
                    <article className="story-passage story-passage--consequence" key={prevChapter.selectedChoice.id}>
                      <h2>{prevChapter.selectedChoice.label}</h2>
                      <p>{prevChapter.selectedChoice.outcomeText}</p>
                      <blockquote><p>{activePrompt}</p><cite>The Spirit of the Wood</cite></blockquote>
                    </article>
                  )}
                  {/* Taped Empty Herbarium Mounting Frame */}
                  <div className="relative border border-[#3b3c2e] bg-[#ebe1cd] p-5 shadow-sm">
                    <span className="pointer-events-none absolute -top-2 -left-2 h-4 w-12 -rotate-45 bg-[#dfd3ba] border border-[#b5a88e]" />
                    <span className="pointer-events-none absolute -top-2 -right-2 h-4 w-12 rotate-45 bg-[#dfd3ba] border border-[#b5a88e]" />
                    <span className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-12 rotate-45 bg-[#dfd3ba] border border-[#b5a88e]" />
                    <span className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-12 -rotate-45 bg-[#dfd3ba] border border-[#b5a88e]" />

                    <div className="border border-dashed border-[#3b3c2e]/70 px-4 py-6 text-center space-y-3">
                      <h2
                        className="text-3xl font-semibold text-[#16190d] leading-tight"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                        }}
                      >
                        What stirs along your path?
                      </h2>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#474737]">
                        Heading: {activeHeading}
                      </p>
                      <p className="text-sm text-[#2b3020] leading-relaxed max-w-xs mx-auto">
                        {activePrompt}
                      </p>

                      <div className="pt-1 max-w-xs mx-auto">
                        <input
                          type="text"
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          placeholder="Optional field note (e.g., 'By the old stone wall')..."
                          className="w-full rounded-[4px] border border-[#3b3c2e] bg-[#f7f2e4] px-3 py-2 text-xs text-[#18221b] placeholder:text-[#5c5848]"
                        />
                      </div>

                      {captureError && (
                        <p className="text-xs text-[#8b382c] font-medium">
                          {captureError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4-Sided Enclosed Capture Compartment */}
                  <div className="border border-[#2b2e20] bg-[#efe7d5]/55 p-3.5 grid grid-cols-3 gap-3 items-center">
                    <div className="col-span-2 space-y-0.5 border-r border-[#353525]/60 pr-2">
                      <p className="text-sm font-medium text-[#1e2111]">
                        Commune with the Wood
                      </p>
                      <p className="text-xs text-[#474737]">
                        Offer a photograph of a plant to learn its name and the tales it carries.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => {
                        setActiveTargetTurn(chapter.turnNumber);
                        cameraInputRef.current?.click();
                      }}
                      className="archival-press rounded-[4px] bg-[#904035] p-[3px] text-[#f6e6d9] hover:bg-[#7e3125] disabled:opacity-50"
                    >
                      <span className="flex h-full w-full items-center justify-center rounded-[3px] border border-[#cc8f80] py-2.5 px-2 text-center text-sm font-semibold leading-tight">
                        {isCompressing ? "Calling the spirit…" : "Photograph a Plant"}
                      </span>
                    </button>
                  </div>

                  {/* Secondary Upload & Lorekeeper Rows */}
                  <div className="divide-y divide-[#2b2e20] border-b border-[#2b2e20]">
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => {
                        setActiveTargetTurn(chapter.turnNumber);
                        uploadInputRef.current?.click();
                      }}
                      className="archival-row w-full py-3 flex items-center justify-between text-left text-[#1e2111] hover:bg-[#e8dec8]/45"
                    >
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wider">
                          OFFER A PHOTOGRAPH
                        </p>
                        <p className="text-xs text-[#474737]">
                          Choose a plant photograph from your collection.
                        </p>
                      </div>
                      <span className="text-sm text-[#27291b]">→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="archival-row w-full py-3 flex items-center justify-between text-left text-[#1e2111] hover:bg-[#e8dec8]/45"
                    >
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wider">
                          OPEN THE LOREKEEPER’S LEDGER
                        </p>
                        <p className="text-xs text-[#474737]">
                          Revisit the plants and old tales gathered along your path.
                        </p>
                      </div>
                      <span className="text-sm text-[#27291b]">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* The same animation spans local preparation and the request. */}
              {(chapter.status === "ritual" || (isCompressing && activeTargetTurn === chapter.turnNumber && chapter.status === "capture")) && (
                <div className="my-auto py-8">
                  <LoreRitualLoader previewImageUrl={chapter.status === "ritual" ? chapter.imageUrl : null} />
                </div>
              )}

              {/* STATE C: COMPLETED ENCOUNTER VOUCHER SHEET */}
              {chapter.status === "encounter" && enc && activeItem && (
                <div className="my-auto py-2 space-y-3">
                  <div className="relative border border-[#3b3c2e] bg-[#ebe1cd] p-2">
                    {chapter.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={chapter.imageUrl}
                        alt={enc.plant.commonName}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-4 right-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#904035] p-2 text-center text-[9px] font-semibold uppercase tracking-wider text-[#f6e6d9] shadow-md border border-[#cc8f80]">
                      {enc.folklore.tradition}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-[#2b2e20] py-2">
                    <h2
                      className="text-2xl font-medium text-[#16190d] truncate pr-2"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {enc.plant.commonName}
                    </h2>
                    <span
                      className="text-base italic text-[#3b3e30] shrink-0 border-l border-[#626453] pl-3"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {enc.plant.scientificName}
                    </span>
                  </div>

                  {enc.needsCloserLook && (
                    <div className="border border-[#904035] bg-[#f6e6d9]/70 p-2.5 text-xs text-[#18221b] flex items-center justify-between gap-2">
                      <span>
                        <strong>The spirit asks:</strong>{" "}
                        {enc.closerLookGuidance}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTargetTurn(chapter.turnNumber);
                          cameraInputRef.current?.click();
                        }}
                        className="shrink-0 rounded-[3px] bg-[#904035] px-2.5 py-1 text-[11px] text-[#f6e6d9]"
                      >
                        Photograph Closer
                      </button>
                    </div>
                  )}

                  <StoryPassage encounter={enc} />

                  {/* 4-Sided Enclosed Physical Forage Box */}
                  <div className="border border-[#2b2e20] bg-[#efe7d5]/55 p-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 border-r border-[#353525]/60 pr-3 flex-1">
                      <p className="text-sm font-medium text-[#1e2111]">
                        Gather a Token: {activeItem.name}
                      </p>
                      <p className="text-xs text-[#474737] line-clamp-2">
                        {activeItem.description}
                      </p>
                      {!isCollected && (
                        <button
                          type="button"
                          onClick={() =>
                            setChapters((prev) =>
                              prev.map((ch) =>
                                ch.turnNumber === chapter.turnNumber
                                  ? {
                                      ...ch,
                                      useSubstitute: !ch.useSubstitute,
                                    }
                                  : ch
                              )
                            )
                          }
                          className="text-[11px] underline text-[#7e3125]"
                        >
                          {chapter.useSubstitute
                            ? `Switch back to ${enc.forageQuest.primaryItem.name}`
                            : "Can't find it nearby? Use spirit substitute"}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCollectItem(chapter.turnNumber)}
                      className="archival-press shrink-0 rounded-[4px] bg-[#904035] p-[3px] text-[#f6e6d9]"
                    >
                      <span className="block rounded-[3px] border border-[#cc8f80] px-3 py-2 text-xs font-semibold leading-tight">
                        {isCollected ? "Collected" : "I Picked Up"}
                      </span>
                    </button>
                  </div>

                  {/* Path Choices */}
                  <div className="divide-y divide-[#2b2e20] border-b border-[#2b2e20]">
                    {enc.choices.map((choice, cIdx) => {
                      const unlocked =
                        !choice.requiredItemId ||
                        inventory.some((i) => i.id === choice.requiredItemId) ||
                        Boolean(isCollected);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={!unlocked}
                          onClick={() =>
                            unlocked &&
                            handleSelectChoice(chapter.turnNumber, choice)
                          }
                          className={`archival-row w-full py-2.5 flex items-center justify-between text-left ${
                            unlocked
                              ? "text-[#1e2111] hover:bg-[#e8dec8]/45"
                              : "text-[#5c5848] opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="pr-2">
                            <p className="text-xs font-medium uppercase tracking-wider">
                              {toRoman(cIdx + 1)} • {choice.label}
                            </p>
                            <p className="text-xs text-[#474737]">
                              {unlocked
                                ? choice.pathPrompt
                                : `Bring this token: ${choice.requiredItemName}`}
                            </p>
                          </div>
                          <span className="text-sm">→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Archival Swipe Rule */}
              <footer className="flex items-center justify-center gap-3 pt-2 text-[#2b3020]">
                <span className="h-[1px] flex-1 bg-[#4a4b3c]/75" />
                <span className="text-xs text-[#4a4b3c]">◇</span>
                <button
                  type="button"
                  onClick={() => scrollToTurn(1)}
                  className="text-xs tracking-wide hover:underline"
                >
                  Return to Chapter I
                </button>
                <span className="text-xs text-[#4a4b3c]">◇</span>
                <span className="h-[1px] flex-1 bg-[#4a4b3c]/75" />
              </footer>
            </div>
          </section>
        );
      })}

      {/* Slide-out Herbarium Satchel, Voucher Compendium & Lorekeeper Drawer */}
      <InventoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        inventory={inventory}
        compendium={compendium}
        onResetJourney={handleResetJourney}
        currentEncounter={
          chapters.find((c) => c.turnNumber === activeTargetTurn)?.encounter ||
          sheet1Encounter
        }
        onTriggerPreset={async (archetype, note) => {
          const sampleUrl = await createBotanicalSampleImage(archetype);
          const targetTurn =
            chapters.find((c) => c.status === "capture")?.turnNumber || 2;
          scrollToTurn(targetTurn);
          await handlePhotoCapturedForTurn(targetTurn, sampleUrl, note);
        }}
        onOverrideSpecies={(speciesNote) => {
          const targetChapter = chapters[0];
          if (targetChapter.imageUrl) {
            handlePhotoCapturedForTurn(1, targetChapter.imageUrl, speciesNote);
          }
        }}
      />
    </div>
  );
}

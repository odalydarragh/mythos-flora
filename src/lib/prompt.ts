import { BioClipCandidate, EncounterResponse, InventoryItem } from "@/types/game";

export interface PromptContext {
  turnNumber: number;
  inventory: InventoryItem[];
  previousChoiceLabel?: string;
  previousDirection?: string;
  previousStory?: string;
  previousOutcome?: string;
  customObservation?: string;
  bioClipCandidates?: BioClipCandidate[];
}

export function buildSystemPrompt(): string {
  return `You are the Ancient Spirit of the Wood, an unseen mythological storyteller and rigorous field botanist embedded in nature for the real-world outdoor RPG "Mythos Flora".
The player is walking outdoors and taking photographs of paths, trees, leaves, bark, moss, or wild flora.

STORY IS THE PRIMARY EXPERIENCE:
Continue one unfolding quest, not a succession of unrelated plant descriptions. Use the previous story and chosen outcome as continuity: preserve the spirit’s identity, unresolved mystery, and consequences. Open each chapter with a concrete sensory event tied to something visible in the photograph. Give the player a small stake, a discovery, and an unresolved invitation. Avoid repetitive greetings and generic enchanted-forest exposition. The two choices must express different intentions with distinct consequences, not merely different compass directions. Keep the narrative to 90–130 words and the spirit invitation to one short sentence. Reference a carried token when it matters, without inventing possessions. Weave folklore into the fiction while keeping the separately attributed folklore field factual. Physical directions must remain on visible, accessible paths; fictional lights and voices are story events, not claims about the real surroundings.

PLAYER-FACING VOICE:
Speak as a gentle woodland spirit in a grounded fantasy RPG. Use vivid, concise language about paths, offerings, satchels, and old tales. Never mention uploads, processing, models, classifiers, or telemetry in player-facing fields. Keep instructions actionable and botanical names, observable traits, uncertainty, and cultural attribution accurate. Distinguish recorded folklore from invented quest events; fantasy must never imply certainty about a plant identification.

CRITICAL BOTANICAL ACCURACY & HUMILITY RULES:
1. ANALYZE MORPHOLOGY BEFORE NAMING:
   Always examine and describe the exact visible morphological traits FIRST (leaf arrangement: opposite vs. alternate; simple vs. compound pinnate/palmate; exact leaflet count; whether leaflets are sessile/unstalked vs. stalked; rachis color and groove; margin serration; stem/bud/bark traits) BEFORE deciding on a species name.

2. KEY WOODLAND LOOKALIKE DISTINCTIONS (DO NOT CONFUSE THESE):
   - EUROPEAN ASH (Fraxinus excelsior, Ogham: Nion ᚛ᚅ᚜) vs. ELDER (Sambucus nigra, Ogham: Ruis ᚛ᚏ᚜):
     * ASH (Fraxinus excelsior) has 7 to 13 (commonly 9 or 11, i.e., 4+ opposite lateral pairs plus 1 terminal leaflet) SESSILE (unstalked) ovate-lanceolate leaflets attached directly to a grooved central rachis that often has dark purplish-brown nodes/stems on saplings, with fine regular serrations and jet-black dormant buds.
     * ELDER (Sambucus nigra) has only 5 (rarely 7) DISTINCTLY STALKED (petiolulate) broader leaflets on pale pithy stems covered in raised corky lenticels.
     * NEVER call a pinnate leaf with 9+ sessile leaflets and purplish-brown rachis nodes "Sambucus nigra"! That is Ash (Fraxinus excelsior).
   - ROWAN / MOUNTAIN ASH (Sorbus aucuparia, Ogham: Luis ᚛ᚂ᚜): 9 to 15 smaller oblong, sharply toothed sessile leaflets, alternate leaf arrangement on the branch (whereas Ash has opposite leaves).

3. SEPARATE IDENTIFICATION UNCERTAINTY FROM IMAGE USABILITY:
   - Set "needsCloserLook": true ONLY when blur, darkness, obstruction, or an unrecognizable subject prevents a useful description of the scene. Give one specific optional retake instruction, and still offer a path that continues the story.
   - A clear landscape, distant woodland, leaf, or fern is a valid encounter. Set "needsCloserLook": false even if exact species identification is uncertain. Use a supported broad name (e.g. "Fern", "Woodland trees") or a tentative species name, retain medium/low confidence, and list missing traits without requesting another photo.
   - Never require 100% species certainty to continue the adventure. Missing buds, flowers, or bark alone are NOT reasons to request a retake.
   - Do not invent a Latin name or attach species-specific folklore to an unidentified plant. Use applicable landscape folklore with accurate attribution instead.
   - Treat player notes as observations, not proof of a species. Keep conflicting visual evidence and uncertainty explicit.

Your task is to analyze the player's photo and return a SINGLE, strictly valid JSON object (no markdown fences, no commentary outside JSON).`;
}

export function buildUserPrompt(ctx: PromptContext): string {
  const inventorySummary =
    ctx.inventory.length > 0
      ? ctx.inventory
          .map((item) => `- id: "${item.id}", name: "${item.name}" (from ${item.originPlant})`)
          .join("\n")
      : "- Empty bag (no items collected yet)";

  const bioClipBlock =
    ctx.bioClipCandidates && ctx.bioClipCandidates.length > 0
      ? `\nSPECIALIZED PLANT CLASSIFIER TELEMETRY (BioCLIP 2.5 Mobile FastViT, 4,271 iNaturalist plant species):
${ctx.bioClipCandidates
  .map(
    (c, i) =>
      `  ${i + 1}. ${c.scientificName}${c.commonName ? ` (${c.commonName})` : ""} — cosine similarity: ${c.similarity.toFixed(4)}`
  )
  .join("\n")}
(NOTE: These candidates are supporting evidence, not proof. For a clear landscape, ignore species rankings and build an encounter from the visible scene without requesting a closer image. For a recognizable plant with uncertain species, use a cautious broad or tentative name and continue the story. Only an unusable image warrants needsCloserLook: true.)\n`
      : "";

  return `PLAYER CONTEXT:
- Turn Number: ${ctx.turnNumber}
- Previous Action: ${ctx.previousChoiceLabel || "Stepped onto the trail for the first time"}
- Previous Heading: ${ctx.previousDirection || "Trailhead"}
- Previous chapter (continuity): ${ctx.previousStory?.slice(0, 2000) || "The journey begins"}
- Consequence of the chosen path: ${ctx.previousOutcome?.slice(0, 1000) || "No choice yet"}
${ctx.customObservation ? `- Player Field Note (IMPORTANT - use this): ${ctx.customObservation}` : ""}
- Current Physical Inventory in Bag:
${inventorySummary}
${bioClipBlock}
STEP-BY-STEP INSTRUCTIONS:
1. First, fill out "plant.visualTraits" by counting leaflets/lobes, checking opposite vs. alternate arrangement, sessile vs. stalked attachment, and stem/rachis color. (Remember: 9 sessile leaflets on a purplish-brown grooved rachis = European Ash / Fraxinus excelsior, NOT Sambucus nigra!).
2. Fill out "plant.missingDiagnosticTraits" and "plant.possibleSpecies" honestly. Set "needsCloserLook" according to image usability, NOT species certainty. A readable scene with uncertain species continues the story with a cautious label and "closerLookGuidance": null.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "sceneDescription": "1-sentence accurate description of what is visible in the photo",
  "plant": {
    "visualTraits": "FIRST: Count leaflets/lobes, check sessile vs stalked attachment, opposite vs alternate arrangement, and stem/rachis color.",
    "missingDiagnosticTraits": "What closer feature (e.g. terminal buds, bark texture, flower/fruit, or closer leaf shot) would help refine the identification, or null if none needed. This does not require a retake.",
    "possibleSpecies": [
      "Primary candidate Common Name (Scientific Name)",
      "Second candidate if any ambiguity exists"
    ],
    "confidence": "high | medium | low",
    "commonName": "Exact species name (e.g. European Ash) if clear; or 'Possible European Ash' if medium confidence; or 'Woodland Trees' if distant path",
    "scientificName": "Latin binomial name (e.g. Fraxinus excelsior) or 'Species indistinct at this distance'",
    "oghamName": "Celtic Ogham name & rune symbol, e.g. Nion (᚛ᚅ᚜) for Ash, Duir (᚛ᚇ᚜) for Oak, Fearn (᚛ᚃ᚜) for Fern/Alder, Huath (᚛ᚆ᚜) for Hawthorn"
  },
  "needsCloserLook": false,
  "closerLookGuidance": "Only for an unusable image: one optional, specific retake instruction. Otherwise null.",
  "folklore": {
    "tradition": "World Folklore & Ethnobotany (e.g. Slavic Midsummer Lore, Norse & Baltic Lore, Japanese Hanakotoba, Mediterranean Myth, Indigenous or Gaelic Lore)",
    "title": "Short folklore title",
    "loreText": "2-3 sentences of authentic global mythology and folklore about the identified plant from the cultural tradition that resonates most richly with the species."
  },
  "story": {
    "title": "Atmospheric chapter title",
    "narrative": "3-4 sentences of immersive second-person RPG narrative weaving the real plant/path in the photo into an encounter with the woodland spirit.",
    "spiritPrompt": "A whispered question or invitation from the forest spirit."
  },
  "forageQuest": {
    "ritualPrompt": "Instruction to physically forage a fallen item nearby as part of the ritual.",
    "primaryItem": {
      "id": "kebab-case-item-id",
      "name": "Fallen Leaf / Ash Key / Twig / Waystone Name",
      "description": "Mythic & physical description of the item",
      "symbol": "leaf",
      "originPlant": "Origin plant name"
    },
    "substituteItem": {
      "id": "kebab-case-substitute-id",
      "name": "Accessible Substitute (e.g. Weather-Worn Pebble, Fallen Twig, Blade of Grass)",
      "description": "Why the forest spirit accepts this substitute token",
      "symbol": "sparkles",
      "originPlant": "Woodland Floor"
    }
  },
  "choices": [
    {
      "id": "choice-ritual",
      "label": "Action offering the foraged item or an existing inventory item",
      "outcomeText": "2 sentences describing the magical outcome of completing the ritual.",
      "requiredItemId": "MUST match either forageQuest.primaryItem.id or an existing inventory item id",
      "requiredItemName": "MUST match the corresponding item name",
      "compassDirection": "e.g. North-West along the shaded trail",
      "pathPrompt": "Specific instruction for where to walk next and what to photograph on the next turn."
    },
    {
      "id": "choice-wander",
      "label": "Alternative cautious action that requires no item",
      "outcomeText": "2 sentences describing how the path shifts as you proceed.",
      "requiredItemId": null,
      "requiredItemName": null,
      "compassDirection": "e.g. Along the sunlit verge of the path",
      "pathPrompt": "Specific instruction for where to walk next and what plant or tree to photograph."
    }
  ]
}`;
}

/**
 * Extracts and repairs JSON from open-weight vision model outputs, which may
 * occasionally include markdown code fences or leading prose.
 */
export function parseEncounterJson(
  rawText: string,
  inventory: InventoryItem[]
): EncounterResponse {
  let cleaned = rawText.trim();

  // Strip ```json ... ``` fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  } else {
    // Find first '{' and last '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  const parsed = JSON.parse(cleaned) as Partial<EncounterResponse>;

  const primaryItem: InventoryItem = {
    id: parsed.forageQuest?.primaryItem?.id || "fallen-trail-leaf",
    name: parsed.forageQuest?.primaryItem?.name || "Fallen Woodland Leaf",
    description:
      parsed.forageQuest?.primaryItem?.description ||
      "A veined leaf gathered from the edge of the path.",
    symbol: parsed.forageQuest?.primaryItem?.symbol || "leaf",
    originPlant:
      parsed.forageQuest?.primaryItem?.originPlant ||
      parsed.plant?.commonName ||
      "Woodland Trail",
  };

  const substituteItem: InventoryItem = {
    id: parsed.forageQuest?.substituteItem?.id || "mossy-waystone",
    name: parsed.forageQuest?.substituteItem?.name || "Weather-Worn Pebble",
    description:
      parsed.forageQuest?.substituteItem?.description ||
      "A humble stone from the path, accepted by the earth spirit when foliage is scarce.",
    symbol: parsed.forageQuest?.substituteItem?.symbol || "sparkles",
    originPlant:
      parsed.forageQuest?.substituteItem?.originPlant || "The Ancient Path",
  };

  const validItemIds = new Set<string>([
    primaryItem.id,
    substituteItem.id,
    ...inventory.map((i) => i.id),
  ]);

  // Support both top-level choices and nested story.choices
  const storyAny = parsed.story as Record<string, unknown> | undefined;
  const candidateChoices = Array.isArray(parsed.choices)
    ? parsed.choices
    : Array.isArray(storyAny?.choices)
    ? (storyAny?.choices as EncounterResponse["choices"])
    : [];

  const rawChoices = candidateChoices.length > 0 ? candidateChoices : [];

  const choices =
    rawChoices.length >= 2
      ? rawChoices.map((c, idx) => {
          if (idx === 0) {
            const reqId =
              c.requiredItemId && validItemIds.has(c.requiredItemId)
                ? c.requiredItemId
                : primaryItem.id;
            const reqName =
              c.requiredItemId && validItemIds.has(c.requiredItemId)
                ? c.requiredItemName || primaryItem.name
                : primaryItem.name;
            return {
              id: c.id || `choice-${idx}`,
              label: c.label || `Offer the ${reqName} to the spirit of the path`,
              outcomeText:
                c.outcomeText ||
                "The leaves rustle in approval as the unseen guardian parts the brambles ahead.",
              requiredItemId: reqId,
              requiredItemName: reqName,
              compassDirection:
                c.compassDirection || "Forward toward the bordering trees",
              pathPrompt:
                c.pathPrompt ||
                "Step up to one of the trees along the path and snap a close-up photo of its leaf or bark.",
            };
          }
          return {
            id: c.id || `choice-${idx}`,
            label: c.label || "Step quietly along the earthen verge and look closer",
            outcomeText:
              c.outcomeText ||
              "You tread softly along the trail edge, drawing nearer to the living foliage.",
            requiredItemId: null,
            requiredItemName: null,
            compassDirection: c.compassDirection || "Follow the winding trail ahead",
            pathPrompt:
              c.pathPrompt ||
              "Walk up to a single plant or tree trunk beside the path and take a close-up picture.",
          };
        })
      : [
          {
            id: "choice-ritual",
            label: `Raise the ${primaryItem.name} toward the canopy`,
            outcomeText:
              "A warm breeze stirs the branches, inviting you closer to read the bark and leaves.",
            requiredItemId: primaryItem.id,
            requiredItemName: primaryItem.name,
            compassDirection: "Toward the nearest tree trunk on the trail edge",
            pathPrompt:
              "Walk up to the nearest tree or shrub and snap a close-up photo of its leaves or bark.",
          },
          {
            id: "choice-wander",
            label: "Approach the trailside foliage for a closer look",
            outcomeText:
              "The mycelial network hums beneath your boots as you step closer to the greenery.",
            requiredItemId: null,
            requiredItemName: null,
            compassDirection: "Along the shaded footpath",
            pathPrompt:
              "Move within arm's reach of a plant or tree and photograph a single leaf or stem.",
          },
        ];

  const plantAny = parsed.plant as Record<string, unknown> | undefined;
  const possibleSpecies = Array.isArray(plantAny?.possibleSpecies)
    ? (plantAny.possibleSpecies as string[]).filter((s) => typeof s === "string")
    : [];
  const missingDiagnosticTraits =
    typeof plantAny?.missingDiagnosticTraits === "string"
      ? plantAny.missingDiagnosticTraits
      : null;

  const needsCloserLook =
    typeof parsed.needsCloserLook === "boolean"
      ? parsed.needsCloserLook
      : false;

  const folkloreIsString = typeof parsed.folklore === "string";
  const forageAny = parsed.forageQuest as Record<string, unknown> | undefined;

  return {
    needsCloserLook,
    closerLookGuidance:
      needsCloserLook
        ? parsed.closerLookGuidance || "The scene is difficult to make out. You can try a clearer photograph in better light, or follow the path onward."
        : null,
    sceneDescription:
      parsed.sceneDescription ||
      "A winding woodland path bordered by tall trees and undergrowth.",
    plant: {
      commonName:
        parsed.plant?.commonName ||
        (needsCloserLook
          ? "Unidentified Woodland Flora (Closer Look Needed)"
          : "Woodland Flora"),
      scientificName:
        parsed.plant?.scientificName ||
        (needsCloserLook
          ? "Species indistinct at this distance"
          : "Species not identified"),
      confidence: parsed.plant?.confidence || (needsCloserLook ? "low" : "medium"),
      visualTraits:
        parsed.plant?.visualTraits ||
        "Tall canopy trees and trailside undergrowth visible at a distance; close-up leaf venation, buds, or bark texture needed for exact species ID.",
      oghamName: parsed.plant?.oghamName || "Fidrad (᚛ᚃ᚜) — The Living Wood",
      possibleSpecies,
      missingDiagnosticTraits,
    },
    folklore: {
      tradition:
        (!folkloreIsString && parsed.folklore?.tradition) ||
        "World Botanical & Woodland Folklore",
      title:
        (!folkloreIsString && parsed.folklore?.title) ||
        "The Threshold of the Living Wood",
      loreText: folkloreIsString
        ? (parsed.folklore as unknown as string)
        : parsed.folklore?.loreText ||
          "Across world folklore—from Slavic Kupala Night fern-fire to Norse world-trees and ancient herbalist codices—every wild plant holds a distinct counsel revealed when a traveler approaches close enough to read its leaf and bark.",
    },
    story: {
      title: parsed.story?.title || "The Winding Forest Path",
      narrative:
        parsed.story?.narrative ||
        "The earthen path curves ahead into a tunnel of green shadow and filtered sunlight. Dozens of trunks and leafy boughs stand watch on either side, yet from the middle of the trail their exact names remain veiled in the shifting light.",
      spiritPrompt:
        parsed.story?.spiritPrompt ||
        "\"Step closer to a single bough or leaf, traveler, that I may read its veins—or gather a token from the path to walk onward.\"",
    },
    forageQuest: {
      ritualPrompt:
        parsed.forageQuest?.ritualPrompt ||
        (typeof forageAny?.prompt === "string" ? forageAny.prompt : "") ||
        `Look at the ground near your feet and pick up a ${primaryItem.name} to attune with the path.`,
      primaryItem,
      substituteItem,
    },
    choices,
  };
}

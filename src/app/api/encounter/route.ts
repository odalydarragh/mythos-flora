import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseEncounterJson,
} from "@/lib/prompt";
import { classifyPlantWithBioClip } from "@/lib/plant-classifier";
import { EncounterResponse, InventoryItem } from "@/types/game";

export const runtime = "nodejs";
export const maxDuration = 60;

interface EncounterRequestBody {
  imageDataUrl: string;
  turnNumber?: number;
  inventory?: InventoryItem[];
  previousChoiceLabel?: string;
  previousDirection?: string;
  customObservation?: string;
}

// Primary open-weight Llama vision model hosted on DigitalOcean Serverless Inference
const DEFAULT_MODEL = "llama-4-maverick";
const FALLBACK_VISION_MODELS = [
  "llama-4-maverick",
  "meta-llama/Llama-3.2-11B-Vision-Instruct",
];
const DEFAULT_BASE_URL = "https://inference.do-ai.run/v1";

/**
 * Honest fallback when inference is unreachable or unconfigured:
 * never fabricates a specific species like Pedunculate Oak, and instead asks
 * the player for a closer look while keeping the game loop playable.
 */
function buildFallbackEncounter(
  inventory: InventoryItem[],
  reason: string
): EncounterResponse {
  return {
    needsCloserLook: true,
    closerLookGuidance:
      "I can see the path ahead, but the trees and undergrowth are too distant to read their leaves or bark with certainty. Step right up to a single leaf, fern frond, or tree trunk and snap a closer picture so I can identify the exact species!",
    sceneDescription:
      "A winding woodland path bordered by tall trees and lush trailside greenery.",
    plant: {
      commonName: "Unidentified Woodland Flora (Closer Look Needed)",
      scientificName: "Species indistinct at this distance",
      confidence: "low",
      visualTraits:
        "Canopy foliage and tree trunks visible along the trail, but individual leaf margins, venation, and bark fissures require a close-up shot to confirm the species.",
      oghamName: "Fidrad (᚛ᚃ᚜) — The Living Wood",
    },
    folklore: {
      tradition: "World Botanical & Woodland Folklore",
      title: "The Unwritten Herbarium Sheet",
      loreText:
        "Across world traditions—from Carpathian midsummer lore to Nordic sacred groves and Mediterranean herbal manuscripts—the forest reveals its myth only when a walker steps close enough to press a single leaf into memory.",
    },
    story: {
      title: "Veiled Boughs Along the Trail",
      narrative:
        "You stand upon an earthen path winding deeper into the green canopy. Around you, tall trunks and shimmering leaves rustle in the breeze, their true names hidden by distance. The Spirit of the Wood stirs beside your shoulder, peering toward the foliage at the edge of the trail.",
      spiritPrompt:
        "\"My eyes see the road before us, wanderer, yet the trees keep their counsel from afar. Will you step closer and show me a single leaf or bark up close, or gather a token from the path before walking on?\"",
    },
    forageQuest: {
      ritualPrompt:
        "While you approach the trees for a closer look, pick up a Fallen Trail Leaf or small twig from the path edge to carry in your satchel.",
      primaryItem: {
        id: "fallen-trail-leaf",
        name: "Fallen Trail Leaf",
        description:
          "A leaf resting beside the footpath, waiting to be examined up close.",
        symbol: "leaf",
        originPlant: "Woodland Trail",
      },
      substituteItem: {
        id: "weather-worn-pebble",
        name: "Weather-Worn Path Pebble",
        description:
          "A smooth stone from the earthen trail, accepted by the spirit of the path.",
        symbol: "sparkles",
        originPlant: "Forest Path",
      },
    },
    choices: [
      {
        id: "choice-closer-ritual",
        label:
          inventory.length > 0
            ? `Hold your ${inventory[0].name} and step up to a single tree for a closer look`
            : "Tuck the Fallen Trail Leaf into your satchel and approach a tree trunk",
        outcomeText:
          "With a token of the trail in hand, the woodland spirit guides your eyes toward the nearest low-hanging leaves and textured bark.",
        requiredItemId:
          inventory.length > 0 ? inventory[0].id : "fallen-trail-leaf",
        requiredItemName:
          inventory.length > 0 ? inventory[0].name : "Fallen Trail Leaf",
        compassDirection: "Toward the nearest tree or plant on the path edge",
        pathPrompt:
          "Walk right up to a single tree trunk, shrub, or ground plant beside the trail and take a close-up photo of its leaves or bark.",
      },
      {
        id: "choice-walk-closer",
        label: "Step off the center of the path to inspect a leaf up close",
        outcomeText:
          "You move toward the verdant edge of the trail where individual leaves and stems come into sharp focus.",
        requiredItemId: null,
        requiredItemName: null,
        compassDirection: "Along the leafy verge of the trail",
        pathPrompt:
          "Get within 1-2 feet of a leaf, fern, or bark surface and snap a clear close-up photo.",
      },
    ],
    modelUsed: `${DEFAULT_MODEL} (${reason})`,
  };
}

async function callDigitalOceanVision(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageDataUrl: string
) {
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 950,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
    }),
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await req.json()) as EncounterRequestBody;
    const {
      imageDataUrl,
      turnNumber = 1,
      inventory = [],
      previousChoiceLabel,
      previousDirection,
      customObservation,
    } = body;

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "A valid base64 data:image URL is required." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.DO_INFERENCE_API_KEY ||
      process.env.GRADIENT_MODEL_ACCESS_KEY ||
      process.env.OPENAI_API_KEY;
    const baseUrl = (
      process.env.DO_INFERENCE_BASE_URL || DEFAULT_BASE_URL
    ).replace(/\/+$/, "");

    // Map legacy model slug to DigitalOcean's active open-weight Llama vision model slug
    const configuredModel = process.env.DO_INFERENCE_MODEL || DEFAULT_MODEL;
    const primaryModel =
      configuredModel === "meta-llama/Llama-3.2-11B-Vision-Instruct"
        ? DEFAULT_MODEL
        : configuredModel;

    // Stage 1: Specialized Open-Weight Plant Classifier (BioCLIP 2.5 Mobile FastViT, 4,271 species)
    const bioClipCandidates = await classifyPlantWithBioClip(imageDataUrl, 5);

    if (!apiKey || apiKey === "your_digitalocean_model_access_key_here") {
      const fallback = buildFallbackEncounter(
        inventory,
        "Demo Fallback - Set DO_INFERENCE_API_KEY"
      );
      fallback.plant.bioClipCandidates = bioClipCandidates;
      fallback.latencyMs = Date.now() - startTime;
      return NextResponse.json(fallback);
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      turnNumber,
      inventory,
      previousChoiceLabel,
      previousDirection,
      customObservation,
      bioClipCandidates,
    });

    const candidateModels = Array.from(
      new Set([primaryModel, ...FALLBACK_VISION_MODELS])
    );

    let response: Response | null = null;
    let activeModel = primaryModel;
    let lastErrorText = "";

    for (const candidate of candidateModels) {
      activeModel = candidate;
      response = await callDigitalOceanVision(
        baseUrl,
        apiKey,
        candidate,
        systemPrompt,
        userPrompt,
        imageDataUrl
      );

      if (response.ok) {
        break;
      }

      lastErrorText = await response.text().catch(() => "Unknown API error");
      console.warn(
        `[Mythos Flora] Model '${candidate}' returned ${response.status}: ${lastErrorText}`
      );
    }

    if (!response || !response.ok) {
      console.error(
        `[Mythos Flora] DigitalOcean Serverless Inference failed across candidates:`,
        lastErrorText
      );
      const fallback = buildFallbackEncounter(
        inventory,
        `Resilient Fallback (HTTP ${response?.status || 500})`
      );
      fallback.latencyMs = Date.now() - startTime;
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content || "";

    const encounter = parseEncounterJson(rawContent, inventory);
    encounter.plant.bioClipCandidates = bioClipCandidates;
    encounter.modelUsed = `BioCLIP-2.5 + ${activeModel}`;
    encounter.latencyMs = Date.now() - startTime;

    return NextResponse.json(encounter);
  } catch (error) {
    console.error("[Mythos Flora] Encounter processing error:", error);
    const fallback = buildFallbackEncounter([], "Offline / Resilient Mode");
    fallback.latencyMs = Date.now() - startTime;
    return NextResponse.json(fallback);
  }
}

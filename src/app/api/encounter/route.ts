import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseEncounterJson,
} from "@/lib/prompt";
import { InventoryItem } from "@/types/game";

export const runtime = "nodejs";
export const maxDuration = 180;

interface EncounterRequestBody {
  imageDataUrl: string;
  turnNumber?: number;
  inventory?: InventoryItem[];
  previousChoiceLabel?: string;
  previousDirection?: string;
  previousStory?: string;
  previousOutcome?: string;
  customObservation?: string;
}

// Primary open-weight Llama vision model hosted on DigitalOcean Serverless Inference
const DEFAULT_MODEL = "llama-4-maverick";
const FALLBACK_VISION_MODELS = [
  "llama-4-maverick",
  "meta-llama/Llama-3.2-11B-Vision-Instruct",
];
const DEFAULT_BASE_URL = "https://inference.do-ai.run/v1";

function encounterUnavailable(code: string, status: number) {
  return NextResponse.json({
    code,
    error: "The woodland spirit cannot answer just now. Your photograph is not the problem. Please try again shortly.",
  }, { status });
}

async function callDigitalOceanVision(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageDataUrl: string,
  signal: AbortSignal
) {
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal,
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
  // One budget for all attempts and response-body reads, below Vercel’s limit.
  const signal = AbortSignal.timeout(165_000);

  try {
    const body = (await req.json()) as EncounterRequestBody;
    const {
      imageDataUrl,
      turnNumber = 1,
      inventory = [],
      previousChoiceLabel,
      previousDirection,
      previousStory,
      previousOutcome,
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

    if (!apiKey || apiKey === "your_digitalocean_model_access_key_here") {
      console.error("[Mythos Flora] Missing inference credentials: configure DO_INFERENCE_API_KEY.");
      return encounterUnavailable("INFERENCE_NOT_CONFIGURED", 503);
    }

    // WASM startup/downloads can consume a serverless request before vision runs.
    // Explicitly enable only on deployments provisioned for local classification.
    const useBioClip = process.env.ENABLE_BIOCLIP === "true" ||
      (process.env.ENABLE_BIOCLIP !== "false" && !process.env.VERCEL);
    const bioClipCandidates = useBioClip
      ? await (await import("@/lib/plant-classifier")).classifyPlantWithBioClip(imageDataUrl, 5)
      : [];
    signal.throwIfAborted();
    console.info(`[Mythos Flora] Vision starting after ${Date.now() - startTime}ms; BioCLIP=${useBioClip}`);

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      turnNumber,
      inventory,
      previousChoiceLabel,
      previousDirection,
      previousStory,
      previousOutcome,
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
        imageDataUrl,
        signal
      );

      if (response.ok) {
        break;
      }

      lastErrorText = await response.text().catch(() => "Unknown API error");
      console.warn(
        `[Mythos Flora] Model '${candidate}' returned ${response.status} after ${Date.now() - startTime}ms`
      );
      // Changing models cannot repair credentials, rate limits, or an outage.
      if (![400, 404].includes(response.status)) break;
    }

    if (!response || !response.ok) {
      console.error(
        `[Mythos Flora] DigitalOcean Serverless Inference failed across candidates:`,
        lastErrorText
      );
      return encounterUnavailable("INFERENCE_UNAVAILABLE", 502);
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content || "";

    const encounter = parseEncounterJson(rawContent, inventory);
    encounter.plant.bioClipCandidates = bioClipCandidates;
    encounter.modelUsed = bioClipCandidates.length ? `BioCLIP-2.5 + ${activeModel}` : activeModel;
    encounter.latencyMs = Date.now() - startTime;

    return NextResponse.json(encounter);
  } catch (error) {
    if (signal.aborted) {
      console.warn(`[Mythos Flora] Inference deadline exceeded after ${Date.now() - startTime}ms`);
      return encounterUnavailable("INFERENCE_TIMEOUT", 503);
    }
    console.error("[Mythos Flora] Encounter processing error:", error);
    return encounterUnavailable("ENCOUNTER_FAILED", 502);
  }
}

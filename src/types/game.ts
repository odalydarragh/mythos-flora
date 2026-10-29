export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  symbol: string;
  originPlant: string;
}

export interface EncounterChoice {
  id: string;
  label: string;
  outcomeText: string;
  requiredItemId: string | null;
  requiredItemName: string | null;
  compassDirection: string;
  pathPrompt: string;
}

export interface BioClipCandidate {
  scientificName: string;
  commonName: string | null;
  similarity: number;
}

export interface PlantIdentification {
  commonName: string;
  scientificName: string;
  confidence: "high" | "medium" | "low";
  visualTraits: string;
  oghamName: string;
  possibleSpecies?: string[];
  missingDiagnosticTraits?: string | null;
  bioClipCandidates?: BioClipCandidate[];
}

export interface FolkloreEntry {
  tradition: string;
  title: string;
  loreText: string;
}

export interface StorySegment {
  title: string;
  narrative: string;
  spiritPrompt: string;
}

export interface ForageQuest {
  ritualPrompt: string;
  primaryItem: InventoryItem;
  substituteItem: InventoryItem;
}

export interface EncounterResponse {
  needsCloserLook: boolean;
  closerLookGuidance: string | null;
  sceneDescription: string;
  plant: PlantIdentification;
  folklore: FolkloreEntry;
  story: StorySegment;
  forageQuest: ForageQuest;
  choices: EncounterChoice[];
  modelUsed?: string;
  latencyMs?: number;
}

export interface DiscoveredPlantRecord {
  id: string;
  commonName: string;
  scientificName: string;
  oghamName: string;
  tradition: string;
  folkloreTitle: string;
  loreText: string;
  visualTraits: string;
  thumbnailDataUrl?: string;
  discoveredAt: string;
}

export type GamePhase =
  | "snap" // 1. Take picture of path / plant
  | "ritual" // 2. Lore Ritual (latency masking while Vision model processes)
  | "encounter" // 3. Plant ID, Folklore, Story, Forage Quest, and Gated Choices
  | "direction"; // 4. Bundled Path Direction & Landmark Prompt -> leads back to "snap"

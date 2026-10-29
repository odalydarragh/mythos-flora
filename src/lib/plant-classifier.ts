import fs from "fs";
import path from "path";
import os from "os";
import { pathToFileURL } from "node:url";
import * as ort from "onnxruntime-web";
import sharp from "sharp";
import { BioClipCandidate } from "@/types/game";

interface TaxonLabel {
  scientific: string;
  common: string | null;
}

const HF_MODEL_BASE_URL =
  "https://huggingface.co/crazedcodernate/bioclip-2.5-mobile-fastvit/resolve/main";

const COMMON_NAME_MAP: Record<string, string> = {
  "Fraxinus excelsior": "European Ash",
  "Fraxinus pennsylvanica": "Green Ash",
  "Fraxinus americana": "White Ash",
  "Fraxinus nigra": "Black Ash",
  "Fraxinus ornus": "Manna Ash",
  "Quercus robur": "Pedunculate / English Oak",
  "Quercus petraea": "Sessile / Irish Oak",
  "Quercus rubra": "Northern Red Oak",
  "Quercus alba": "White Oak",
  "Quercus ilex": "Holm Oak",
  "Crataegus monogyna": "Common Hawthorn",
  "Crataegus laevigata": "Midland Hawthorn",
  "Sambucus nigra": "European Elder",
  "Sambucus racemosa": "Red-Berried Elder",
  "Sorbus aucuparia": "Rowan / Mountain Ash",
  "Corylus avellana": "Common Hazel",
  "Betula pendula": "Silver Birch",
  "Betula pubescens": "Downy Birch",
  "Alnus glutinosa": "Common Alder",
  "Ilex aquifolium": "European Holly",
  "Taxus baccata": "English Yew",
  "Salix alba": "White Willow",
  "Salix caprea": "Goat Willow",
  "Fagus sylvatica": "European Beech",
  "Acer pseudoplatanus": "Sycamore Maple",
  "Acer campestre": "Field Maple",
  "Acer platanoides": "Norway Maple",
  "Aesculus hippocastanum": "Horse Chestnut",
  "Castanea sativa": "Sweet Chestnut",
  "Tilia cordata": "Small-Leaved Lime",
  "Ulmus glabra": "Wych Elm",
  "Pinus sylvestris": "Scots Pine",
  "Picea abies": "Norway Spruce",
  "Abies alba": "Silver Fir",
  "Pteridium aquilinum": "Bracken Fern",
  "Dryopteris filix-mas": "Male Fern",
  "Athyrium filix-femina": "Lady Fern",
  "Hedera helix": "Common Ivy",
  "Rubus fruticosus": "Blackberry / Bramble",
  "Urtica dioica": "Stinging Nettle",
  "Taraxacum officinale": "Common Dandelion",
  "Trifolium repens": "White Clover",
  "Trifolium pratense": "Red Clover",
  "Bellis perennis": "Common Daisy",
  "Digitalis purpurea": "Foxglove",
  "Ailanthus altissima": "Tree of Heaven",
  "Koelreuteria paniculata": "Goldenrain Tree",
  "Wisteria sinensis": "Chinese Wisteria",
};

/**
 * Serverless Node (Vercel) cannot spawn ONNX wasm workers reliably, and the
 * default import.meta.url lookup misses the traced .wasm file. Pin a single
 * thread and an absolute file URL under node_modules.
 *
 * The path is built from process.cwd() on purpose. Webpack rewrites
 * createRequire() to undefined in the server bundle.
 */
function configureOnnxRuntime(): void {
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;

  const distDir = path.join(
    process.cwd(),
    "node_modules",
    "onnxruntime-web",
    "dist"
  );
  const wasmFile = path.join(distDir, "ort-wasm-simd-threaded.wasm");
  if (!fs.existsSync(wasmFile)) return;

  const distUrl = pathToFileURL(
    distDir.endsWith(path.sep) ? distDir : distDir + path.sep
  );
  ort.env.wasm.wasmPaths = distUrl.href;
}

let cachedSession: ort.InferenceSession | null = null;
let cachedTable: Float32Array | null = null;
let cachedLabels: TaxonLabel[] | null = null;
let loadingPromise: Promise<{
  session: ort.InferenceSession;
  table: Float32Array;
  labels: TaxonLabel[];
}> | null = null;

function loadNpyFloat32(filePath: string): Float32Array {
  const buf = fs.readFileSync(filePath);
  const headerLen = buf.readUInt16LE(8);
  const dataOffset = 10 + headerLen;
  return new Float32Array(
    buf.buffer,
    buf.byteOffset + dataOffset,
    (buf.length - dataOffset) / 4
  );
}

async function downloadFileIfMissing(url: string, destPath: string): Promise<void> {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`);
  }
  const arrayBuf = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuf));
}

/**
 * Resolves the BioCLIP 2.5 model directory:
 * 1. Uses `./models/bioclip` if present (local dev or pre-built container via `npm run build`).
 * 2. Otherwise downloads from Hugging Face CDN into `/tmp/mythos-bioclip` on cold start
 *    (so serverless / read-only container deployments work out of the box without committing 40MB to Git).
 */
async function resolveModelFiles(): Promise<{
  onnxPath: string;
  tablePath: string;
  labelsPath: string;
}> {
  const localDir = path.join(process.cwd(), "models", "bioclip");
  const localOnnx = path.join(localDir, "flora_student_fp16.onnx");
  const localTable = path.join(localDir, "taxa_table.npy");
  const localLabels = path.join(localDir, "taxa_labels.json");

  if (
    fs.existsSync(localOnnx) &&
    fs.existsSync(localTable) &&
    fs.existsSync(localLabels)
  ) {
    return {
      onnxPath: localOnnx,
      tablePath: localTable,
      labelsPath: localLabels,
    };
  }

  const tmpDir = path.join(os.tmpdir(), "mythos-bioclip");
  const tmpOnnx = path.join(tmpDir, "flora_student_fp16.onnx");
  const tmpTable = path.join(tmpDir, "taxa_table.npy");
  const tmpLabels = path.join(tmpDir, "taxa_labels.json");

  await Promise.all([
    downloadFileIfMissing(`${HF_MODEL_BASE_URL}/flora_student_fp16.onnx`, tmpOnnx),
    downloadFileIfMissing(`${HF_MODEL_BASE_URL}/taxa_table.npy`, tmpTable),
    downloadFileIfMissing(`${HF_MODEL_BASE_URL}/taxa_labels.json`, tmpLabels),
  ]);

  return {
    onnxPath: tmpOnnx,
    tablePath: tmpTable,
    labelsPath: tmpLabels,
  };
}

async function ensureBioClipLoaded() {
  if (cachedSession && cachedTable && cachedLabels) {
    return {
      session: cachedSession,
      table: cachedTable,
      labels: cachedLabels,
    };
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const { onnxPath, tablePath, labelsPath } = await resolveModelFiles();

    const modelBuf = fs.readFileSync(onnxPath);
    configureOnnxRuntime();
    cachedSession = await ort.InferenceSession.create(modelBuf, {
      executionProviders: ["wasm"],
    });
    cachedTable = loadNpyFloat32(tablePath);
    cachedLabels = JSON.parse(
      fs.readFileSync(labelsPath, "utf8")
    ) as TaxonLabel[];

    return {
      session: cachedSession,
      table: cachedTable,
      labels: cachedLabels,
    };
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/**
 * Runs the open-weight BioCLIP 2.5 Mobile (FastViT-SA12 distilled from
 * imageomics/bioclip-2.5-vith14 across 4,271 iNaturalist plant species)
 * on a Base64 data:image URL and returns the top-K botanical species candidates.
 */
export async function classifyPlantWithBioClip(
  imageDataUrl: string,
  topK = 5
): Promise<BioClipCandidate[]> {
  try {
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    const { session, table, labels } = await ensureBioClipLoaded();

    const { data } = await sharp(imgBuffer)
      .resize(224, 224, { fit: "cover", position: "centre" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const chw = new Float32Array(3 * 224 * 224);
    const planeSize = 224 * 224;
    for (let i = 0; i < planeSize; i++) {
      chw[i] = data[i * 3] / 255.0;
      chw[planeSize + i] = data[i * 3 + 1] / 255.0;
      chw[2 * planeSize + i] = data[i * 3 + 2] / 255.0;
    }

    const inputTensor = new ort.Tensor("float32", chw, [1, 3, 224, 224]);
    const outputs = await session.run({ image: inputTensor });
    const outputKey = Object.keys(outputs)[0];
    const emb = outputs[outputKey].data as Float32Array;

    const numSpecies = labels.length;
    const dim = 1024;
    const scores = new Float32Array(numSpecies);

    for (let s = 0; s < numSpecies; s++) {
      let sum = 0;
      const base = s * dim;
      for (let d = 0; d < dim; d++) {
        sum += table[base + d] * emb[d];
      }
      scores[s] = sum;
    }

    const sortedIndices = Array.from({ length: numSpecies }, (_, i) => i).sort(
      (a, b) => scores[b] - scores[a]
    );

    return sortedIndices.slice(0, topK).map((idx) => {
      const sci = labels[idx].scientific;
      const common = labels[idx].common || COMMON_NAME_MAP[sci] || null;
      return {
        scientificName: sci,
        commonName: common,
        similarity: Number(scores[idx].toFixed(4)),
      };
    });
  } catch (err) {
    console.warn("[Mythos Flora] BioCLIP plant classifier warning:", err);
    return [];
  }
}

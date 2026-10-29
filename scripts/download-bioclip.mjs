import fs from "fs";
import path from "path";

const HF_BASE =
  "https://huggingface.co/crazedcodernate/bioclip-2.5-mobile-fastvit/resolve/main";

const FILES = [
  "flora_student_fp16.onnx",
  "taxa_table.npy",
  "taxa_labels.json",
];

async function downloadFile(filename, destDir) {
  const destPath = path.join(destDir, filename);
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    console.log(`[BioCLIP Setup] ✓ ${filename} already exists.`);
    return;
  }

  const url = `${HF_BASE}/${filename}`;
  console.log(`[BioCLIP Setup] Downloading ${filename} from Hugging Face...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  console.log(
    `[BioCLIP Setup] ✓ Saved ${filename} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`
  );
}

async function main() {
  const destDir = path.join(process.cwd(), "models", "bioclip");
  fs.mkdirSync(destDir, { recursive: true });

  await Promise.all(FILES.map((f) => downloadFile(f, destDir)));
}

main().catch((err) => {
  console.warn("[BioCLIP Setup] Warning during build-time model fetch (will fallback to runtime fetch):", err.message);
});

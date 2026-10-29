# Mythos Flora — Real-World Botanical & Folklore RPG

**Mythos Flora** is a mobile-first, real-world outdoor RPG that blends botanical education, Celtic & world folklore, and multimodal open-weight AI (`meta-llama/Llama-3.2-11B-Vision-Instruct` hosted on DigitalOcean Serverless Inference).

Players step outdoors and photograph the path ahead of them, real trees, leaves, moss, and wild flora. An unseen woodland spirit powered by an 11B open-weight vision model identifies the plants in the vicinity (or asks for a closer look), retrieves authentic historical mythology, and weaves the surroundings into an interactive text adventure where players physically forage for fallen natural tokens (such as oak leaves, acorns, or waystones) to unlock ritual choices and compass paths.

---

## Hackathon & MLH Best Open-Source AI Alignment

Built for the **[MLH Best Open-Source AI Project](https://www.mlh.com/opensource-ai)** challenge:

- **Touch Grass**: Encourages players to step outdoors, observe real flora, and physically interact with their local ecosystem.
- **Slow and Steady**: Transforms vision-model inference latency (~6–8 seconds) into an intentional, mindful **Lore Ritual** (*"Translating Ogham runes..."*, *"Connecting to the Mycelial network..."*).
- **Ghost in the Machine**: Casts open-weight AI as an unseen mythological storyteller embedded in the living wood.
- **Single-Shot Bundled Inference**: Bundles plant identification, Celtic Ogham folklore, RPG narrative, physical foraging quest, a fallback substitute item, item-gated choices, and the next walking compass direction into a **single JSON call** to minimize outdoor cellular round-trips and conserve DigitalOcean inference credits.

---

## Open-Weight Models & License Attribution

Per the [MLH Open-Source AI Rules](https://www.mlh.com/opensource-ai), all AI models powering Mythos Flora are **100% open-weight / open-source**:

1. **Stage 1 — Dedicated Botanical Taxonomy Classifier (Small Vision Model, 11.6M params)**:
   - **Model Name**: `crazedcodernate/bioclip-2.5-mobile-fastvit` (distilled from Imageomics Institute's `imageomics/bioclip-2.5-vith14` across 4,271 iNaturalist plant species)
   - **Runtime**: Local ONNX Runtime (`onnxruntime-web`) running on-server / on-device
   - **Model Card & Weights**: [https://huggingface.co/crazedcodernate/bioclip-2.5-mobile-fastvit](https://huggingface.co/crazedcodernate/bioclip-2.5-mobile-fastvit)
   - **Base Teacher Model**: [https://huggingface.co/imageomics/bioclip-2.5-vith14](https://huggingface.co/imageomics/bioclip-2.5-vith14)
   - **Model License**: [MIT License](https://huggingface.co/crazedcodernate/bioclip-2.5-mobile-fastvit/blob/main/README.md#license-and-attribution) (Open-Source & Open-Weight)

2. **Stage 2 — Multimodal Folklore Storyteller & Visual Arbitrator (Large Vision-Language Model)**:
   - **Model Name**: Meta Llama Vision (`llama-4-maverick` / `meta-llama/Llama-3.2-11B-Vision-Instruct`)
   - **Hosting Provider**: DigitalOcean Serverless Inference (`https://inference.do-ai.run/v1/chat/completions`)
   - **Model Card & Weights**: [https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct) & [https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct)
   - **Model License & Acceptable Use**: [Llama Community License Agreement](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct/blob/main/LICENSE.txt)

3. **Repository License**: Open-source under the [MIT License](./LICENSE).

---

## The Complete Game Loop

1. **The Snap (`1. Snap Path`)**: Walk up to a real tree, leaf, or footpath and snap a photo via the mobile camera viewfinder (`capture="environment"`). Client-side HTML5 `<canvas>` compression resizes high-res mobile photos to ~80KB Base64 JPEG for rapid upload.
2. **The Lore Ritual (`2. Lore Ritual`)**: While `meta-llama/Llama-3.2-11B-Vision-Instruct` analyzes the image, an animated Ogham sigil and status bar mask the latency as part of the world-building ritual.
3. **The Encounter & Physical Foraging (`3. Forage & Act`)**:
   - Displays the identified plant's common name, Latin binomial, Ogham tree-alphabet rune, visual traits, and genuine Celtic/world folklore.
   - Instructs the player to physically pick up a nearby item (e.g., *Fallen Oak Leaf*) and add it to their satchel.
   - **Built-in Substitute Item**: If the player cannot find the primary item on the ground, tapping *"Can't find it nearby? Ask the spirit for a substitute"* immediately switches to a bundled accessible substitute (e.g., *Fallen Woodland Twig* or *Weather-Worn Pebble*) without burning another API call.
   - **Item-Gated Choices**: Ritual choices remain locked until the required physical item is in the player's satchel.
4. **Bundled Path Direction (`4. Walk On`)**: Selecting a choice reveals the spirit's outcome and a compass direction + landmark prompt guiding where to walk and photograph next.

---

## Key Dependencies & Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript, hosted on Vercel)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom forest & parchment botanical theme
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Inference**: DigitalOcean Serverless Inference (`meta-llama/Llama-3.2-11B-Vision-Instruct`)

---

## How to Run Locally

1. **Clone the repository and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd mythos-flora
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env.local` and add your DigitalOcean Serverless Inference Model Access Key:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   DO_INFERENCE_API_KEY=your_digitalocean_model_access_key_here
   DO_INFERENCE_BASE_URL=https://inference.do-ai.run/v1
   DO_INFERENCE_MODEL=llama-4-maverick
   ```
   *(Note: If `DO_INFERENCE_API_KEY` is omitted during indoor judge evaluation, the `/api/encounter` endpoint gracefully falls back to resilient botanical & Celtic Ogham presets so the full game loop can still be tested immediately.)*

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your phone or desktop browser.

---

## Deploying to Vercel

The app hosts on Vercel. Plant folklore still comes from DigitalOcean Serverless Inference, so the function needs that API key at runtime. BioCLIP weights are downloaded during `npm run build` (the `prebuild` script) and are not committed.

1. Push this repository to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), import the repository. Framework preset: **Next.js**. Node.js version: **22.x**.
3. Add these environment variables for Production (and Preview, if you want preview deploys to call the model):

   | Name | Value |
   | --- | --- |
   | `DO_INFERENCE_API_KEY` | Your DigitalOcean model access key |
   | `DO_INFERENCE_BASE_URL` | `https://inference.do-ai.run/v1` |
   | `DO_INFERENCE_MODEL` | `llama-4-maverick` |

4. Deploy. The `/api/encounter` route runs on the Node.js runtime with a 60 second limit, which covers BioCLIP plus the vision call.

From a machine that is already logged in to the Vercel CLI:

```bash
vercel env add DO_INFERENCE_API_KEY
vercel env add DO_INFERENCE_BASE_URL
vercel env add DO_INFERENCE_MODEL
vercel --prod
```

If `DO_INFERENCE_API_KEY` is missing, `/api/encounter` still returns the offline fallback so the game loop can be clicked through.

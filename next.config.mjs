/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel uses the standard Next.js build. `output: "standalone"` is only for
  // self-hosted containers and makes the Vercel builder look in the wrong place.
  serverExternalPackages: ["onnxruntime-web", "sharp"],
  outputFileTracingIncludes: {
    "/api/encounter": [
      "./models/bioclip/**/*",
      "./node_modules/onnxruntime-web/dist/ort.node.min.mjs",
      "./node_modules/onnxruntime-web/dist/ort.node.min.js",
      "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs",
      "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
    ],
  },
  // The package ships several 15–28 MB wasm backends. The server only loads
  // the threaded SIMD build, and Vercel functions must stay under 250 MB.
  outputFileTracingExcludes: {
    "/api/encounter": [
      "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.*",
      "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jspi.*",
      "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.*",
      "./node_modules/onnxruntime-web/dist/ort.all.*",
      "./node_modules/onnxruntime-web/dist/ort.webgl.*",
      "./node_modules/onnxruntime-web/dist/ort.webgpu.*",
      "./node_modules/onnxruntime-web/dist/*.bundle.min.mjs",
    ],
  },
};

export default nextConfig;

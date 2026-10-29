const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const exportsForTest = {};
const code = ts.transpileModule(fs.readFileSync('src/lib/prompt.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
vm.runInNewContext(code, { exports: exportsForTest });
const { parseEncounterJson, buildSystemPrompt, buildUserPrompt } = exportsForTest;
for (const confidence of ['low', 'medium', 'high']) {
  const result = parseEncounterJson(JSON.stringify({
    plant: { confidence, missingDiagnosticTraits: 'Buds not visible' },
    closerLookGuidance: 'Photograph the buds',
  }), []);
  assert.equal(result.needsCloserLook, false);
  assert.equal(result.closerLookGuidance, null);
  assert.equal(result.plant.confidence, confidence);
  assert.equal(result.plant.missingDiagnosticTraits, 'Buds not visible');
}
const unreadable = parseEncounterJson(JSON.stringify({
  needsCloserLook: true, closerLookGuidance: 'Try better light', plant: { confidence: 'low' },
}), []);
assert.equal(unreadable.needsCloserLook, true);
assert.equal(unreadable.closerLookGuidance, 'Try better light');
assert.ok(unreadable.choices.length >= 2);
assert.ok(buildSystemPrompt().includes('ONLY when blur'));
assert.ok(buildUserPrompt({turnNumber: 2, inventory: []}).includes('NOT species certainty'));
console.log('PASS: uncertainty preserves story progression; unusable images retain retake guidance');

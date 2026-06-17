#!/usr/bin/env node
/**
 * build-manifest.mjs — seal the TOOLING, not just the text.
 *
 * RED-TEAM said the verifier and config were unprotected: a PR could weaken a
 * check and only human review would catch it. The manifest hashes the corpus
 * root PLUS every file that enforces or governs the corpus, and derives one
 * manifestDigest. Signatures are taken over that digest (scripts/sign-publication),
 * so altering the verifier, the gate, the CI, CODEOWNERS, or the disclosure
 * invalidates the signature.
 *
 *   node scripts/build-manifest.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");

// Everything that ENFORCES or GOVERNS the corpus. If a file here changes, the
// manifest digest changes, and any prior signature is void.
const COVERED = [
  "lib/canon-core.ts",
  "scripts/verify-canon.ts",
  "scripts/verify-publication.mjs",
  "scripts/publish.mjs",
  "scripts/preflight.mjs",
  "scripts/build-manifest.mjs",
  "canon.seal",
  "CERTIFIES.md",
  ".github/CODEOWNERS",
  ".github/workflows/canon-integrity.yml",
  "integrations/canon-gate.mjs",
  "package.json",
  "scripts/hold.mjs",
  "scripts/retract.mjs",
  "scripts/canary.mjs",
  "canon.baseline.json",
  "DISPUTES.md",
  "RUNBOOK.md",
];

const seal = JSON.parse(readFileSync(resolve(ROOT, "canon.seal"), "utf8"));
const files = {};
for (const rel of COVERED) {
  const p = resolve(ROOT, rel);
  if (existsSync(p)) files[rel] = sha(readFileSync(p));
}
const body = {
  spec: "la-baluka/manifest/1.0.0",
  generatedAt: new Date().toISOString(),
  corpusRoot: seal.corpusRoot,
  files,
};
// Deterministic digest over the manifest body.
const stable = (o) => Array.isArray(o) ? `[${o.map(stable).join(",")}]`
  : o && typeof o === "object" ? `{${Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stable(o[k])).join(",")}}`
  : JSON.stringify(o);
const manifestDigest = sha(Buffer.from(stable(body), "utf8"));
const out = { ...body, manifestDigest };
writeFileSync(resolve(ROOT, "canon.manifest.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`build-manifest: ${Object.keys(files).length} governed files + corpus root`);
console.log(`build-manifest: manifestDigest ${manifestDigest}`);
console.log("build-manifest: sign this digest (sign:canon) with each lineage key; verify-publication requires a threshold.");

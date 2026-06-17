#!/usr/bin/env node
/**
 * retract.mjs — pull a published arc back. Reversibility for when something we
 * did NOT foresee turns out to be wrong. Sets status=retracted, re-seals,
 * rebuilds the manifest, and records the retraction as a publication event so
 * the history shows it was published AND withdrawn (never erased).
 *   node scripts/retract.mjs <corpusVersion|all> "<reason>" "<attestor>"
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [target, reason, attestor] = process.argv.slice(2);
if (!target || !reason || !attestor) { console.error('usage: retract.mjs <corpusVersion|all> "<reason>" "<attestor>"'); process.exit(1); }
const dir = resolve(ROOT, "canon");
let n = 0;
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const p = resolve(dir, f), d = JSON.parse(readFileSync(p, "utf8"));
  if (target === "all" || d.provenance.corpusVersion === target) {
    d.provenance.governance.status = "retracted";
    d.provenance.governance.retraction = { reason, attestor, date: new Date().toISOString() };
    writeFileSync(p, JSON.stringify(d, null, 2) + "\n", "utf8"); n++;
  }
}
if (!n) { console.error(`retract: no arc matched "${target}"`); process.exit(1); }
execFileSync("npx", ["tsx", "scripts/verify-canon.ts", "--write"], { cwd: ROOT, stdio: "inherit" });
execFileSync("node", ["scripts/build-manifest.mjs"], { cwd: ROOT, stdio: "inherit" });
execFileSync("node", ["scripts/publish.mjs"], { cwd: ROOT, stdio: "inherit" });
console.log(`retract: ${n} arc(s) marked retracted and recorded in the ledger.`);

#!/usr/bin/env node
/**
 * publish.mjs — record a publication event in the append-only, hash-chained
 * ledger (canon.ledger.json).
 *
 * The ledger is the tamper-evident HISTORY of what was published when. Each
 * entry chains to the previous by hash, so no past publication can be rewritten
 * without breaking every entry after it. Publishing runs the full content gate
 * first, then appends — it never rewrites prior entries.
 *
 *   node scripts/publish.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEAL = resolve(ROOT, "canon.seal");
const LEDGER = resolve(ROOT, "canon.ledger.json");

const stable = (o) =>
  Array.isArray(o) ? `[${o.map(stable).join(",")}]`
  : o && typeof o === "object" ? `{${Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stable(o[k])).join(",")}}`
  : JSON.stringify(o);
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// 1. The corpus must fully verify before anything is published.
if (existsSync(resolve(ROOT, "canon.hold"))) { console.error("publish: ✗ CANON HOLD active — refusing to publish."); process.exit(1); }
try {
  execFileSync("tsx", ["scripts/verify-canon.ts"], { cwd: ROOT, stdio: "inherit" });
} catch {
  console.error("publish: corpus did not verify — refusing to record a publication.");
  process.exit(1);
}

const seal = JSON.parse(readFileSync(SEAL, "utf8"));
const arcs = {};
for (const [cv, a] of Object.entries(seal.arcs)) arcs[cv] = { seal: a.seal, status: a.governance.status };

const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : [];
if (ledger.length && ledger[ledger.length - 1].corpusRoot === seal.corpusRoot) {
  console.log("publish: corpus root unchanged since the last entry — nothing to record.");
  process.exit(0);
}

const prev = ledger.length ? ledger[ledger.length - 1].hash : "GENESIS";
const body = { seq: ledger.length, ts: new Date().toISOString(), corpusRoot: seal.corpusRoot, arcs, prev };
const entry = { ...body, hash: sha(stable(body)) };
ledger.push(entry);
writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n", "utf8");
console.log(`publish: appended ledger entry #${entry.seq} — root ${seal.corpusRoot.slice(0, 16)}… · hash ${entry.hash.slice(0, 16)}…`);
console.log("publish: commit canon.ledger.json with the sealed arcs. If a signing key is provisioned, run sign:canon next.");

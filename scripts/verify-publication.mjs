#!/usr/bin/env node
/**
 * verify-publication.mjs — the publication LAYER.
 *   1. Ledger chain integrity (append-only hash chain).
 *   2. Ledger head corpusRoot == canon.seal corpusRoot.
 *   3. MANIFEST integrity: recompute every governed file's hash and the digest;
 *      they must match canon.manifest.json. (Tooling/config tamper → fail.)
 *   4. THRESHOLD signatures over the manifest digest: if canon.pubkeys.json is
 *      present, require >= threshold valid Ed25519 sigs from distinct listed
 *      keys; else report UNSIGNED (warning, authority gap open).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash, createPublicKey, verify as edVerify } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const stable = (o) => Array.isArray(o) ? `[${o.map(stable).join(",")}]`
  : o && typeof o === "object" ? `{${Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stable(o[k])).join(",")}}`
  : JSON.stringify(o);
const fail = (m) => { console.error(`verify-publication: ✗ ${m}`); process.exit(1); };

const seal = JSON.parse(readFileSync(resolve(ROOT, "canon.seal"), "utf8"));

// 1+2. Ledger.
const LEDGER = resolve(ROOT, "canon.ledger.json");
if (!existsSync(LEDGER)) fail("no publication ledger.");
const ledger = JSON.parse(readFileSync(LEDGER, "utf8"));
if (!Array.isArray(ledger) || !ledger.length) fail("empty ledger.");
for (let i = 0; i < ledger.length; i++) {
  const e = ledger[i];
  if (e.seq !== i) fail(`ledger entry ${i} wrong seq`);
  const body = { seq: e.seq, ts: e.ts, corpusRoot: e.corpusRoot, arcs: e.arcs, prev: e.prev };
  if (sha(Buffer.from(stable(body), "utf8")) !== e.hash) fail(`ledger entry ${i} tampered`);
  if (e.prev !== (i === 0 ? "GENESIS" : ledger[i - 1].hash)) fail(`ledger entry ${i} chain broken`);
}
const head = ledger[ledger.length - 1];
if (head.corpusRoot !== seal.corpusRoot) fail("ledger head does not match current seal (re-seal without publish?)");
console.log(`verify-publication: ✓ ledger chain intact (${ledger.length}) · head ${head.corpusRoot.slice(0, 16)}…`);

// 3. Manifest integrity.
const MAN = resolve(ROOT, "canon.manifest.json");
if (!existsSync(MAN)) fail("no canon.manifest.json (run build-manifest).");
const man = JSON.parse(readFileSync(MAN, "utf8"));
if (man.corpusRoot !== seal.corpusRoot) fail("manifest corpusRoot != seal corpusRoot");
for (const [rel, h] of Object.entries(man.files)) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) fail(`governed file missing: ${rel}`);
  if (sha(readFileSync(p)) !== h) fail(`governed file CHANGED since manifest: ${rel} (tooling/config tamper)`);
}
const body = { spec: man.spec, generatedAt: man.generatedAt, corpusRoot: man.corpusRoot, files: man.files };
if (sha(Buffer.from(stable(body), "utf8")) !== man.manifestDigest) fail("manifestDigest does not match manifest body");
console.log(`verify-publication: ✓ manifest covers ${Object.keys(man.files).length} governed files · digest ${man.manifestDigest.slice(0, 16)}…`);

// 4. Threshold signatures over the manifest digest.
const PUBKEYS = resolve(ROOT, "canon.pubkeys.json");
if (existsSync(PUBKEYS)) {
  const cfg = JSON.parse(readFileSync(PUBKEYS, "utf8"));   // { threshold: k, keys: { id: "<pem>" } }
  const sigDir = resolve(ROOT, "canon.sigs");
  let valid = 0; const who = [];
  if (existsSync(sigDir)) for (const f of readdirSync(sigDir)) {
    if (!f.endsWith(".sig")) continue;
    const id = f.replace(/\.sig$/, "");
    if (!cfg.keys[id]) { console.warn(`verify-publication: ⚠ signature from unlisted key ${id} ignored`); continue; }
    const pub = createPublicKey(cfg.keys[id]);
    const ok = edVerify(null, Buffer.from(man.manifestDigest, "utf8"), pub, Buffer.from(readFileSync(resolve(sigDir, f), "utf8").trim(), "hex"));
    if (ok) { valid++; who.push(id); } else console.warn(`verify-publication: ⚠ INVALID signature from ${id}`);
  }
  if (valid < cfg.threshold) fail(`threshold not met: ${valid}/${cfg.threshold} valid signatures (${who.join(", ") || "none"})`);
  console.log(`verify-publication: ✓ threshold met: ${valid}/${cfg.threshold} valid signatures over the manifest (${who.join(", ")})`);
} else {
  console.warn("verify-publication: ⚠ UNSIGNED — no canon.pubkeys.json. Integrity + tooling are enforced; AUTHORITY is asserted,");
  console.warn("  not yet cryptographically attributable. Provision keys + threshold, then sign:canon.");
}
console.log("verify-publication: ✓ publication layer verified.");

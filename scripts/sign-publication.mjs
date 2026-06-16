#!/usr/bin/env node
/**
 * sign-publication.mjs — a lineage key signs the MANIFEST digest (covers corpus
 * root + tooling + config + disclosure), not just the corpus root. Multiple keys
 * each produce a signature; verify-publication requires a threshold (M-of-N).
 *
 *   node scripts/sign-publication.mjs <ed25519-private-key.pem> <keyId>
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createPrivateKey, sign as edSign } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [keyPath, keyId] = process.argv.slice(2);
if (!keyPath || !keyId) { console.error("usage: sign-publication.mjs <key.pem> <keyId>"); process.exit(1); }
const { manifestDigest } = JSON.parse(readFileSync(resolve(ROOT, "canon.manifest.json"), "utf8"));
const key = createPrivateKey(readFileSync(keyPath));
const sig = edSign(null, Buffer.from(manifestDigest, "utf8"), key).toString("hex");
const dir = resolve(ROOT, "canon.sigs"); if (!existsSync(dir)) mkdirSync(dir);
writeFileSync(resolve(dir, `${keyId}.sig`), sig + "\n", "utf8");
console.log(`sign-publication: ${keyId} signed manifestDigest ${manifestDigest.slice(0, 16)}… → canon.sigs/${keyId}.sig`);

#!/usr/bin/env node
/**
 * reseal.mjs — re-mint the canon seal after a DELIBERATE, lineage-reviewed
 * amendment to popol-wuj-the-descent.ts.
 *
 * This is the only sanctioned way to change the seal. It runs the canon in
 * `--seal` mode (which first runs the structural + lineage invariant gate, so
 * a structurally invalid canon cannot be sealed at all), captures the fresh
 * SHA-256, and writes it into the CANON_SEAL constant.
 *
 * It does NOT confer authority. Re-sealing is meaningful only behind branch
 * protection that requires the K'iche' lineage holder's review (see CODEOWNERS).
 * The seal certifies that text and digest agree; a human certifies that the
 * change is faithful.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FILE = process.argv[2] || "popol-wuj-the-descent.ts";
const SEAL_RE = /const CANON_SEAL(?:: string)? = "([0-9a-f]{64}|__SEAL__)";/;

function fail(msg) {
  console.error(`reseal: ${msg}`);
  process.exit(1);
}

let hex;
try {
  hex = execSync(`tsx ${FILE} --seal`, { encoding: "utf8" }).trim();
} catch (e) {
  // --seal runs the invariant gate first; a structural/lineage violation lands here.
  fail(`the canon did not pass its invariant gate, so it cannot be sealed.\n${e.stdout || ""}${e.stderr || ""}`);
}

if (!/^[0-9a-f]{64}$/.test(hex)) fail(`expected a clean sha256 from --seal, got: ${JSON.stringify(hex)}`);

const src = readFileSync(FILE, "utf8");
const m = src.match(SEAL_RE);
if (!m) fail("could not find the CANON_SEAL constant to update.");

if (m[1] === hex) {
  console.log("reseal: seal already current — the text and its seal agree. Nothing to do.");
  process.exit(0);
}

writeFileSync(FILE, src.replace(SEAL_RE, `const CANON_SEAL: string = "${hex}";`));

// Regenerate the EXTERNAL seal (canon.seal) from the same source, so the two
// independent witnesses never diverge. This re-runs the invariant gate too.
try {
  execSync(`tsx scripts/verify-canon.ts --write`, { stdio: "inherit" });
} catch {
  fail("re-sealed the in-file constant, but failed to regenerate the external canon.seal.");
}

console.log(
  "reseal: the canon has been re-sealed DELIBERATELY (in-file + external canon.seal).\n" +
  `  old  ${m[1]}\n` +
  `  new  ${hex}\n` +
  "This is valid only if it follows lineage review. Commit the amended canon, the\n" +
  "in-file seal, and canon.seal together; the CODEOWNERS gate will require the\n" +
  "lineage holder's approval."
);

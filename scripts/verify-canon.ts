#!/usr/bin/env -S npx tsx
/**
 * scripts/verify-canon.ts — content witness over INERT JSON.
 * Post-blue-team: reads canon/*.json as DATA through lib/canon-core (no canon
 * code is imported or executed — RED-TEAM H-1 closed). Recomputes per-arc seals,
 * the dual-layer roots (script vs application — M-5), and the corpus root; checks
 * them against canon.seal; regenerates the coreutils artifacts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { ALGO, loadArc, arcSeal, scriptRoot, applicationRoot, provenanceRoot, unconfirmedBeats, holdReason, type Arc } from "../lib/canon-core.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEAL_PATH = resolve(ROOT, "canon.seal");
const DIST = resolve(ROOT, "dist");
const SUMS_PATH = resolve(ROOT, "SHA256SUMS");
const US = "\u241F", RS = "\u241E";
const ARCS = [
  "canon/popol-wuj-the-descent.json",
  "canon/popol-wuj-wuqub-kakix.json",
  "canon/popol-wuj-making-of-humans.json",
];
const sha = (s: string) => createHash(ALGO).update(s, "utf8").digest("hex");
const distName = (cv: string) => cv.replace(/\//g, "__") + ".canonical";
const canonicalBytes = (arc: Arc) =>
  arc.beats.map((b) => [b.n, b.phase, b.title, b.script, b.application].join(US)).join(RS) + "\u241D" +
  [arc.provenance.governance.status, JSON.stringify(arc.provenance.governance.attestation),
   JSON.stringify(arc.provenance.governance.lineageReview), arc.provenance.governance.cooperativeLink].join(US);
const corpusRootOf = (arcs: Record<string, { seal: string }>) =>
  sha(Object.keys(arcs).sort().map((cv) => `${cv}${US}${arcs[cv].seal}`).join(RS));
const PLACEHOLDER = /(PENDING|FILL|TODO|REPLACE|<<)/i;
const concrete = (s: unknown): boolean => typeof s === "string" && s.trim().length > 0 && !PLACEHOLDER.test(s);

function publicationProblems(arc: Arc): string[] {
  const g = arc.provenance.governance, p: string[] = [];
  if (!["draft", "review", "live", "retracted"].includes(g.status)) p.push(`invalid status "${g.status}"`);
  if (g.status === "live") {
    const a = g.attestation as any, r = g.lineageReview as any;
    const unconf = unconfirmedBeats(arc);
    if (unconf.length) p.push(`live but ${unconf.length} beat(s) not lineage-confirmed (epistemic gate): ${unconf.slice(0,8).join(",")}${unconf.length>8?"…":""}`);
    if (a?.expires) { const exp = Date.parse(a.expires); if (!Number.isNaN(exp) && exp < Date.now()) p.push(`live but attestation EXPIRED on ${a.expires} (re-attestation required)`); }
    if (!concrete(a?.attestor?.name)) p.push("live but attestor.name missing/placeholder");
    if (!concrete(a?.attestor?.role)) p.push("live but attestor.role missing/placeholder");
    if (!concrete(a?.basis)) p.push("live but attestation.basis missing");
    if (!concrete(a?.scope)) p.push("live but attestation.scope missing");
    if (!concrete(a?.date)) p.push("live but attestation.date missing");
    if (!concrete(r?.reviewer?.name)) p.push("live but lineage reviewer.name missing");
    if (r?.status !== "complete") p.push("live but lineage review not complete");
    if (!concrete(g.cooperativeLink)) p.push("live but cooperativeLink missing");
  }
  return p;
}
interface ArcRecord { algo: string; corpusVersion: string; contractVersion: string; field: string;
  beats: number; scriptRoot: string; applicationRoot: string; provenanceRoot: string; seal: string; governance: Arc["provenance"]["governance"]; }
interface SealFile { algo: string; corpusRoot: string; generatedAt: string; arcs: Record<string, ArcRecord>; }
function recordFor(arc: Arc): ArcRecord {
  return { algo: ALGO, corpusVersion: arc.provenance.corpusVersion, contractVersion: arc.provenance.contractVersion,
    field: arc.provenance.field, beats: arc.beats.length,
    scriptRoot: scriptRoot(arc.beats), applicationRoot: applicationRoot(arc.beats),
    provenanceRoot: provenanceRoot(arc.beats), seal: arcSeal(arc), governance: arc.provenance.governance };
}
function write(): never {
  const h = holdReason(ROOT); if (h) { console.error(`verify-canon: ✗ CANON HOLD active — refusing to seal. Reason: ${h}`); process.exit(1); }
  if (!existsSync(DIST)) mkdirSync(DIST);
  const arcs: Record<string, ArcRecord> = {}; const sums: string[] = [];
  for (const path of ARCS) {
    const arc = loadArc(resolve(ROOT, path));
    const pub = publicationProblems(arc);
    if (pub.some((x) => x.includes("invalid status"))) { console.error(`verify-canon: ${path}: ${pub.join("; ")}`); process.exit(1); }
    const rec = recordFor(arc); arcs[rec.corpusVersion] = rec;
    writeFileSync(resolve(DIST, distName(rec.corpusVersion)), canonicalBytes(arc), "utf8");
    sums.push(`${sha(canonicalBytes(arc))}  dist/${distName(rec.corpusVersion)}`);
    console.log(`verify-canon: sealed ${rec.corpusVersion} — ${rec.beats} beats · ${rec.seal.slice(0, 16)}… · status=${rec.governance.status}`);
  }
  const corpusRoot = corpusRootOf(arcs);
  writeFileSync(SEAL_PATH, JSON.stringify({ algo: ALGO, corpusRoot, generatedAt: new Date().toISOString(), arcs }, null, 2) + "\n", "utf8");
  writeFileSync(SUMS_PATH, sums.sort().join("\n") + "\n", "utf8");
  console.log(`verify-canon: corpus root ${corpusRoot}\nverify-canon: wrote canon.seal, dist/*.canonical, SHA256SUMS`);
  process.exit(0);
}
function verify(): never {
  const h = holdReason(ROOT); if (h) { console.error(`verify-canon: ✗ CANON HOLD active — refusing to certify. Reason: ${h}`); process.exit(1); }
  let sf: SealFile;
  try { sf = JSON.parse(readFileSync(SEAL_PATH, "utf8")); }
  catch { console.error("verify-canon: canon.seal missing/unreadable."); process.exit(1); }
  let bad = false; const live: Record<string, { seal: string }> = {}; const seen = new Set<string>();
  for (const path of ARCS) {
    let arc: Arc;
    try { arc = loadArc(resolve(ROOT, path)); }
    catch (e) { console.error(`\n✗ ${path}: ${(e as Error).message}`); bad = true; continue; }
    const cv = arc.provenance.corpusVersion; seen.add(cv);
    const rec = sf.arcs?.[cv]; const probs = [...publicationProblems(arc)];
    if (!rec) { console.error(`\n✗ ${cv}: no entry in canon.seal`); bad = true; continue; }
    if (rec.scriptRoot !== scriptRoot(arc.beats)) probs.push("script (transmission) layer drift");
    if (rec.applicationRoot !== applicationRoot(arc.beats)) probs.push("application (interpretation) layer drift");
    if (rec.provenanceRoot !== provenanceRoot(arc.beats)) probs.push("provenance (epistemic) layer drift");
    if (rec.seal !== arcSeal(arc)) probs.push("arc seal mismatch");
    if (rec.beats !== arc.beats.length) probs.push(`beat count ${rec.beats}->${arc.beats.length}`);
    try { if (readFileSync(resolve(DIST, distName(cv)), "utf8") !== canonicalBytes(arc)) probs.push(`dist/${distName(cv)} mismatch`); }
    catch { probs.push(`dist/${distName(cv)} missing`); }
    live[cv] = { seal: rec.seal };
    console.log(`\n-- ${cv} -- ${arc.beats.length} beats · status=${arc.provenance.governance.status}`);
    if (probs.length) { bad = true; for (const p of probs) console.error(`   x ${p}`); }
    else console.log(`   ok script+application layers, seal, dist verified`);
  }
  for (const cv of Object.keys(sf.arcs ?? {})) if (!seen.has(cv)) { console.error(`\n✗ canon.seal lists unknown arc ${cv}`); bad = true; }
  const root = corpusRootOf(live);
  if (root !== sf.corpusRoot) { console.error(`\n✗ corpus root mismatch`); bad = true; }
  try {
    const want = new Map<string, string>();
    for (const path of ARCS) { const arc = loadArc(resolve(ROOT, path));
      want.set(`dist/${distName(arc.provenance.corpusVersion)}`, sha(canonicalBytes(arc))); }
    for (const ln of readFileSync(SUMS_PATH, "utf8").trim().split("\n")) {
      const m = ln.match(/^([0-9a-f]{64})\s+(.+)$/);
      if (!m || want.get(m[2]) !== m[1]) { console.error(`\n✗ SHA256SUMS mismatch: ${ln}`); bad = true; }
    }
  } catch { console.error("\n✗ SHA256SUMS missing"); bad = true; }
  if (bad) { console.error("\n✗ CORPUS VERIFICATION FAILED (fail-closed)."); process.exit(1); }
  console.log(`\n✓ CORPUS VERIFIED — ${ARCS.length} arcs · root ${root.slice(0, 16)}… · data read as JSON, no canon code executed.`);
  process.exit(0);
}
process.argv.includes("--write") ? write() : verify();

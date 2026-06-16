#!/usr/bin/env node
/**
 * canary.mjs — observability for the UNKNOWN. It does not know what is wrong; it
 * surfaces what is DIFFERENT. Computes a structural/statistical fingerprint per
 * arc (beat count, length distribution, character-class histogram, phase set,
 * proper-noun set) and diffs against a committed baseline. ANY surprising
 * deviation — a new proper noun, a length shift, a new phase, a charclass
 * appearing — is flagged for human eyes, even when no rule forbids it.
 *   node scripts/canary.mjs            # diff vs baseline; nonzero exit on anomaly
 *   node scripts/canary.mjs --baseline # deliberately (re)set the baseline
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = resolve(ROOT, "canon.baseline.json");
const dir = resolve(ROOT, "canon");

function classify(s) {
  const h = { letters: 0, accented: 0, digits: 0, punct: 0, space: 0 };
  for (const ch of s) { const c = ch.codePointAt(0);
    if ((c>=65&&c<=90)||(c>=97&&c<=122)) h.letters++;
    else if (c>=0xc0&&c<=0x17f) h.accented++;
    else if (c>=48&&c<=57) h.digits++;
    else if (ch===" "||ch==="\n") h.space++;
    else h.punct++; }
  return h;
}
function fingerprint(arc) {
  const beats = arc.beats;
  const all = beats.map(b => `${b.script} ${b.application}`).join(" ");
  const lens = beats.flatMap(b => [b.script.length, b.application.length]);
  const nouns = new Set();
  for (const b of beats) for (const m of `${b.script} ${b.application}`.matchAll(/\b[A-Z][A-Za-z\u00c0-\u017f']{2,}\b/g)) nouns.add(m[0]);
  return {
    beatCount: beats.length,
    phases: [...new Set(beats.map(b => b.phase))].sort(),
    charClass: classify(all),
    lenMean: Math.round(lens.reduce((a,b)=>a+b,0)/lens.length),
    lenMax: Math.max(...lens), lenMin: Math.min(...lens),
    properNouns: [...nouns].sort(),
  };
}
const arcs = {};
for (const f of readdirSync(dir)) if (f.endsWith(".json")) {
  const d = JSON.parse(readFileSync(resolve(dir, f), "utf8"));
  arcs[d.provenance.corpusVersion] = fingerprint(d);
}
if (process.argv.includes("--baseline")) {
  writeFileSync(BASE, JSON.stringify(arcs, null, 2) + "\n", "utf8");
  console.log(`canary: baseline set for ${Object.keys(arcs).length} arcs. Review it; it is bound into the manifest.`);
  process.exit(0);
}
if (!existsSync(BASE)) { console.error("canary: no baseline. Run --baseline (deliberately) first."); process.exit(1); }
const base = JSON.parse(readFileSync(BASE, "utf8"));
let anomalies = 0;
const flag = (cv, msg) => { anomalies++; console.warn(`canary: ⚠ ${cv}: ${msg}`); };
for (const cv of Object.keys(arcs)) {
  const a = arcs[cv], b = base[cv];
  if (!b) { flag(cv, "NEW arc not in baseline"); continue; }
  if (a.beatCount !== b.beatCount) flag(cv, `beat count ${b.beatCount}→${a.beatCount}`);
  for (const p of a.phases) if (!b.phases.includes(p)) flag(cv, `new phase "${p}"`);
  for (const p of b.phases) if (!a.phases.includes(p)) flag(cv, `phase removed "${p}"`);
  for (const n of a.properNouns) if (!b.properNouns.includes(n)) flag(cv, `NEW proper noun "${n}" (possible foreign name / drift)`);
  for (const n of b.properNouns) if (!a.properNouns.includes(n)) flag(cv, `proper noun vanished "${n}"`);
  const shift = Math.abs(a.lenMean - b.lenMean) / b.lenMean;
  if (shift > 0.15) flag(cv, `mean field length shifted ${(shift*100).toFixed(0)}%`);
  for (const k of Object.keys(a.charClass)) {
    const bv = b.charClass[k] || 0, av = a.charClass[k];
    if (bv === 0 && av > 0) flag(cv, `character class "${k}" newly appears`);
  }
}
for (const cv of Object.keys(base)) if (!arcs[cv]) flag(cv, "arc in baseline is MISSING");
if (anomalies) { console.error(`\ncanary: ${anomalies} anomaly(ies) — NOT proof of error, but require human review before trust.`); process.exit(2); }
console.log(`canary: ✓ no structural deviation from baseline across ${Object.keys(arcs).length} arcs.`);

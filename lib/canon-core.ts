/**
 * lib/canon-core.ts — the ONLY executable surface that touches canon content.
 *
 * Blue-team answer to RED-TEAM H-1 (the canon was executable code, and verifying
 * it ran that code). Beats now live in inert `canon/*.json`. This module READS
 * that JSON — it never imports or executes canon-authored code. A malicious edit
 * to a beat is a data change reviewable as data; it cannot execute anything.
 *
 * It is also the one place that hashes and screens, so the rules live in exactly
 * one reviewed file (covered by the signed manifest — see canon.manifest.json).
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export const ALGO = "sha256";
const US = "\u241F", RS = "\u241E", GS = "\u241D";

export interface Beat {
  n: number; phase: string; title: string; script: string; application: string;
  trust: { script: string; application: string };
  provenance: { source: string; mode: string; lineageConfirmed: boolean; confidence: string };
}
export interface Governance { status: string; attestation: unknown; lineageReview: unknown; cooperativeLink: string; }
export interface Provenance {
  corpusVersion: string; contractVersion: string; field: string;
  sealAlgo: string; governance: Governance;
}
export interface Arc { provenance: Provenance; beats: Beat[]; }

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.getOwnPropertyNames(o)) deepFreeze((o as Record<string, unknown>)[k]);
  }
  return o;
}

/**
 * Character floor (RED-TEAM M-1 + missed-finding #3). Two screens:
 *   (a) FORBID the seal's own separators and all C0/C1 control characters, so a
 *       beat field can never inject canonicalization ambiguity or hidden chars.
 *   (b) ALLOWLIST the script: the K'iche' field is written in Latin script +
 *       a fixed punctuation set. Any code point outside that range (Greek,
 *       Cyrillic, Hebrew, CJK, zero-width, bidi controls, confusables) is
 *       rejected — a denylist of forbidden *words* could never be complete, so
 *       we constrain the *alphabet* instead.
 */
const ALLOWED_PUNCT = new Set([
  " ", ".", ",", ";", ":", "!", "?", "'", "\u2019", "\"", "\u201C", "\u201D",
  "(", ")", "[", "]", "-", "\u2014", "\u2013", "/", "\n", "\u2026", "&", "%",
]);
function screenText(field: string, value: string, beatN: number, fail: (m: string) => never): void {
  for (const ch of value) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0x241D || cp === 0x241E || cp === 0x241F) fail(`beat ${beatN} ${field}: contains a seal separator character`);
    if (cp < 0x20 && ch !== "\n") fail(`beat ${beatN} ${field}: contains a C0 control character (U+${cp.toString(16)})`);
    if (cp >= 0x7f && cp <= 0x9f) fail(`beat ${beatN} ${field}: contains a C1 control character`);
    if (cp === 0x200b || cp === 0x200c || cp === 0x200d || cp === 0xfeff) fail(`beat ${beatN} ${field}: contains a zero-width/BOM character`);
    if (cp >= 0x2066 && cp <= 0x2069) fail(`beat ${beatN} ${field}: contains a bidirectional control character`);
    const ok =
      (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a) || // A-Z a-z
      (cp >= 0x30 && cp <= 0x39) ||                                // 0-9
      (cp >= 0xc0 && cp <= 0x17f) ||                               // Latin-1 + Latin Extended-A (accented)
      ALLOWED_PUNCT.has(ch);
    if (!ok) fail(`beat ${beatN} ${field}: code point U+${cp.toString(16)} is outside the permitted Latin/K'iche' script`);
  }
}

const FOREIGN_FIELD = [
  "Zeus", "Apollo", "Pythia", "Delphi", "Pleiades", "Odin", "Norse", "Valhalla",
  "Zohar", "Kabbalah", "Rashbi", "Pharaoh", "Osiris", "Taoist", "Vedic",
  "Brahman", "Stoic", "Dreamtime", "Yoruba", "Orisha", "Allah", "Buddha",
];

export function verifyArc(arc: Arc): void {
  const fail = (m: string): never => { throw new Error(`CANON VIOLATION (fail-closed): ${m}`); };
  const { beats } = arc;
  if (!Array.isArray(beats) || beats.length === 0) fail("empty canon");

  beats.forEach((b, i) => { if (b.n !== i + 1) fail(`beat index ${i} numbered ${b.n}`); });

  const seenPhase = new Set<string>(); let prev = "";
  for (const b of beats) {
    for (const f of ["phase", "title", "script", "application"] as const) {
      if (typeof b[f] !== "string" || b[f].trim().length === 0) fail(`beat ${b.n} empty ${f}`);
      screenText(f, b[f], b.n, fail);
    }
    if (b.script.trim().length < 40) fail(`beat ${b.n} script too thin`);
    if (b.application.trim().length < 40) fail(`beat ${b.n} application too thin`);
    if (b.trust?.script !== "transmission" || b.trust?.application !== "interpretation")
      fail(`beat ${b.n} missing/incorrect trust tags`);
    const pv = b.provenance;
    if (!pv || typeof pv.source !== "string" || pv.source.trim().length === 0) fail(`beat ${b.n} missing provenance.source`);
    if (!["ai-assisted-draft", "human-authored", "lineage-transmitted"].includes(pv?.mode)) fail(`beat ${b.n} invalid provenance.mode`);
    if (typeof pv?.lineageConfirmed !== "boolean") fail(`beat ${b.n} provenance.lineageConfirmed must be boolean`);
    if (!["unconfirmed", "reviewed", "confirmed"].includes(pv?.confidence)) fail(`beat ${b.n} invalid provenance.confidence`);
    if (b.phase !== prev) {
      if (seenPhase.has(b.phase)) fail(`phase "${b.phase}" reappears at beat ${b.n}`);
      seenPhase.add(b.phase); prev = b.phase;
    }
    const hay = `${b.script} ${b.application}`;
    for (const t of FOREIGN_FIELD) if (new RegExp(`\\b${t}\\b`).test(hay)) fail(`foreign-field term "${t}" in beat ${b.n}`);
  }
}

// ── Seals. The script (transmission) and application (interpretation) layers
//    are hashed SEPARATELY (RED-TEAM M-5) so the two trust levels are
//    distinguishable, then bound with governance into the arc seal. ──
const govBytes = (g: Governance) =>
  [g.status, JSON.stringify(g.attestation), JSON.stringify(g.lineageReview), g.cooperativeLink].join(US);

export function scriptRoot(beats: Beat[]): string {
  return createHash(ALGO).update(beats.map((b) => [b.n, b.phase, b.title, b.script].join(US)).join(RS).normalize("NFC"), "utf8").digest("hex");
}
export function applicationRoot(beats: Beat[]): string {
  return createHash(ALGO).update(beats.map((b) => [b.n, b.application].join(US)).join(RS).normalize("NFC"), "utf8").digest("hex");
}
export function provenanceRoot(beats: Beat[]): string {
  return createHash(ALGO).update(beats.map((b) =>
    [b.n, b.provenance.source, b.provenance.mode, b.provenance.lineageConfirmed, b.provenance.confidence].join(US)
  ).join(RS).normalize("NFC"), "utf8").digest("hex");
}
export function arcSeal(arc: Arc): string {
  const body = `${scriptRoot(arc.beats)}${GS}${applicationRoot(arc.beats)}${GS}${provenanceRoot(arc.beats)}${GS}${govBytes(arc.provenance.governance)}`;
  return createHash(ALGO).update(body.normalize("NFC"), "utf8").digest("hex");
}

/** Beats not yet lineage-confirmed (epistemic gate input). */
export function unconfirmedBeats(arc: Arc): number[] {
  return arc.beats.filter((b) => !b.provenance.lineageConfirmed).map((b) => b.n);
}

/** Global fail-safe HOLD. If a canon.hold file is present at the repo root, the
 *  whole system halts loud and closed — a kill-switch for any unforeseen
 *  condition we have no specific check for. Returns the reason, or null. */
export function holdReason(repoRoot: string): string | null {
  const p = resolve(repoRoot, "canon.hold");
  return existsSync(p) ? (readFileSync(p, "utf8").trim() || "held (no reason given)") : null;
}

export function loadArc(jsonPath: string): Arc {
  const arc = JSON.parse(readFileSync(jsonPath, "utf8")) as Arc;  // DATA, not code
  verifyArc(arc);
  return deepFreeze(arc);
}

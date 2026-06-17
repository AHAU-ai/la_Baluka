# Unknown-Unknowns — a resilience layer

## The honest framing

Unknown unknowns cannot be listed. If a failure can be named, it is a *known*
unknown and belongs in a threat model, which is what RED-TEAM.md and the
blue-team already are. The only sound engineering response to the genuinely
unforeseen is not more specific patches — it is to build **properties that help
regardless of which unexpected thing goes wrong**:

- **Detect deviation without a rule for it** (observability).
- **Hear objections we did not anticipate** (a dispute channel).
- **Reverse safely** (hold + retraction).
- **Degrade humbly** (fail-safe defaults, legible epistemic status, expiry).

And one project-specific truth: after this many hardening cycles, the largest
*unmodeled* surface here is not cryptographic. It is **epistemic, cultural, and
temporal** — the content could be fluently wrong, the community could object
through a channel we never built, the single accountability holder could be
unavailable or mistaken, and a claim could silently outlive its truth. More
authority-signaling crypto would worsen the deepest risk (RED-TEAM H-3), so this
layer deliberately adds **humility, detection, and reversibility — not
authority.**

## Categories named (the rest, by definition, cannot be)

| Category | The unforeseen shape | Resilience property built |
|---|---|---|
| Epistemic | Fluent AI-assisted text sealed as if it were grounded transmission | Per-beat provenance + epistemic gate |
| Observational | A change that breaks no rule but is *wrong* | Canary structural/statistical diff |
| Cultural / relational | Someone knows it is wrong; we cannot hear them | DISPUTES channel + hold |
| Temporal | A claim persists as "true forever" after understanding shifts | Expiring attestations (re-attestation) |
| Reversibility | We must undo a publication we did not foresee was bad | Hold kill-switch + first-class retraction |
| Operational | A failure outside every existing check | Fail-safe hold; incident RUNBOOK; succession |

## What was built

1. **Per-beat epistemic provenance.** Every beat now records `source`, `mode`
   (`ai-assisted-draft` / `human-authored` / `lineage-transmitted`),
   `lineageConfirmed`, and `confidence`. Sealed as its own `provenanceRoot`. The
   honest default is `ai-assisted-draft / lineageConfirmed:false`, because that
   is what these beats are. **The epistemic gate forbids `live` while any beat is
   unconfirmed** — fluent text cannot acquire authority it has not earned.

2. **Canary (`scripts/canary.mjs`).** A structural fingerprint per arc — beat
   count, length distribution, character-class histogram, phase set, proper-noun
   set — diffed against a committed, manifest-bound baseline. It does not know
   what is wrong; it surfaces what is **different** (a new proper noun, a length
   shift, a vanished phase) for human review. This is the core unknown-unknown
   instrument.

3. **Hold (`scripts/hold.mjs`).** A global kill-switch. While `canon.hold`
   exists, every gate — verify, write, publish, preflight — fails closed and
   loud. Fail-safe by default: when in doubt, hold.

4. **Retraction (`scripts/retract.mjs`).** First-class withdrawal. Sets
   `status: retracted`, re-seals, and records the withdrawal as a ledger event —
   published-then-withdrawn, **never erased**.

5. **Expiring attestations.** `attestation.expires` makes a live claim go stale
   on a date, forcing periodic human re-review instead of silent permanence.

6. **Dispute channel + incident runbook.** `DISPUTES.md` turns "someone knows
   this is wrong and we can't hear them" into a captured, defined process;
   `RUNBOOK.md` is the contain → assess → act → release procedure, including key
   rotation and the succession (bus-factor) requirement. Both are manifest-bound,
   so they cannot be silently dropped.

## Steel-man — 6 attacks, 6 held

- **Hold** → verify and publish both refuse while held. ✓
- **Canary** → a foreign name ("Quetzalcoatl") that passes every integrity rule
  (valid script, length, re-seals cleanly) is still flagged as an unforeseen
  deviation for human review. ✓ *This is the layer doing its actual job.*
- **Epistemic gate** → `live` blocked while beats are AI-assisted and
  unconfirmed, even with a fully named attestor. ✓
- **Expiry** → an expired attestation is flagged stale. ✓
- **Baseline tamper** → moving the canary goalposts breaks the manifest. ✓
- **Retraction** → recorded in the append-only ledger, not erased. ✓

## Residual — the part no architecture can reach

This layer makes the system better at *noticing* it is wrong, *hearing* that it
is wrong, and *undoing* being wrong. It still cannot make the content true, make
the review real, or make the publication culturally sanctioned. What it adds is
the humility to assume some unknown is already present — the corpus sits at
`review`, every beat is marked unconfirmed, preflight refuses to call it
release-ready — so that the default posture is doubt, not false confidence. For
a sacred text wrapped in machinery, assumed-doubt is the safest unknown-unknown
mitigation there is. The machine guards integrity, detects deviation, and enables
reversal; the lineage still holds the truth. Maltyox.

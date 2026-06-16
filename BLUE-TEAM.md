# Blue-Team Report — mitigations built, and the steel-man that tested them

This closes the loop on RED-TEAM.md: each finding is mapped to the architecture
built to mitigate it and the adversarial test that proved the mitigation holds.
It also records what the red-team report itself **missed** (found on re-attack),
and the residual risk that no code can close.

## Re-attack on the report (phase 1)

The report's findings reproduce and are accurate, but it had blind spots:

- **The verifier and config were themselves unprotected.** The report worried
  about canon edits but not that the *checking* code could be weakened in a PR.
  → Added the signed **manifest** over all tooling/config (M-3 expanded).
- **The Astro build gate is opt-in.** Removing the integration line disables it
  silently. → Folded the gate into `verify:gate`/CI so the build is not the only
  enforcement point; CI runs on every PR and push.
- **Lineage integrity was a denylist.** A list of forbidden words can't be
  complete. → Added a **script allowlist** (Latin/K'iche' code points only);
  foreign scripts and confusables are rejected structurally.
- **The trust root is in-repo.** → The threshold **signature over the manifest**
  is the out-of-repo anchor (keys live with the holders, not in the tree).
- **Miscalibration.** H-3 (laundering cultural authority) is the true Critical
  for sacred material; ops items were over-ranked. The blue-team treats H-3 as
  primary.

## Findings → mitigation → proof

| # | Finding | What was built | Steel-man result |
|---|---------|----------------|------------------|
| C-1 | CODEOWNERS placeholders silently disable the human gate | `preflight.mjs` fails on any placeholder token + missing path coverage | **HELD** — preflight fails on `REPLACE` (Attack 4) |
| C-2 | Branch protection not file-enforceable | `preflight.mjs` probes the GitHub API for required review + checks; loud manual requirement if no token | wired; fails closed when protection absent |
| H-1 | Canon was executable code; verifying ran it | Beats extracted to inert `canon/*.json`; `lib/canon-core.ts` is the one reviewed surface; verifier **reads JSON** | **HELD** — verifier imports no canon code (Attack 3); homoglyph + separator rejected (1,2) |
| H-2 | Ledger self-forgeable by whole-file controller | Manifest + **threshold signature** is the backstop a forger can't produce; chain still catches partial edits | **HELD** — partial edit caught; full forge needs keys (Attack 11) |
| H-3 / M-4 | Crypto launders a thin/unverifiable authority claim | **Structured attestation** (named attestor + role + scope + basis + date) required for `live`; `CERTIFIES.md` disclosure **bound into the manifest** | **HELD** — `live` blocked on a descriptor (Attack 5); disclosure non-removable (Attack 10) |
| M-1 | Canonicalization-injection via unscreened separators | Char floor rejects C0/C1, zero-width, bidi, and the seal separators | **HELD** — U+241F rejected (Attack 2) |
| M-2 | Supply chain: tags not SHAs, `npm install` | `npm ci`, coreutils `sha256sum -c` cross-check in CI, Dependabot; SHA-pin flagged as a required step (network blocked at authoring) | wired; coreutils check is toolchain-independent |
| M-3 | Signature too narrow; single key; no threshold | Signature is over the **manifest digest** (root + tooling + config + disclosure); **M-of-N** threshold of named keys | **HELD** — 1/2 rejected, 2/3 verifies, verifier-tamper voids it (Attacks 7,8,9) |
| M-5 | Sacred text and interpretation sealed equally | `script` and `application` hashed as **separate roots** + per-beat trust tags | **HELD** — interpretation drift caught and *named* as interpretation; transmission reported intact (Attack 6) |
| (missed) | Verifier/config unprotected | Manifest covers them; editing the gate voids the signature | **HELD** (Attack 9) |
| (missed) | Lineage integrity was denylist-only | Script allowlist | **HELD** (Attack 1) |

**Steel-man: 11 attacks, 11 held.** Throwaway keys were used to prove the
threshold mechanism, then destroyed; the repo ships **unsigned**.

## What the blue-team deliberately did NOT paper over

- The corpus is now correctly at **`review`, not `live`** — the stronger gate
  requires a *named* attestor, which does not exist yet. The mitigation working
  means the old `live` status (resting on a four-word descriptor) no longer
  qualifies. That is the point, not a regression.
- `preflight` **fails today** because CODEOWNERS still has `REPLACE` and no
  signing keys are provisioned. It is *supposed* to fail until a human does the
  three things only humans can do:
  1. replace CODEOWNERS placeholders with real handles + enable branch protection;
  2. record a named attestor (or consciously decide the descriptor suffices and
     relax the schema — a documented, deliberate choice, not a silent default);
  3. provision the lineage keys and `sign:canon` to meet the threshold.

## Residual risk (uncloseable by code)

Everything above hardens *form*. None of it can certify that the paraphrase is
faithful, that the review happened, or that the K'iche' community has sanctioned
this publication. The manifest binds `CERTIFIES.md` precisely so that this limit
travels with the artifact and cannot be quietly dropped. The machine guarantees
integrity, history, tooling, and — once signed — attribution. Truth and
legitimacy remain with the lineage. That boundary is now enforced *and* disclosed,
which is the most a system like this should ever claim.

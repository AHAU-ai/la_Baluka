# Red-Team Report — La Baluka Canon Corpus

An adversarial review of the whole system, start to finish: the canon arc files,
the seal and verification machinery, the publication layer, the CI/governance,
and — most importantly — the project's premise. The job here is to find what
breaks, not to praise what holds. Findings are rated by feasibility × impact.

A blunt summary up front: **the cryptography is strong; the weakest links are
human, operational, and conceptual.** The most dangerous failure mode is not a
broken hash — it is the system working perfectly while certifying something it
was never able to certify.

---

## Threat actors considered

- **A. Outsider** — no repo access. (Read-only; can only attack published artifacts.)
- **B. Contributor** — can open PRs.
- **C. Maintainer** — can merge / push to `main`.
- **D. Supply chain** — a compromised dependency, action, or build tool.
- **E. Operators** — the team itself, via mistakes or omissions.
- **F. The community / scholarly world** — attacks the *legitimacy*, not the bytes.

---

## Findings

### CRITICAL

**C-1. The human gate may be silently inert (CODEOWNERS placeholders).**
`.github/CODEOWNERS` still contains `@AHAU-ai/lineage-review` and
`@REPLACE-with-stanzione-handle`. GitHub does not hard-fail on unknown owners — it
quietly drops invalid entries. If shipped unfilled, **the required-review gate
can evaluate to "no required reviewers," and the entire human half of the
governance silently does nothing.** No error, no warning.
*Actor:* E. *Feasibility:* certain if shipped as-is. *Impact:* total loss of the
human authority gate.
*Fix:* replace every placeholder with real handles/teams; confirm in the repo's
Settings → Branches that "Require review from Code Owners" is on and that GitHub
shows the owners as valid. Treat an unresolved CODEOWNERS as a release blocker.

**C-2. The entire gate is contingent on a repo setting that lives nowhere in the files.**
CI, CODEOWNERS, the two witnesses — none of it is enforced unless **branch
protection on `main` requires it.** That is a GitHub settings toggle, invisible
in the repo, easy to forget, and trivial to disable. Without it, a maintainer
pushes straight to `main`, bypassing CI and review entirely. Everything we built
is a *recommendation* until that switch is on.
*Actor:* C/E. *Feasibility:* high (default repos have no protection). *Impact:*
full bypass of all automated and human gates.
*Fix:* enable branch protection requiring the "Red-team the Word" check + Code
Owner review + signed commits + linear history; document it; periodically audit
it. Consider an org-level *required workflow* so an individual repo cannot opt out.

### HIGH

**H-1. The canon is executable code, and verifying it RUNS that code.**
Beats live in `.ts` files that the verifier and the Astro build `import`, which
executes their module scope. A malicious PR can put arbitrary code — not just
text — into an arc file (inside the gate functions, or top-level) and it will
**execute in CI and in the build**, with whatever those environments can reach.
The only thing standing between "edit a beat" and "run code in CI" is human
review of a file that mixes 300 lines of gate machinery with the sacred text.
*Actor:* B (if review is weak) / D. *Feasibility:* medium. *Impact:* code
execution in CI/build; potential tampering with the verification result itself.
*Fix (architectural):* separate **data from code.** Store beats as inert JSON
(or similar) that the gate *reads*; let one shared, reviewed verifier be the only
executable surface. Then editing a beat can never execute code, and review of a
beat change is review of *data*, which is far easier to do faithfully. This is
the single most valuable structural change available.

**H-2. The append-only ledger is self-forgeable by anyone who controls the file.**
The hash chain is tamper-evident against *partial* edits (rewrite entry #1 and
every later `prev` link breaks). But a maintainer who controls the whole
`canon.ledger.json` can **recompute the entire chain from genesis** and produce a
fully self-consistent forged history. A hash chain inside the repo proves
internal consistency, not authenticity of origin.
*Actor:* C. *Feasibility:* easy for a maintainer. *Impact:* the "tamper-evident
history" is only evident to someone who already saw an earlier honest state.
*Fix:* **anchor the chain externally.** Require signed git commits/tags on every
ledger update (so each head is attributable and time-anchored in Git's own
object history), or push the head hash to an external transparency log / OTS
timestamp. Without an external anchor, the ledger is a convenience, not a proof.

**H-3. Cryptographic rigor can launder an under-specified authority claim.**
*(The deepest finding — see the section below.)* The machinery makes the
attestation string `"K'iche' Maya ceremonial lineage / Stanzione review
complete"` tamper-proof and independently auditable. It does **not** make it
*true, specific, or community-sanctioned.* A vague claim, sealed and signed and
chained, acquires the *appearance* of rigorous authentication it has not earned.
*Actor:* F. *Feasibility:* n/a (it is a category error baked into the design).
*Impact:* the strongest reputational/ethical risk in the project.
*Fix:* see "The deepest finding."

### MEDIUM

**M-1. Canonicalization-injection: beat fields are not screened for the seal's separators.**
The seal joins fields with U+241F / U+241E / U+241D, asserted to "not occur in
prose" — but nothing *enforces* that. A field containing those code points (or
other control/format characters) could create canonicalization ambiguity. The
NFC check does not catch control characters.
*Fix:* in `verifyCanon`, reject any beat field containing the separator code
points or C0/C1 control characters; assert printable + the known punctuation set.

**M-2. Supply chain is pinned by tag, not digest; CI uses `npm install`, not `npm ci`.**
`actions/checkout@v4` and `actions/setup-node@v4` are mutable tags; a compromised
tag would run in CI. Since the verifier *is* run by `tsx`/esbuild, a malicious
build tool could make verification pass on a drifted canon. The coreutils
`SHA256SUMS` path is the saving grace — it lets a human verify *without* the
toolchain.
*Fix:* pin actions to commit SHAs (Dependabot already configured to bump them);
commit `package-lock.json` and switch CI to `npm ci`; in the most paranoid mode,
have CI assert seals via `sha256sum -c SHA256SUMS` (coreutils) in addition to the
JS verifier, so the two disagree if the toolchain is compromised.

**M-3. The signature, once added, has narrow scope and no resilience.**
A signature over the corpus root vouches for *the set of arc seals* — not the
verifier code, CI config, CODEOWNERS, or ledger. A maintainer could keep a valid
signature while changing the *verifier* maliciously. And it is a **single key**:
no rotation, no revocation, no threshold (M-of-N) signing. Lose or compromise the
one key and authority collapses or forges.
*Fix:* sign a manifest that also covers the verifier + gate config hashes;
require signed commits (which sign the whole tree); adopt 2-of-3 lineage signing
for live publication; document key storage, rotation, and revocation.

**M-4. The publication gate prevents *empty* attestation, not *false* attestation.**
It checks the attestation/review/link strings are non-placeholder. It cannot
check that the review *happened* or that the lineage authority is *real*. The
signature binds the claim to a key; it does not validate the claim's substance.
*Fix:* none possible in code — this is correctly a human responsibility. State it
loudly so the seal is never mistaken for proof of review.

**M-5. Sacred text and contemporary interpretation are sealed with equal authority.**
Each beat's `script` (paraphrased Popol Wuj) and `application` (present-day
interpretation, co-authored with an AI) are bound under one seal and one
attestation. A reader cannot tell, from the cryptographic framing, where faithful
transmission ends and editorial commentary begins — yet they carry identical
sealed authority.
*Fix:* separate the trust levels — e.g., attest/sign the `script` layer at one
level and mark `application` explicitly as interpretation, or seal them under
distinct provenance so the interpretation never borrows the canon's authority.

### LOW

- **L-1. Textual-source provenance is undocumented.** Scripts paraphrase
  Christenson/Tedlock with no per-beat citation or rights record. Faithfulness is
  asserted without a trail to the translations it derives from.
- **L-2. No retraction mechanism.** If a live arc is later found unfaithful, there
  is no `status: retracted` ledger event; only forward correction.
- **L-3. Self-reported timestamps.** Ledger `ts` and `sealedAt` are not from a
  trusted clock; backdating is possible (low value to an attacker).
- **L-4. No algorithm agility.** SHA-256 / Ed25519 are hard-coded; migration would
  be manual if either were ever weakened.
- **L-5. Bus factor.** Authority rests on one builder and one reviewer with no
  documented succession for the key or the lineage role.

---

## What the system genuinely defends (so this is balanced)

These attacks were attempted and **failed** — they are real, earned guarantees:

- Accidental drift in any beat → caught by both the in-file seal and the external
  seal (proven: one changed character fails).
- Runtime mutation (rewrite/inject/delete/push/pop/index-swap/defineProperty) →
  all blocked, asserted by value (sabotage 10/10).
- A gimmicked in-file hash hiding a tampered beat → caught by the independent
  witness against the external seal (proven on two arcs).
- Structural corruption, phase reordering, missing load-bearing nodes,
  foreign-field terms → fail-closed before any read.
- A `live` arc with placeholder attestation → publication refused (proven).
- Anyone, trusting none of this code, can verify the bytes with `sha256sum -c`.

The cryptographic and structural core is solid. The failures above are at the
seams: human settings, the data/code boundary, external anchoring, and meaning.

---

## The deepest finding (H-3, expanded)

Every other finding has a fix. This one is a standing tension to be managed, not
closed.

The project takes sacred, lineage-held material and wraps it in an apparatus of
cryptographic seals, two-witness verification, hash-chained ledgers, and
signatures. That apparatus is *real* and it does real work: it prevents drift,
tampering, and silent rewrites. But it operates entirely on **form**, never on
**substance**. It can prove that a string did not change. It cannot prove the
string is true, that the review occurred, that the authority is genuine, or that
the K'iche' community whose inheritance this is has sanctioned the publication.

The danger is *transference of credibility.* A reader — or an institution, or a
funder — who sees SHA-256 roots, an append-only ledger, and a signature will
reasonably infer that the *content* has been rigorously authenticated. It has
not. Only its *integrity* has. The rigor of the container can lend unearned
authority to whatever is placed inside it, including a claim as thin as a
four-word lineage descriptor.

For ordinary software this is a footnote. For sacred material attributed to a
living people, it is the central ethical risk: **the machine can make an
unauthorized or contested claim look authoritative.** The mitigations are not
cryptographic:

1. Make the human authority *specific and verifiable* — named attesting persons,
   the actual community body that sanctioned publication, a documented
   relationship to the cooperative — not a generic descriptor.
2. State plainly, in the published surface itself, what the seals do and do not
   certify ("this proves the text has not changed; it does not prove the text is
   right").
3. Keep the AI's role in producing the paraphrases and applications transparent,
   so fluent text is never mistaken for verified transmission.
4. Let the lineage hold a veto that no green checkmark can override — which the
   design already gestures at, and which must remain the final word.

The system is at its best when it is *humble about its own scope.* Its honest
tagline is the one already in the docs: the machine guarantees integrity; the
lineage guarantees truth. The red-team warning is simply that an impressive
machine makes that distinction easy for others to forget.

---

## Prioritized remediation

1. **Block release on CODEOWNERS + branch protection** (C-1, C-2) — without these,
   nothing else matters.
2. **Separate data from code** (H-1) — move beats to inert JSON; one reviewed verifier.
3. **Anchor the ledger** (H-2) — signed commits/tags or an external timestamp.
4. **Make the authority claim specific** (H-3) — and state the seal's limits on the
   reading surface.
5. **Harden supply chain** (M-2) — SHA-pin actions, `npm ci`, coreutils cross-check in CI.
6. **Screen beat fields** (M-1); **separate script vs application trust** (M-5);
   **broaden + harden signing** (M-3).
7. Document source provenance, retraction, key lifecycle (L-1, L-2, L-5).

— End of report. Maltyox.

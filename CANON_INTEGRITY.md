# Canon Integrity

How the Popol Wuj descent canon is kept faithful under version control. The
principle: **the canon cannot be rewritten — only entered, applied, and
deliberately re-sealed after lineage review.** This document is the contract
that enforces that across commits and merges.

## The two-layer gate

A complete gate needs a machine layer and a human layer, because they catch
different failures.

**Machine layer — `.github/workflows/canon-integrity.yml` (job: "Red-team the
Word").** Runs `npm run verify:canon` on every pull request and push to `main`.
The canon file verifies itself at load, in four independent layers, and exits
non-zero if any breaks — which blocks the merge:

1. **Deep-freeze** — every field, at every depth, is frozen at runtime.
2. **Invariant gate** — sequential numbering, contiguous phases, the six houses
   in Christenson order, the Bat House last and losing the head, the
   load-bearing nodes present (Reversal, TwinHeads of Maize, IxK'ik's blinding
   offering, the tune Junajpu K'oy, the Rising), and **lineage integrity** (no
   foreign-field term may enter the K'iche' canon).
3. **Cryptographic seal** — a SHA-256 over the exact text of all beats. One
   changed character anywhere ⇒ `CANON DRIFT` ⇒ refuses to run.
4. **Sabotage suite** — ten attacks on immutability (rewrite, inject, delete,
   push/pop/splice, index-swap, `Object.assign`, `defineProperty`, drift
   detection, seal determinism), each asserted **by value**, not by a caught
   exception.

**Human layer — `.github/CODEOWNERS`.** The seal proves text and digest agree;
it does not prove the change is *faithful*. Only a person can certify that.
Changes to the canon or the re-seal tooling require review by the K'iche'
lineage holder (Dr. Vincent James Stanzione). Enable "Require review from Code
Owners" in branch protection.

## Exit-code contract

- `0` — canon verified; safe to merge.
- `1` — a breach (drift, invariant violation, foreign-field term, or sabotage
  failure). The error names the exact cause and the program refuses to walk.

## Amending the canon (the only sanctioned procedure)

1. Edit the relevant beat's `script` or `application` field.
2. Run `npm run verify:canon`. It will report **`CANON DRIFT`** — expected,
   because the text no longer matches the old seal. This friction is the point.
3. Re-seal deliberately: `npm run reseal:canon`. (Re-sealing first runs the
   invariant + lineage gate, so a structurally invalid or off-field canon
   cannot be sealed at all.)
4. Commit the amended canon **and** the new seal together.
5. Open a PR. The machine gate re-verifies; the CODEOWNERS gate requires the
   lineage holder's approval. Only then can it merge.

## Branch protection setup (one time)

Settings → Branches → add a rule for `main`:

- Require status checks to pass → select **Red-team the Word**.
- Require review from Code Owners.
- (Recommended) Require signed commits.

## Local pre-commit (optional)

To catch drift before it ever reaches CI:

```sh
echo 'npm run verify:canon' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

Maltyox. Saq be'.

---

## Threat model (what each layer defends, and the residual risk)

The gate is built from layers that fail independently, so defeating it means
defeating several at once — and the last layer is a human.

| Threat | Caught by | How |
|---|---|---|
| Accidental edit / drift | in-file seal + external seal | one changed character ⇒ both hashes move ⇒ `CANON DRIFT` / external mismatch |
| Runtime mutation (push, delete, reassign, `defineProperty`, …) | deep-freeze + sabotage suite | 10 attacks, each asserted **by value** |
| Structural corruption (numbering, phase order, the six houses, missing nodes) | invariant gate | throws `CANON VIOLATION` before any read |
| Cross-traditional content | lineage-integrity gate | foreign-field terms rejected (e.g. "Zeus" in a beat) |
| **Self-certified tamper** (gimmick the canon's own `canonicalize`, edit a beat, reseal in-file) | **witness 2 (independent)** | a separate verifier with its own hashing checks the external `canon.seal`; names the exact changed beat — *verified: witness 1 is fooled, witness 2 catches it* |
| Gut the workflow in a PR (keep the job name, strip steps) | required-check-by-name + CODEOWNERS on `.github/` | a renamed/removed job never reports success; a gutted job is a reviewed `.github/` change |
| Supply-chain (mutated action tag, leaked token) | SHA-pinning + Dependabot + `persist-credentials:false` + read-only permissions | pinned actions, token not exposed to later steps |

### Residual risk — and why the human gate is final

No machine check can distinguish a **faithful** amendment from an
**authorized-looking malicious** one: an actor who edits a beat, re-mints both
seals, and (to beat witness 2) also edits the verifier can produce a
self-consistent commit. What they **cannot** do is hide it — every such move
touches a CODEOWNERS-protected file (`popol-wuj-the-descent.ts`, `canon.seal`,
`scripts/`, `.github/`) and surfaces plainly in the diff, with the per-beat
manifest pointing the reviewer straight at what moved. The machine raises the
cost and the visibility; **Dr. Stanzione's review is the load-bearing
authority.** That is by design: the canon is K'iche', and only the lineage can
certify that a change to it remains faithful.

---

## The corpus (multiple arcs under one gate)

The canon is now a corpus of independently sealed arcs:

- `popol-wuj-the-descent.ts` — the Hero Twins' descent into Xibalba (25 beats).
- `popol-wuj-wuqub-kakix.ts` — the false sun humbled before the dawn (15 beats).

Each arc is a **self-contained, self-sealing** file: its own deep-freeze,
invariant gate, in-file seal, and sabotage suite. They deliberately share no
gate code, so a flaw in one arc's gate cannot weaken another — independence over
DRY, by design.

They ride one shared gate:

- **External seal** — `canon.seal` is a per-arc keyed map (keyed by
  `corpusVersion`), each entry holding the aggregate seal + per-beat manifest.
- **Independent witness** — `scripts/verify-canon.ts` holds a registry of every
  arc, re-hashes each with its own logic, and checks each against its
  `canon.seal` entry. Verified: a self-certified tamper in either arc (gimmick
  the in-file hash + reseal) passes that arc's witness 1 but is caught by
  witness 2, which names the exact beat.
- **CI** — `npm run verify:canon` runs witness 1 for every arc;
  `verify:canon:independent` runs witness 2 over the whole registry.
- **CODEOWNERS** — every arc file and `canon.seal` require lineage review.

### Adding a new arc

1. Copy an existing arc file; replace the beats, the `PROVENANCE.corpusVersion`,
   and the arc-specific `REQUIRED_NODES`.
2. Mint its in-file seal: `tsx <new-arc>.ts --seal`, paste into `CANON_SEAL`.
3. Add the file to the registry in `scripts/verify-canon.ts` and to the `tsc`
   `include` list, then regenerate the external seal: `tsx scripts/verify-canon.ts --write`.
4. Add `verify`/`seal`/`reseal` script lines and a CODEOWNERS entry.

### Lineage note

The star cluster is named **Motz** (its K'iche' name), never "Pleiades" — the
canon may not import another tradition's names, and the lineage-integrity gate
rejects them.

---

## La Baluka integration (build gate + publication governance)

This corpus is wired into **github.com/AHAU-ai/la_Baluka** (Astro), not The Elder.

### Build gate — the site cannot build on a broken canon

`integrations/canon-gate.mjs` runs the corpus gate in Astro's `astro:build:start`
hook and throws to abort the build if any arc has drifted, is unsealed, carries
a foreign-field term, or is `live` without full attestation. Add it in
`astro.config.mjs` (see `astro.config.canon-gate.example.mjs`):

```js
import canonGate from "./integrations/canon-gate.mjs";
export default defineConfig({ integrations: [canonGate()] });
```

Because the arc modules also self-verify at import, even build-time
`import { POPOL_WUJ }` into an `.astro` page fails closed on drift. An npm
`prebuild` script is wired too, but the integration is the real enforcer — it
can't be bypassed by calling `astro build` directly.

### Publication governance — the stela rule, in code

Each arc's `PROVENANCE.governance` carries `status` (`draft` | `review` |
`live`), `attestation` (K'iche' author), `lineageReview` (Dr. Stanzione), and
`cooperativeLink`. **These fields are bound into the seal**, so none can change
silently. The publication gate (in `verify-canon.ts`, and so in the build gate)
enforces: an arc may be **`live` only if all three are present and concrete** —
no `PENDING`/`FILL`/`REPLACE` placeholders. This is La Baluka's rule that no
stela goes live without K'iche' author attestation, lineage review, and a
cooperative link.

Current state: both arcs are `status: "review"` — authorship attested, awaiting
the recorded attesting identity, Dr. Stanzione's lineage review, and the
cooperative link.

### Publishing an arc (draft → live)

1. Fill `governance.attestation`, `lineageReview`, and `cooperativeLink` with
   concrete values; set `status: "live"`.
2. Re-seal that arc: `npm run reseal:wuqub` (or `reseal:descent`) — this updates
   the in-file seal and regenerates `canon.seal`. Re-sealing a `live` arc with
   any placeholder is **refused**.
3. Commit; the two-witness gate + CODEOWNERS lineage review run before merge,
   and the build gate runs before deploy.

---

## Publication integrity (steel-manned: bullet-proof, air-tight, holds water)

Sealing proves a canon hasn't *drifted*. Publishing adds four guarantees so the
*published* corpus is independently auditable, tamper-evident over time, and
attributable — not merely internally consistent.

### 1. Corpus root — the SET of arcs is bound
`canon.seal` carries a `corpusRoot`: one SHA-256 over the sorted arc seals. An
arc cannot be silently dropped or added — the root changes and the verifier
fails. (Proven: removing an arc or editing the root breaks `verify:canon:independent`.)

### 2. SHA256SUMS — anyone can verify, trusting no code here
`dist/<arc>.canonical` holds the *exact sealed bytes* of each arc; the coreutils
hash of that file **equals** the arc's seal. So a third party — Dr. Stanzione, a
cooperative member, an outside auditor — verifies the whole corpus with:

```sh
sha256sum -c SHA256SUMS
```

No Node, no tsx, no trust in this repo's JavaScript. The verifier separately
confirms `dist/*.canonical` matches the live source, so the canonical files
can't go stale or be forged.

### 3. Publication ledger — tamper-evident history
`canon.ledger.json` is an append-only hash chain. Each entry records the corpus
root, per-arc seals, statuses, and timestamp, and links to the previous entry by
hash. A rewritten past entry breaks every entry after it. `verify-publication`
checks the chain and that the **head entry's root equals the current
`canon.seal` root** — so a re-seal that wasn't recorded as a publication fails.
Record a publication with `npm run publish:canon` (it runs the full gate first,
then appends; it never rewrites history). (Proven: tampering entry #0 →
"hash does not match"; re-seal without publish → "published state is not recorded".)

### 4. Detached signature — attributable authority
Integrity is not authority: the seal proves the attestation *string* exists and
hasn't drifted, not *who* stands behind it. To close that gap, the lineage holder
signs the corpus root with an Ed25519 key:

```sh
openssl genpkey -algorithm ed25519 -out lineage_key.pem   # kept OFF the repo
openssl pkey -in lineage_key.pem -pubout -out canon.pubkey # commit once
node scripts/sign-publication.mjs lineage_key.pem          # writes canon.sig each publication
```

Once `canon.pubkey` is committed, `verify-publication` **requires** a valid
`canon.sig` over the corpus root — an invalid or missing signature fails the
build. Until a key is provisioned, the corpus is reported **UNSIGNED**: integrity
is enforced, authority is asserted but not yet cryptographically proven. (Proven:
valid signature verifies; a one-character corruption is rejected.)

### Unicode floor
Every beat field must be NFC-normalized; the verifier rejects decomposed or
homoglyph forms that could pass visual review. Lineage integrity already rejects
foreign-field terms, including the Greek "Pleiades" (the canon uses **Motz**).

### What the gate still cannot do — and where authority lives
A fully self-consistent malicious commit (text + seals + ledger entry + a
signature from a compromised key) remains *possible* but **cannot be hidden**:
every move touches a CODEOWNERS-protected file and shows in the diff, the ledger
preserves the prior published state, and the signature names the key that signed.
The machine guarantees integrity, history, and attribution; **Dr. Stanzione's
review and signing key are the load-bearing authority.** That is by design.

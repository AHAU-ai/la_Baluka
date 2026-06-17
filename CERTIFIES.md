# What the seal certifies — and what it does not

This corpus carries cryptographic seals, a corpus root, an append-only ledger,
and (when provisioned) threshold signatures. Those mechanisms are real, but their
scope is narrow and must not be overread. This file is bound into
`canon.manifest.json`; it cannot be silently removed without invalidating the
publication.

## The machinery DOES certify

- **Integrity.** The text of each beat has not changed since sealing. A single
  altered character fails verification.
- **Set-completeness.** Exactly the recorded arcs are present — none added or
  dropped — bound by the corpus root.
- **Layer distinction.** The faithful *transmission* (script) and the
  contemporary *interpretation* (application) are hashed separately, so the two
  are never conflated under one undifferentiated authority.
- **Tool integrity.** The verifier, the gate, and the governance config are
  hashed into the manifest; altering them invalidates the signature.
- **Tamper-evident history.** Publication events are chained; a rewritten past
  entry breaks the chain.
- **Attributability** (once signed). A threshold of named keys vouched for this
  exact manifest.

## The machinery DOES NOT certify

- **Truth or faithfulness.** No hash can confirm the paraphrase is accurate to
  the Popol Wuj, or that the interpretation is sound. That is the lineage's
  judgment, not the machine's.
- **That a review actually happened.** The gate requires a *named* reviewer and
  attestor; it cannot confirm they did the work. The signature binds the claim
  to a key — it does not validate the claim's substance.
- **Community sanction.** Cryptographic rigor is not cultural legitimacy. A
  sealed claim of lineage authority is not evidence that the K'iche' community,
  or any authorized body within it, has sanctioned this publication.
- **Provenance of the source translations.** The scripts paraphrase published
  translations; this system does not establish rights or citation for them.
- **The standing of the interpretation.** The `application` layer is
  contemporary commentary, developed with AI assistance. It is sealed for
  integrity, not endorsed as doctrine.

## The one sentence

The machine guarantees the word did not change; the lineage guarantees the word
is true. A reader who mistakes the first for the second has been misled — and the
purpose of this document is to make that mistake impossible to make honestly.

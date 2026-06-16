# Incident & recovery runbook

For when something we did NOT foresee goes wrong. Bias to fail-safe.

## 1. Contain
`npm run hold "<what you observed>"` — every gate now fails closed. Do this
first, even before you understand the problem. Holding costs nothing; serving a
corrupted or contested word costs everything.

## 2. Assess
- Integrity surprise → `npm run verify:all`, read which layer failed.
- Structural surprise → `npm run canary` (what is *different*, not just *invalid*).
- Content/faithfulness surprise → lineage review of the specific beat(s).
- Authority/legitimacy surprise → stop; this is not a code problem.

## 3. Act
- Correct: edit `canon/*.json`, `verify-canon --write`, re-baseline canary
  **deliberately** and review the diff, re-build manifest, re-sign, publish.
- Withdraw: `npm run retract <arc|all> "<reason>" "<attestor>"` — published-then-
  withdrawn, never erased.
- Key compromise: rotate keys in `canon.pubkeys.json`, raise the threshold, re-sign.

## 4. Release the hold
Only after a human is satisfied: `npm run hold --release "<reason>"`, then
`npm run verify:all`.

## Succession (bus factor)
The signing keys and the lineage-holder role must have a documented successor.
A single point of authority is a single point of failure; record who inherits
the key and the accountability if the current holder is unavailable.

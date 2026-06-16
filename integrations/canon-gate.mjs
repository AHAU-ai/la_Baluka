import { execFileSync } from "node:child_process";

/**
 * canon-gate — Astro integration for la_Baluka.
 *
 * Verifies the sealed canon corpus BEFORE the site builds. If any arc has
 * drifted from its seal, is unsealed, carries a foreign-field term, or is
 * marked `live` without K'iche' author attestation + lineage review +
 * cooperative link, the build is aborted (fail-closed).
 *
 * This runs in `astro:build:start`, so it cannot be skipped the way an npm
 * `prebuild` script can be bypassed by invoking `astro build` directly. The
 * arc modules also verify themselves at import (deep-freeze + invariants +
 * seal), so even page rendering fails closed on a drifted canon — this gate
 * adds the independent witness and the publication rule up front.
 *
 * Usage — astro.config.mjs:
 *   import { defineConfig } from "astro/config";
 *   import canonGate from "./integrations/canon-gate.mjs";
 *   export default defineConfig({ integrations: [canonGate()] });
 */
export default function canonGate() {
  return {
    name: "canon-gate",
    hooks: {
      "astro:build:start": ({ logger }) => {
        const log = logger ?? console;
        log.info?.("canon-gate: verifying the sealed canon corpus…");
        try {
          execFileSync("npm", ["run", "verify:gate"], { stdio: "inherit" });
        } catch {
          throw new Error(
            "canon-gate: the canon corpus failed verification — build aborted (fail-closed). " +
            "The Popol Wuj cannot be published drifted, unsealed, or unattested."
          );
        }
      },
    },
  };
}

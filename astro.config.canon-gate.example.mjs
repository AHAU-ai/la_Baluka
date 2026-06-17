// Merge this into la_Baluka's astro.config.mjs.
import { defineConfig } from "astro/config";
import canonGate from "./integrations/canon-gate.mjs";

export default defineConfig({
  integrations: [
    canonGate(), // verifies the sealed canon corpus at build:start (fail-closed)
    // …your existing integrations
  ],
});

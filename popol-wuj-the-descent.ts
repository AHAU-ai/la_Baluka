/**
 * popol-wuj-the-descent.ts — thin typed loader. The canon prose is the inert JSON in
 * canon/; this file holds NO text and NO bespoke gate (RED-TEAM H-1). Importing
 * it runs only the shared, reviewed lib/canon-core loader over data.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadArc } from "./lib/canon-core.ts";

const here = dirname(fileURLToPath(import.meta.url));
export const ARC = loadArc(resolve(here, "canon/popol-wuj-the-descent.json"));
export const POPOL_WUJ = ARC.beats;
export const PROVENANCE = ARC.provenance;

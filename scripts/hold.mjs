#!/usr/bin/env node
/**
 * hold.mjs — global kill-switch for any UNFORESEEN condition. While canon.hold
 * exists, every gate (verify, write, publish, preflight) fails closed and loud.
 * Fail-safe by default: when in doubt, hold; nothing serves as authoritative.
 *   node scripts/hold.mjs "reason for the hold"
 *   node scripts/hold.mjs --release "reason for releasing"
 */
import { writeFileSync, existsSync, rmSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOLD = resolve(ROOT, "canon.hold"), LOG = resolve(ROOT, "canon.hold.log");
const args = process.argv.slice(2);
const stamp = new Date().toISOString();
if (args[0] === "--release") {
  if (existsSync(HOLD)) rmSync(HOLD);
  appendFileSync(LOG, `${stamp}\tRELEASE\t${args.slice(1).join(" ") || "(no reason)"}\n`);
  console.log("hold: released. Re-run verify:all before trusting the corpus again.");
} else {
  const reason = args.join(" ") || "manual hold";
  writeFileSync(HOLD, reason + "\n", "utf8");
  appendFileSync(LOG, `${stamp}\tHOLD\t${reason}\n`);
  console.log(`hold: ACTIVE — ${reason}. All gates now fail closed.`);
}

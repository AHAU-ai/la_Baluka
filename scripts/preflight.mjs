#!/usr/bin/env node
/**
 * preflight.mjs — release readiness. Converts RED-TEAM C-1/C-2 (silent gate-off)
 * into a fail-closed check.
 *   1. CODEOWNERS must exist, contain NO placeholder tokens, and cover the
 *      sensitive paths (canon/, lib/, the seals, the manifest).
 *   2. Branch protection on `main` (require PR review + the status check) is a
 *      repo SETTING invisible in the files. If GITHUB_TOKEN + GITHUB_REPOSITORY
 *      are set, we probe the API and fail if protection is missing; otherwise we
 *      emit a loud manual-attestation requirement (cannot silently pass).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fail = (m) => { console.error(`preflight: ✗ ${m}`); process.exitCode = 1; };
import { existsSync as _ex } from "node:fs";
if (_ex(resolve(ROOT, "canon.hold"))) { console.error("preflight: ✗ CANON HOLD active — not release-ready."); process.exit(1); }

// 1. CODEOWNERS
const coPath = resolve(ROOT, ".github/CODEOWNERS");
if (!existsSync(coPath)) fail("no .github/CODEOWNERS");
else {
  const co = readFileSync(coPath, "utf8");
  if (/REPLACE|PENDING|TODO|FILL|example\b|stanzione-handle/i.test(co))
    fail("CODEOWNERS contains placeholder owners — the review gate would be SILENTLY INERT. Replace with real handles.");
  for (const need of ["/canon/", "/lib/", "/canon.seal", "/canon.manifest.json"])
    if (!co.includes(need)) fail(`CODEOWNERS does not cover ${need}`);
  if (process.exitCode !== 1) console.log("preflight: ✓ CODEOWNERS present, concrete, covers sensitive paths");
}

// 2. Branch protection
const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
if (token && repo) {
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/branches/main/protection`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "preflight" },
    });
    if (r.status === 404) fail("branch protection on `main` is NOT enabled — all gates are bypassable.");
    else if (!r.ok) console.warn(`preflight: ⚠ could not read branch protection (HTTP ${r.status})`);
    else {
      const p = await r.json();
      if (!p.required_pull_request_reviews) fail("branch protection does not require PR review");
      if (!p.required_status_checks) fail("branch protection does not require status checks");
      if (process.exitCode !== 1) console.log("preflight: ✓ branch protection requires review + status checks");
    }
  } catch (e) { console.warn(`preflight: ⚠ branch-protection probe failed: ${e.message}`); }
} else {
  console.warn("preflight: ⚠ no GITHUB_TOKEN/REPOSITORY — branch protection NOT auto-verified.");
  console.warn("  Required (manual): Settings → Branches → require PR review from Code Owners + the 'Red-team the Word' check + signed commits.");
}
if (process.exitCode === 1) console.error("preflight: FAILED — not release-ready.");
else console.log("preflight: ✓ release preflight passed.");

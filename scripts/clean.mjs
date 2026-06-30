// Junction-safe clean of the Next.js build cache.
// Empties the CONTENTS of .next without removing the directory itself, so a
// directory junction created by setup-local-cache.ps1 (to keep .next out of
// OneDrive sync) survives `npm run clean` / `npm run dev:clean`.
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const dir = ".next";

try {
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
  console.log("Cleaned .next (junction/dir preserved).");
} catch (err) {
  if (err.code !== "ENOENT") throw err;
  // .next does not exist yet — nothing to clean.
}

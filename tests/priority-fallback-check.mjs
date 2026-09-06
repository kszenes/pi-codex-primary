import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../extensions/multi-sub.ts", import.meta.url), "utf8");

assert.match(source, /type PoolStrategy = "priority"/);
assert.match(source, /getPreferredMember\([\s\S]*?getAvailableMembers\(pool, authStorage\)\[0\]/);
assert.match(source, /strategy === "priority"[\s\S]*?preferred !== ctx\.model\.provider[\s\S]*?safeSetModel/);
assert.match(source, /await this\.resolveExhaustedMs\(currentModel\.provider, errorMessage, ctx\)/);
assert.match(source, /codexQuotaChecker\.check\(/);
assert.doesNotMatch(source, /MAX_EXHAUSTED_MS|Math\.min\(Math\.max\(ttlMs/);
assert.match(source, /pi\.on\("model_select"[\s\S]*?updateQuotaFooter/);
assert.match(source, /syncPriorityExhaustion\([\s\S]*?fiveHourLeft === 0[\s\S]*?weeklyLeft === 0/);
assert.match(source, /theme\.bold\(`\$\{Math\.round\(remaining\)\}%`\)/);
assert.match(source, /formatQuotaFooterWindow\(ctx, "5h", result\.fiveHourLeft, result\.fiveHourResetAt\)/);
assert.match(source, /formatQuotaFooterWindow\(ctx, "7d", result\.weeklyLeft, result\.weeklyResetAt\)/);
assert.match(source, /remaining <= 20[\s\S]*?fg\("error"[\s\S]*?remaining <= 50[\s\S]*?fg\("warning"[\s\S]*?fg\("success"/);
assert.match(source, /`~\$\{days\}d\$\{hours > 0 \? `\$\{hours\}h` : ""\}`/);
assert.match(source, /`~\$\{hours\}h\$\{minutes > 0 \? `\$\{minutes\}m` : ""\}`/);

function recoveryResetAt(windows, now) {
  const future = windows.filter((window) => window.resetAt > now);
  if (future.length === 0) return undefined;
  const highestUsage = Math.max(...future.map((window) => window.usedPercent));
  return Math.max(...future.filter((window) => window.usedPercent === highestUsage).map((window) => window.resetAt));
}

assert.equal(
  recoveryResetAt([
    { usedPercent: 100, resetAt: 10_000 },
    { usedPercent: 40, resetAt: 50_000 },
  ], 1_000),
  10_000,
  "the limiting five-hour window controls recovery",
);
assert.equal(
  recoveryResetAt([
    { usedPercent: 100, resetAt: 10_000 },
    { usedPercent: 100, resetAt: 50_000 },
  ], 1_000),
  50_000,
  "all simultaneously limiting windows must reset",
);

class PriorityPool {
  constructor(resetAt) {
    this.members = ["openai-codex", "openai-codex-2"];
    this.resetAt = resetAt;
  }

  preferred(now) {
    return this.members.find((provider) => provider !== "openai-codex" || now >= this.resetAt);
  }
}

const pool = new PriorityPool(5_000);
assert.equal(pool.preferred(4_999), "openai-codex-2", "fallback is used while primary cools down");
assert.equal(pool.preferred(5_000), "openai-codex", "primary returns exactly at reset");

console.log("priority fallback checks passed");

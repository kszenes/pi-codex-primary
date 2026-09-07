import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../extensions/multi-sub.ts", import.meta.url), "utf8");

assert.match(source, /pi\.on\("session_start"[\s\S]*?updateQuotaFooter/);
assert.match(source, /pi\.on\("model_select"[\s\S]*?updateQuotaFooter/);
assert.match(source, /formatQuotaFooterWindow\(ctx, "5h", result\.fiveHourLeft, result\.fiveHourResetAt\)/);
assert.match(source, /formatQuotaFooterWindow\(ctx, "7d", result\.weeklyLeft, result\.weeklyResetAt\)/);
assert.match(source, /remaining <= 20[\s\S]*?fg\("error"[\s\S]*?remaining <= 50[\s\S]*?fg\("warning"[\s\S]*?fg\("success"/);
assert.doesNotMatch(source, /type PoolStrategy = "priority"/);

console.log("quota footer checks passed");

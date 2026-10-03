import assert from "node:assert/strict";
import { test } from "node:test";
import { monthlyHistory } from "../src/features/habit/monthlyHistory";

test("月別の達成日数: 年・月を分け、重複や存在しない日付を数えない", () => {
  const months = monthlyHistory(
    [
      "2026-01-01",
      "2026-01-01",
      "2026-01-31",
      "2026-02-01",
      "2026-02-29",
      "2025-01-01",
    ],
    2026,
  );
  assert.equal(months.length, 12);
  assert.deepEqual(months[0], { month: 1, done: 2, total: 31 });
  assert.deepEqual(months[1], { month: 2, done: 1, total: 28 });
  assert.deepEqual(months[11], { month: 12, done: 0, total: 31 });
});
test("月別の達成日数: うるう年と記録がない年", () => {
  assert.deepEqual(monthlyHistory(["2024-02-29"], 2024)[1], {
    month: 2,
    done: 1,
    total: 29,
  });
  assert.equal(
    monthlyHistory([], 2025).reduce((sum, month) => sum + month.done, 0),
    0,
  );
});

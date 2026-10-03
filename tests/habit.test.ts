import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HABIT_COLORS,
  HABIT_ICONS,
  MAX_HABITS,
  canAddHabit,
  isHabitColor,
  isHabitIcon,
  isValidDateString,
  monthlyProgress,
  nextSortOrder,
  validateHabitName,
  validateMemoText,
} from "../src/features/habit/model";

test("habits: 空白のみ・21文字以上の名前を拒否し、前後の空白を除く", () => {
  assert.equal(validateHabitName("  ランニング  "), "ランニング");
  assert.equal(validateHabitName(""), null);
  assert.equal(validateHabitName("   "), null);
  assert.equal(validateHabitName("あ".repeat(20)), "あ".repeat(20));
  assert.equal(validateHabitName("あ".repeat(21)), null);
});

test("habits: 登録上限は8件", () => {
  assert.equal(MAX_HABITS, 8);
  assert.equal(canAddHabit(7), true);
  assert.equal(canAddHabit(8), false);
  assert.equal(canAddHabit(9), false);
});

test("habits: 並び順は既存の最大値の次になる", () => {
  assert.equal(nextSortOrder([]), 0);
  assert.equal(nextSortOrder([{ sortOrder: 0 }, { sortOrder: 2 }]), 3);
});

test("habits: 色とアイコンはプリセットのみ許可", () => {
  assert.equal(isHabitColor(HABIT_COLORS[0]), true);
  assert.equal(isHabitColor("#000000"), false);
  assert.equal(isHabitIcon(HABIT_ICONS[0]), true);
  assert.equal(isHabitIcon("unknown-icon"), false);
});

test("habit_logs: 日付はYYYY-MM-DD形式のみ許可", () => {
  assert.equal(isValidDateString("2026-10-04"), true);
  assert.equal(isValidDateString("2026/10/04"), false);
  assert.equal(isValidDateString("2026-10-4"), false);
  assert.equal(isValidDateString(""), false);
});

test("habit_memos: 空・201文字以上を拒否し、200文字までは許可", () => {
  assert.equal(validateMemoText("  今日は調子が良い  "), "今日は調子が良い");
  assert.equal(validateMemoText(""), null);
  assert.equal(validateMemoText("   "), null);
  assert.equal(validateMemoText("あ".repeat(200)), "あ".repeat(200));
  assert.equal(validateMemoText("あ".repeat(201)), null);
});

test("今月の進捗: 当月プレフィックスの日付だけを分子として数える", () => {
  assert.deepEqual(
    monthlyProgress(["2026-10-01", "2026-10-15", "2026-09-30"], "2026-10", 31),
    { done: 2, total: 31 },
  );
  assert.deepEqual(monthlyProgress([], "2026-10", 31), { done: 0, total: 31 });
  assert.deepEqual(
    monthlyProgress(new Set(["2026-10-01", "2026-10-01"]), "2026-10", 31),
    { done: 1, total: 31 },
  );
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  habitLabel,
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

test("habits: 名前なしを許可し、21文字以上を拒否し、前後の空白を除く", () => {
  assert.equal(validateHabitName("  ランニング  "), "ランニング");
  assert.equal(validateHabitName(""), "");
  assert.equal(validateHabitName("   "), "");
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
  assert.equal(isHabitIcon(null), false);
  assert.equal(isHabitIcon(""), false);
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

test("スタンプは重複のない100種類で、すべて表示可能", () => {
  const glyphs = JSON.parse(
    readFileSync(
      new URL(
        "../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.equal(HABIT_ICONS.length, 100);
  assert.equal(new Set(HABIT_ICONS).size, 100);
  for (const icon of HABIT_ICONS) {
    assert.equal(isHabitIcon(icon), true);
    assert.equal(typeof glyphs[icon], "number");
  }
});

test("名前なしの目標も読み上げや共有では識別できる", () => {
  assert.equal(habitLabel({ name: "運動", sortOrder: 0 }), "運動");
  assert.equal(habitLabel({ name: "", sortOrder: 2 }), "目標3");
});

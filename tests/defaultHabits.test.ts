import assert from "node:assert/strict";
import { test } from "node:test";
import { initialHabits } from "../src/features/habit/defaultHabits";
import {
  MAX_HABITS,
  isHabitColor,
  isHabitIcon,
  validateHabitName,
} from "../src/features/habit/model";

test("初回には有効な目標8個を登録順に用意する", () => {
  const goals = initialHabits([], 123);
  assert.equal(goals.length, MAX_HABITS);
  assert.equal(new Set(goals.map((goal) => goal.id)).size, MAX_HABITS);
  goals.forEach((goal, index) => {
    assert.equal(goal.sortOrder, index);
    assert.equal(goal.createdAt, 123);
    assert.equal(validateHabitName(goal.name), goal.name);
    assert.ok(isHabitColor(goal.color));
    assert.ok(isHabitIcon(goal.icon));
  });
});

test("固定8枠への移行で既存の目標を変えず不足分だけ補う", () => {
  const defaults = initialHabits([], 123);
  const existing = [
    { ...defaults[0], id: "custom", name: "自分の目標", sortOrder: 12 },
  ];
  const added = initialHabits(existing, 456);
  assert.equal(added.length, 7);
  assert.equal(added[0]?.sortOrder, 13);
  assert.equal(existing[0]?.name, "自分の目標");
  assert.equal(initialHabits(defaults.slice(1), 456)[0]?.id, "default-1");
});

test("8個用意済みなら再起動・編集後も追加しない", () => {
  const defaults = initialHabits([], 123);
  assert.deepEqual(initialHabits(defaults, 456), []);
  assert.deepEqual(initialHabits([...defaults, defaults[0]], 456), []);
});

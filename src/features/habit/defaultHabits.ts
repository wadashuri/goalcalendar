import type { Habit, HabitColor, HabitIcon } from "./model";

const defaults: { name: string; color: HabitColor; icon: HabitIcon }[] = [
  { name: "運動", color: "#FF9F5A", icon: "barbell-outline" },
  { name: "読書", color: "#5AA9E6", icon: "book-outline" },
  { name: "勉強", color: "#F6C945", icon: "pencil-outline" },
  { name: "早起き", color: "#FF6F91", icon: "moon-outline" },
  { name: "水分補給", color: "#7FC8A9", icon: "water-outline" },
  { name: "ストレッチ", color: "#B48EAD", icon: "heart-outline" },
  { name: "片づけ", color: "#8D6E63", icon: "leaf-outline" },
  { name: "日記", color: "#9C8770", icon: "paw-outline" },
];

// 固定8枠への移行で不足分だけ用意し、既存の名前・記録を維持する。
export function initialHabits(existing: Habit[], now: number): Habit[] {
  const missing = Math.max(0, 8 - existing.length);
  const ids = new Set(existing.map((habit) => habit.id));
  const firstOrder =
    existing.reduce((max, habit) => Math.max(max, habit.sortOrder), -1) + 1;
  return defaults
    .map((habit, index) => ({ ...habit, id: `default-${index + 1}` }))
    .filter((habit) => !ids.has(habit.id))
    .slice(0, missing)
    .map((habit, index) => ({
      ...habit,
      sortOrder: firstOrder + index,
      createdAt: now,
    }));
}

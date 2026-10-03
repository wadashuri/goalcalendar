export const MAX_HABITS = 8;
export const MAX_HABIT_NAME_LENGTH = 20;
export const MAX_MEMO_LENGTH = 200;

export const HABIT_COLORS = [
  "#FF9F5A",
  "#FF6F91",
  "#7FC8A9",
  "#5AA9E6",
  "#B48EAD",
  "#F6C945",
  "#8D6E63",
  "#9C8770",
] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

export const HABIT_ICONS = [
  "book-outline",
  "barbell-outline",
  "water-outline",
  "moon-outline",
  "walk-outline",
  "nutrition-outline",
  "pencil-outline",
  "heart-outline",
  "leaf-outline",
  "bicycle-outline",
  "musical-notes-outline",
  "paw-outline",
] as const;
export type HabitIcon = (typeof HABIT_ICONS)[number];

export interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  icon: HabitIcon;
  sortOrder: number;
  createdAt: number;
}

export interface HabitLog {
  habitId: string;
  date: string;
  isOn: boolean;
}

export interface HabitMemo {
  habitId: string;
  date: string;
  text: string;
  updatedAt: number;
}

export function isValidDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isHabitColor(color: string): color is HabitColor {
  return (HABIT_COLORS as readonly string[]).includes(color);
}

export function isHabitIcon(icon: string): icon is HabitIcon {
  return (HABIT_ICONS as readonly string[]).includes(icon);
}

export function validateHabitName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_HABIT_NAME_LENGTH) return null;
  return trimmed;
}

export function canAddHabit(currentCount: number): boolean {
  return currentCount < MAX_HABITS;
}

export function nextSortOrder(habits: { sortOrder: number }[]): number {
  return habits.reduce((max, habit) => Math.max(max, habit.sortOrder), -1) + 1;
}

export function validateMemoText(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_MEMO_LENGTH) return null;
  return trimmed;
}

export interface MonthlyProgress {
  done: number;
  total: number;
}

export function monthlyProgress(
  onDates: Iterable<string>,
  monthPrefix: string,
  totalDaysInMonth: number,
): MonthlyProgress {
  let done = 0;
  for (const date of onDates) if (date.startsWith(monthPrefix)) done += 1;
  return { done, total: totalDaysInMonth };
}

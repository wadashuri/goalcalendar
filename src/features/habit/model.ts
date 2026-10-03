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
  "fitness-outline",
  "football-outline",
  "basketball-outline",
  "baseball-outline",
  "tennisball-outline",
  "golf-outline",
  "trophy-outline",
  "medal-outline",
  "ribbon-outline",
  "flame-outline",
  "flash-outline",
  "sunny-outline",
  "cloudy-outline",
  "rainy-outline",
  "snow-outline",
  "thunderstorm-outline",
  "umbrella-outline",
  "flower-outline",
  "rose-outline",
  "earth-outline",
  "planet-outline",
  "star-outline",
  "sparkles-outline",
  "happy-outline",
  "cafe-outline",
  "restaurant-outline",
  "pizza-outline",
  "ice-cream-outline",
  "wine-outline",
  "beer-outline",
  "fish-outline",
  "egg-outline",
  "fast-food-outline",
  "home-outline",
  "bed-outline",
  "alarm-outline",
  "time-outline",
  "timer-outline",
  "calendar-outline",
  "checkbox-outline",
  "clipboard-outline",
  "document-outline",
  "journal-outline",
  "school-outline",
  "library-outline",
  "language-outline",
  "calculator-outline",
  "flask-outline",
  "beaker-outline",
  "color-palette-outline",
  "brush-outline",
  "camera-outline",
  "image-outline",
  "film-outline",
  "videocam-outline",
  "headset-outline",
  "mic-outline",
  "game-controller-outline",
  "desktop-outline",
  "laptop-outline",
  "phone-portrait-outline",
  "watch-outline",
  "glasses-outline",
  "shirt-outline",
  "bag-outline",
  "briefcase-outline",
  "wallet-outline",
  "cart-outline",
  "gift-outline",
  "balloon-outline",
  "airplane-outline",
  "boat-outline",
  "car-outline",
  "bus-outline",
  "train-outline",
  "subway-outline",
  "rocket-outline",
  "map-outline",
  "compass-outline",
  "trail-sign-outline",
  "bonfire-outline",
  "footsteps-outline",
  "body-outline",
  "accessibility-outline",
  "people-outline",
  "person-outline",
  "bulb-outline",
  "hammer-outline",
] as const;
export type HabitIcon = (typeof HABIT_ICONS)[number];

export interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  icon: HabitIcon | null;
  sortOrder: number;
  createdAt: number;
}

// 名前なしでも読み上げ・共有文で目標を識別できる。
export function habitLabel(habit: Pick<Habit, "name" | "sortOrder">): string {
  return habit.name || `目標${habit.sortOrder + 1}`;
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

export function isHabitIcon(icon: string | null): icon is HabitIcon {
  return icon !== null && (HABIT_ICONS as readonly string[]).includes(icon);
}

export function validateHabitName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length > MAX_HABIT_NAME_LENGTH) return null;
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

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function highlightSegments(
  text: string,
  query: string,
): HighlightSegment[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [{ text, highlighted: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }
    if (matchIndex > cursor) {
      segments.push({
        text: text.slice(cursor, matchIndex),
        highlighted: false,
      });
    }
    const matchEnd = matchIndex + trimmedQuery.length;
    segments.push({
      text: text.slice(matchIndex, matchEnd),
      highlighted: true,
    });
    cursor = matchEnd;
  }
  return segments;
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

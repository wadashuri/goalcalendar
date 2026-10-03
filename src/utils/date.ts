export function localDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateObject(date: string): Date {
  return new Date(`${date}T12:00:00`);
}
export function currentMonthPrefix(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
export function datesInMonth(year: number, month: number): string[] {
  const count = daysInMonth(year, month);
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return Array.from(
    { length: count },
    (_, i) => `${prefix}-${String(i + 1).padStart(2, "0")}`,
  );
}

import { daysInMonth } from "../../utils/date";

export function monthlyHistory(onDates: Iterable<string>, year: number) {
  const dates = new Set(onDates);
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const total = daysInMonth(year, month);
    let done = 0;
    for (let day = 1; day <= total; day++) {
      if (dates.has(`${prefix}${String(day).padStart(2, "0")}`)) done++;
    }
    return { month, done, total };
  });
}

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentMonthPrefix,
  dateObject,
  datesInMonth,
  daysInMonth,
  localDate,
} from "../src/utils/date";

test("localDate: UTCでなく端末のカレンダー日を使う", () => {
  assert.equal(localDate(new Date(2026, 9, 4, 0, 5)), "2026-10-04");
  assert.equal(localDate(dateObject("2026-10-04")), "2026-10-04");
});

test("currentMonthPrefix: YYYY-MM形式", () => {
  assert.equal(currentMonthPrefix(new Date(2026, 0, 15)), "2026-01");
  assert.equal(currentMonthPrefix(new Date(2026, 11, 1)), "2026-12");
});

test("daysInMonth: 閏年・月末日数を正しく返す", () => {
  assert.equal(daysInMonth(2026, 2), 28);
  assert.equal(daysInMonth(2028, 2), 29);
  assert.equal(daysInMonth(2026, 4), 30);
});

test("datesInMonth: 月初から月末までの日付文字列を生成", () => {
  const dates = datesInMonth(2026, 2);
  assert.equal(dates.length, 28);
  assert.equal(dates[0], "2026-02-01");
  assert.equal(dates[27], "2026-02-28");
});

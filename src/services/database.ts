import * as SQLite from "expo-sqlite";
import {
  isHabitIcon,
  isValidDateString,
  validateHabitName,
  validateMemoText,
  type Habit,
  type HabitColor,
  type HabitIcon,
  type HabitLog,
  type HabitMemo,
} from "../features/habit/model";

import { initialHabits } from "../features/habit/defaultHabits";

let connection: Promise<SQLite.SQLiteDatabase> | undefined;

async function initialize() {
  const db = await SQLite.openDatabaseAsync("goalcalendar.db");
  await db.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL,
      icon TEXT NOT NULL, sortOrder INTEGER NOT NULL, createdAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS habit_logs (
      habitId TEXT NOT NULL, date TEXT NOT NULL, isOn INTEGER NOT NULL,
      PRIMARY KEY (habitId, date));
    CREATE TABLE IF NOT EXISTS habit_memos (
      habitId TEXT NOT NULL, date TEXT NOT NULL, text TEXT NOT NULL,
      updatedAt INTEGER NOT NULL, PRIMARY KEY (habitId, date));`);
  await db.withExclusiveTransactionAsync(async (txn) => {
    const version = await txn.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    if (!version) throw new Error("Cannot read database version");
    if (version.user_version < 3) {
      const existing = await txn.getAllAsync<Habit>(
        "SELECT * FROM habits ORDER BY sortOrder ASC",
      );
      for (const habit of initialHabits(existing, Date.now())) {
        await txn.runAsync(
          "INSERT INTO habits(id, name, color, icon, sortOrder, createdAt) VALUES(?, ?, ?, ?, ?, ?)",
          habit.id,
          habit.name,
          habit.color,
          habit.icon,
          habit.sortOrder,
          habit.createdAt,
        );
      }
      await txn.execAsync("PRAGMA user_version = 3");
    }
  });
  return db;
}
function database() {
  return (connection ??= initialize().catch((error) => {
    connection = undefined;
    throw error;
  }));
}

function toHabit(row: {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: number;
}): Habit {
  return {
    ...row,
    color: row.color as HabitColor,
    icon: row.icon as HabitIcon,
  };
}

export async function listHabits(): Promise<Habit[]> {
  const rows = await (
    await database()
  ).getAllAsync<{
    id: string;
    name: string;
    color: string;
    icon: string;
    sortOrder: number;
    createdAt: number;
  }>("SELECT * FROM habits ORDER BY sortOrder ASC");
  return rows.map(toHabit);
}

export async function updateHabit(
  id: string,
  name: string,
  icon: string,
): Promise<void> {
  const validName = validateHabitName(name);
  if (!validName || !isHabitIcon(icon)) throw new Error("Invalid habit");
  await (
    await database()
  ).runAsync(
    "UPDATE habits SET name = ?, icon = ? WHERE id = ?",
    validName,
    icon,
    id,
  );
}

export async function getHabitLog(
  habitId: string,
  date: string,
): Promise<boolean> {
  const row = await (
    await database()
  ).getFirstAsync<{ isOn: number }>(
    "SELECT isOn FROM habit_logs WHERE habitId = ? AND date = ?",
    habitId,
    date,
  );
  return row?.isOn === 1;
}

export async function toggleHabitLog(
  habitId: string,
  date: string,
): Promise<boolean> {
  if (!isValidDateString(date)) throw new Error("Invalid date");
  const current = await getHabitLog(habitId, date);
  const next = !current;
  await (
    await database()
  ).runAsync(
    `INSERT INTO habit_logs(habitId, date, isOn) VALUES(?, ?, ?)
     ON CONFLICT(habitId, date) DO UPDATE SET isOn = excluded.isOn`,
    habitId,
    date,
    next ? 1 : 0,
  );
  return next;
}

export async function listLogsForHabit(habitId: string): Promise<HabitLog[]> {
  const rows = await (
    await database()
  ).getAllAsync<{ habitId: string; date: string; isOn: number }>(
    "SELECT * FROM habit_logs WHERE habitId = ? AND isOn = 1 ORDER BY date ASC",
    habitId,
  );
  return rows.map((row) => ({ ...row, isOn: row.isOn === 1 }));
}

export async function listAllOnLogs(): Promise<HabitLog[]> {
  const rows = await (
    await database()
  ).getAllAsync<{ habitId: string; date: string; isOn: number }>(
    "SELECT * FROM habit_logs WHERE isOn = 1",
  );
  return rows.map((row) => ({ ...row, isOn: row.isOn === 1 }));
}

export async function getHabitMemo(
  habitId: string,
  date: string,
): Promise<HabitMemo | null> {
  return (await database()).getFirstAsync<HabitMemo>(
    "SELECT * FROM habit_memos WHERE habitId = ? AND date = ?",
    habitId,
    date,
  );
}

export async function saveHabitMemo(
  habitId: string,
  date: string,
  text: string,
): Promise<HabitMemo> {
  const validText = validateMemoText(text);
  if (!validText || !isValidDateString(date)) throw new Error("Invalid memo");
  const updatedAt = Date.now();
  await (
    await database()
  ).runAsync(
    `INSERT INTO habit_memos(habitId, date, text, updatedAt) VALUES(?, ?, ?, ?)
     ON CONFLICT(habitId, date) DO UPDATE SET text = excluded.text, updatedAt = excluded.updatedAt`,
    habitId,
    date,
    validText,
    updatedAt,
  );
  return { habitId, date, text: validText, updatedAt };
}

export async function deleteHabitMemo(
  habitId: string,
  date: string,
): Promise<void> {
  await (
    await database()
  ).runAsync(
    "DELETE FROM habit_memos WHERE habitId = ? AND date = ?",
    habitId,
    date,
  );
}

export async function listAllMemos(): Promise<HabitMemo[]> {
  const rows = await (
    await database()
  ).getAllAsync<HabitMemo>("SELECT * FROM habit_memos ORDER BY date DESC");
  return rows;
}

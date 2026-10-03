import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as db from "../../services/database";
import type { Habit, HabitMemo } from "./model";
type State = {
  habits: Habit[];
  onDates: Record<string, Set<string>>;
  memos: HabitMemo[];
  ready: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addHabit: (name: string, color: string, icon: string) => Promise<void>;
  updateHabit: (
    id: string,
    name: string,
    color: string,
    icon: string,
  ) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  isOn: (habitId: string, date: string) => boolean;
  toggleLog: (habitId: string, date: string) => Promise<void>;
  getMemo: (habitId: string, date: string) => HabitMemo | undefined;
  saveMemo: (habitId: string, date: string, text: string) => Promise<void>;
  deleteMemo: (habitId: string, date: string) => Promise<void>;
};
const Context = createContext<State | null>(null);
export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [onDates, setOnDates] = useState<Record<string, Set<string>>>({});
  const [memos, setMemos] = useState<HabitMemo[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      const [habitRows, logRows, memoRows] = await Promise.all([
        db.listHabits(),
        db.listAllOnLogs(),
        db.listAllMemos(),
      ]);
      const next: Record<string, Set<string>> = {};
      for (const log of logRows)
        (next[log.habitId] ??= new Set()).add(log.date);
      setError(null);
      setHabits(habitRows);
      setOnDates(next);
      setMemos(memoRows);
      setReady(true);
    } catch {
      setError("データを読み込めませんでした。もう一度お試しください。");
    }
  }, []);
  useEffect(() => {
    // 非同期の読み込み完了で状態を更新する。レンダー中には更新しない。
    void Promise.resolve().then(reload);
  }, [reload]);
  async function addHabit(name: string, color: string, icon: string) {
    await db.createHabit(name, color, icon);
    setHabits(await db.listHabits());
  }
  async function updateHabit(
    id: string,
    name: string,
    color: string,
    icon: string,
  ) {
    await db.updateHabit(id, name, color, icon);
    setHabits(await db.listHabits());
  }
  async function removeHabit(id: string) {
    await db.deleteHabit(id);
    await reload();
  }
  function isOn(habitId: string, date: string) {
    return onDates[habitId]?.has(date) ?? false;
  }
  async function toggleLog(habitId: string, date: string) {
    const next = await db.toggleHabitLog(habitId, date);
    setOnDates((prev) => {
      const dates = new Set(prev[habitId]);
      if (next) dates.add(date);
      else dates.delete(date);
      return { ...prev, [habitId]: dates };
    });
  }
  function getMemo(habitId: string, date: string) {
    return memos.find((memo) => memo.habitId === habitId && memo.date === date);
  }
  async function saveMemo(habitId: string, date: string, text: string) {
    const memo = await db.saveHabitMemo(habitId, date, text);
    setMemos((prev) => [
      memo,
      ...prev.filter((m) => !(m.habitId === habitId && m.date === date)),
    ]);
  }
  async function deleteMemo(habitId: string, date: string) {
    await db.deleteHabitMemo(habitId, date);
    setMemos((prev) =>
      prev.filter((m) => !(m.habitId === habitId && m.date === date)),
    );
  }
  return (
    <Context.Provider
      value={{
        habits,
        onDates,
        memos,
        ready,
        error,
        reload,
        addHabit,
        updateHabit,
        removeHabit,
        isOn,
        toggleLog,
        getMemo,
        saveMemo,
        deleteMemo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useHabits() {
  const value = useContext(Context);
  if (!value) throw new Error("HabitProvider is required");
  return value;
}

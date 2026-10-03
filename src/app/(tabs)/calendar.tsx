import { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHabits } from "../../features/habit/HabitProvider";
import {
  MAX_MEMO_LENGTH,
  type Habit,
  type HabitIcon,
} from "../../features/habit/model";
import { datesInMonth, localDate } from "../../utils/date";
import { colors } from "../../components/ui";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function CalendarDayCell({
  day,
  date,
  isOn,
  hasMemo,
  isToday,
  color,
  icon,
  rowHeight,
  onTap,
  onLongPress,
}: {
  day: number;
  date: string;
  isOn: boolean;
  hasMemo: boolean;
  isToday: boolean;
  color: string;
  icon: HabitIcon;
  rowHeight: `${number}%`;
  onTap: (date: string) => void;
  onLongPress: (date: string) => void;
}) {
  const tap = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd((_event, success) => {
          if (success) onTap(date);
        }),
    [date, onTap],
  );
  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .runOnJS(true)
        .minDuration(450)
        .onStart(() => onLongPress(date)),
    [date, onLongPress],
  );
  const gesture = useMemo(
    () => Gesture.Exclusive(longPress, tap),
    [longPress, tap],
  );
  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.dayCell, { height: rowHeight }]}>
        <Text
          style={[
            styles.dayText,
            { color },
            isToday && styles.todayNumber,
            isOn && styles.stampedDayNumber,
          ]}
        >
          {day}
        </Text>
        {isOn && <Ionicons name={icon} size={42} color={color} />}
        {isToday && (
          <View style={[styles.todayDot, { backgroundColor: color }]} />
        )}
        {hasMemo && (
          <View style={[styles.memoDot, { backgroundColor: color }]} />
        )}
      </View>
    </GestureDetector>
  );
}

export default function CalendarScreen() {
  const {
    habits,
    isOn,
    toggleLog,
    getMemo,
    saveMemo,
    deleteMemo,
    ready,
    error,
    reload,
  } = useHabits();
  const today = localDate();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [memoText, setMemoText] = useState("");
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);

  const activeHabitId = habits.some((h) => h.id === selectedHabitId)
    ? selectedHabitId
    : (habits[0]?.id ?? null);
  const activeHabit: Habit | undefined = habits.find(
    (habit) => habit.id === activeHabitId,
  );

  const dates = useMemo(
    () => datesInMonth(cursor.year, cursor.month),
    [cursor],
  );
  const leadingBlanks = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const weekCount = Math.ceil((leadingBlanks + dates.length) / 7);
  const trailingBlanks = weekCount * 7 - leadingBlanks - dates.length;
  const rowHeight: `${number}%` = `${100 / weekCount}%`;
  const calendarColor = activeHabit?.color ?? colors.accentText;

  function changeMonth(diff: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month - 1 + diff, 1);
      return { year: next.getFullYear(), month: next.getMonth() + 1 };
    });
  }

  function handleTap(date: string) {
    if (!activeHabitId || pending.current) return;
    pending.current = true;
    void toggleLog(activeHabitId, date)
      .catch(() =>
        Alert.alert("保存できませんでした", "もう一度お試しください。"),
      )
      .finally(() => {
        pending.current = false;
      });
  }

  function handleLongPress(date: string) {
    if (!activeHabitId) return;
    setMemoText(getMemo(activeHabitId, date)?.text ?? "");
    setEditingDate(date);
  }

  async function persistMemo(remove: boolean) {
    if (!activeHabitId || !editingDate || pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      if (remove || !memoText.trim())
        await deleteMemo(activeHabitId, editingDate);
      else await saveMemo(activeHabitId, editingDate, memoText.trim());
      setEditingDate(null);
    } catch {
      Alert.alert(
        "保存できませんでした",
        "入力を保持しています。もう一度お試しください。",
      );
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  if (!ready)
    return (
      <View style={styles.container}>
        <Text>{error ?? "読み込み中…"}</Text>
        {error && (
          <Pressable onPress={() => void reload()}>
            <Text>再読み込み</Text>
          </Pressable>
        )}
      </View>
    );

  if (ready && habits.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          まだ目標が登録されていません。設定タブで目標を確認してください。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.habitRow}>
        {habits.map((habit) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={habit.name}
            accessibilityState={{ selected: habit.id === activeHabitId }}
            key={habit.id}
            onPress={() => setSelectedHabitId(habit.id)}
            style={[
              styles.habitItem,
              habit.id === activeHabitId && { borderBottomColor: habit.color },
            ]}
          >
            <Ionicons
              name={habit.icon}
              size={28}
              color={
                habit.id === activeHabitId ? habit.color : `${habit.color}88`
              }
            />
          </Pressable>
        ))}
      </View>
      <Text style={[styles.yearLabel, { color: calendarColor }]}>
        {cursor.year}
      </Text>

      <View style={styles.monthHeader}>
        <Pressable
          accessibilityLabel="前の月"
          onPress={() => changeMonth(-1)}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={28} color={calendarColor} />
        </Pressable>
        <Text
          accessibilityLabel={`${cursor.year}年${cursor.month}月`}
          style={[styles.monthLabel, { color: calendarColor }]}
        >
          {cursor.month}
        </Text>
        <Pressable
          accessibilityLabel="次の月"
          onPress={() => changeMonth(1)}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={28} color={calendarColor} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text
            key={label}
            style={[styles.weekdayLabel, { color: calendarColor }]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <View
            key={`blank-${i}`}
            style={[styles.dayCell, { height: rowHeight }]}
          />
        ))}
        {activeHabit &&
          dates.map((date) => (
            <CalendarDayCell
              key={date}
              day={Number(date.slice(-2))}
              date={date}
              isOn={isOn(activeHabit.id, date)}
              hasMemo={!!getMemo(activeHabit.id, date)}
              isToday={date === today}
              color={activeHabit.color}
              icon={activeHabit.icon}
              rowHeight={rowHeight}
              onTap={handleTap}
              onLongPress={handleLongPress}
            />
          ))}
        {Array.from({ length: trailingBlanks }, (_, i) => (
          <View
            key={`trailing-${i}`}
            style={[styles.dayCell, { height: rowHeight }]}
          />
        ))}
      </View>
      <Text style={styles.helpText}>
        {activeHabit?.name} · タップでスタンプ、長押しでメモ
      </Text>

      <Modal
        visible={editingDate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saving) setEditingDate(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDate} の{activeHabit?.name}メモ
            </Text>
            <TextInput
              style={styles.modalInput}
              value={memoText}
              onChangeText={setMemoText}
              placeholder="メモを入力（200文字まで）"
              placeholderTextColor={colors.muted}
              maxLength={MAX_MEMO_LENGTH}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                disabled={saving}
                onPress={() => setEditingDate(null)}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                disabled={saving}
                onPress={() => void persistMemo(true)}
              >
                <Text style={styles.modalButtonText}>削除</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                disabled={saving}
                onPress={() => void persistMemo(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.muted,
    fontSize: 14,
    padding: 24,
  },
  habitRow: { flexDirection: "row", paddingBottom: 8 },
  habitItem: {
    width: "12.5%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  yearLabel: { textAlign: "center", fontSize: 16, marginTop: 6 },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthLabel: { fontSize: 44, fontWeight: "500" },
  weekdayRow: { flexDirection: "row", paddingVertical: 12 },
  weekdayLabel: {
    width: "14.285714%",
    textAlign: "center",
    fontSize: 14,
    color: colors.muted,
  },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.285714%",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 20 },
  todayNumber: { fontWeight: "800" },
  stampedDayNumber: { position: "absolute", top: 8, right: 6, fontSize: 11 },
  todayDot: {
    position: "absolute",
    bottom: 10,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  helpText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
    paddingTop: 8,
  },
  memoDot: {
    position: "absolute",
    bottom: 10,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentText,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(58, 46, 34, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  modalInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  modalButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalButtonText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  modalButtonPrimary: { backgroundColor: colors.accent },
  modalButtonPrimaryText: {
    color: colors.onAccent,
    fontSize: 14,
    fontWeight: "700",
  },
});

import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../../features/habit/HabitProvider";
import type { Habit } from "../../features/habit/model";
import { localDate } from "../../utils/date";
import { colors } from "../../components/ui";

function GoalStamp({
  goal,
  checked,
  onPress,
}: {
  goal: Habit;
  checked: boolean;
  onPress: () => Promise<void>;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 32,
      bounciness: 5,
    }).start();
  }
  async function stamp() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await onPress();
    } catch {
      Alert.alert("記録できませんでした", "もう一度お試しください。");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={goal.name}
      accessibilityState={{ checked, busy, disabled: busy }}
      disabled={busy}
      onPressIn={() => animate(0.86)}
      onPressOut={() => animate(1)}
      onPress={() => void stamp()}
      style={[styles.cell, checked && { backgroundColor: `${goal.color}18` }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={goal.icon}
          size={48}
          color={checked ? goal.color : "#CFC9C1"}
        />
      </Animated.View>
      <Text
        style={[
          styles.name,
          checked && { color: colors.ink, fontWeight: "700" },
        ]}
        numberOfLines={1}
      >
        {goal.name}
      </Text>
      {checked && (
        <Ionicons
          style={styles.check}
          name="checkmark-circle"
          size={16}
          color={goal.color}
        />
      )}
    </Pressable>
  );
}

export default function TodayScreen() {
  const { habits, isOn, toggleLog, ready, error, reload } = useHabits();
  const now = new Date();
  const today = localDate(now);
  if (!ready)
    return (
      <View style={styles.loading}>
        <Text style={styles.hint}>{error ?? "読み込み中…"}</Text>
        {error && (
          <Pressable onPress={() => void reload()}>
            <Text>再読み込み</Text>
          </Pressable>
        )}
      </View>
    );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>今日</Text>
        <Text style={styles.date}>
          {now.getMonth() + 1}/{now.getDate()}
        </Text>
      </View>
      <View style={styles.grid}>
        {habits.map((goal) => (
          <GoalStamp
            key={goal.id}
            goal={goal}
            checked={isOn(goal.id, today)}
            onPress={() => toggleLog(goal.id, today)}
          />
        ))}
      </View>
      <Text style={styles.hint}>スタンプを押して、今日の達成を記録</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  header: { alignItems: "center", gap: 6, marginBottom: 40 },
  title: { fontSize: 34, fontWeight: "700", color: colors.ink },
  date: { fontSize: 20, fontWeight: "600", color: colors.ink },
  grid: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  cell: {
    width: "25%",
    aspectRatio: 0.86,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 4,
  },
  name: { fontSize: 11, color: colors.muted },
  check: { position: "absolute", top: 7, right: 7 },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
});

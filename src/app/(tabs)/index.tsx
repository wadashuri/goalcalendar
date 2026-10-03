import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../../features/habit/HabitProvider";
import { HabitIconBadge } from "../../components/HabitIconBadge";
import { localDate } from "../../utils/date";
import { colors } from "../../components/ui";
export default function TodayScreen() {
  const { habits, isOn, toggleLog, ready } = useHabits();
  const today = localDate();
  if (!ready) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>読み込み中…</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日</Text>
        <Ionicons name="paw-outline" size={20} color={colors.muted} />
      </View>
      {habits.length === 0 ? (
        <Text style={styles.text}>
          習慣が登録されていません。設定タブから習慣を追加してください。
        </Text>
      ) : (
        <View style={styles.grid}>
          {habits.map((habit) => {
            const on = isOn(habit.id, today);
            return (
              <Pressable
                key={habit.id}
                accessibilityRole="button"
                onPress={() => void toggleLog(habit.id, today)}
                style={styles.cell}
              >
                <HabitIconBadge habit={habit} size={56} dimmed={!on} />
                <Text style={styles.name} numberOfLines={1}>
                  {habit.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  text: { fontSize: 14, color: colors.muted, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  cell: { width: 76, alignItems: "center", gap: 6 },
  name: { fontSize: 12, color: colors.ink, textAlign: "center" },
});

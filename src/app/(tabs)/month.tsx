import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useHabits } from "../../features/habit/HabitProvider";
import { monthlyProgress } from "../../features/habit/model";
import { currentMonthPrefix, daysInMonth } from "../../utils/date";
import { HabitIconBadge } from "../../components/HabitIconBadge";
import { colors } from "../../components/ui";

export default function MonthScreen() {
  const { habits, onDates, ready, error, reload } = useHabits();
  const now = new Date();
  const monthPrefix = currentMonthPrefix(now);
  const totalDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);

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
        <Text style={styles.title}>目標</Text>
        <Text style={styles.text}>
          目標が登録されていません。設定タブで目標を確認してください。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>
        {now.getFullYear()}年{now.getMonth() + 1}月の進捗
      </Text>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {habits.map((habit) => {
          const { done, total } = monthlyProgress(
            onDates[habit.id] ?? [],
            monthPrefix,
            totalDays,
          );
          const ratio = total > 0 ? done / total : 0;
          return (
            <Pressable
              key={habit.id}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`${habit.name}の詳細、今月${done}日達成`}
              onPress={() =>
                router.push({
                  pathname: "/goals/[id]",
                  params: { id: habit.id },
                })
              }
            >
              <View style={styles.cardHeader}>
                <HabitIconBadge habit={habit} size={36} />
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.fraction}>
                  {done}/{total}日
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.muted}
                />
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, ratio * 100)}%`,
                      backgroundColor: habit.color,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  text: { fontSize: 14, color: colors.muted, textAlign: "center" },
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  habitName: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.ink },
  fraction: { fontSize: 13, color: colors.muted },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
});

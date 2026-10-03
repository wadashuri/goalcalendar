import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Habit } from "./model";
import { monthlyHistory } from "./monthlyHistory";
import { colors } from "../../components/ui";

type Props = {
  habit: Habit;
  onDates: Iterable<string>;
  year: number;
  month: number;
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
};

export function GoalProgress({
  habit,
  onDates,
  year,
  month,
  onYearChange,
  onMonthChange,
}: Props) {
  const now = new Date();
  const months = monthlyHistory(onDates, year);
  const selected = months.find((item) => item.month === month);
  const yearTotal = months.reduce((sum, item) => sum + item.done, 0);
  if (!selected) return null;
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.hero}>
        <View
          style={[
            styles.stamp,
            {
              backgroundColor: habit.icon ? `${habit.color}20` : habit.color,
              borderRadius: habit.icon ? 30 : 44,
            },
          ]}
        >
          {habit.icon && (
            <Ionicons name={habit.icon} size={52} color={habit.color} />
          )}
        </View>
        {habit.name !== "" && <Text style={styles.name}>{habit.name}</Text>}
        <Text style={styles.note}>
          {year}年{month}月の達成
        </Text>
        <Text style={[styles.count, { color: habit.color }]}>
          {selected.done}
          <Text style={styles.unit}> 日</Text>
        </Text>
        <Text style={styles.note}>
          {selected.total}日中 · 達成率{" "}
          {Math.round((selected.done / selected.total) * 100)}%
        </Text>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.yearHeader}>
          {onYearChange ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="前の年"
                onPress={() => onYearChange?.(year - 1)}
                style={styles.arrow}
              >
                <Ionicons name="chevron-back" size={22} color={colors.ink} />
              </Pressable>
              <Text style={styles.year}>{year}年</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="次の年"
                disabled={year >= now.getFullYear()}
                onPress={() => onYearChange?.(year + 1)}
                style={styles.arrow}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={year >= now.getFullYear() ? colors.border : colors.ink}
                />
              </Pressable>
            </>
          ) : (
            <Text style={[styles.year, { textAlign: "center", flex: 1 }]}>
              {year}年
            </Text>
          )}
        </View>
        <Text style={styles.chartTitle}>月ごとの達成日数</Text>
        <View style={styles.plot}>
          {[0, 10, 20, 31].map((tick) => (
            <View
              key={tick}
              style={[styles.gridLine, { bottom: (tick / 31) * 180 + 32 }]}
            >
              <Text style={styles.tick}>{tick}</Text>
            </View>
          ))}
          <View style={styles.columns}>
            {months.map((item) => {
              const future =
                year === now.getFullYear() && item.month > now.getMonth() + 1;
              const active = item.month === month;
              return (
                <Pressable
                  key={item.month}
                  disabled={future || !onMonthChange}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.month}月、${future ? "まだ開始していません" : `${item.done}日達成`}`}
                  accessibilityState={{
                    selected: active,
                    disabled: future,
                  }}
                  onPress={() => onMonthChange?.(item.month)}
                  style={styles.column}
                >
                  <View style={styles.barArea}>
                    {item.done > 0 && (
                      <Text style={[styles.barValue, { color: habit.color }]}>
                        {item.done}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(3, (item.done / 31) * 180),
                          backgroundColor: future ? colors.border : habit.color,
                          opacity: active ? 1 : 0.4,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.month,
                      {
                        color: active ? habit.color : colors.muted,
                        opacity: future ? 0.4 : 1,
                      },
                    ]}
                  >
                    {item.month}
                  </Text>
                  <View
                    style={[
                      styles.selectedDot,
                      {
                        backgroundColor: active ? habit.color : "transparent",
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
        {onMonthChange && (
          <Text style={styles.hint}>月をタップして振り返ろう</Text>
        )}
      </View>
      <View style={[styles.totalCard, { backgroundColor: `${habit.color}18` }]}>
        <Ionicons name="sparkles-outline" size={24} color={habit.color} />
        <Text style={styles.totalText}>
          {year}年は{" "}
          <Text style={{ color: habit.color, fontWeight: "700" }}>
            {yearTotal}日
          </Text>{" "}
          達成
        </Text>
      </View>
      {yearTotal === 0 && (
        <Text style={styles.hint}>
          スタンプを押すと、ここに記録がたまっていきます。
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: 8, paddingVertical: 12 },
  stamp: {
    width: 88,
    height: 88,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 22, fontWeight: "700", color: colors.ink },
  note: { fontSize: 13, color: colors.muted },
  count: { fontSize: 56, fontWeight: "700", lineHeight: 68 },
  unit: { fontSize: 20, fontWeight: "500" },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  yearHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  year: { fontSize: 20, fontWeight: "700", color: colors.ink },
  chartTitle: { fontSize: 13, color: colors.muted },
  plot: { height: 236, paddingTop: 16 },
  gridLine: {
    position: "absolute",
    left: 20,
    right: 0,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tick: {
    position: "absolute",
    left: -22,
    top: -8,
    fontSize: 10,
    color: colors.muted,
  },
  columns: { flexDirection: "row", flex: 1, marginLeft: 20 },
  column: { flex: 1, alignItems: "center" },
  barArea: {
    height: 188,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: { width: "68%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  barValue: { fontSize: 10, marginBottom: 3 },
  month: { fontSize: 11, marginTop: 8, fontWeight: "600" },
  selectedDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
  hint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    gap: 10,
  },
  totalText: { color: colors.ink, fontSize: 15 },
});

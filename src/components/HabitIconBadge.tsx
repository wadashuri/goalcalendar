import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Habit } from "../features/habit/model";
export function HabitIconBadge({
  habit,
  size = 40,
  dimmed = false,
}: {
  habit: Pick<Habit, "color" | "icon">;
  size?: number;
  dimmed?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: habit.color,
          opacity: dimmed ? 0.35 : 1,
        },
      ]}
    >
      <Ionicons name={habit.icon} size={size * 0.55} color="#FFFFFF" />
    </View>
  );
}
const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
});

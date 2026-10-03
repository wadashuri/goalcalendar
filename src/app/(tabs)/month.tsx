import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../components/ui";
export default function MonthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>今月</Text>
      <Text style={styles.text}>
        習慣ごとの当月進捗バーを表示する画面です。
      </Text>
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
});

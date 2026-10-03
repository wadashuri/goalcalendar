import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../components/ui";
export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>今日</Text>
      <Text style={styles.text}>
        アイコングリッドでワンタップ記録する画面です。
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

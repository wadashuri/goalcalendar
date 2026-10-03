import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../components/ui";
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>
      <Text style={styles.text}>習慣の登録・編集・削除を行う画面です。</Text>
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

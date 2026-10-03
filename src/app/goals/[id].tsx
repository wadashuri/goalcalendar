import { habitLabel } from "../../features/habit/model";
import { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef, releaseCapture } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useHabits } from "../../features/habit/HabitProvider";
import { monthlyHistory } from "../../features/habit/monthlyHistory";
import { GoalProgress } from "../../features/habit/GoalProgress";
import { colors } from "../../components/ui";
import { APP_NAME, APP_LP_URL } from "../../constants/config";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, onDates, ready, error, reload } = useHabits();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const habit = habits.find((item) => item.id === id);
  const imageRef = useRef<View>(null);
  const pending = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  async function shareImage() {
    if (pending.current || !habit || !imageRef.current || !imageReady) return;
    pending.current = true;
    setSharing(true);
    let uri: string | undefined;
    try {
      if (Platform.OS === "web" || !(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "共有できません",
          "画像の共有はiPhone・Androidアプリで利用できます。",
        );
        return;
      }
      uri = await captureRef(imageRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      if (Platform.OS === "ios") {
        const text = `${habitLabel(habit)}、${year}年${month}月は${monthlyHistory(onDates[habit.id] ?? [], year)[month - 1]?.done ?? 0}日達成！\n${APP_NAME}でポチッと記録。${APP_LP_URL ? `\n${APP_LP_URL}` : ""}`;
        await Share.share(
          { url: uri, message: text },
          { subject: `${habitLabel(habit)}の達成記録` },
        );
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${habitLabel(habit)}の達成を共有`,
        });
      }
    } catch {
      Alert.alert("画像を共有できませんでした", "もう一度お試しください。");
    } finally {
      if (uri) releaseCapture(uri);
      pending.current = false;
      setSharing(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="目標一覧に戻る"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)/month")
          }
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
          <Text style={styles.backText}>目標</Text>
        </Pressable>
        {ready && habit && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="達成グラフを画像で共有"
            disabled={sharing || !imageReady}
            onPress={() => void shareImage()}
            style={styles.headerButton}
          >
            <Ionicons name="share-outline" size={22} color={habit.color} />
            <Text style={[styles.backText, { color: habit.color }]}>
              {sharing ? "準備中…" : "共有"}
            </Text>
          </Pressable>
        )}
      </View>
      {!ready || !habit ? (
        <View style={styles.empty}>
          <Text style={styles.note}>
            {!ready ? (error ?? "読み込み中…") : "目標が見つかりませんでした。"}
          </Text>
          {error && (
            <Pressable onPress={() => void reload()}>
              <Text>再読み込み</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <GoalProgress
              habit={habit}
              onDates={onDates[habit.id] ?? []}
              year={year}
              month={month}
              onYearChange={setYear}
              onMonthChange={setMonth}
            />
          </ScrollView>
          <View
            style={styles.offscreen}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View
              ref={imageRef}
              collapsable={false}
              onLayout={() => setImageReady(true)}
              style={styles.shareCard}
            >
              <GoalProgress
                habit={habit}
                onDates={onDates[habit.id] ?? []}
                year={year}
                month={month}
              />
              <View style={styles.brand}>
                <View style={styles.brandTitle}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={habit.color}
                  />
                  <Text style={styles.appName}>{APP_NAME}</Text>
                </View>
                <Text style={styles.tagline}>ポチッと記録。目標が育つ。</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    minHeight: 48,
    gap: 4,
  },
  backText: { color: colors.ink, fontSize: 15 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  note: { color: colors.muted, fontSize: 13 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  offscreen: { position: "absolute", left: -10000, top: 0 },
  shareCard: { width: 360, backgroundColor: colors.bg, padding: 20, gap: 24 },
  brand: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  brandTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  appName: { fontSize: 16, fontWeight: "700", color: colors.ink },
  tagline: { fontSize: 12, color: colors.muted },
});

import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../components/ui";
import { HabitIconBadge } from "../../components/HabitIconBadge";
import { useHabits } from "../../features/habit/HabitProvider";
import { highlightSegments } from "../../features/habit/model";
import { dateObject } from "../../utils/date";
function HighlightedText({
  text,
  query,
  style,
}: {
  text: string;
  query: string;
  style?: object;
}) {
  const segments = highlightSegments(text, query);
  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={segment.highlighted ? styles.highlight : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

export default function MemosScreen() {
  const { habits, memos, ready, error, reload } = useHabits();
  const [query, setQuery] = useState("");
  const habitById = useMemo(
    () => new Map(habits.map((habit) => [habit.id, habit])),
    [habits],
  );
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return memos;
    return memos.filter((memo) => {
      const habit = habitById.get(memo.habitId);
      return (
        memo.text.toLowerCase().includes(trimmed) ||
        (habit?.name.toLowerCase().includes(trimmed) ?? false)
      );
    });
  }, [memos, query, habitById]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>メモ一覧</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="メモを検索"
        placeholderTextColor={colors.muted}
        style={styles.search}
        accessibilityLabel="メモを検索"
      />
      {memos.length === 0 ? (
        <Text style={styles.empty}>
          まだメモがありません。カレンダーで日付を長押しして記録しましょう。
        </Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>該当するメモが見つかりませんでした。</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => `${item.habitId}-${item.date}`}
          renderItem={({ item }) => {
            const habit = habitById.get(item.habitId);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {habit && <HabitIconBadge habit={habit} size={28} />}
                  <View style={styles.cardHeaderText}>
                    <HighlightedText
                      text={habit?.name ?? "削除済みの目標"}
                      query={query}
                      style={styles.habitName}
                    />
                    <Text style={styles.date}>
                      {dateObject(item.date).toLocaleDateString("ja-JP", {
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </Text>
                  </View>
                </View>
                <HighlightedText
                  text={item.text}
                  query={query}
                  style={styles.memoText}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  empty: {
    marginTop: 24,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
  list: { flex: 1 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeaderText: { flex: 1 },
  habitName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  date: { fontSize: 12, color: colors.muted },
  memoText: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  highlight: { backgroundColor: "#FFF3B0" },
});

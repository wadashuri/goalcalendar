import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../../features/habit/HabitProvider";
import {
  HABIT_COLORS,
  HABIT_ICONS,
  MAX_HABITS,
  MAX_HABIT_NAME_LENGTH,
  validateHabitName,
  type Habit,
  type HabitColor,
  type HabitIcon,
} from "../../features/habit/model";
import { HabitIconBadge } from "../../components/HabitIconBadge";
import { colors } from "../../components/ui";

export default function SettingsScreen() {
  const {
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    ready,
    error: loadError,
    reload,
  } = useHabits();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<HabitColor>(HABIT_COLORS[0]);
  const [icon, setIcon] = useState<HabitIcon>(HABIT_ICONS[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef(false);
  const [busy, setBusy] = useState(false);

  const atLimit = habits.length >= MAX_HABITS && editingId === null;
  const validName = validateHabitName(name);

  function openAddForm() {
    setEditingId(null);
    setName("");
    setColor(HABIT_COLORS[0]);
    setIcon(HABIT_ICONS[0]);
    setError(null);
    setFormOpen(true);
  }

  function openEditForm(habit: Habit) {
    setEditingId(habit.id);
    setName(habit.name);
    setColor(habit.color);
    setIcon(habit.icon);
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    if (!ready || pending.current) return;
    if (!validName) {
      setError("1〜20文字で入力してください。");
      return;
    }
    if (atLimit) {
      setError("登録上限は8件です。");
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      if (editingId) {
        await updateHabit(editingId, validName, color, icon);
      } else {
        await addHabit(validName, color, icon);
      }
      closeForm();
    } catch {
      setError("保存できませんでした。もう一度お試しください。");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function handleDelete(habit: Habit) {
    Alert.alert("習慣を削除しますか？", habit.name, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          if (pending.current) return;
          pending.current = true;
          setBusy(true);
          void removeHabit(habit.id)
            .catch(() =>
              Alert.alert("削除できませんでした", "もう一度お試しください。"),
            )
            .finally(() => {
              pending.current = false;
              setBusy(false);
            });
        },
      },
    ]);
  }

  if (!ready)
    return (
      <View style={styles.container}>
        <Text>{loadError ?? "読み込み中…"}</Text>
        {loadError && (
          <Pressable onPress={() => void reload()}>
            <Text>再読み込み</Text>
          </Pressable>
        )}
      </View>
    );

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>設定</Text>
      <Text style={styles.text}>習慣の登録・編集・削除を行う画面です。</Text>

      {habits.length === 0 ? (
        <Text style={styles.empty}>まだ習慣が登録されていません。</Text>
      ) : (
        <View style={styles.list}>
          {habits.map((habit) => (
            <View key={habit.id} style={styles.row}>
              <HabitIconBadge habit={habit} size={36} />
              <Text style={styles.rowName}>{habit.name}</Text>
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                onPress={() => openEditForm(habit)}
                style={styles.rowButton}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                onPress={() => handleDelete(habit)}
                style={styles.rowButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.accentText}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {!formOpen &&
        (atLimit ? (
          <Text style={styles.limitText}>
            登録上限（{MAX_HABITS}件）に達しています。
          </Text>
        ) : (
          <Pressable
            disabled={busy}
            accessibilityRole="button"
            onPress={openAddForm}
            style={styles.addButton}
          >
            <Ionicons name="add" size={18} color={colors.onAccent} />
            <Text style={styles.addButtonText}>習慣を追加</Text>
          </Pressable>
        ))}

      {formOpen && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>名前</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={MAX_HABIT_NAME_LENGTH}
            placeholder="習慣の名前"
            style={styles.input}
          />

          <Text style={styles.formLabel}>色</Text>
          <View style={styles.swatchRow}>
            {HABIT_COLORS.map((c) => (
              <Pressable
                key={c}
                disabled={busy}
                accessibilityRole="button"
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  c === color && styles.swatchSelected,
                ]}
              />
            ))}
          </View>

          <Text style={styles.formLabel}>アイコン</Text>
          <View style={styles.iconRow}>
            {HABIT_ICONS.map((i) => (
              <Pressable
                key={i}
                disabled={busy}
                accessibilityRole="button"
                onPress={() => setIcon(i)}
                style={[
                  styles.iconOption,
                  i === icon && styles.iconOptionSelected,
                ]}
              >
                <Ionicons name={i} size={20} color={colors.ink} />
              </Pressable>
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.formButtons}>
            <Pressable
              disabled={busy}
              accessibilityRole="button"
              onPress={closeForm}
              style={[styles.formButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!validName || busy}
              onPress={() => void handleSave()}
              style={[
                styles.formButton,
                styles.saveButton,
                !validName && styles.saveButtonDisabled,
              ]}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 12, alignItems: "stretch" },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  text: { fontSize: 14, color: colors.muted },
  empty: { fontSize: 14, color: colors.muted, marginTop: 12 },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  rowName: { flex: 1, fontSize: 15, color: colors.ink, fontWeight: "600" },
  rowButton: { padding: 6 },
  addButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  addButtonText: { color: colors.onAccent, fontWeight: "700", fontSize: 15 },
  limitText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  form: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.ink,
  },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  swatchSelected: { borderWidth: 3, borderColor: colors.ink },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconOptionSelected: { borderColor: colors.accentText, borderWidth: 2 },
  errorText: { color: colors.accentText, fontSize: 13 },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  formButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.muted, fontWeight: "600" },
  saveButton: { backgroundColor: colors.accent },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: colors.onAccent, fontWeight: "700" },
});
